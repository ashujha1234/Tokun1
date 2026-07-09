"use strict";

const { DEEP_QUESTIONS, SUBCATEGORIES } = require("./constants");

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// GET DEEP QUESTIONS FOR A DOMAIN + SUBCATEGORY
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Returns the deep-mode questions for a given domain and subcategory.
 * Falls back to the first subcategory of the domain, then to the generic set.
 *
 * @param {string} domainId      - e.g. "cafe_food_service"
 * @param {string} [subcatId]    - e.g. "business_planning"
 * @returns {Array<Object>}      - Array of question objects
 */
function getDeepQuestions(domainId, subcatId) {
  // 1. Try exact domain:subcat key
  if (subcatId) {
    const key = `${domainId}:${subcatId}`;
    if (DEEP_QUESTIONS[key]) return DEEP_QUESTIONS[key];
  }

  // 2. Try domain with its first subcategory
  const subcats = SUBCATEGORIES[domainId] || [];
  if (subcats.length > 0) {
    const firstSubcatKey = `${domainId}:${subcats[0].id}`;
    if (DEEP_QUESTIONS[firstSubcatKey]) return DEEP_QUESTIONS[firstSubcatKey];
  }

  // 3. Try any key that starts with this domainId
  const fallbackKey = Object.keys(DEEP_QUESTIONS).find(k => k.startsWith(`${domainId}:`));
  if (fallbackKey) return DEEP_QUESTIONS[fallbackKey];

  // 4. Ultimate fallback â generic questions
  return DEEP_QUESTIONS["generic"];
}

/**
 * Returns ALL deep question sets for a given domain (keyed by subcategory).
 * Useful for building a UI that lets users pick a subcategory first.
 *
 * @param {string} domainId
 * @returns {Object}  { subcatId: questions[], ... }
 */
function getAllDeepQuestionsForDomain(domainId) {
  const result = {};
  const subcats = SUBCATEGORIES[domainId] || [];
  for (const subcat of subcats) {
    const key = `${domainId}:${subcat.id}`;
    if (DEEP_QUESTIONS[key]) {
      result[subcat.id] = DEEP_QUESTIONS[key];
    }
  }
  return result;
}

/**
 * Renders deep questions as a human-readable numbered list string.
 * Used when surfacing questions in a non-UI context (e.g. API response text).
 *
 * @param {Array<Object>} questions
 * @returns {string}
 */
function renderQuestionsAsText(questions) {
  return questions
    .map((q, i) => {
      let line = `${i + 1}. ${q.question}`;
      if (q.type === "select" && Array.isArray(q.options)) {
        line += `\n   Options: ${q.options.join(" | ")}`;
      } else if (q.placeholder) {
        line += `\n   (e.g. ${q.placeholder})`;
      }
      return line;
    })
    .join("\n\n");
}

/**
 * Merges user answers (keyed by question id) with the question list,
 * producing an enriched array that includes the selected/typed answer.
 *
 * @param {Array<Object>} questions
 * @param {Object}        answers    - { questionId: answerString }
 * @returns {Array<Object>}          - questions with .answer injected
 */
function mergeAnswers(questions, answers = {}) {
  return questions.map(q => ({
    ...q,
    answer: answers[q.id] ?? null,
  }));
}

/**
 * Validates that all required questions have been answered.
 * Returns an array of unanswered question ids.
 *
 * @param {Array<Object>} questions
 * @param {Object}        answers
 * @returns {string[]}  ids of unanswered questions
 */
function getUnansweredQuestions(questions, answers = {}) {
  return questions
    .filter(q => !answers[q.id] || String(answers[q.id]).trim() === "")
    .map(q => q.id);
}

module.exports = {
  getDeepQuestions,
  getAllDeepQuestionsForDomain,
  renderQuestionsAsText,
  mergeAnswers,
  getUnansweredQuestions,
};