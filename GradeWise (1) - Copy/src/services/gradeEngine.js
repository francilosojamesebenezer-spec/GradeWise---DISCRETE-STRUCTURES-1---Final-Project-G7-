import curriculum from "../data/curriculum.json" with { type: "json" };
import templates from "../data/assessmentTemplates.json" with { type: "json" };
import { isFiniteNumber, numericError, resultError, resultOk, roundTo, stringError, WEIGHT_TOLERANCE } from "../utils/validation.js";

const knownCourses = new Map(curriculum.map((course) => [course.courseCode, course]));

/**
 * Calculate current weighted contribution for one configured course component and term.
 * Input uses AssessmentCategory[] from DATA_MODELS.md. Pending categories require null scores.
 * Returns { valid, errors, result }; invalid inputs never produce a result.
 */
export function calculateGrade(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return resultError([{ field: "input", code: "invalid_type", message: "Input must be an object." }]);
  }
  for (const [field, value] of [["courseCode", input.courseCode], ["componentType", input.componentType], ["term", input.term]]) {
    const error = stringError(field, value);
    if (error) errors.push(error);
  }
  if (typeof input.courseCode === "string" && !knownCourses.has(input.courseCode)) {
    errors.push({ field: "courseCode", code: "unknown_configuration", message: `Unknown course code: ${input.courseCode}.` });
  } else if (knownCourses.has(input.courseCode) && input.componentType && knownCourses.get(input.courseCode).componentType !== input.componentType) {
    errors.push({ field: "componentType", code: "configuration_mismatch", message: "The selected component does not match the configured course component." });
  }
  if (input.term && !["Midterm", "Final"].includes(input.term)) {
    errors.push({ field: "term", code: "unsupported_value", message: "term must be Midterm or Final." });
  }
  if (!Array.isArray(input.categories) || input.categories.length === 0) {
    errors.push({ field: "categories", code: "required", message: "At least one assessment category is required." });
    return resultError(errors);
  }

  const seen = new Set();
  let weightTotal = 0;
  const categories = [];
  input.categories.forEach((category, index) => {
    const prefix = `categories[${index}]`;
    if (!category || typeof category !== "object" || Array.isArray(category)) {
      errors.push({ field: prefix, code: "invalid_type", message: "Each category must be an object." });
      return;
    }
    const nameError = stringError(`${prefix}.categoryName`, category.categoryName);
    if (nameError) errors.push(nameError);
    if (typeof category.categoryName === "string") {
      if (seen.has(category.categoryName)) errors.push({ field: `${prefix}.categoryName`, code: "duplicate", message: "Category names must be unique." });
      seen.add(category.categoryName);
      if (templates.components[input.componentType] && !templates.components[input.componentType].includes(category.categoryName)) {
        errors.push({ field: `${prefix}.categoryName`, code: "unsupported_value", message: `${category.categoryName} is not a supported category for ${input.componentType}.` });
      }
    }
    const weightError = numericError(`${prefix}.weight`, category.weight, { min: 0, max: 100 });
    if (weightError) errors.push(weightError);
    else weightTotal += category.weight;
    if (typeof category.graded !== "boolean") {
      errors.push({ field: `${prefix}.graded`, code: "invalid_type", message: "graded must be a boolean." });
      return;
    }
    if (category.graded) {
      const earnedError = numericError(`${prefix}.earnedPoints`, category.earnedPoints, { min: 0 });
      const maxError = numericError(`${prefix}.maxPoints`, category.maxPoints, { min: Number.MIN_VALUE });
      if (earnedError) errors.push(earnedError);
      if (maxError) errors.push(maxError);
      if (!earnedError && !maxError && isFiniteNumber(category.earnedPoints) && isFiniteNumber(category.maxPoints) && category.earnedPoints > category.maxPoints) {
        errors.push({ field: `${prefix}.earnedPoints`, code: "exceeds_maximum", message: "Earned points cannot exceed maximum points." });
      }
      const scoreIsUsable = !earnedError && !maxError && category.earnedPoints <= category.maxPoints;
      const performance = scoreIsUsable ? (category.earnedPoints / category.maxPoints) * 100 : null;
      categories.push({ categoryName: category.categoryName, weight: category.weight, earnedPoints: category.earnedPoints, maxPoints: category.maxPoints, graded: true, performance: performance === null ? null : roundTo(performance), weightedContribution: performance === null ? null : roundTo(performance * category.weight / 100) });
    } else {
      if (category.earnedPoints !== null || category.maxPoints !== null) errors.push({ field: prefix, code: "pending_scores_must_be_null", message: "A pending category must use null for earnedPoints and maxPoints; zero is a completed score." });
      categories.push({ categoryName: category.categoryName, weight: category.weight, earnedPoints: null, maxPoints: null, graded: false, performance: null, weightedContribution: null });
    }
  });
  if (Math.abs(weightTotal - 100) > WEIGHT_TOLERANCE) {
    errors.push({ field: "categories", code: "invalid_weight_total", message: `Category weights must total 100%; received ${roundTo(weightTotal, 4)}%.` });
  }
  if (errors.length) return resultError(errors);

  const currentContribution = roundTo(categories.reduce((sum, category) => sum + (category.weightedContribution ?? 0), 0));
  const remainingWeight = roundTo(categories.filter((category) => !category.graded).reduce((sum, category) => sum + category.weight, 0));
  const highestPossibleGrade = roundTo(currentContribution + remainingWeight);
  const pendingCategories = categories.filter((category) => !category.graded).map((category) => category.categoryName);
  const complete = pendingCategories.length === 0;
  const course = knownCourses.get(input.courseCode);
  return resultOk({
    id: input.id ?? null,
    courseCode: course.courseCode,
    componentType: course.componentType,
    term: input.term,
    categories,
    weightedContribution: currentContribution,
    remainingWeight,
    highestPossibleGrade,
    pendingCategories,
    status: complete ? "Complete" : "Provisional",
  });
}
