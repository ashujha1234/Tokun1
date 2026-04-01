// const { requireAuth } = require("../utils/auth");
// const { ensureDailyQuota, spendTokens } = require("../utils/quota");
// const express = require("express");

// const router = express.Router();

// // GET /api/auth/quota -> check today's remaining tokens
// router.get("/", requireAuth, async (req, res) => {
//   try {
    
//     return res.json({
//       user:req.user,
//       success: true,
      
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });
 

// module.exports = router;

const { requireAuth } = require("../utils/auth");
const express = require("express");
const User = require("../models/User");
const Organization = require("../models/organization");
 
const router = express.Router();
 
// GET /api/quota → ALWAYS returns FRESH user + org data
router.get("/", requireAuth, async (req, res) => {
  try {
    // FETCH FRESH USER FROM DB
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: "user_not_found" });
    }
 
    let org = null;
    if (user.orgId) {
      org = await Organization.findById(user.orgId).lean();
    }
 
    return res.json({
      success: true,
      user,
      organization: org,
    });
  } catch (err) {
    console.error("GET /quota error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});
 
module.exports = router;