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
// //     const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.ai/login?invite="`${member._id}`;

// //     // ✅ Build email HTML (use the template we created earlier)
// //     const html = resendInvitationTemplate
// //       .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
// //       .replace(/{{memberEmail}}/g, member.email)
// //       .replace(/{{orgName}}/g, org.name)
// //       .replace(/{{loginLink}}/g, inviteUrl);

// //     // ✅ Send the reminder email
// //     await sendEmail({
// //       to: member.email,
// //       subject: `Reminder: Your Tokun.ai Invitation Awaits 🚀`,
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
//         const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.ai/login?invite="`${member._id}`;

//         const html = invitationTemplate
//           .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
//           .replace(/{{memberEmail}}/g, member.email)
//           .replace(/{{orgName}}/g, org.name)
//           .replace(/{{loginLink}}/g, inviteUrl);

//         await sendEmail({
//           to: member.email,
//           subject: `${org.name} invites you to Tokun.ai`,
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
//     const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.ai/login?invite="`${member._id}`;

//     // ✅ Build email HTML (use the template we created earlier)
//     const html = resendInvitationTemplate
//       .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
//       .replace(/{{memberEmail}}/g, member.email)
//       .replace(/{{orgName}}/g, org.name)
//       .replace(/{{loginLink}}/g, inviteUrl);

//     // ✅ Send the reminder email
//     await sendEmail({
//       to: member.email,
//       subject: `Reminder: Your Tokun.ai Invitation Awaits 🚀`,
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
const { PLANS } = require("../config/plans");
const fs =require("fs");
const path= require("path");
const { sendEmail } = require("../utils/SendEmail"); // ← make sure filename & path match exactly


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
    console.log(org.teamMembersLimit)
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
      } else {
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

      // ✅ Decrease teamMembersLimitRemaining
      org.teamMembersLimitRemaining = Math.max(0, maxMembers - org.members.length);

     


    try {
        const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.ai/login?invite="`${member._id}`;

        const html = invitationTemplate
          .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
          .replace(/{{memberEmail}}/g, member.email)
          .replace(/{{orgName}}/g, org.name)
          .replace(/{{loginLink}}/g, inviteUrl);

        await sendEmail({
          to: member.email,
          subject: `${org.name} invites you to Tokun.ai`,
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













//get all members  of org
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.user.orgId) {
      return res.status(400).json({ success: false, error: "no_org" });
    }
    const members = await User.find({ orgId: req.user.orgId })
     .select("_id name email role isVerified isDeletedFromOrg orgAssignedCap orgTokensRemaining")

      .lean();

    return res.json({ success: true, members });
  } catch (err) {
    console.error("org/members", err);
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
}


    // ✅ Save both
    await member.save();
    await org.save();

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

    // ✅ Generate invite link
    const inviteUrl = `${process.env.SITE_URL}` || "https://tokun.ai/login?invite="`${member._id}`;

    // ✅ Build email HTML (use the template we created earlier)
    const html = resendInvitationTemplate
      .replace(/{{memberName}}/g, member.name || member.email.split("@")[0])
      .replace(/{{memberEmail}}/g, member.email)
      .replace(/{{orgName}}/g, org.name)
      .replace(/{{loginLink}}/g, inviteUrl);

    // ✅ Send the reminder email
    await sendEmail({
      to: member.email,
      subject: `Reminder: Your Tokun.ai Invitation Awaits 🚀`,
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

    // Restore member details
    member.isDeletedFromOrg = false;
    member.deletedAt = null;
    member.role = role || "Member";
    member.orgTokensRemaining = tokens || 0;
    member.orgAssignedCap = tokens || 0;
    await member.save();

    // Re-add to organization
    org.members.push({
      userId: member._id,
      role: role?.toUpperCase() || "MEMBER",
      assignedCap: tokens || 0,
      usedThisPeriod: 0,
      sectionUsage: {},
    });
    org.totalAssignedCap += tokens || 0;
    await org.save();

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

     

    res.json({
      success: true,
      orgId: org._id,
      totalMembers: members.length , // +1 for owner
     members: members,

    });
  } catch (err) {
    console.error("get organization members error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
