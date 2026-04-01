// src/routes/pricing.js
const express = require("express");
const router = express.Router();
const { PLANS, priceFor, savingsPercent } = require("../config/plans");

router.get("/", (req, res) => {
  const data = Object.keys(PLANS).map((id) => {
    const p = PLANS[id];
    return {
      id,
      monthlyPrice: p.priceMonthly,
      yearlyPrice: priceFor(id, "yearly"),
      yearlySavingsPercent: savingsPercent(),
      monthlyTokens: p.monthlyTokens,
      features: p.features,
      forIndividual: !!p.forIndividual,
      forOrganization: !!p.forOrganization,
    };
  });
  res.json({ plans: data });
});

module.exports = router;
