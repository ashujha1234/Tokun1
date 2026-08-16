// The one place a creator's star rating is worked out.
//
// It used to live inside routes/reviews.js, reachable only from there. Rating
// penalties (models/RatingPenalty.js) have to affect the same number, and a
// second implementation next door would have meant the rating said one thing
// after a review and another after a penalty, depending on which code path
// last touched it.
//
//   displayed rating = average of visible buyer reviews − active penalties
//
// Anything that changes either input calls recomputeUserRating and the stored
// value follows.

const mongoose = require("mongoose");
const Review = require("../models/Review");
const RatingPenalty = require("../models/RatingPenalty");
const User = require("../models/User");

/* A rating is only ever 1–5. Penalising someone to 0 would push them below the
   worst review anyone can leave, and 0 reads as "unrated" in the UI rather than
   "rated badly" — the opposite of what a penalty is for. */
const MIN_RATING = 1;
const MAX_RATING = 5;

/** Total stars currently coming off this creator. */
async function activePenaltyTotal(userId) {
  const [agg] = await RatingPenalty.aggregate([
    { $match: { creatorId: new mongoose.Types.ObjectId(String(userId)), active: true } },
    { $group: { _id: null, total: { $sum: "$stars" } } },
  ]);
  return agg?.total || 0;
}

/**
 * Recompute and store a creator's rating.
 *
 * @returns {{rating:number, count:number, rawRating:number, penalty:number}}
 *   `rawRating` is what the reviews alone say — kept in the return value (and
 *   nowhere in the database) so an admin screen can show "4.6, less 0.5" rather
 *   than a number that appears to have come from nowhere.
 */
async function recomputeUserRating(userId) {
  const [agg] = await Review.aggregate([
    {
      $match: {
        revieweeId: new mongoose.Types.ObjectId(String(userId)),
        hidden: false,
        reviewerRole: "buyer",
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const rawRating = +(agg?.avg || 0).toFixed(2);
  const count = agg?.count || 0;
  const penalty = await activePenaltyTotal(userId);

  /* No reviews, no rating to reduce. A penalty must not invent a 1-star rating
     for someone nobody has reviewed yet — that would read as real feedback and
     there is none. It still applies the moment their first review lands. */
  const rating =
    count > 0
      ? +Math.min(MAX_RATING, Math.max(MIN_RATING, rawRating - penalty)).toFixed(2)
      : 0;

  await User.findByIdAndUpdate(userId, {
    $set: {
      sellerRating: rating,
      sellerReviewsCount: count,
      // Stored so a profile can be honest about why the number is what it is,
      // and so support can answer "why did my rating drop" without a query.
      sellerRatingPenalty: +penalty.toFixed(2),
    },
  });

  return { rating, count, rawRating, penalty: +penalty.toFixed(2) };
}

module.exports = { recomputeUserRating, activePenaltyTotal, MIN_RATING, MAX_RATING };
