const express = require("express");
const router = express.Router();
const PromptOptimizer = require("../models/PromptOptimizer");
const LLMProvider = require("../models/LLMProvider");
const { requireAuth } = require("../utils/auth");
const { PLANS } = require("../config/plans");


const { ensureMonthlyQuota, spendMonthlyTokens , spendTokensForOrgOwner} = require("../utils/quota");

const {
  spendTokensForIndividual,
  spendTokensForTeamMember,
} = require("../service/spend");


async function enforcePromptOptimizerHistoryLimit(user) {
  
  const planKey = String(user?.plan || "free").toLowerCase();
  const plan = PLANS[planKey];

  // if plan doesn't exist or history is unlimited, skip
  if (!plan || !plan.historyEntries || plan.historyEntries === "unlimited") return;

  const cap = plan.historyEntries;
  const filter = { userId: user._id, orgId: user.orgId || null };
  const existingCount = await PromptOptimizer.countDocuments(filter);

  if (existingCount >= cap) {
    const toDeleteCount = existingCount - cap + 1;
    const oldest = await PromptOptimizer.find(filter)
      .sort({ createdAt: 1 })
      .limit(toDeleteCount)
      .select({ _id: 1 })
      .lean();

    const ids = oldest.map(d => d._id);
    if (ids.length) {
      await PromptOptimizer.deleteMany({ _id: { $in: ids } });
    }
  }
}



// Create a new optimized prompt
// POST /api/prompt-optimizer
router.post("/", requireAuth, async (req, res) => {
  try {
    const { llmProviderName, inputPrompt, outputPrompt, tokensUsed } = req.body;

    if (!llmProviderName|| !inputPrompt || !outputPrompt || tokensUsed === undefined) {
      return res.status(400).json({ success: false, error: "all_fields_required" });
    }

   // Use findOne instead of findByName
    const provider = await LLMProvider.findOne({ name: llmProviderName });
    if (!provider) return res.status(404).json({ success: false, error: "llm_provider_not_found" });

    const amount = Number(tokensUsed);
    if (tokensUsed && (!Number.isFinite(amount) || amount <= 0)) {
      return res.status(400).json({ success: false, error: "tokensUsed_required_positive_number" });
    }
 
    /*
    // If tokens were updated, we need to spend them and check daily quota
    if (tokensUsed) {
      await ensureMonthlyQuota(req.user);  // Ensure the daily quota is not exceeded
      await spendMonthlyTokens(req.user, amount);  // Spend the tokens for this Smartgen
    }
      */

 let resuser=null;
     // 🔹 Spend tokens based on user type (IND vs TM vs ORG owner)
    if (req.user.userType === "IND") {
        await enforcePromptOptimizerHistoryLimit(req.user);

       resuser=  await spendTokensForIndividual(req.user._id, amount, "prompt-optimizer");
    } else if (req.user.userType === "TM") {
        resuser=await spendTokensForTeamMember(req.user._id, amount, "prompt-optimizer");
    } else if (req.user.userType === "ORG" && req.user.role === "Owner") {
      // Count owner’s own usage like an individual quota
    resuser=await spendTokensForOrgOwner(req.user._id, amount, "prompt-optimizer");
    } else {
      return res.status(403).json({ success: false, error: "invalid_user_type" });
    }

    const optimizedPrompt = await PromptOptimizer.create({
      llmProvider: provider._id,
      inputPrompt,
      outputPrompt,
      tokensUsed: amount,
      createdBy: req.user._id,
    });

    res.json({ success: true, optimizedPrompt ,user:resuser.user});
  } catch (err) {

     if (
      err?.message === "token_quota_exceeded" ||
      err?.message === "member_cap_exceeded" ||
      err?.message === "org_pool_exhausted"
    ) {
      return res.status(402).json({ success: false, error: "insufficient_quota" });
    }
    console.error("Create PromptOptimizer error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// Get all optimized prompts
// GET /api/prompt-optimizer
// router.get("/", requireAuth, async (req, res) => {
//   try {
//     const promptsoptimizer = await PromptOptimizer.find()
//       .populate("llmProvider", "name")
//       .populate("createdBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, promptsoptimizer });
//   } catch (err) {
//     console.error("Get PromptOptimizer error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.user; // authenticated user from requireAuth middleware
 
    // ✅ Filter by this user's ID only
    const filter = { createdBy: user._id };
 
    // If you also support org/team mode, you can expand it like this:
    // if (user.userType === "TM" && user.orgId) {
    //   filter.orgId = user.orgId;
    // } else {
    //   filter.createdBy = user._id;
    // }
 
    const promptsoptimizer = await PromptOptimizer.find(filter)
      .populate("llmProvider", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
 
    res.json({ success: true, promptsoptimizer });
  } catch (err) {
    console.error("Get PromptOptimizer error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

 // DELETE /api/promptoptimizer/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PromptOptimizer.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: "prompt_not_found" });

    res.json({ success: true, deleted });
  } catch (err) {
    console.error("Delete PromptOptimizer error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

   


router.delete("/user/all", requireAuth, async (req, res) => {
  try {
       const result = await PromptOptimizer.deleteMany({ createdBy: req.user._id });
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} Prompt optimizer records`,
    });
  } catch (err) {
    console.error("Delete All prompt Optimizer error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
