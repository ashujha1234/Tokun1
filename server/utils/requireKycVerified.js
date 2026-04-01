module.exports.requireKycVerified = async (req, res, next) => {
  try {
    // assume requireAuth already put user on req.user
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: "UNAUTHORIZED" });

    if (user.kycStatus === "VERIFIED") return next();

    return res.status(403).json({
      success: false,
      error: "KYC_REQUIRED",
      kycStatus: user.kycStatus || "NOT_SUBMITTED",
      kycStage: user.kycStage || null,
      kycReasonCode: user.kycReasonCode || null,
      kycReasonText: user.kycReasonText || null,
      cooldownUntil: user.kycCooldownUntil || null,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: "KYC_MIDDLEWARE_FAILED" });
  }
};
