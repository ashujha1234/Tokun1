// src/config/plans.js
const YEARLY_DISCOUNT = 0.20;

const PLANS = {
  free: {
    forIndividual: true,
    priceMonthly: 0,
    monthlyTokens: 5000,
    historyEntries: 5,
    features: {
      tools: ["smartgen", "prompt-optimizer"],
      chatSupport: false,
      emailSupport: true,
      team: false,
      extraTokens: null,
      usageModes: ["monthlyTotal"],
    },
  },
  pro: {
    forIndividual: true,
    priceMonthly: 799,
    monthlyTokens: 100000,
    historyEntries: "unlimited",
    features: {
      tools: ["smartgen", "prompt-optimizer"],
      chatSupport: true,
      emailSupport: true,
      team: false,
      extraTokens: { bundle: 50000, price: 400 },
      usageModes: ["monthlyTotal", "sectionWise"],
    },
  },
  enterprise: {
    forOrganization: true,
    priceMonthly: 7999,
    monthlyTokens: 1000000, // ORG POOL
    features: {
      tools: ["smartgen", "prompt-optimizer"],
      chatSupport: true,
      emailSupport: true,
      team: true,
      teamMembersLimit:20,
      extraTokens: { bundle: 100000, price: 799 },
      extraSeat: { price: 799 },
      usageModes: ["monthlyTotal", "sectionWise"],
    },
  },
};

function priceFor(planKey, cycle) {
  const monthly = PLANS[planKey].priceMonthly;
  if (cycle === "monthly") return monthly;
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT)); // Save 20% annually
}

function savingsPercent() {
  return Math.round(YEARLY_DISCOUNT * 100); // 20
}



module.exports = { PLANS, YEARLY_DISCOUNT, priceFor, savingsPercent };
