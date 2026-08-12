const mongoose = require("mongoose");

/**
 * A review one party leaves for the other after a booking closes.
 *
 * Deliberately NOT a free-standing "rate this person" feature. Every review is
 * anchored to a real, paid, finished transaction — you can only review someone
 * you actually did business with, once per booking, in the direction you were
 * on. That constraint is the only thing separating a rating system from a
 * grudge board, and it has to live in the data model rather than in the UI.
 *
 * Both directions are allowed:
 *   client → creator   "was the work good?"     — shown on the creator's profile
 *   creator → client   "were they good to work with?" — shown on the client's
 *
 * The second half matters more than it looks. A marketplace where only buyers
 * can rate gives clients no reason to behave, and freelancers no way to warn
 * each other about the ones who don't.
 */

const ReviewSchema = new mongoose.Schema(
  {
    // What was reviewed. Exactly one id is set, matching orderKind.
    //
    // "prompt" is here because prompt sellers are sellers too — a buyer who
    // paid for a prompt has just as much standing to rate the person as one
    // who booked a service, and leaving them out meant most of the marketplace
    // had no reviews at all.
    orderKind: { type: String, enum: ["hire", "service", "prompt"], required: true, index: true },
    hireDealId: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal", default: null },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder", default: null },
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", default: null },

    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Whose profile this appears on.
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Which side the REVIEWER was on, so a profile can show "as a creator" and
    // "as a client" separately — being great to hire and being great to work
    // for are different claims, and averaging them together says neither.
    reviewerRole: { type: String, enum: ["buyer", "seller"], required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 2000, trim: true },

    // Snapshot: the booking's title at the time. The service can be renamed or
    // deleted later, and a review that can't say what it was about is useless.
    orderTitle: { type: String, default: "" },

    // How the booking ended. A 2-star review on a job that settled at 30% after
    // a dispute reads very differently from a 2-star on one delivered in full,
    // and hiding that difference would be misleading.
    outcome: {
      type: String,
      enum: ["COMPLETED", "SETTLED", "REFUNDED", "CANCELLED"],
      default: "COMPLETED",
    },

    // Set if the reviewee replies. One reply per review — a thread would turn
    // every disagreement into a public argument on someone's profile.
    response: { type: String, default: "", maxlength: 2000, trim: true },
    respondedAt: { type: Date, default: null },

    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ONE review per person, about a person — not per booking.

   A review is left from someone's profile, so it's a verdict on them, not on a
   single job. Per-booking uniqueness would let one repeat client stack five
   reviews on the same freelancer and quietly dominate their rating; this can't.
   The order fields above stay as CONTEXT — which transaction earned the right
   to review, and what it was called — not as the unit of uniqueness. */
ReviewSchema.index({ reviewerId: 1, revieweeId: 1 }, { unique: true });

// Profile reads are "newest visible reviews for this person".
ReviewSchema.index({ revieweeId: 1, hidden: 1, createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
