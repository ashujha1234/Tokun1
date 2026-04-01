// jobs/monthlyQuotaReset.js
const cron = require("node-cron");
const User = require("../../models/User");

const DEFAULT_FREE_MONTHLY_TOKENS = 5000; // Free user monthly tokens

/**
 * Get last day of the month
 */
function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Runs every day at 00:00 IST
 * Resets monthly tokens for FREE individual users based on registration day
 */
function startMonthlyQuotaResetJob() {
  cron.schedule(
    "0 0 * * *", // every day at 00:00
    async () => {
      const today = new Date();
      const currentDay = today.getDate(); // 1-31
      const lastDayOfMonth = getLastDayOfMonth(today);
      const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"

      try {
        // Find users whose registration day matches today OR exceeds this month's last day
        const usersToReset = await User.find({
          userType: "IND",
          plan: "FREE",
          tokensLastResetMonth: { $ne: currentMonth },
          $expr: {
            $or: [
              { $eq: ["$registrationDay", currentDay] },
              {
                $and: [
                  { $gt: ["$registrationDay", lastDayOfMonth] },
                  { $eq: [currentDay, lastDayOfMonth] }
                ]
              }
            ]
          }
        });

        if (usersToReset.length === 0) return;

        const userIds = usersToReset.map(u => u._id);

        const res = await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              monthlyTokensRemaining: DEFAULT_FREE_MONTHLY_TOKENS,
              tokensLastResetMonth: currentMonth,
            },
          }
        );

        console.log(`[quota] Reset monthly tokens for ${res.modifiedCount} users on ${today.toDateString()}`);
      } catch (err) {
        console.error("[quota] Monthly reset failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("[quota] Monthly quota reset job scheduled daily at 00:00 IST");
}

module.exports = { startMonthlyQuotaResetJob };
