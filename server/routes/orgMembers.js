// // // // 

// // // /*// src/routes/orgMembers.js
// // // const express = require("express");
// // // const router = express.Router();

// // // const User = require("../models/User");
// // // const Organization = require("../models/organization");
// // // const { getISTDateString } = require("../utils/quota");
// // // const { requireAuth } = require("../utils/auth"); // your existing middleware

// // // function orgAssignableRemaining(org) {
// // //   const base = org.orgPoolCap + org.orgExtraTokensRemaining;
// // //   return Math.max(0, base - org.totalAssignedCap);
// // // }

// // // router.post("/org/members/add", requireAuth, async (req, res) => {
// // //   const todayIST = getISTDateString();

// // //   try {
// // //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// // //       return res.status(403).json({ success: false, error: "not_org_owner" });
// // //     }
// // //     if (!req.user.plan || req.user.plan !== "enterprise") {
// // //       return res.status(403).json({ success: false, error: "enterprise_plan_required" });
// // //     }

// // //     const { members } = req.body; // [{ name, email, role, tokens }]
// // //     if (!Array.isArray(members) || members.length === 0) {
// // //       return res.status(400).json({ success: false, error: "members_required" });
// // //     }

// // //     const org = await Organization.findById(req.user.orgId);
// // //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// // //     let assignable = orgAssignableRemaining(org);
// // //     const results = [];

// // //     for (const m of members) {
// // //       const { name, email, role, tokens } = m || {};
// // //       if (!email || !role || typeof tokens !== "number" || tokens < 0) {
// // //         results.push({ email, success: false, error: "invalid_member_data" });
// // //         continue;
// // //       }
// // //       if (tokens > assignable) {
// // //         results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
// // //         continue;
// // //       }

// // //       const normEmail = String(email).toLowerCase().trim();
// // //       let member = await User.findOne({ email: normEmail });

// // //       if (member) {
// // //         if (member.orgId && String(member.orgId) !== String(org._id)) {
// // //           results.push({ email, success: false, error: "user_belongs_to_another_org" });
// // //           continue;
// // //         }
// // //         if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
// // //           results.push({ email, success: false, error: "user_already_in_org" });
// // //           continue;
// // //         }
// // //       }

// // //       if (!member) {
// // //         member = await User.create({
// // //           name: name || normEmail.split("@")[0],
// // //           email: normEmail,
// // //           isVerified: false,

// // //           userType: "TM",
// // //           role,
// // //           orgId: org._id,

// // //           plan: null,
// // //           billingCycle: null,
// // //           currentPeriodEnd: null,

// // //           orgAssignedCap: tokens,
// // //           orgTokensRemaining: tokens,
// // //           tokensLastResetDateIST: todayIST,
// // //         });
// // //       } else {
// // //         member.userType = "TM";
// // //         member.role = role;
// // //         member.orgId = org._id;
// // //         member.plan = null;
// // //         member.billingCycle = null;
// // //         member.currentPeriodEnd = null;
// // //         member.orgAssignedCap = tokens;
// // //         member.orgTokensRemaining = tokens;
// // //         member.tokensLastResetDateIST = todayIST;
// // //         await member.save();
// // //       }

// // //       org.members.push({
// // //         userId: member._id,
// // //         role: role === "Admin" ? "ADMIN" : "MEMBER",
// // //         assignedCap: tokens,
// // //         usedThisPeriod: 0,
// // //         sectionUsage: {},
// // //       });

// // //       org.totalAssignedCap += tokens;
// // //       assignable -= tokens;

// // //       results.push({ email, success: true, created: !member.isVerified, tokens });
// // //     }

// // //     await org.save();

// // //     return res.json({
// // //       success: true,
// // //       orgId: org._id,
// // //       results,
// // //       orgAssignableRemaining: assignable,
// // //     });
// // //   } catch (err) {
// // //     console.error("org/members/add", err);
// // //     return res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });

// // // module.exports = router;
// // // */






















// // // // routes/orgMembersAdd.js
// // // const express = require("express");
// // // const router = express.Router();
// // // const { requireAuth } = require("../utils/auth");
// // // const User = require("../models/User");
// // // const Organization = require("../models/organization");
// // // const { PLANS } = require("../config/plans");

// // // // Helper: YYYY-MM-DD in IST
// // // function getISTDateString(d = new Date()) {
// // //   const utc = d.getTime() + d.getTimezoneOffset() * 60000;
// // //   const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
// // //   const y = ist.getFullYear();
// // //   const m = String(ist.getMonth() + 1).padStart(2, "0");
// // //   const day = String(ist.getDate()).padStart(2, "0");
// // //   return `${y}-${m}-${day}`;
// // // }

// // // // How much capacity is still assignable (not yet assigned to members)
// // // function orgAssignableRemaining(org) {
// // //   const base = (org.orgPoolCap || 0) + (org.orgExtraTokensRemaining || 0);
// // //   return Math.max(0, base - (org.totalAssignedCap || 0));
// // // }

// // // // Add team members (OWNER only) and assign per-member tokens from org pool
// // // router.post("/add", requireAuth, async (req, res) => {
// // //   const todayIST = getISTDateString();

// // //   try {
// // //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// // //       return res.status(403).json({ success: false, error: "not_org_owner" });
// // //     }

// // //     const org = await Organization.findById(req.user.orgId);
// // //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// // //     // ✅ Check enterprise plan
// // //     if (!org.plan || org.plan !== "enterprise") {
// // //       return res.status(403).json({ success: false, error: "enterprise_plan_required" });
// // //     }

// // //     const { members } = req.body; // [{ name, email, role, tokens }]
// // //     if (!Array.isArray(members) || members.length === 0) {
// // //       return res.status(400).json({ success: false, error: "members_required" });
// // //     }

// // //     // -----------------------------
// // //     // 🔹 TEAM MEMBER LIMIT CHECK
// // //     // -----------------------------
// // //     console.log(org.teamMembersLimit)
// // //     const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
// // //     const currentMembersCount = org.members.length || 0;

// // //     if (currentMembersCount + members.length > maxMembers) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: "team_member_limit_exceeded",
// // //         maxAllowed: maxMembers,
// // //         currentlyAdded: currentMembersCount,
// // //       });
// // //     }

// // //     let assignable = orgAssignableRemaining(org);
// // //     const results = [];

// // //     for (const m of members) {
// // //       const { name, email, role, tokens } = m || {};

// // //       // Basic validation
// // //       if (!email || !role || typeof tokens !== "number" || tokens < 0) {
// // //         results.push({ email, success: false, error: "invalid_member_data" });
// // //         continue;
// // //       }

// // //       if (!["Admin", "Member"].includes(role)) {
// // //         results.push({ email, success: false, error: "invalid_role" });
// // //         continue;
// // //       }

// // //       if (tokens > assignable) {
// // //         results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
// // //         continue;
// // //       }

// // //       const normEmail = String(email).toLowerCase().trim();
// // //       let member = await User.findOne({ email: normEmail });

// // //       if (member) {
// // //         if (member.orgId && String(member.orgId) !== String(org._id)) {
// // //           results.push({ email, success: false, error: "user_belongs_to_another_org" });
// // //           continue;
// // //         }
// // //         if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
// // //           results.push({ email, success: false, error: "user_already_in_org" });
// // //           continue;
// // //         }

// // //         member.userType = "TM";
// // //         member.role = role;
// // //         member.orgId = org._id;
// // //         member.plan = null;
// // //         member.billingCycle = null;
// // //         member.currentPeriodEnd = null;
// // //         member.orgAssignedCap = tokens;
// // //         member.orgTokensRemaining = tokens;
// // //         member.tokensLastResetDateIST = todayIST;

// // //         await member.save();
// // //       } else {
// // //         member = await User.create({
// // //           name: name || normEmail.split("@")[0],
// // //           email: normEmail,
// // //           isVerified: false,
// // //           userType: "TM",
// // //           role,
// // //           orgId: org._id,
// // //           plan: null,
// // //           billingCycle: null,
// // //           currentPeriodEnd: null,
// // //           orgAssignedCap: tokens,
// // //           orgTokensRemaining: tokens,
// // //           tokensLastResetDateIST: todayIST,
// // //         });
// // //       }

// // //       org.members.push({
// // //         userId: member._id,
// // //         role: role === "Admin" ? "ADMIN" : "MEMBER",
// // //         assignedCap: tokens,
// // //         usedThisPeriod: 0,
// // //         sectionUsage: {},
// // //       });

// // //       org.totalAssignedCap += tokens;
// // //       assignable -= tokens;

// // //       // ✅ Decrease teamMembersLimitRemaining
// // //       org.teamMembersLimitRemaining = Math.max(0, maxMembers - org.members.length);

// // //       results.push({ email, success: true, created: !member.isVerified, tokens });
// // //     }

// // //     await org.save();

// // //     return res.json({
// // //       success: true,
// // //       orgId: org._id,
// // //       results,
// // //       orgAssignableRemaining: assignable,
// // //       teamMembersLimitRemaining: org.teamMembersLimitRemaining, // return for frontend
// // //     });
// // //   } catch (err) {
// // //     console.error("org/members/add", err);
// // //     return res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });













// // // //get all members  of org
// // // router.get("/", requireAuth, async (req, res) => {
// // //   try {
// // //     if (!req.user.orgId) {
// // //       return res.status(400).json({ success: false, error: "no_org" });
// // //     }
// // //     const members = await User.find({ orgId: req.user.orgId })
// // //      .select("_id name email userType role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining")

// // //       .lean();

// // //     return res.json({ success: true, members });
// // //   } catch (err) {
// // //     console.error("org/members", err);
// // //     return res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });




// // // // ✅ PATCH: Edit org member (role or tokens)
// // // router.patch("/edit/:memberId", requireAuth, async (req, res) => {
// // //   try {
// // //     const { memberId } = req.params;
// // //     const { role, tokens } = req.body;

// // //     // 🧭 Validate user = org owner
// // //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// // //       return res.status(403).json({ success: false, error: "not_org_owner" });
// // //     }

// // //     const org = await Organization.findById(req.user.orgId);
// // //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// // //     const member = await User.findById(memberId);
// // //     if (!member || String(member.orgId) !== String(org._id)) {
// // //       return res.status(404).json({ success: false, error: "member_not_found" });
// // //     }

// // //     // 🧩 Locate the member in organization.members array
// // //     const orgMember = org.members.find((m) => String(m.userId) === String(member._id));
// // //     if (!orgMember) {
// // //       return res.status(404).json({ success: false, error: "member_record_not_found_in_org" });
// // //     }

// // //     // -----------------------
// // //     // 🔹 1️⃣ Update role
// // //     // -----------------------
// // //     if (role) {
// // //       if (!["Admin", "Member"].includes(role)) {
// // //         return res.status(400).json({ success: false, error: "invalid_role" });
// // //       }

// // //       member.role = role;
// // //       orgMember.role = role === "Admin" ? "ADMIN" : "MEMBER";
// // //     }

// // //     // -----------------------
// // // // 🔹 2️⃣ Update tokens
// // // // -----------------------
// // // if (tokens !== undefined) {
// // //   const numTokens = Number(tokens);
// // //   if (isNaN(numTokens) || numTokens < 0) {
// // //     return res.status(400).json({ success: false, error: "invalid_token_value" });
// // //   }

// // //   const used = orgMember.assignedCap - member.orgTokensRemaining; // tokens already used
// // //   const diff = numTokens - orgMember.assignedCap;

// // //   // Ensure org has capacity to assign diff
// // //   const totalAvailable = org.orgPoolCap + org.orgExtraTokensRemaining - org.orgPoolUsed;
// // //   const totalCurrentlyAssigned = org.totalAssignedCap;
// // //   if (totalCurrentlyAssigned + diff > totalAvailable) {
// // //     return res.status(400).json({
// // //       success: false,
// // //       error: "insufficient_org_tokens",
// // //       available: totalAvailable - totalCurrentlyAssigned,
// // //     });
// // //   }

// // //   org.totalAssignedCap += diff;
// // //   orgMember.assignedCap = numTokens;

// // //   // ✅ Preserve usage
// // //   const newRemaining = Math.max(0, numTokens - used);

// // //   member.orgAssignedCap = numTokens;
// // //   member.orgTokensRemaining = newRemaining;
// // //   member.tokensLastResetDateIST = new Date().toLocaleDateString("en-CA", {
// // //     timeZone: "Asia/Kolkata",
// // //   });
// // // }


// // //     // ✅ Save both
// // //     await member.save();
// // //     await org.save();

// // //     res.json({
// // //       success: true,
// // //       message: "member_updated",
// // //       member: {
// // //         id: member._id,
// // //         name: member.name,
// // //         email: member.email,
// // //         role: member.role,
// // //         orgAssignedCap: member.orgAssignedCap,
// // //         orgTokensRemaining: member.orgTokensRemaining,
// // //       },
// // //       organization: {
// // //         id: org._id,
// // //         totalAssignedCap: org.totalAssignedCap,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("org/members/edit", err);
// // //     res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });


// // // //delete member
// // // router.delete("/:memberId", requireAuth, async (req, res) => {
// // //   try {
// // //     const { memberId } = req.params;

// // //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// // //       return res.status(403).json({ success: false, error: "not_org_owner" });
// // //     }

// // //     const org = await Organization.findById(req.user.orgId);
// // //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// // //     const member = await User.findById(memberId);
// // //     if (!member || String(member.orgId) !== String(org._id)) {
// // //       return res.status(404).json({ success: false, error: "member_not_found" });
// // //     }

// // //     const memberIndex = org.members.findIndex((m) => String(m.userId) === String(member._id));
// // //     if (memberIndex === -1) {
// // //       return res.status(404).json({ success: false, error: "member_not_in_org" });
// // //     }

// // //     const orgMember = org.members[memberIndex];

// // //     // 🔹 Release unspent tokens
// // //     const unspent = member.orgTokensRemaining || 0;
// // //     org.orgPoolUsed = Math.max(0, org.orgPoolUsed - unspent);
// // //     org.totalAssignedCap = Math.max(0, org.totalAssignedCap - orgMember.assignedCap);

// // //     // 🔹 Remove from active members
// // //     org.members.splice(memberIndex, 1);
// // //     await org.save();

// // //     // 🔹 Soft delete member from org
// // //     member.isDeletedFromOrg = true;
// // //     member.deletedAt = new Date();
// // //     member.orgTokensRemaining = 0;
// // //     member.orgAssignedCap = 0;
// // //      member.orgId = org._id; // keep orgId reference for easy rejoin
// // //     await member.save();

// // //     res.json({
// // //       success: true,
// // //       message: "member_soft_deleted",
// // //       releasedTokens: unspent,
// // //       org: {
// // //         id: org._id,
// // //         totalAssignedCap: org.totalAssignedCap,
// // //         orgPoolUsed: org.orgPoolUsed,
// // //         membersRemaining: org.members.length,
// // //       },
// // //       member: {
// // //         id: member._id,
// // //         email: member.email,
// // //         isDeletedFromOrg: member.isDeletedFromOrg,
// // //         deletedAt: member.deletedAt,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("org/members/delete", err);
// // //     res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });


// // // router.patch("/members/:memberId/rejoin", requireAuth, async (req, res) => {
// // //   try {
// // //     const { memberId } = req.params;
// // //     const { role, tokens } = req.body;

// // //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// // //       return res.status(403).json({ success: false, error: "not_org_owner" });
// // //     }

// // //     const org = await Organization.findById(req.user.orgId);
// // //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// // //     const member = await User.findById(memberId);
// // //     if (!member || String(member.orgId) !== String(org._id) || !member.isDeletedFromOrg) {
// // //       return res.status(404).json({ success: false, error: "member_not_found_or_not_deleted" });
// // //     }

// // //     // Restore member details
// // //     member.isDeletedFromOrg = false;
// // //     member.deletedAt = null;
// // //     member.role = role || "Member";
// // //     member.orgTokensRemaining = tokens || 0;
// // //     member.orgAssignedCap = tokens || 0;
// // //     await member.save();

// // //     // Re-add to organization
// // //     org.members.push({
// // //       userId: member._id,
// // //       role: role?.toUpperCase() || "MEMBER",
// // //       assignedCap: tokens || 0,
// // //       usedThisPeriod: 0,
// // //       sectionUsage: {},
// // //     });
// // //     org.totalAssignedCap += tokens || 0;
// // //     await org.save();

// // //     res.json({
// // //       success: true,
// // //       message: "member_rejoined_successfully",
// // //       member: {
// // //         id: member._id,
// // //         email: member.email,
// // //         role: member.role,
// // //         orgAssignedCap: member.orgAssignedCap,
// // //         orgTokensRemaining: member.orgTokensRemaining,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("org/members/rejoin", err);
// // //     res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });


// // // // ===============================
// // // // GET all members of an organization
// // // // ===============================
// // // router.get("/emaillist", requireAuth, async (req, res) => {
// // //   try {
// // //     //const { orgId } = req.params;
// // //     const user = req.user;

// // //     // ✅ Verify that requester belongs to this org or is owner/admin
// // //     if (!user.orgId ) {
// // //       return res.status(403).json({ success: false, error: "unauthorized" });
// // //     }

// // //     const org = await Organization.findById(user.orgId)
// // //       .populate("members.userId", "email _id name")
// // //       .populate("ownerId", "email _id name");

// // //     if (!org) {
// // //       return res.status(404).json({ success: false, error: "organization_not_found" });
// // //     }

// // //     // ✅ Build list of members with only required fields
// // //     const members = org.members.map((m) => ({
// // //       userId: m.userId?._id,
// // //       email: m.userId?.email,
       
// // //       orgId: org._id,
       
// // //     }));

     

// // //     res.json({
// // //       success: true,
// // //       orgId: org._id,
// // //       totalMembers: members.length , // +1 for owner
// // //       members: [members],
// // //     });
// // //   } catch (err) {
// // //     console.error("get organization members error:", err);
// // //     res.status(500).json({ success: false, error: "server_error" });
// // //   }
// // // });

// // // module.exports = router;




// // // routes/orgMembersAdd.js
// // const express = require("express");
// // const router = express.Router();
// // const { requireAuth } = require("../utils/auth");
// // const User = require("../models/User");
// // const Organization = require("../models/organization");
// // const { PLANS } = require("../config/plans");

// // // ✅ Helper: YYYY-MM-DD in IST
// // function getISTDateString(d = new Date()) {
// //   const utc = d.getTime() + d.getTimezoneOffset() * 60000;
// //   const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
// //   const y = ist.getFullYear();
// //   const m = String(ist.getMonth() + 1).padStart(2, "0");
// //   const day = String(ist.getDate()).padStart(2, "0");
// //   return `${y}-${m}-${day}`;
// // }

// // // ✅ Remaining assignable tokens
// // function orgAssignableRemaining(org) {
// //   const base = (org.orgPoolCap || 0) + (org.orgExtraTokensRemaining || 0);
// //   return Math.max(0, base - (org.totalAssignedCap || 0));
// // }

// // // =====================================
// // // ADD MEMBERS (Owner only)
// // // =====================================
// // router.post("/add", requireAuth, async (req, res) => {
// //   const todayIST = getISTDateString();

// //   try {
// //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_org_owner" });
// //     }

// //     const org = await Organization.findById(req.user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     // ✅ Must have enterprise plan
// //     if (org.plan !== "enterprise") {
// //       return res.status(403).json({ success: false, error: "enterprise_plan_required" });
// //     }

// //     const { members } = req.body;
// //     if (!Array.isArray(members) || members.length === 0) {
// //       return res.status(400).json({ success: false, error: "members_required" });
// //     }

// //     const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
// //     const currentCount = org.members.length || 0;

// //     if (currentCount + members.length > maxMembers) {
// //       return res.status(400).json({
// //         success: false,
// //         error: "team_member_limit_exceeded",
// //         maxAllowed: maxMembers,
// //         currentlyAdded: currentCount,
// //       });
// //     }

// //     let assignable = orgAssignableRemaining(org);
// //     const results = [];

// //     for (const m of members) {
// //       const { name, email, role, tokens } = m || {};

// //       if (!email || !role || typeof tokens !== "number" || tokens < 0) {
// //         results.push({ email, success: false, error: "invalid_member_data" });
// //         continue;
// //       }

// //       if (!["Admin", "Member"].includes(role)) {
// //         results.push({ email, success: false, error: "invalid_role" });
// //         continue;
// //       }

// //       if (tokens > assignable) {
// //         results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
// //         continue;
// //       }

// //       const normEmail = String(email).toLowerCase().trim();
// //       let member = await User.findOne({ email: normEmail });

// //       if (member) {
// //         if (member.orgId && String(member.orgId) !== String(org._id)) {
// //           results.push({ email, success: false, error: "user_belongs_to_another_org" });
// //           continue;
// //         }
// //         if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
// //           results.push({ email, success: false, error: "user_already_in_org" });
// //           continue;
// //         }

// //         member.userType = "TM";
// //         member.role = role;
// //         member.orgId = org._id;
// //         member.plan = null;
// //         member.billingCycle = null;
// //         member.currentPeriodEnd = null;
// //         member.orgAssignedCap = tokens;
// //         member.orgTokensRemaining = tokens; // ✅ fixed
// //         member.tokensLastResetDateIST = todayIST;
// //         await member.save();
// //       } else {
// //         member = await User.create({
// //           name: name || normEmail.split("@")[0],
// //           email: normEmail,
// //           isVerified: false,
// //           userType: "TM",
// //           role,
// //           orgId: org._id,
// //           plan: null,
// //           billingCycle: null,
// //           currentPeriodEnd: null,
// //           orgAssignedCap: tokens,
// //           orgTokensRemaining: tokens, // ✅ fixed
// //           tokensLastResetDateIST: todayIST,
// //         });
// //       }

// //       org.members.push({
// //         userId: member._id,
// //         role: role === "Admin" ? "ADMIN" : "MEMBER",
// //         assignedCap: tokens,
// //         usedThisPeriod: 0,
// //         sectionUsage: {},
// //       });

// //       // ✅ Update org totals
// //       org.totalAssignedCap = (org.totalAssignedCap || 0) + tokens;
// //       org.orgPoolUsed = (org.orgPoolUsed || 0) + tokens;
// //       assignable -= tokens;

// //       org.teamMembersLimitRemaining = Math.max(0, maxMembers - org.members.length);

// //       results.push({ email, success: true, created: !member.isVerified, tokens });
// //     }

// //     await org.save();

// //     return res.json({
// //       success: true,
// //       orgId: org._id,
// //       results,
// //       orgAssignableRemaining: assignable,
// //       teamMembersLimitRemaining: org.teamMembersLimitRemaining,
// //     });
// //   } catch (err) {
// //     console.error("org/members/add", err);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // // =====================================
// // // GET all org members
// // // =====================================
// // router.get("/", requireAuth, async (req, res) => {
// //   try {
// //     if (!req.user.orgId) {
// //       return res.status(400).json({ success: false, error: "no_org" });
// //     }
// //     const members = await User.find({ orgId: req.user.orgId })
// //       .select("_id name email userType role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining")
// //       .lean();

// //     return res.json({ success: true, members });
// //   } catch (err) {
// //     console.error("org/members", err);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // // =====================================
// // // EDIT member (role or tokens)
// // // =====================================
// // router.patch("/edit/:memberId", requireAuth, async (req, res) => {
// //   try {
// //     const { memberId } = req.params;
// //     const { role, tokens } = req.body;

// //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_org_owner" });
// //     }

// //     const org = await Organization.findById(req.user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     const member = await User.findById(memberId);
// //     if (!member || String(member.orgId) !== String(org._id)) {
// //       return res.status(404).json({ success: false, error: "member_not_found" });
// //     }

// //     const orgMember = org.members.find((m) => String(m.userId) === String(member._id));
// //     if (!orgMember) {
// //       return res.status(404).json({ success: false, error: "member_record_not_found_in_org" });
// //     }

// //     // ✅ Update role
// //     if (role) {
// //       if (!["Admin", "Member"].includes(role)) {
// //         return res.status(400).json({ success: false, error: "invalid_role" });
// //       }
// //       member.role = role;
// //       orgMember.role = role === "Admin" ? "ADMIN" : "MEMBER";
// //     }

// //     // ✅ Update tokens
// //     if (tokens !== undefined) {
// //       const newCap = Number(tokens);
// //       if (isNaN(newCap) || newCap < 0) {
// //         return res.status(400).json({ success: false, error: "invalid_token_value" });
// //       }

// //       const used = orgMember.assignedCap - member.orgTokensRemaining;
// //       const diff = newCap - orgMember.assignedCap;

// //       const totalAvailable = (org.orgPoolCap || 0) + (org.orgExtraTokensRemaining || 0);
// //       const totalCurrentlyAssigned = org.totalAssignedCap || 0;

// //       if (totalCurrentlyAssigned + diff > totalAvailable) {
// //         return res.status(400).json({
// //           success: false,
// //           error: "insufficient_org_tokens",
// //           available: totalAvailable - totalCurrentlyAssigned,
// //         });
// //       }

// //       // ✅ Update org totals and usage
// //       org.totalAssignedCap += diff;
// //       org.orgPoolUsed = Math.max(0, (org.orgPoolUsed || 0) + diff);
// //       orgMember.assignedCap = newCap;

// //       const newRemaining = Math.max(0, newCap - used);
// //       member.orgAssignedCap = newCap;
// //       member.orgTokensRemaining = newRemaining;
// //       member.tokensLastResetDateIST = getISTDateString();
// //     }

// //     await member.save();
// //     await org.save();

// //     res.json({
// //       success: true,
// //       message: "member_updated",
// //       member: {
// //         id: member._id,
// //         name: member.name,
// //         email: member.email,
// //         role: member.role,
// //         orgAssignedCap: member.orgAssignedCap,
// //         orgTokensRemaining: member.orgTokensRemaining,
// //       },
// //       organization: {
// //         id: org._id,
// //         totalAssignedCap: org.totalAssignedCap,
// //         orgPoolUsed: org.orgPoolUsed,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("org/members/edit", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });




// // //delete member
// // router.delete("/:memberId", requireAuth, async (req, res) => {
// //   try {
// //     const { memberId } = req.params;

// //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_org_owner" });
// //     }

// //     const org = await Organization.findById(req.user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     const member = await User.findById(memberId);
// //     if (!member || String(member.orgId) !== String(org._id)) {
// //       return res.status(404).json({ success: false, error: "member_not_found" });
// //     }

// //     const memberIndex = org.members.findIndex((m) => String(m.userId) === String(member._id));
// //     if (memberIndex === -1) {
// //       return res.status(404).json({ success: false, error: "member_not_in_org" });
// //     }

// //     const orgMember = org.members[memberIndex];

// //     // 🔹 Release unspent tokens
// //     const unspent = member.orgTokensRemaining || 0;
// //     org.orgPoolUsed = Math.max(0, org.orgPoolUsed - unspent);
// //     org.totalAssignedCap = Math.max(0, org.totalAssignedCap - orgMember.assignedCap);

// //     // 🔹 Remove from active members
// //     org.members.splice(memberIndex, 1);
// //     await org.save();

// //     // 🔹 Soft delete member from org
// //     member.isDeletedFromOrg = true;
// //     member.deletedAt = new Date();
// //     member.orgTokensRemaining = 0;
// //     member.orgAssignedCap = 0;
    
// //      member.orgId = org._id; // keep orgId reference for easy rejoin
// //     await member.save();

// //     res.json({
// //       success: true,
// //       message: "member_soft_deleted",
// //       releasedTokens: unspent,
// //       org: {
// //         id: org._id,
// //         totalAssignedCap: org.totalAssignedCap,
// //         orgPoolUsed: org.orgPoolUsed,
// //         membersRemaining: org.members.length,
// //       },
// //       member: {
// //         id: member._id,
// //         email: member.email,
// //         isDeletedFromOrg: member.isDeletedFromOrg,
// //         deletedAt: member.deletedAt,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("org/members/delete", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // // 📁 routes/org.js (or similar)

// // router.post("/resend-invite/:memberId", requireAuth, async (req, res) => {
// //   try {
// //     // ✅ Only org owner can resend invitations
// //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_org_owner" });
// //     }

// //     const org = await Organization.findById(req.user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     // ✅ Find the member by ID
// //     const member = await User.findById(req.params.memberId);
// //     if (!member) return res.status(404).json({ success: false, error: "member_not_found" });

// //     // ✅ Ensure this member belongs to the same org
// //     if (String(member.orgId) !== String(org._id)) {
// //       return res.status(403).json({ success: false, error: "member_not_in_this_org" });
// //     }

// //     // ✅ Optional: Check if already verified
// //     if (member.isVerified) {
// //       return res.status(400).json({ success: false, error: "member_already_verified" });
// //     }

// //     // ✅ Generate invite link
// //     const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.world/login?invite="`${member._id}`;

// //     // ✅ Build email HTML (use the template we created earlier)
// //     const html = resendInvitationTemplate
// //       .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
// //       .replace(/{{memberEmail}}/g, member.email)
// //       .replace(/{{orgName}}/g, org.name)
// //       .replace(/{{loginLink}}/g, inviteUrl);

// //     // ✅ Send the reminder email
// //     await sendEmail({
// //       to: member.email,
// //       subject: `Reminder: Your Tokun.World Invitation Awaits 🚀`,
// //       html,
// //     });

// //     return res.json({
// //       success: true,
// //       message: "Invitation resent successfully",
// //       invitedEmail: member.email,
// //     });
// //   } catch (err) {
// //     console.error("resend-invite error:", err);
// //     return res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // router.patch("/rejoin/:memberId", requireAuth, async (req, res) => {
// //   try {
// //     const { memberId } = req.params;
// //     const { role, tokens } = req.body;

// //     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
// //       return res.status(403).json({ success: false, error: "not_org_owner" });
// //     }

// //     const org = await Organization.findById(req.user.orgId);
// //     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

// //     const member = await User.findById(memberId);
// //     if (!member || String(member.orgId) !== String(org._id) || !member.isDeletedFromOrg) {
// //       return res.status(404).json({ success: false, error: "member_not_found_or_not_deleted" });
// //     }

// //     // Restore member details
// //     member.isDeletedFromOrg = false;
// //     member.deletedAt = null;
// //     member.role = role || "Member";
// //     member.orgTokensRemaining = tokens || 0;
// //     member.orgAssignedCap = tokens || 0;
// //     await member.save();

// //     // Re-add to organization
// //     org.members.push({
// //       userId: member._id,
// //       role: role?.toUpperCase() || "MEMBER",
// //       assignedCap: tokens || 0,
// //       usedThisPeriod: 0,
// //       sectionUsage: {},
// //     });
// //     org.totalAssignedCap += tokens || 0;
// //     await org.save();

// //     res.json({
// //       success: true,
// //       message: "member_rejoined_successfully",
// //       member: {
// //         id: member._id,
// //         email: member.email,
// //         role: member.role,
// //         orgAssignedCap: member.orgAssignedCap,
// //         orgTokensRemaining: member.orgTokensRemaining,
// //         isVerified: member.isVerified
// //       },
// //     });
// //   } catch (err) {
// //     console.error("org/members/rejoin", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });


// // // ===============================
// // // GET all members of an organization
// // // ===============================
// // router.get("/emaillist", requireAuth, async (req, res) => {
// //   try {
// //     //const { orgId } = req.params;
// //     const user = req.user;

// //     // ✅ Verify that requester belongs to this org or is owner/admin
// //     if (!user.orgId ) {
// //       return res.status(403).json({ success: false, error: "unauthorized" });
// //     }

// //     const org = await Organization.findById(user.orgId)
// //       .populate("members.userId", "email _id name")
// //       .populate("ownerId", "email _id name");

// //     if (!org) {
// //       return res.status(404).json({ success: false, error: "organization_not_found" });
// //     }

// //     // ✅ Build list of members with only required fields
// //     const members = org.members.map((m) => ({
// //       userId: m.userId?._id,
// //       email: m.userId?.email,
       
// //       orgId: org._id,
       
// //     }));

     

// //     res.json({
// //       success: true,
// //       orgId: org._id,
// //       totalMembers: members.length , // +1 for owner
// //       members: [members],
// //     });
// //   } catch (err) {
// //     console.error("get organization members error:", err);
// //     res.status(500).json({ success: false, error: "server_error" });
// //   }
// // });

// // module.exports = router;





// /*// src/routes/orgMembers.js
// const express = require("express");
// const router = express.Router();

// const User = require("../models/User");
// const Organization = require("../models/organization");
// const { getISTDateString } = require("../utils/quota");
// const { requireAuth } = require("../utils/auth"); // your existing middleware

// function orgAssignableRemaining(org) {
//   const base = org.orgPoolCap + org.orgExtraTokensRemaining;
//   return Math.max(0, base - org.totalAssignedCap);
// }

// router.post("/org/members/add", requireAuth, async (req, res) => {
//   const todayIST = getISTDateString();

//   try {
//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }
//     if (!req.user.plan || req.user.plan !== "enterprise") {
//       return res.status(403).json({ success: false, error: "enterprise_plan_required" });
//     }

//     const { members } = req.body; // [{ name, email, role, tokens }]
//     if (!Array.isArray(members) || members.length === 0) {
//       return res.status(400).json({ success: false, error: "members_required" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     let assignable = orgAssignableRemaining(org);
//     const results = [];

//     for (const m of members) {
//       const { name, email, role, tokens } = m || {};
//       if (!email || !role || typeof tokens !== "number" || tokens < 0) {
//         results.push({ email, success: false, error: "invalid_member_data" });
//         continue;
//       }
//       if (tokens > assignable) {
//         results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
//         continue;
//       }

//       const normEmail = String(email).toLowerCase().trim();
//       let member = await User.findOne({ email: normEmail });

//       if (member) {
//         if (member.orgId && String(member.orgId) !== String(org._id)) {
//           results.push({ email, success: false, error: "user_belongs_to_another_org" });
//           continue;
//         }
//         if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
//           results.push({ email, success: false, error: "user_already_in_org" });
//           continue;
//         }
//       }

//       if (!member) {
//         member = await User.create({
//           name: name || normEmail.split("@")[0],
//           email: normEmail,
//           isVerified: false,

//           userType: "TM",
//           role,
//           orgId: org._id,

//           plan: null,
//           billingCycle: null,
//           currentPeriodEnd: null,

//           orgAssignedCap: tokens,
//           orgTokensRemaining: tokens,
//           tokensLastResetDateIST: todayIST,
//         });
//       } else {
//         member.userType = "TM";
//         member.role = role;
//         member.orgId = org._id;
//         member.plan = null;
//         member.billingCycle = null;
//         member.currentPeriodEnd = null;
//         member.orgAssignedCap = tokens;
//         member.orgTokensRemaining = tokens;
//         member.tokensLastResetDateIST = todayIST;
//         await member.save();
//       }

//       org.members.push({
//         userId: member._id,
//         role: role === "Admin" ? "ADMIN" : "MEMBER",
//         assignedCap: tokens,
//         usedThisPeriod: 0,
//         sectionUsage: {},
//       });

//       org.totalAssignedCap += tokens;
//       assignable -= tokens;

//       results.push({ email, success: true, created: !member.isVerified, tokens });
//     }

//     await org.save();

//     return res.json({
//       success: true,
//       orgId: org._id,
//       results,
//       orgAssignableRemaining: assignable,
//     });
//   } catch (err) {
//     console.error("org/members/add", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;
// */



// // routes/orgMembersAdd.js
// const express = require("express");
// const router = express.Router();
// const { requireAuth } = require("../utils/auth");
// const User = require("../models/User");
// const Organization = require("../models/organization");
// const { PLANS } = require("../config/plans");
// const fs =require("fs");
// const path= require("path");
// const { sendEmail } = require("../utils/SendEmail"); // ← make sure filename & path match exactly


// // Helper: YYYY-MM-DD in IST
// function getISTDateString(d = new Date()) {
//   const utc = d.getTime() + d.getTimezoneOffset() * 60000;
//   const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
//   const y = ist.getFullYear();
//   const m = String(ist.getMonth() + 1).padStart(2, "0");
//   const day = String(ist.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }
// const invitationTemplate = fs.readFileSync(
//   path.join(__dirname, "../htmlTemplate/TeamMemberInviteTemplate.html"),
//   "utf-8"
// );
// const resendInvitationTemplate = fs.readFileSync(
//   path.join(__dirname, "../htmlTemplate/TeamMemberResendInviteTemplate.html"),
//   "utf-8"
// );
// // How much capacity is still assignable (not yet assigned to members)
// function orgAssignableRemaining(org) {
//   const base = (org.orgPoolCap || 0) + (org.orgExtraTokensRemaining || 0);
//   return Math.max(0, base - (org.totalAssignedCap || 0));
// }

// // Add team members (OWNER only) and assign per-member tokens from org pool
// router.post("/add", requireAuth, async (req, res) => {
//   const todayIST = getISTDateString();

//   try {
//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     // ✅ Check enterprise plan
//     if (!org.plan || org.plan !== "enterprise") {
//       return res.status(403).json({ success: false, error: "enterprise_plan_required" });
//     }

//     const { members } = req.body; // [{ name, email, role, tokens }]
//     if (!Array.isArray(members) || members.length === 0) {
//       return res.status(400).json({ success: false, error: "members_required" });
//     }

//     // -----------------------------
//     // 🔹 TEAM MEMBER LIMIT CHECK
//     // -----------------------------
//     console.log(org.teamMembersLimit)
//     const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
//     const currentMembersCount = org.members.length || 0;

//     if (currentMembersCount + members.length > maxMembers) {
//       return res.status(400).json({
//         success: false,
//         error: "team_member_limit_exceeded",
//         maxAllowed: maxMembers,
//         currentlyAdded: currentMembersCount,
//       });
//     }

//     let assignable = orgAssignableRemaining(org);
//     const results = [];

//     for (const m of members) {
//       const { name, email, role, tokens } = m || {};

//       // Basic validation
//       if (!email || !role || typeof tokens !== "number" || tokens < 0) {
//         results.push({ email, success: false, error: "invalid_member_data" });
//         continue;
//       }

//       if (!["Admin", "Member"].includes(role)) {
//         results.push({ email, success: false, error: "invalid_role" });
//         continue;
//       }

//       if (tokens > assignable) {
//         results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
//         continue;
//       }

//       const normEmail = String(email).toLowerCase().trim();
//       let member = await User.findOne({ email: normEmail });

//       if (member) {
//         if (member.orgId && String(member.orgId) !== String(org._id)) {
//           results.push({ email, success: false, error: "user_belongs_to_another_org" });
//           continue;
//         }
//         if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
//           results.push({ email, success: false, error: "user_already_in_org" });
//           continue;
//         }

//         member.userType = "TM";
//         member.role = role;
//         member.orgId = org._id;
//         member.plan = null;
//         member.billingCycle = null;
//         member.currentPeriodEnd = null;
//         member.orgAssignedCap = tokens;
//         member.orgTokensRemaining = tokens;
//         member.tokensLastResetDateIST = todayIST;

//         await member.save();
//       } else {
//         member = await User.create({
//           name: name || normEmail.split("@")[0],
//           email: normEmail,
//           isVerified: false,
//           userType: "TM",
//           role,
//           orgId: org._id,
//           plan: null,
//           billingCycle: null,
//           currentPeriodEnd: null,
//           orgAssignedCap: tokens,
//           orgTokensRemaining: tokens,
//           tokensLastResetDateIST: todayIST,
//         });
//       }

//       org.members.push({
//         userId: member._id,
//         role: role === "Admin" ? "ADMIN" : "MEMBER",
//         assignedCap: tokens,
//         usedThisPeriod: 0,
//         sectionUsage: {},
//       });

//       org.totalAssignedCap += tokens;
//       assignable -= tokens;

//       // ✅ Decrease teamMembersLimitRemaining
//       org.teamMembersLimitRemaining = Math.max(0, maxMembers - org.members.length);

     


//     try {
//         const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.world/login?invite="`${member._id}`;

//         const html = invitationTemplate
//           .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
//           .replace(/{{memberEmail}}/g, member.email)
//           .replace(/{{orgName}}/g, org.name)
//           .replace(/{{loginLink}}/g, inviteUrl);

//         await sendEmail({
//           to: member.email,
//           subject: `${org.name} invites you to Tokun.World`,
//           html,
//         });
//         results.push({ email, success: true, invited:true ,created: !member.isVerified, tokens });

        
//       } catch (mailErr) {
//         console.error(`Failed to send invitation to ${email}:`, mailErr);
//         results.push({ email, success: true, invited: false, warning: "email_failed" });
//       }

//     }
    

//     await org.save();


 


//     return res.json({
//       success: true,
//       orgId: org._id,
//       results,
//       orgAssignableRemaining: assignable,
//       teamMembersLimitRemaining: org.teamMembersLimitRemaining, // return for frontend
//     });
//   } catch (err) {
//     console.error("org/members/add", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });













// //get all members  of org
// router.get("/", requireAuth, async (req, res) => {
//   try {
//     if (!req.user.orgId) {
//       return res.status(400).json({ success: false, error: "no_org" });
//     }
//     const members = await User.find({ orgId: req.user.orgId })
//      .select("_id name email role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining")

//       .lean();

//     return res.json({ success: true, members });
//   } catch (err) {
//     console.error("org/members", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });




// // ✅ PATCH: Edit org member (role or tokens)
// router.patch("/edit/:memberId", requireAuth, async (req, res) => {
//   try {
//     const { memberId } = req.params;
//     const { role, tokens } = req.body;

//     // 🧭 Validate user = org owner
//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     const member = await User.findById(memberId);
//     if (!member || String(member.orgId) !== String(org._id)) {
//       return res.status(404).json({ success: false, error: "member_not_found" });
//     }

//     // 🧩 Locate the member in organization.members array
//     const orgMember = org.members.find((m) => String(m.userId) === String(member._id));
//     if (!orgMember) {
//       return res.status(404).json({ success: false, error: "member_record_not_found_in_org" });
//     }

//     // -----------------------
//     // 🔹 1️⃣ Update role
//     // -----------------------
//     if (role) {
//       if (!["Admin", "Member"].includes(role)) {
//         return res.status(400).json({ success: false, error: "invalid_role" });
//       }

//       member.role = role;
//       orgMember.role = role === "Admin" ? "ADMIN" : "MEMBER";
//     }

//     // -----------------------
// // 🔹 2️⃣ Update tokens
// // -----------------------
// if (tokens !== undefined) {
//   const numTokens = Number(tokens);
//   if (isNaN(numTokens) || numTokens < 0) {
//     return res.status(400).json({ success: false, error: "invalid_token_value" });
//   }

//   const used = orgMember.assignedCap - member.orgTokensRemaining; // tokens already used
//   const diff = numTokens - orgMember.assignedCap;

//   // Ensure org has capacity to assign diff
//   const totalAvailable = org.orgPoolCap + org.orgExtraTokensRemaining - org.orgPoolUsed;
//   const totalCurrentlyAssigned = org.totalAssignedCap;
//   if (totalCurrentlyAssigned + diff > totalAvailable) {
//     return res.status(400).json({
//       success: false,
//       error: "insufficient_org_tokens",
//       available: totalAvailable - totalCurrentlyAssigned,
//     });
//   }

//   org.totalAssignedCap += diff;
//   orgMember.assignedCap = numTokens;

//   // ✅ Preserve usage
//   const newRemaining = Math.max(0, numTokens - used);

//   member.orgAssignedCap = numTokens;
//   member.orgTokensRemaining = newRemaining;
//   member.tokensLastResetDateIST = new Date().toLocaleDateString("en-CA", {
//     timeZone: "Asia/Kolkata",
//   });
// }


//     // ✅ Save both
//     await member.save();
//     await org.save();

//     res.json({
//       success: true,
//       message: "member_updated",
//       member: {
//         id: member._id,
//         name: member.name,
//         email: member.email,
//         role: member.role,
//         orgAssignedCap: member.orgAssignedCap,
//         orgTokensRemaining: member.orgTokensRemaining,
//       },
//       organization: {
//         id: org._id,
//         totalAssignedCap: org.totalAssignedCap,
//       },
//     });
//   } catch (err) {
//     console.error("org/members/edit", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// //delete member
// router.delete("/:memberId", requireAuth, async (req, res) => {
//   try {
//     const { memberId } = req.params;

//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     const member = await User.findById(memberId);
//     if (!member || String(member.orgId) !== String(org._id)) {
//       return res.status(404).json({ success: false, error: "member_not_found" });
//     }

//     const memberIndex = org.members.findIndex((m) => String(m.userId) === String(member._id));
//     if (memberIndex === -1) {
//       return res.status(404).json({ success: false, error: "member_not_in_org" });
//     }

//     const orgMember = org.members[memberIndex];

//     // 🔹 Release unspent tokens
//     const unspent = member.orgTokensRemaining || 0;
//     org.orgPoolUsed = Math.max(0, org.orgPoolUsed - unspent);
//     org.totalAssignedCap = Math.max(0, org.totalAssignedCap - orgMember.assignedCap);

//     // 🔹 Remove from active members
//     org.members.splice(memberIndex, 1);
//     await org.save();

//     // 🔹 Soft delete member from org
//     member.isDeletedFromOrg = true;
//     member.deletedAt = new Date();
//     member.orgTokensRemaining = 0;
//     member.orgAssignedCap = 0;
    
//      member.orgId = org._id; // keep orgId reference for easy rejoin
//     await member.save();

//     res.json({
//       success: true,
//       message: "member_soft_deleted",
//       releasedTokens: unspent,
//       org: {
//         id: org._id,
//         totalAssignedCap: org.totalAssignedCap,
//         orgPoolUsed: org.orgPoolUsed,
//         membersRemaining: org.members.length,
//       },
//       member: {
//         id: member._id,
//         email: member.email,
//         isDeletedFromOrg: member.isDeletedFromOrg,
//         deletedAt: member.deletedAt,
//       },
//     });
//   } catch (err) {
//     console.error("org/members/delete", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// // 📁 routes/org.js (or similar)

// router.post("/resend-invite/:memberId", requireAuth, async (req, res) => {
//   try {
//     // ✅ Only org owner can resend invitations
//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     // ✅ Find the member by ID
//     const member = await User.findById(req.params.memberId);
//     if (!member) return res.status(404).json({ success: false, error: "member_not_found" });

//     // ✅ Ensure this member belongs to the same org
//     if (String(member.orgId) !== String(org._id)) {
//       return res.status(403).json({ success: false, error: "member_not_in_this_org" });
//     }

//     // ✅ Optional: Check if already verified
//     if (member.isVerified) {
//       return res.status(400).json({ success: false, error: "member_already_verified" });
//     }

//     // ✅ Generate invite link
//     const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.world/login?invite="`${member._id}`;

//     // ✅ Build email HTML (use the template we created earlier)
//     const html = resendInvitationTemplate
//       .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
//       .replace(/{{memberEmail}}/g, member.email)
//       .replace(/{{orgName}}/g, org.name)
//       .replace(/{{loginLink}}/g, inviteUrl);

//     // ✅ Send the reminder email
//     await sendEmail({
//       to: member.email,
//       subject: `Reminder: Your Tokun.World Invitation Awaits 🚀`,
//       html,
//     });

//     return res.json({
//       success: true,
//       message: "Invitation resent successfully",
//       invitedEmail: member.email,
//     });
//   } catch (err) {
//     console.error("resend-invite error:", err);
//     return res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// router.patch("/rejoin/:memberId", requireAuth, async (req, res) => {
//   try {
//     const { memberId } = req.params;
//     const { role, tokens } = req.body;

//     if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
//       return res.status(403).json({ success: false, error: "not_org_owner" });
//     }

//     const org = await Organization.findById(req.user.orgId);
//     if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

//     const member = await User.findById(memberId);
//     if (!member || String(member.orgId) !== String(org._id) || !member.isDeletedFromOrg) {
//       return res.status(404).json({ success: false, error: "member_not_found_or_not_deleted" });
//     }

//     // Restore member details
//     member.isDeletedFromOrg = false;
//     member.deletedAt = null;
//     member.role = role || "Member";
//     member.orgTokensRemaining = tokens || 0;
//     member.orgAssignedCap = tokens || 0;
//     await member.save();

//     // Re-add to organization
//     org.members.push({
//       userId: member._id,
//       role: role?.toUpperCase() || "MEMBER",
//       assignedCap: tokens || 0,
//       usedThisPeriod: 0,
//       sectionUsage: {},
//     });
//     org.totalAssignedCap += tokens || 0;
//     await org.save();

//     res.json({
//       success: true,
//       message: "member_rejoined_successfully",
//       member: {
//         id: member._id,
//         email: member.email,
//         role: member.role,
//         orgAssignedCap: member.orgAssignedCap,
//         orgTokensRemaining: member.orgTokensRemaining,
//         isVerified: member.isVerified
//       },
//     });
//   } catch (err) {
//     console.error("org/members/rejoin", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // ===============================
// // GET all members of an organization
// // ===============================
// router.get("/emaillist", requireAuth, async (req, res) => {
//   try {
//     //const { orgId } = req.params;
//     const user = req.user;

//     // ✅ Verify that requester belongs to this org or is owner/admin
//     if (!user.orgId ) {
//       return res.status(403).json({ success: false, error: "unauthorized" });
//     }

//     const org = await Organization.findById(user.orgId)
//       .populate("members.userId", "email _id name")
//       .populate("ownerId", "email _id name");

//     if (!org) {
//       return res.status(404).json({ success: false, error: "organization_not_found" });
//     }

//     // ✅ Build list of members with only required fields
//     const members = org.members.map((m) => ({
//       userId: m.userId?._id,
//       email: m.userId?.email,
       
//       orgId: org._id,
       
//     }));

     

//     res.json({
//       success: true,
//       orgId: org._id,
//       totalMembers: members.length , // +1 for owner
//       members: [members],
//     });
//   } catch (err) {
//     console.error("get organization members error:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// module.exports = router;



/*// src/routes/orgMembers.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Organization = require("../models/organization");
const { getISTDateString } = require("../utils/quota");
const { requireAuth } = require("../utils/auth"); // your existing middleware

function orgAssignableRemaining(org) {
  const base = org.orgPoolCap + org.orgExtraTokensRemaining;
  return Math.max(0, base - org.totalAssignedCap);
}

router.post("/org/members/add", requireAuth, async (req, res) => {
  const todayIST = getISTDateString();

  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }
    if (!req.user.plan || req.user.plan !== "enterprise") {
      return res.status(403).json({ success: false, error: "enterprise_plan_required" });
    }

    const { members } = req.body; // [{ name, email, role, tokens }]
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, error: "members_required" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    let assignable = orgAssignableRemaining(org);
    const results = [];

    for (const m of members) {
      const { name, email, role, tokens } = m || {};
      if (!email || !role || typeof tokens !== "number" || tokens < 0) {
        results.push({ email, success: false, error: "invalid_member_data" });
        continue;
      }
      if (tokens > assignable) {
        results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
        continue;
      }

      const normEmail = String(email).toLowerCase().trim();
      let member = await User.findOne({ email: normEmail });

      if (member) {
        if (member.orgId && String(member.orgId) !== String(org._id)) {
          results.push({ email, success: false, error: "user_belongs_to_another_org" });
          continue;
        }
        if (member.userType === "TM" && String(member.orgId) === String(org._id)) {
          results.push({ email, success: false, error: "user_already_in_org" });
          continue;
        }
      }

      if (!member) {
        member = await User.create({
          name: name || normEmail.split("@")[0],
          email: normEmail,
          isVerified: false,

          userType: "TM",
          role,
          orgId: org._id,

          plan: null,
          billingCycle: null,
          currentPeriodEnd: null,

          orgAssignedCap: tokens,
          orgTokensRemaining: tokens,
          tokensLastResetDateIST: todayIST,
        });
      } else {
        member.userType = "TM";
        member.role = role;
        member.orgId = org._id;
        member.plan = null;
        member.billingCycle = null;
        member.currentPeriodEnd = null;
        member.orgAssignedCap = tokens;
        member.orgTokensRemaining = tokens;
        member.tokensLastResetDateIST = todayIST;
        await member.save();
      }

      org.members.push({
        userId: member._id,
        role: role === "Admin" ? "ADMIN" : "MEMBER",
        assignedCap: tokens,
        usedThisPeriod: 0,
        sectionUsage: {},
      });

      org.totalAssignedCap += tokens;
      assignable -= tokens;

      results.push({ email, success: true, created: !member.isVerified, tokens });
    }

    await org.save();

    return res.json({
      success: true,
      orgId: org._id,
      results,
      orgAssignableRemaining: assignable,
    });
  } catch (err) {
    console.error("org/members/add", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
*/
// routes/orgMembersAdd.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth");
const User = require("../models/User");
const Organization = require("../models/organization");
const Purchase = require("../models/Purchase");
const SharedPrompt = require("../models/SharedPrompt");
const OrgInvitation = require("../models/OrgInvitation");
// Required for its side effect: the dashboard's nested populate of
// prompt.categories resolves the "Category" model by name, and mongoose throws
// MissingSchemaError if nothing has registered it yet. Relying on some other
// route happening to load first would make this file order-dependent.
require("../models/Category");
const { PLANS } = require("../config/plans");
const Notification = require("../models/Notification");
const fs =require("fs");
const path= require("path");
const { sendEmail } = require("../utils/SendEmail"); // ← make sure filename & path match exactly

// In-app notification for a member whose org membership or token allowance
// changed. This file used to send an invitation EMAIL and nothing else, so a
// member who was already signed in never saw that they'd been added to an org or
// given an allowance — the notification bell stayed empty.
//
// Best-effort by design: a notification failing must never roll back the
// membership change the owner just made, so it's logged rather than thrown.
//
// receiverUserId ONLY — deliberately no receiverOrgId. GET /notifications treats
// receiverOrgId as "everyone senior in this org", so an Owner (and any TM with
// the Admin role) receives anything carrying it. Setting both fields here meant
// these messages landed in the Owner's own bell, addressed to them in the second
// person: the Owner read "Your access to Pepsi was removed" about a member they
// had just removed. receiverOrgId belongs on genuinely org-wide notices like
// TM_REQUEST, not on ones written to one member.
async function notifyMember({ owner, org, memberId, type, message, meta = {} }) {
  try {
    await Notification.create({
      senderId: owner?._id,
      senderName: owner?.name || org?.name,
      senderEmail: owner?.email,
      receiverUserId: memberId,
      type,
      message,
      // orgId kept here so the notification is still traceable to the org
      // without making it org-addressed.
      meta: { ...meta, orgId: org?._id ? String(org._id) : null },
    });
  } catch (err) {
    console.error(`Notification (${type}) failed for member ${memberId}:`, err?.message);
  }
}


// Helper: YYYY-MM-DD in IST
function getISTDateString(d = new Date()) {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const day = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const invitationTemplate = fs.readFileSync(
  path.join(__dirname, "../htmltemplate/TeamMemberInviteTemplate.html"),
  "utf-8"
);
const resendInvitationTemplate = fs.readFileSync(
  path.join(__dirname, "../htmltemplate/TeamMemberResendInviteTemplate.html"),
  "utf-8"
);
// How much capacity is still assignable (not yet assigned to members)
function orgAssignableRemaining(org) {
  const base = (org.orgPoolCap || 0) + (org.orgExtraTokensRemaining || 0);
  return Math.max(0, base - (org.totalAssignedCap || 0));
}

// Add team members (OWNER only) and assign per-member tokens from org pool
router.post("/add", requireAuth, async (req, res) => {
  const todayIST = getISTDateString();

  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    // ✅ Check enterprise plan
    if (!org.plan || org.plan !== "enterprise") {
      return res.status(403).json({ success: false, error: "enterprise_plan_required" });
    }

    const { members } = req.body; // [{ name, email, role, tokens }]
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, error: "members_required" });
    }

    // -----------------------------
    // 🔹 TEAM MEMBER LIMIT CHECK
    // -----------------------------
    const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
    const currentMembersCount = org.members.length || 0;

    if (currentMembersCount + members.length > maxMembers) {
      return res.status(400).json({
        success: false,
        error: "team_member_limit_exceeded",
        maxAllowed: maxMembers,
        currentlyAdded: currentMembersCount,
      });
    }

    let assignable = orgAssignableRemaining(org);
    const results = [];

    for (const m of members) {
      const { name, email, role, tokens } = m || {};

      // Basic validation
      if (!email || !role || typeof tokens !== "number" || tokens < 0) {
        results.push({ email, success: false, error: "invalid_member_data" });
        continue;
      }

      if (!["Admin", "Member"].includes(role)) {
        results.push({ email, success: false, error: "invalid_role" });
        continue;
      }

      if (tokens > assignable) {
        results.push({ email, success: false, error: "insufficient_org_assignable_tokens" });
        continue;
      }

      const normEmail = String(email).toLowerCase().trim();
      const existingUser = await User.findOne({ email: normEmail });

      if (existingUser) {
        if (existingUser.orgId && String(existingUser.orgId) !== String(org._id)) {
          results.push({ email, success: false, error: "user_belongs_to_another_org" });
          continue;
        }
        if (existingUser.userType === "TM" && String(existingUser.orgId) === String(org._id)) {
          results.push({ email, success: false, error: "user_already_in_org" });
          continue;
        }
      }

      const alreadyInvited = await OrgInvitation.findOne({
        orgId: org._id,
        email: normEmail,
        status: "PENDING",
      });
      if (alreadyInvited) {
        results.push({ email, success: false, error: "invitation_already_pending" });
        continue;
      }

      /* NOTHING about the invitee's account is touched here.
         This used to rewrite their User document on the spot — flipping
         userType to "TM" and clearing `plan` — which meant they were shown as
         an active member without ever seeing the invitation, and anyone on a
         paid individual plan had it wiped just by being invited. The intended
         role and allowance live on the invitation until they accept. */
      const invitation = await OrgInvitation.create({
        orgId: org._id,
        orgName: org.name,
        email: normEmail,
        userId: existingUser?._id || null,
        name: name || existingUser?.name || normEmail.split("@")[0],
        role,
        assignedCap: tokens,
        invitedBy: req.user._id,
        invitedByName: req.user.name || "",
        status: "PENDING",
      });

      /* The seat and the tokens ARE reserved from now, even though nothing has
         been granted. Otherwise an owner with 3 seats could send 10 invitations
         and over-commit both the headcount and the token pool. Released again
         if the invitation is declined, revoked or expires. */
      org.pendingInvites = (org.pendingInvites || 0) + 1;
      org.totalAssignedCap += tokens;
      assignable -= tokens;
      org.teamMembersLimitRemaining = Math.max(
        0,
        maxMembers - org.members.length - org.pendingInvites
      );

      // In-app, independent of the email below — an existing user who is signed
      // in should see this in their bell immediately, and it still lands if the
      // invitation email bounces. The Accept button reads `invitationId`.
      if (existingUser) {
        await notifyMember({
          owner: req.user,
          org,
          memberId: existingUser._id,
          type: "ORG_INVITATION",
          message: `${org.name} invited you to join their team as ${
            role === "Admin" ? "an Admin" : "a Member"
          } with ${tokens.toLocaleString("en-IN")} tokens. Accept to join.`,
          meta: {
            orgName: org.name,
            role,
            assignedCap: tokens,
            invitationId: String(invitation._id),
            requiresAction: true,
          },
        });
      }

      const member = existingUser || { _id: invitation._id, name: invitation.name, email: normEmail, isVerified: false };

    try {
        /* SITE_URL is the site ROOT; /login is appended here.

           It used to be read as though it already pointed at the login page,
           which is why the env was set to ".../login" — and that broke every
           other consumer of the variable, because emails build their CTAs as
           `${SITE_URL}/self-dash` and were producing "/login/self-dash". The
           page each link wants belongs at the link, not in the variable. */
        const base = (process.env.SITE_URL || "https://tokun.world").replace(/\/$/, "");
        const inviteUrl = `${base}/login?invite=${member._id}`;

        const html = invitationTemplate
          .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
          .replace(/{{memberEmail}}/g, member.email)
          .replace(/{{orgName}}/g, org.name)
          .replace(/{{loginLink}}/g, inviteUrl);

        await sendEmail({
          to: member.email,
          subject: `${org.name} invites you to Tokun.World`,
          html,
        });
        results.push({ email, success: true, invited:true ,created: !member.isVerified, tokens });

        
      } catch (mailErr) {
        console.error(`Failed to send invitation to ${email}:`, mailErr);
        results.push({ email, success: true, invited: false, warning: "email_failed" });
      }

    }
    

    await org.save();


 


    return res.json({
      success: true,
      orgId: org._id,
      results,
      orgAssignableRemaining: assignable,
      teamMembersLimitRemaining: org.teamMembersLimitRemaining, // return for frontend
    });
  } catch (err) {
    console.error("org/members/add", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   INVITATIONS — the consent step between "the owner added you" and "you are a
   member". Nothing about the invitee's account changes until they accept.
   ══════════════════════════════════════════════════════════════════════════ */

/** Frees the seat and tokens an outstanding invitation was holding. */
async function releaseInviteReservation(org, invitation) {
  org.pendingInvites = Math.max(0, (org.pendingInvites || 0) - 1);
  org.totalAssignedCap = Math.max(0, org.totalAssignedCap - Number(invitation.assignedCap || 0));

  const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
  org.teamMembersLimitRemaining = Math.max(
    0,
    maxMembers - org.members.length - (org.pendingInvites || 0)
  );
  await org.save();
}

/* GET /api/org/members/invitations/mine — what's waiting for me.
   Matched on email as well as userId, because most invitations are sent to
   people who had no account at the time and so were never linked by id. */
router.get("/invitations/mine", requireAuth, async (req, res) => {
  try {
    const invitations = await OrgInvitation.find({
      status: "PENDING",
      $or: [{ userId: req.user._id }, { email: String(req.user.email || "").toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      invitations: invitations.map((i) => ({
        _id: i._id,
        orgName: i.orgName,
        role: i.role,
        assignedCap: i.assignedCap,
        invitedByName: i.invitedByName,
        createdAt: i.createdAt,
      })),
    });
  } catch (err) {
    console.error("org invitations/mine", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* POST /api/org/members/invitations/:id/accept */
router.post("/invitations/:id/accept", requireAuth, async (req, res) => {
  const todayIST = getISTDateString();

  try {
    const invitation = await OrgInvitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, error: "invitation_not_found" });

    const isMine =
      String(invitation.userId || "") === String(req.user._id) ||
      String(invitation.email || "").toLowerCase() === String(req.user.email || "").toLowerCase();
    if (!isMine) return res.status(403).json({ success: false, error: "not_your_invitation" });

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "invitation_not_pending",
        message: `This invitation was already ${invitation.status.toLowerCase()}.`,
      });
    }

    // Re-checked at accept time, not just at invite time — they may have joined
    // a different org in between.
    const me = await User.findById(req.user._id);
    if (me.orgId && String(me.orgId) !== String(invitation.orgId)) {
      return res.status(400).json({
        success: false,
        error: "already_in_another_org",
        message: "You're already part of another organization. Leave it before joining a new one.",
      });
    }

    const org = await Organization.findById(invitation.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    /* Only now does the account change. This is the work /add used to do
       immediately — moved behind the person's consent, which is also what stops
       an invitation silently clearing someone's paid individual plan. */
    me.userType = "TM";
    me.role = invitation.role;
    me.orgId = org._id;
    me.plan = null;
    me.billingCycle = null;
    me.currentPeriodEnd = null;
    me.orgAssignedCap = invitation.assignedCap;
    me.orgTokensRemaining = invitation.assignedCap;
    me.tokensLastResetDateIST = todayIST;
    await me.save();

    /* The reservation becomes a real seat rather than being released: the
       tokens were already counted into totalAssignedCap when the invitation
       went out, so only the pending counter moves. */
    org.members.push({
      userId: me._id,
      role: invitation.role === "Admin" ? "ADMIN" : "MEMBER",
      assignedCap: invitation.assignedCap,
      usedThisPeriod: 0,
      sectionUsage: {},
    });
    org.pendingInvites = Math.max(0, (org.pendingInvites || 0) - 1);

    const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
    org.teamMembersLimitRemaining = Math.max(
      0,
      maxMembers - org.members.length - (org.pendingInvites || 0)
    );
    await org.save();

    invitation.status = "ACCEPTED";
    invitation.userId = me._id;
    invitation.respondedAt = new Date();
    await invitation.save();

    try {
      await Notification.create({
        senderId: me._id,
        senderName: me.name,
        receiverUserId: invitation.invitedBy,
        type: "ORG_INVITATION_ACCEPTED",
        message: `${me.name || me.email} accepted your invitation to join ${org.name}.`,
        meta: { orgName: org.name, role: invitation.role },
      });
    } catch (notifyErr) {
      console.error("Invitation-accepted notification failed:", notifyErr.message);
    }

    return res.json({
      success: true,
      message: `You've joined ${org.name}.`,
      org: { _id: org._id, name: org.name },
      role: invitation.role,
      assignedCap: invitation.assignedCap,
    });
  } catch (err) {
    console.error("org invitation accept", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* POST /api/org/members/invitations/:id/decline */
router.post("/invitations/:id/decline", requireAuth, async (req, res) => {
  try {
    const invitation = await OrgInvitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, error: "invitation_not_found" });

    const isMine =
      String(invitation.userId || "") === String(req.user._id) ||
      String(invitation.email || "").toLowerCase() === String(req.user.email || "").toLowerCase();
    if (!isMine) return res.status(403).json({ success: false, error: "not_your_invitation" });

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "invitation_not_pending" });
    }

    invitation.status = "DECLINED";
    invitation.respondedAt = new Date();
    await invitation.save();

    // Give the seat and its tokens back to the org.
    const org = await Organization.findById(invitation.orgId);
    if (org) await releaseInviteReservation(org, invitation);

    try {
      await Notification.create({
        senderId: req.user._id,
        senderName: req.user.name,
        receiverUserId: invitation.invitedBy,
        type: "ORG_INVITATION_DECLINED",
        message: `${req.user.name || req.user.email} declined your invitation to join ${invitation.orgName}.`,
        meta: { orgName: invitation.orgName },
      });
    } catch (notifyErr) {
      console.error("Invitation-declined notification failed:", notifyErr.message);
    }

    return res.json({ success: true, message: "Invitation declined." });
  } catch (err) {
    console.error("org invitation decline", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* POST /api/org/members/invitations/:id/revoke — the owner takes it back. */
router.post("/invitations/:id/revoke", requireAuth, async (req, res) => {
  try {
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const invitation = await OrgInvitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, error: "invitation_not_found" });
    if (String(invitation.orgId) !== String(req.user.orgId)) {
      return res.status(403).json({ success: false, error: "not_your_org" });
    }
    if (invitation.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "invitation_not_pending" });
    }

    invitation.status = "REVOKED";
    invitation.respondedAt = new Date();
    await invitation.save();

    const org = await Organization.findById(invitation.orgId);
    if (org) await releaseInviteReservation(org, invitation);

    return res.json({ success: true, message: "Invitation revoked." });
  } catch (err) {
    console.error("org invitation revoke", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});













//get all members  of org
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.user.orgId) {
      return res.status(400).json({ success: false, error: "no_org" });
    }

    // Only the Owner or a member explicitly given the "Admin" role may see
    // the team roster (names/emails/token allocations) — plain Members
    // should not be able to enumerate the rest of the org.
    const isOwner = req.user.userType === "ORG" && req.user.role === "Owner";
    const isAdminMember = req.user.userType === "TM" && req.user.role === "Admin";
    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const org = await Organization.findById(req.user.orgId).select(
      "teamMembersLimit teamMembersLimitRemaining"
    );

    // userType: "TM" matters. The Owner's own User doc also carries this orgId,
    // so without the filter they came back as a row in their own team roster —
    // and since an org signs up under the company name, that row rendered as the
    // organization's name sitting in the Team Members list.
    const members = await User.find({ orgId: req.user.orgId, userType: "TM" })
     .select("_id name email role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining")

      .lean();

    /* Outstanding invitations are shown alongside real members, because from
       the owner's point of view they're the same thing: a seat and an
       allowance that has been committed. Without this they'd vanish from the
       roster entirely between sending and acceptance, while still counting
       against the limit — which reads as tokens going missing. */
    const invitations = await OrgInvitation.find({
      orgId: req.user.orgId,
      status: "PENDING",
    })
      .select("_id name email role assignedCap createdAt")
      .lean();

    return res.json({
      success: true,
      members: [
        ...members.map((m) => ({ ...m, membershipStatus: "ACTIVE", isInvitation: false })),
        ...invitations.map((i) => ({
          _id: i._id,
          name: i.name,
          email: i.email,
          role: i.role,
          isVerified: false,
          isDeletedFromOrg: false,
          orgAssignedCap: i.assignedCap,
          // Nothing has been granted yet, so there is nothing available to
          // spend — showing the full allowance here would imply otherwise.
          orgTokensRemaining: 0,
          membershipStatus: "INVITED",
          isInvitation: true,
          invitedAt: i.createdAt,
        })),
      ],
      teamMembersLimit: org?.teamMembersLimit || 0,
      teamMembersLimitRemaining: org?.teamMembersLimitRemaining || 0,
    });
  } catch (err) {
    console.error("org/members", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// ✅ GET /api/org/members/dashboard — org-wide overview for the Owner (or a
// TM with the "Admin" role): org/quota state, the team roster, and rolled-up
// activity (what the team has bought, what's been shared) computed live from
// Purchase/SharedPrompt rather than the never-populated usedThisPeriod
// counters on Organization.members[].
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    if (!req.user.orgId) {
      return res.status(400).json({ success: false, error: "no_org" });
    }

    const isOwner = req.user.userType === "ORG" && req.user.role === "Owner";
    const isAdminMember = req.user.userType === "TM" && req.user.role === "Admin";
    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ success: false, error: "not_authorized" });
    }

    const org = await Organization.findById(req.user.orgId).lean();
    if (!org) {
      return res.status(404).json({ success: false, error: "org_not_found" });
    }

    // Team members only. The Owner shares this orgId, so without the userType
    // filter they appeared as one of their own team members — see GET / above.
    const members = await User.find({ orgId: req.user.orgId, userType: "TM" })
      .select("_id name email role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining createdAt")
      .lean();

    // Purchases attributable to the org = the owner's own purchases plus every
    // team member's. The owner is added explicitly here precisely because
    // `members` is now team-members-only; in practice members contribute
    // nothing, since blockOrgTeamMemberPurchase stops them buying at all.
    const teamUserIds = [org.ownerId, ...members.map((m) => m._id)];

    const [
      purchaseAgg,
      recentPurchases,
      sharedCount,
      recentShares,
      requestCount,
      recentRequests,
    ] = await Promise.all([
      Purchase.aggregate([
        { $match: { buyer: { $in: teamUserIds }, paymentStatus: "SUCCESS" } },
        { $group: { _id: null, count: { $sum: 1 }, totalSpent: { $sum: "$pricePaid" } } },
      ]),
      Purchase.find({ buyer: { $in: teamUserIds }, paymentStatus: "SUCCESS" })
        .populate("buyer", "name email")
        .populate("prompt", "title")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      SharedPrompt.countDocuments({ orgId: req.user.orgId }),
      SharedPrompt.find({ orgId: req.user.orgId })
        // Enough to render a real prompt card, not just a line of text —
        // thumbnail, price and category, the same fields the marketplace card
        // uses. categories is a ref array, so it needs its own nested populate.
        .populate({
          path: "promptId",
          select: "title price tokun_price free attachment categories deleted",
          populate: { path: "categories", select: "name" },
        })
        .populate("sharedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // What team members have actually asked for. Members can't buy — they
      // send a TM_REQUEST via /api/prompt-collab/team/request — and until now
      // those only existed as a notification the owner had to scroll to find.
      // The dashboard is where the owner decides what to buy, so it belongs here.
      Notification.countDocuments({ receiverOrgId: req.user.orgId, type: "TM_REQUEST" }),
      Notification.find({ receiverOrgId: req.user.orgId, type: "TM_REQUEST" })
        // Same field set as the shares above, so both panels can render the
        // identical prompt card.
        .populate({
          path: "promptId",
          select: "title price tokun_price free attachment categories deleted",
          populate: { path: "categories", select: "name" },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return res.json({
      success: true,
      org: {
        name: org.name,
        plan: org.plan,
        billingCycle: org.billingCycle,
        currentPeriodEnd: org.currentPeriodEnd,
        subscriptionStatus: org.subscriptionStatus,
        orgPoolCap: org.orgPoolCap || 0,
        orgPoolUsed: org.orgPoolUsed || 0,
        orgExtraTokensRemaining: org.orgExtraTokensRemaining || 0,
        teamMembersLimit: org.teamMembersLimit || 0,
        teamMembersLimitRemaining: org.teamMembersLimitRemaining || 0,
      },
      members,
      teamPurchases: {
        count: purchaseAgg[0]?.count || 0,
        totalSpent: purchaseAgg[0]?.totalSpent || 0,
        recent: recentPurchases.map((p) => ({
          id: p._id,
          promptTitle: p.prompt?.title || p.promptSnapshot?.title || "Untitled",
          buyerName: p.buyer?.name || p.buyer?.email || "Unknown",
          pricePaid: p.pricePaid,
          purchasedAt: p.purchasedAt || p.createdAt,
        })),
      },
      sharedPrompts: {
        count: sharedCount,
        recent: recentShares.map((sp) => ({
          id: sp._id,
          promptId: sp.promptId?._id || null,
          promptTitle: sp.promptId?.title || "Untitled",
          // Absolute or API-relative; the client's mediaUrl() resolves either.
          thumbnail: sp.promptId?.attachment?.type === "image" ? sp.promptId.attachment.path : null,
          category: sp.promptId?.categories?.[0]?.name || null,
          isFree: Boolean(sp.promptId?.free),
          // What a buyer pays, same figure the marketplace card shows.
          price: sp.promptId?.tokun_price || sp.promptId?.price || 0,
          promptDeleted: Boolean(sp.promptId?.deleted),
          sharedByName: sp.sharedBy?.name || sp.sharedBy?.email || "Owner",
          sharedToCount: (sp.sharedTo || []).length,
          sharedAt: sp.createdAt,
        })),
      },
      teamRequests: {
        count: requestCount,
        unread: recentRequests.filter((n) => !n.read).length,
        recent: recentRequests.map((n) => ({
          id: n._id,
          promptId: n.promptId?._id || null,
          promptTitle: n.promptId?.title || "Untitled",
          thumbnail: n.promptId?.attachment?.type === "image" ? n.promptId.attachment.path : null,
          category: n.promptId?.categories?.[0]?.name || null,
          isFree: Boolean(n.promptId?.free),
          // What the owner would pay if they buy it, matching the marketplace.
          price: n.promptId?.tokun_price || n.promptId?.price || 0,
          promptDeleted: Boolean(n.promptId?.deleted),
          requestedByName: n.senderName || n.senderEmail || "Team member",
          message: n.message || "",
          read: Boolean(n.read),
          requestedAt: n.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error("org/members/dashboard error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});




// ✅ PATCH: Edit org member (role or tokens)
router.patch("/edit/:memberId", requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, tokens } = req.body;

    // 🧭 Validate user = org owner
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const member = await User.findById(memberId);
    if (!member || String(member.orgId) !== String(org._id)) {
      return res.status(404).json({ success: false, error: "member_not_found" });
    }

    // Set below only when the allowance actually changes, so the member isn't
    // notified about a role-only edit.
    let tokenChange = null;

    // 🧩 Locate the member in organization.members array
    const orgMember = org.members.find((m) => String(m.userId) === String(member._id));
    if (!orgMember) {
      return res.status(404).json({ success: false, error: "member_record_not_found_in_org" });
    }

    // -----------------------
    // 🔹 1️⃣ Update role
    // -----------------------
    if (role) {
      if (!["Admin", "Member"].includes(role)) {
        return res.status(400).json({ success: false, error: "invalid_role" });
      }

      member.role = role;
      orgMember.role = role === "Admin" ? "ADMIN" : "MEMBER";
    }

    // -----------------------
// 🔹 2️⃣ Update tokens
// -----------------------
if (tokens !== undefined) {
  const numTokens = Number(tokens);
  if (isNaN(numTokens) || numTokens < 0) {
    return res.status(400).json({ success: false, error: "invalid_token_value" });
  }

  const used = orgMember.assignedCap - member.orgTokensRemaining; // tokens already used
  const diff = numTokens - orgMember.assignedCap;

  // Ensure org has capacity to assign diff
  const totalAvailable = org.orgPoolCap + org.orgExtraTokensRemaining - org.orgPoolUsed;
  const totalCurrentlyAssigned = org.totalAssignedCap;
  if (totalCurrentlyAssigned + diff > totalAvailable) {
    return res.status(400).json({
      success: false,
      error: "insufficient_org_tokens",
      available: totalAvailable - totalCurrentlyAssigned,
    });
  }

  org.totalAssignedCap += diff;
  orgMember.assignedCap = numTokens;

  // ✅ Preserve usage
  const newRemaining = Math.max(0, numTokens - used);

  member.orgAssignedCap = numTokens;
  member.orgTokensRemaining = newRemaining;
  member.tokensLastResetDateIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  tokenChange = { from: orgMember.assignedCap - diff, to: numTokens, remaining: newRemaining };
}


    // ✅ Save both
    await member.save();
    await org.save();

    // Told only after both saves succeed, so the member is never notified about
    // an allowance change that didn't persist.
    if (tokenChange) {
      const raised = tokenChange.to > tokenChange.from;
      await notifyMember({
        owner: req.user,
        org,
        memberId: member._id,
        type: "ORG_TOKENS_UPDATED",
        message: `Your token allowance in ${org.name} was ${raised ? "increased" : "changed"} to ${tokenChange.to.toLocaleString("en-IN")} (${tokenChange.remaining.toLocaleString("en-IN")} remaining).`,
        meta: {
          orgName: org.name,
          previousCap: tokenChange.from,
          assignedCap: tokenChange.to,
          remaining: tokenChange.remaining,
        },
      });
    }

    res.json({
      success: true,
      message: "member_updated",
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        orgAssignedCap: member.orgAssignedCap,
        orgTokensRemaining: member.orgTokensRemaining,
      },
      organization: {
        id: org._id,
        totalAssignedCap: org.totalAssignedCap,
      },
    });
  } catch (err) {
    console.error("org/members/edit", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


//delete member
router.delete("/:memberId", requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;

    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const member = await User.findById(memberId);
    if (!member || String(member.orgId) !== String(org._id)) {
      return res.status(404).json({ success: false, error: "member_not_found" });
    }

    const memberIndex = org.members.findIndex((m) => String(m.userId) === String(member._id));
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, error: "member_not_in_org" });
    }

    const orgMember = org.members[memberIndex];

    // 🔹 Release unspent tokens
    const unspent = member.orgTokensRemaining || 0;
    org.orgPoolUsed = Math.max(0, org.orgPoolUsed - unspent);
    org.totalAssignedCap = Math.max(0, org.totalAssignedCap - orgMember.assignedCap);

    // 🔹 Remove from active members
    org.members.splice(memberIndex, 1);
    await org.save();

    // 🔹 Soft delete member from org
    member.isDeletedFromOrg = true;
    member.deletedAt = new Date();
    member.orgTokensRemaining = 0;
    member.orgAssignedCap = 0;
    
     member.orgId = org._id; // keep orgId reference for easy rejoin
    await member.save();

    await notifyMember({
      owner: req.user,
      org,
      memberId: member._id,
      type: "ORG_MEMBER_REMOVED",
      message: `Your access to ${org.name} was removed. Your remaining token allowance has been returned to the organization.`,
      meta: { orgName: org.name, releasedTokens: unspent },
    });

    res.json({
      success: true,
      message: "member_soft_deleted",
      releasedTokens: unspent,
      org: {
        id: org._id,
        totalAssignedCap: org.totalAssignedCap,
        orgPoolUsed: org.orgPoolUsed,
        membersRemaining: org.members.length,
      },
      member: {
        id: member._id,
        email: member.email,
        isDeletedFromOrg: member.isDeletedFromOrg,
        deletedAt: member.deletedAt,
      },
    });
  } catch (err) {
    console.error("org/members/delete", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// 📁 routes/org.js (or similar)

router.post("/resend-invite/:memberId", requireAuth, async (req, res) => {
  try {
    // ✅ Only org owner can resend invitations
    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    // ✅ Find the member by ID
    const member = await User.findById(req.params.memberId);
    if (!member) return res.status(404).json({ success: false, error: "member_not_found" });

    // ✅ Ensure this member belongs to the same org
    if (String(member.orgId) !== String(org._id)) {
      return res.status(403).json({ success: false, error: "member_not_in_this_org" });
    }

    // ✅ Optional: Check if already verified
    if (member.isVerified) {
      return res.status(400).json({ success: false, error: "member_already_verified" });
    }

    /* Same as the invite route above: root from the env, page appended here.
       The old expression also dropped the member id entirely — a template
       literal tagged onto a string, so the invite went to a bare login page
       with nothing identifying who was joining. */
    const inviteBase = (process.env.SITE_URL || "https://tokun.world").replace(/\/$/, "");
    const inviteUrl = `${inviteBase}/login?invite=${member._id}`;

    // ✅ Build email HTML (use the template we created earlier)
    const html = resendInvitationTemplate
      .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
      .replace(/{{memberEmail}}/g, member.email)
      .replace(/{{orgName}}/g, org.name)
      .replace(/{{loginLink}}/g, inviteUrl);

    // ✅ Send the reminder email
    await sendEmail({
      to: member.email,
      subject: `Reminder: Your Tokun.World Invitation Awaits 🚀`,
      html,
    });

    return res.json({
      success: true,
      message: "Invitation resent successfully",
      invitedEmail: member.email,
    });
  } catch (err) {
    console.error("resend-invite error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

router.patch("/rejoin/:memberId", requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, tokens } = req.body;

    if (req.user.userType !== "ORG" || req.user.role !== "Owner" || !req.user.orgId) {
      return res.status(403).json({ success: false, error: "not_org_owner" });
    }

    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const member = await User.findById(memberId);
    if (!member || String(member.orgId) !== String(org._id) || !member.isDeletedFromOrg) {
      return res.status(404).json({ success: false, error: "member_not_found_or_not_deleted" });
    }

    // Same seat-limit gate as /add — rejoining still counts against the cap.
    const maxMembers = org.teamMembersLimit || PLANS.enterprise.features.teamMembersLimit || 0;
    const currentMembersCount = org.members.length || 0;
    if (currentMembersCount + 1 > maxMembers) {
      return res.status(400).json({
        success: false,
        error: "team_member_limit_exceeded",
        maxAllowed: maxMembers,
        currentlyAdded: currentMembersCount,
      });
    }

    // Same token-budget gate as /add.
    const rejoinTokens = Number(tokens) || 0;
    if (rejoinTokens > orgAssignableRemaining(org)) {
      return res.status(400).json({ success: false, error: "insufficient_org_assignable_tokens" });
    }

    // Restore member details
    member.isDeletedFromOrg = false;
    member.deletedAt = null;
    member.role = role || "Member";
    member.orgTokensRemaining = rejoinTokens;
    member.orgAssignedCap = rejoinTokens;
    await member.save();

    // Re-add to organization
    org.members.push({
      userId: member._id,
      role: role?.toUpperCase() || "MEMBER",
      assignedCap: rejoinTokens,
      usedThisPeriod: 0,
      sectionUsage: {},
    });
    org.totalAssignedCap += rejoinTokens;
    org.teamMembersLimitRemaining = Math.max(0, maxMembers - org.members.length);
    await org.save();

    await notifyMember({
      owner: req.user,
      org,
      memberId: member._id,
      type: "ORG_MEMBER_REJOINED",
      message: `You were re-added to ${org.name} with ${rejoinTokens.toLocaleString("en-IN")} tokens.`,
      meta: { orgName: org.name, role: member.role, assignedCap: rejoinTokens },
    });

    res.json({
      success: true,
      message: "member_rejoined_successfully",
      member: {
        id: member._id,
        email: member.email,
        role: member.role,
        orgAssignedCap: member.orgAssignedCap,
        orgTokensRemaining: member.orgTokensRemaining,
        isVerified: member.isVerified
      },
    });
  } catch (err) {
    console.error("org/members/rejoin", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// ===============================
// GET all members of an organization
// ===============================
router.get("/emaillist", requireAuth, async (req, res) => {
  try {
    //const { orgId } = req.params;
    const user = req.user;

    // ✅ Verify that requester belongs to this org or is owner/admin
    if (!user.orgId ) {
      return res.status(403).json({ success: false, error: "unauthorized" });
    }

    const org = await Organization.findById(user.orgId)
      .populate("members.userId", "email _id name")
      .populate("ownerId", "email _id name");

    if (!org) {
      return res.status(404).json({ success: false, error: "organization_not_found" });
    }

    // ✅ Build list of members with only required fields
    const members = org.members.map((m) => ({
      userId: m.userId?._id,
      email: m.userId?.email,

      orgId: org._id,

    }));

    // A team member calls this to find out who their request goes to. Without
    // the owner in the payload they had no way to resolve it, and the request
    // UI fell back to the prompt seller's email — a different person.
    const owner = org.ownerId
      ? {
          userId: org.ownerId._id,
          email: org.ownerId.email,
          name: org.ownerId.name,
        }
      : null;

    res.json({
      success: true,
      orgId: org._id,
      orgName: org.name,
      owner,
      totalMembers: members.length , // +1 for owner
     members: members,

    });
  } catch (err) {
    console.error("get organization members error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
