import { numericError, resultError, resultOk, stringError } from "../utils/validation.js";

const RULES = [
  { id: "below-supplied-passing-threshold", minimum: 0, maximum: 60, indicator: "Below supplied passing threshold", explanation: "Review the result and confirm the course status with the instructor." },
  { id: "may-need-attention", minimum: 60, maximum: 75, indicator: "May need attention", explanation: "Consider reviewing difficult topics, assessments, and available academic support." },
  { id: "no-threshold-alert", minimum: 75, maximum: 90, indicator: "No threshold alert", explanation: "The grade is above the prototype's attention threshold. Continue monitoring upcoming requirements." },
  { id: "strong-current-result", minimum: 90, maximum: 101, indicator: "Strong current result", explanation: "The entered grade indicates strong performance under the prototype's rules." },
];

/** Generate deterministic insights for finalized, positive-unit course components only. */
export function generateAcademicInsights(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input.courses)) {
    return resultError([{ field: "courses", code: "invalid_type", message: "Input must contain a courses array." }]);
  }
  const errors = [];
  const seen = new Set();
  const insights = [];
  const exclusions = [];
  input.courses.forEach((course, index) => {
    const prefix = `courses[${index}]`;
    if (!course || typeof course !== "object" || Array.isArray(course)) {
      errors.push({ field: prefix, code: "invalid_type", message: "Each course must be an object." });
      return;
    }
    for (const field of ["courseCode", "courseName", "componentType"]) {
      const error = stringError(`${prefix}.${field}`, course[field]);
      if (error) errors.push(error);
    }
    const gradeError = numericError(`${prefix}.semesterGrade`, course.semesterGrade, { min: 0, max: 100 });
    const unitsError = numericError(`${prefix}.units`, course.units, { min: 0 });
    if (gradeError) errors.push(gradeError);
    if (unitsError) errors.push(unitsError);
    if (typeof course.finalized !== "boolean") errors.push({ field: `${prefix}.finalized`, code: "invalid_type", message: "finalized must be a boolean." });
    if (typeof course.courseCode === "string") {
      if (seen.has(course.courseCode)) errors.push({ field: `${prefix}.courseCode`, code: "duplicate", message: "Course components must be unique." });
      seen.add(course.courseCode);
    }
    if (gradeError || unitsError || typeof course.finalized !== "boolean") return;
    if (!course.finalized) {
      exclusions.push({ courseCode: course.courseCode, reason: "Provisional" });
      return;
    }
    if (course.units === 0) {
      exclusions.push({ courseCode: course.courseCode, reason: "ZeroUnits" });
      return;
    }
    const rule = RULES.find(({ minimum, maximum }) => course.semesterGrade >= minimum && course.semesterGrade < maximum);
    insights.push({ courseCode: course.courseCode, numericalGrade: course.semesterGrade, indicator: rule.indicator, ruleId: rule.id, explanation: rule.explanation });
  });
  if (errors.length) return resultError(errors);
  return resultOk({ insights, excludedCourses: exclusions, disclaimer: "These are prototype rule-based indicators, not official university decisions or predictions." });
}
