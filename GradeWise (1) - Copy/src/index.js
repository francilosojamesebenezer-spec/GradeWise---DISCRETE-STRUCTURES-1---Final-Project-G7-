export { calculateGrade } from "./services/gradeEngine.js";
export { calculateRequiredScore, simulateGrade } from "./services/planningEngine.js";
export { calculateSemesterGPA, convertNumericalGrade } from "./services/gpaEngine.js";
export { generateAcademicInsights } from "./services/insightsEngine.js";
export { default as curriculum } from "./data/curriculum.json" with { type: "json" };
export { default as gradeScale } from "./data/gradeScale.json" with { type: "json" };
export { default as assessmentTemplates } from "./data/assessmentTemplates.json" with { type: "json" };
