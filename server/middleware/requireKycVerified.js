const User = require("../models/User");

const requireKycVerified = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId).select("kycStatus");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
      });
    }

    if (user.kycStatus !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        error: "KYC_REQUIRED",
        code: "KYC_REQUIRED",
        kycStatus: user.kycStatus || "NOT_SUBMITTED",
      });
    }

    return next();
  } catch (error) {
    console.error("[requireKycVerified]", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
    });
  }
};

module.exports = { requireKycVerified };