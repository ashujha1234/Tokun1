// processKyc.js
const User = require("../../models/User");
const KycSubmission = require("../../models/KycSubmission");

const { ocrAadhaarName, ocrImage } = require("./ocrAadhar");
const { extractNameFromText } = require("./extractName");
const { matchScore } = require("./nameMatch");

const PASS_SCORE = 0.82;        // verified
const MANUAL_REVIEW_MIN = 0.72; // pending/manual
const COOLDOWN_MS = 5000;       // 5 sec

async function processKyc(submissionId) {
  const sub = await KycSubmission.findById(submissionId).populate("userId", "name");
  if (!sub) return;

  const userId = sub.userId?._id;
  const profileName = sub.userId?.name || "";
  const docType = String(sub.docType || "AADHAAR").toUpperCase();

  // stage: OCR
  sub.stage = "OCR_EXTRACTION";
  await sub.save();
  await User.findByIdAndUpdate(userId, { kycStage: "OCR_EXTRACTION" });

  let extracted = null;
  let fullText = "";

  try {
    // ✅ Aadhaar: First try ROI name OCR (most accurate)
    if (docType === "AADHAAR") {
      extracted = await ocrAadhaarName(sub.frontPath, profileName);
    }

    // Fallback: full OCR if ROI failed (or if you want it for logs)
    if (!extracted) {
      const t1 = await ocrImage(sub.frontPath);
      const t2 = await ocrImage(sub.backPath);
      fullText = `${t1}\n${t2}`;

      extracted = extractNameFromText(fullText, profileName);
    }
  } catch (e) {
    sub.status = "REJECTED";
    sub.reasonCode = "OCR_FAILED";
    sub.reasonText = "We could not read your document. Please upload clearer photos.";
    sub.cooldownUntil = new Date(Date.now() + COOLDOWN_MS);
    sub.extractedName = null;
    sub.matchScore = 0;

    await sub.save();

    await User.findByIdAndUpdate(userId, {
      kycStatus: "REJECTED",
      kycStage: null,
      kycReasonCode: sub.reasonCode,
      kycReasonText: sub.reasonText,
      kycExtractedName: null,
      kycMatchScore: 0,
      kycCooldownUntil: sub.cooldownUntil,
    });
    return;
  }

  // stage: NAME MATCH
  sub.stage = "NAME_MATCHING";
  await sub.save();
  await User.findByIdAndUpdate(userId, { kycStage: "NAME_MATCHING" });

  sub.extractedName = extracted || null;

  const score = extracted ? matchScore(profileName, extracted) : 0;
  sub.matchScore = score;

  // decision
  if (score >= PASS_SCORE) {
    sub.status = "VERIFIED";
    sub.reasonCode = null;
    sub.reasonText = null;
    sub.cooldownUntil = null;
    sub.stage = null;
    await sub.save();

    await User.findByIdAndUpdate(userId, {
      kycStatus: "VERIFIED",
      kycStage: null,
      kycReasonCode: null,
      kycReasonText: null,
      kycExtractedName: extracted,
      kycMatchScore: score,
      kycVerifiedAt: new Date(),
      kycCooldownUntil: null,
    });
    return;
  }

  if (score >= MANUAL_REVIEW_MIN) {
    sub.status = "PENDING";
    sub.stage = "MANUAL_REVIEW";
    sub.reasonCode = "MANUAL_REVIEW";
    sub.reasonText = "We are manually reviewing your submission.";
    sub.cooldownUntil = null;
    await sub.save();

    await User.findByIdAndUpdate(userId, {
      kycStatus: "PENDING",
      kycStage: "MANUAL_REVIEW",
      kycReasonCode: "MANUAL_REVIEW",
      kycReasonText: sub.reasonText,
      kycExtractedName: extracted,
      kycMatchScore: score,
      kycCooldownUntil: null,
    });
    return;
  }

  // reject
  sub.status = "REJECTED";
  sub.reasonCode = "NAME_MISMATCH";
  sub.reasonText = "The name on your document does not match your profile name.";
  sub.cooldownUntil = new Date(Date.now() + COOLDOWN_MS);
  sub.stage = null;
  await sub.save();

  await User.findByIdAndUpdate(userId, {
    kycStatus: "REJECTED",
    kycStage: null,
    kycReasonCode: sub.reasonCode,
    kycReasonText: sub.reasonText,
    kycExtractedName: extracted || null,
    kycMatchScore: score,
    kycCooldownUntil: sub.cooldownUntil,
  });
}

module.exports = { processKyc };
