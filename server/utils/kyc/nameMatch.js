// nameMatch.js
const { distance } = require("fastest-levenshtein");

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\b(mr|mrs|ms|miss|shri|smt|kumari|dr)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinScore(a, b) {
  const A = normalizeName(a);
  const B = normalizeName(b);
  if (!A || !B) return 0;

  const d = distance(A, B);
  const maxLen = Math.max(A.length, B.length, 1);
  return 1 - d / maxLen; // 0..1
}

function tokenOverlapScore(a, b) {
  const A = normalizeName(a).split(" ").filter(Boolean);
  const B = normalizeName(b).split(" ").filter(Boolean);
  if (!A.length || !B.length) return 0;

  const setA = new Set(A);
  const setB = new Set(B);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;

  return inter / Math.max(setA.size, setB.size); // 0..1
}

function lastNameMatchBoost(profileName, extractedName) {
  const A = normalizeName(profileName).split(" ").filter(Boolean);
  const B = normalizeName(extractedName).split(" ").filter(Boolean);
  if (!A.length || !B.length) return 0;

  const lastA = A[A.length - 1];
  const lastB = B[B.length - 1];
  if (lastA && lastB && lastA === lastB) return 0.15;
  return 0;
}

function matchScore(profileName, extractedName) {
  const s1 = levenshteinScore(profileName, extractedName);
  const s2 = tokenOverlapScore(profileName, extractedName);
  const boost = lastNameMatchBoost(profileName, extractedName);

  const score = (0.65 * s1 + 0.35 * s2) + boost;
  return Math.round(Math.min(score, 1) * 100) / 100; // 0..1 with 2 decimals
}

module.exports = { matchScore, normalizeName };
