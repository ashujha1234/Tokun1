// extractName.js
const { matchScore, normalizeName } = require("./nameMatch");

function cleanLine(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function isMostlyLetters(s) {
  return /^[A-Za-z\s]+$/.test(s);
}

function titleCaseLike(s) {
  // allow "ASHUTOSH KUMAR JHA" OR "Ashutosh Kumar Jha"
  const parts = s.split(" ").filter(Boolean);
  if (parts.length < 2) return false;

  const allCaps = parts.every((p) => /^[A-Z]{2,}$/.test(p));
  if (allCaps) return true;

  const titleish = parts.every((p) => /^[A-Z][a-z]{1,}$/.test(p));
  return titleish;
}

function extractNameFromText(rawText, profileName = "") {
  const text = String(rawText || "");
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const reject = [
    /government of india/i,
    /unique identification/i,
    /\baadhaar\b/i,
    /\buidai\b/i,
    /\bdob\b/i,
    /date of birth/i,
    /\bmale\b|\bfemale\b/i,
    /^\d{4}\s?\d{4}\s?\d{4}$/,
    /\bissued\b/i,
    /\byear\b/i,
  ];

  // Collect plausible candidates
  const candidates = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    if (reject.some((r) => r.test(l))) continue;
    if (!isMostlyLetters(l)) continue;

    const parts = l.split(" ").filter(Boolean);
    if (parts.length < 2 || parts.length > 5) continue;
    if (l.length < 5 || l.length > 45) continue;

    // Must look like name casing
    if (!titleCaseLike(l)) continue;

    const score = profileName ? matchScore(profileName, l) : 0;
    candidates.push({ name: l, score });
  }

  if (!candidates.length) return null;

  // If profileName present => best match
  if (profileName) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].name;
  }

  // Else pick longest reasonable
  candidates.sort((a, b) => b.name.length - a.name.length);
  return candidates[0].name;
}

module.exports = { extractNameFromText };
