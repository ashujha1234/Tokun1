// utils/quota.js
const DEFAULT_FREE_MONTHLY_TOKENS = 5000;

// Returns IST date string "YYYY-MM-DD"
function getISTDateString(d = new Date()) {
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const day = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
 

 

// Returns IST month string "YYYY-MM"
function getISTMonthString(d = new Date()) {
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}




 

 

async function ensureMonthlyQuota(user) {
  if (!user) return;

  if (user.plan !== "FREE" || user.userType !== "IND") return;

  const todayIST = new Date();
  const todayDay = todayIST.getDate(); // 1..31
  const currentMonthStr = getISTMonthString(todayIST);

  // Initialize if not set
  if (user.monthlyTokensRemaining == null || !user.tokensLastResetMonth) {
    user.monthlyTokensRemaining = DEFAULT_FREE_MONTHLY_TOKENS;
    user.tokensLastResetMonth = currentMonthStr;
    await user.save();
    return;
  }

  // Check if month changed or registrationDay reached
  const lastResetMonth = user.tokensLastResetMonth; // "YYYY-MM"

  if (
    currentMonthStr !== lastResetMonth && todayDay === user.registrationDay
  ) {
    user.monthlyTokensRemaining = DEFAULT_FREE_MONTHLY_TOKENS;
    user.tokensLastResetMonth = currentMonthStr;
    await user.save();
  }
}


async function spendMonthlyTokens(user, amount = 1) {
  await ensureMonthlyQuota(user);

  if (user.monthlyTokensRemaining < amount) {
    const err = new Error("insufficient_quota");
    err.code = "insufficient_quota";
    throw err;
  }

  user.monthlyTokensRemaining -= amount;
  await user.save();
  return user.monthlyTokensRemaining;
}


module.exports = {
  DEFAULT_FREE_MONTHLY_TOKENS,
  getISTDateString,
  ensureMonthlyQuota,
  spendMonthlyTokens,
};
