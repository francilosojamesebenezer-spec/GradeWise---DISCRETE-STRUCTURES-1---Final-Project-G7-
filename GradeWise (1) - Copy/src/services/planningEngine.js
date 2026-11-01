import { numericError, resultError, resultOk, roundTo } from "../utils/validation.js";

function validatePlanningInputs(input, scoreField, scoreLabel) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return [{ field: "input", code: "invalid_type", message: "Input must be an object." }];
  }
  for (const [field, range] of [["currentContribution", { min: 0, max: 100 }], ["remainingWeight", { min: 0, max: 100 }], [scoreField, { min: 0, max: 100 }]]) {
    const error = numericError(field, input[field], range);
    if (error) errors.push(error);
  }
  if (typeof input.currentContribution === "number" && typeof input.remainingWeight === "number" && input.currentContribution + input.remainingWeight > 100.01) {
    errors.push({ field: "remainingWeight", code: "inconsistent_grade_state", message: "Current contribution plus remaining weight cannot exceed 100." });
  }
  return errors;
}

/** Calculate the required average on remaining assessments. */
export function calculateRequiredScore(input) {
  const errors = validatePlanningInputs(input, "targetGrade", "target grade");
  if (errors.length) return resultError(errors);
  const { currentContribution, remainingWeight, targetGrade } = input;
  const highestPossibleGrade = roundTo(currentContribution + remainingWeight);
  const alreadyAchieved = currentContribution >= targetGrade;

  if (alreadyAchieved) {
    return resultOk({ currentContribution, remainingWeight, targetGrade, requiredScore: null, attainable: true, highestPossibleGrade, status: "AlreadyAchieved" });
  }
  if (remainingWeight === 0) {
    return resultOk({ currentContribution, remainingWeight, targetGrade, requiredScore: null, attainable: false, highestPossibleGrade, status: "NoRemainingWeight" });
  }
  const requiredScore = roundTo((targetGrade - currentContribution) / (remainingWeight / 100));
  if (requiredScore > 100) {
    return resultOk({ currentContribution, remainingWeight, targetGrade, requiredScore, attainable: false, highestPossibleGrade, status: "Unattainable" });
  }
  return resultOk({ currentContribution, remainingWeight, targetGrade, requiredScore, attainable: true, highestPossibleGrade, status: "ScoreRequired" });
}

/** Calculate one hypothetical result and optional standard comparison scenarios. */
export function simulateGrade(input) {
  const errors = validatePlanningInputs(input, "hypotheticalScore", "hypothetical score");
  if (errors.length) return resultError(errors);
  const { currentContribution, remainingWeight, hypotheticalScore } = input;
  const projectedGrade = roundTo(currentContribution + (remainingWeight / 100) * hypotheticalScore);
  const scenarios = [70, 80, 90, 100].map((score) => ({ hypotheticalScore: score, projectedGrade: roundTo(currentContribution + (remainingWeight / 100) * score) }));
  return resultOk({ currentContribution, remainingWeight, hypotheticalScore, projectedGrade, status: remainingWeight === 0 ? "NoRemainingWeight" : "Hypothetical", scenarios });
}
