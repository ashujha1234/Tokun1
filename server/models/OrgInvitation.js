const mongoose = require("mongoose");

/**
 * A pending invitation to join an organization's team.
 *
 * Exists because adding a member used to take effect the instant the owner
 * clicked Add: the invitee's User document was rewritten on the spot —
 * userType flipped to "TM", role and orgId set, and `plan` wiped to null. Two
 * things were wrong with that.
 *
 *   1. Nobody consented. The person appeared as an active team member without
 *      ever having seen the invitation, which is why the roster showed them as
 *      "Active" immediately.
 *
 *   2. It destroyed accounts. Someone on a paid individual plan who was
 *      invited had that plan silently cleared — an owner could wipe a
 *      stranger's subscription just by typing their email.
 *
 * So nothing about the invitee's account changes here. The invitation holds
 * the intended role and token allowance, and only ACCEPT applies any of it.
 *
 * Keyed by EMAIL, not userId, because a large share of invitations go to
 * people who don't have an account yet. `userId` is filled in when one exists
 * (or when they sign up), purely to make "do I have an invitation?" a fast
 * lookup for a logged-in user.
 */

const OrgInvitationSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    orgName: { type: String, default: "" },

    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    // Set only if an account already exists for that email.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, default: "" },

    // What they'd get on accepting. Applied to the User document at that point
    // and not before.
    role: { type: String, enum: ["Admin", "Member"], required: true },
    assignedCap: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "REVOKED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },

    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    invitedByName: { type: String, default: "" },

    respondedAt: { type: Date, default: null },

    // The seat and tokens are reserved against the org from the moment the
    // invitation goes out, so an owner can't promise the same allowance twice
    // while invitations are outstanding. Released on decline, revoke or expiry.
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

/* One outstanding invitation per person per org. Partial, so a declined or
   accepted invitation doesn't block a fresh one being sent later. */
OrgInvitationSchema.index(
  { orgId: 1, email: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

module.exports = mongoose.model("OrgInvitation", OrgInvitationSchema);
