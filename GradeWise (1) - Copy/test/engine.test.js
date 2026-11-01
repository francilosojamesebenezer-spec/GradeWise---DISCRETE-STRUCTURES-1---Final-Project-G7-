import test from "node:test";
import assert from "node:assert/strict";
import curriculum from "../src/data/curriculum.json" with { type: "json" };
import gradeScale from "../src/data/gradeScale.json" with { type: "json" };
import { calculateGrade, calculateRequiredScore, simulateGrade, calculateSemesterGPA, convertNumericalGrade, generateAcademicInsights } from "../src/index.js";

const validGradeInput = (overrides = {}) => ({
  courseCode: "S-ITCS214",
  componentType: "Lecture",
  term: "Midterm",
  categories: [
    { categoryName: "EA", weight: 50, earnedPoints: 80, maxPoints: 100, graded: true },
    { categoryName: "SA", weight: 30, earnedPoints: 90, maxPoints: 100, graded: true },
    { categoryName: "CP", weight: 20, earnedPoints: 100, maxPoints: 100, graded: true },
  ],
  ...overrides,
});
const course = (courseCode, midtermGrade, finalGrade, finalized = true) => {
  const config = curriculum.find((item) => item.courseCode === courseCode);
  return { courseCode, courseName: config.courseName, componentType: config.componentType, units: config.units, midtermGrade, finalGrade, finalized };
};

test("grade calculator matches PRD 87 example and exposes documented fields", () => {
  const response = calculateGrade(validGradeInput());
  assert.equal(response.valid, true);
  assert.equal(response.result.weightedContribution, 87);
  assert.equal(response.result.remainingWeight, 0);
  assert.equal(response.result.highestPossibleGrade, 87);
  assert.equal(response.result.status, "Complete");
  assert.deepEqual(Object.keys(response.result).filter((key) => ["courseCode", "componentType", "term", "categories", "weightedContribution", "remainingWeight", "highestPossibleGrade", "status"].includes(key)).sort(), ["categories", "componentType", "courseCode", "highestPossibleGrade", "remainingWeight", "status", "term", "weightedContribution"].sort());
});

test("grade calculator rejects 95% weights and allows configured decimal tolerance", () => {
  const invalid = calculateGrade(validGradeInput({ categories: validGradeInput().categories.map((item, index) => ({ ...item, weight: [50, 30, 15][index] })) }));
  assert.equal(invalid.valid, false);
  assert.equal(invalid.result, null);
  assert.ok(invalid.errors.some((error) => error.code === "invalid_weight_total"));
  const withinTolerance = calculateGrade(validGradeInput({ categories: validGradeInput().categories.map((item, index) => ({ ...item, weight: [50, 30, 20.005][index] })) }));
  assert.equal(withinTolerance.valid, true);
});

test("pending category is not counted as zero; explicit zero is graded", () => {
  const pending = calculateGrade(validGradeInput({ categories: [
    { categoryName: "EA", weight: 50, earnedPoints: 0, maxPoints: 100, graded: true },
    { categoryName: "SA", weight: 30, earnedPoints: 90, maxPoints: 100, graded: true },
    { categoryName: "CP", weight: 20, earnedPoints: null, maxPoints: null, graded: false },
  ] }));
  assert.equal(pending.valid, true);
  assert.equal(pending.result.weightedContribution, 27);
  assert.equal(pending.result.remainingWeight, 20);
  assert.equal(pending.result.highestPossibleGrade, 47);
  assert.deepEqual(pending.result.pendingCategories, ["CP"]);
  assert.equal(pending.result.status, "Provisional");
});

test("grade validation rejects invalid component, score ranges, missing scores, and non-finite numbers", () => {
  for (const categories of [
    [{ categoryName: "EA", weight: 100, earnedPoints: 101, maxPoints: 100, graded: true }],
    [{ categoryName: "EA", weight: 100, earnedPoints: 10, maxPoints: 0, graded: true }],
    [{ categoryName: "EA", weight: 100, earnedPoints: null, maxPoints: null, graded: true }],
    [{ categoryName: "EA", weight: 100, earnedPoints: 0, maxPoints: 10, graded: false }],
    [{ categoryName: "EA", weight: Infinity, earnedPoints: 0, maxPoints: 10, graded: true }],
  ]) assert.equal(calculateGrade(validGradeInput({ categories })).valid, false);
  assert.equal(calculateGrade(validGradeInput({ courseCode: "UNKNOWN" })).valid, false);
  assert.equal(calculateGrade(validGradeInput({ componentType: "Laboratory" })).valid, false);
  assert.equal(calculateGrade(validGradeInput({ categories: [] })).valid, false);
});

test("required score follows PRD formula and identifies achieved, impossible, and zero-weight targets", () => {
  const required = calculateRequiredScore({ currentContribution: 55, remainingWeight: 40, targetGrade: 90 });
  assert.deepEqual(required.result, { currentContribution: 55, remainingWeight: 40, targetGrade: 90, requiredScore: 87.5, attainable: true, highestPossibleGrade: 95, status: "ScoreRequired" });
  const impossible = calculateRequiredScore({ currentContribution: 55, remainingWeight: 40, targetGrade: 100 });
  assert.equal(impossible.result.requiredScore, 112.5);
  assert.equal(impossible.result.attainable, false);
  assert.equal(impossible.result.highestPossibleGrade, 95);
  assert.equal(impossible.result.status, "Unattainable");
  assert.equal(calculateRequiredScore({ currentContribution: 80, remainingWeight: 20, targetGrade: 75 }).result.status, "AlreadyAchieved");
  const noneLeft = calculateRequiredScore({ currentContribution: 85, remainingWeight: 0, targetGrade: 90 });
  assert.equal(noneLeft.result.attainable, false);
  assert.equal(noneLeft.result.highestPossibleGrade, 85);
  assert.equal(noneLeft.result.status, "NoRemainingWeight");
  assert.equal(calculateRequiredScore({ currentContribution: 90, remainingWeight: 0, targetGrade: 90 }).result.status, "AlreadyAchieved");
});

test("required score validates ranges, inconsistent inputs, and fractional precision", () => {
  assert.equal(calculateRequiredScore({ currentContribution: -1, remainingWeight: 50, targetGrade: 80 }).valid, false);
  assert.equal(calculateRequiredScore({ currentContribution: 50, remainingWeight: 60, targetGrade: 80 }).valid, false);
  assert.equal(calculateRequiredScore({ currentContribution: 55, remainingWeight: 40, targetGrade: NaN }).valid, false);
  assert.equal(calculateRequiredScore({ currentContribution: 55.25, remainingWeight: 40, targetGrade: 90 }).result.requiredScore, 86.875);
});

test("simulator returns hypothetical grade and scenario comparisons, including zero remaining weight", () => {
  const response = simulateGrade({ currentContribution: 55, remainingWeight: 40, hypotheticalScore: 90 });
  assert.equal(response.result.projectedGrade, 91);
  assert.equal(response.result.status, "Hypothetical");
  assert.deepEqual(response.result.scenarios.map(({ hypotheticalScore }) => hypotheticalScore), [70, 80, 90, 100]);
  assert.equal(simulateGrade({ currentContribution: 85, remainingWeight: 0, hypotheticalScore: 0 }).result.projectedGrade, 85);
  assert.equal(simulateGrade({ currentContribution: 55, remainingWeight: 40, hypotheticalScore: 101 }).valid, false);
});

test("grade conversion floors 89.5 to 89 and matches every documented range boundary", () => {
  const halfGrade = calculateSemesterGPA({ courses: [course("S-ITCS111", 89, 90)] });
  assert.equal(halfGrade.result.courses[0].semesterGrade, 89.5);
  assert.equal(halfGrade.result.courses[0].conversionGrade, 89);
  assert.equal(halfGrade.result.courses[0].gradePoint, 3.25);
  for (const range of gradeScale) {
    assert.equal(convertNumericalGrade(range.minimum).gradePoint, range.gradePoint, `minimum ${range.minimum}`);
    assert.equal(convertNumericalGrade(range.maximum).gradePoint, range.gradePoint, `maximum ${range.maximum}`);
  }
  assert.equal(convertNumericalGrade(101), null);
  assert.equal(convertNumericalGrade(1.5), null);
});

test("GPA uses curriculum units, excludes provisional and zero-unit courses, and formats two decimals", () => {
  const response = calculateSemesterGPA({ courses: [
    course("G-PSYC101", 86, 86),
    course("S-ITCS111", 98, 98),
    course("D-SEPR000", 100, 100),
    course("G-FILI101", 60, 60, false),
  ] });
  assert.equal(response.result.semesterGPA, 3.4);
  assert.equal(response.result.semesterGPAFormatted, "3.40");
  assert.equal(response.result.totalEligibleUnits, 5);
  assert.equal(response.result.totalWeightedPoints, 17);
  assert.equal(response.result.excludedCourses.length, 2);
  assert.deepEqual(response.result.excludedCourses.map(({ reason }) => reason), ["ZeroUnits", "Provisional"]);
});

test("GPA empty state, duplicate protection, and invalid course inputs", () => {
  const empty = calculateSemesterGPA({ courses: [course("D-SEPR000", 80, 90)] });
  assert.equal(empty.result.semesterGPA, null);
  assert.equal(empty.result.status, "NoEligibleCourses");
  assert.equal(calculateSemesterGPA({ courses: [] }).result.semesterGPA, null);
  assert.equal(calculateSemesterGPA({ courses: [course("G-PSYC101", 80, 90), course("G-PSYC101", 70, 70)] }).valid, false);
  assert.equal(calculateSemesterGPA({ courses: [course("G-PSYC101", 101, 90)] }).valid, false);
  assert.equal(calculateSemesterGPA({ courses: [{ courseCode: "UNKNOWN", courseName: "Unknown", componentType: "Lecture", units: 3, midtermGrade: 80, finalGrade: 90, finalized: true }] }).valid, false);
  assert.equal(calculateSemesterGPA({ courses: [{ ...course("G-PSYC101", 80, 90), units: 4 }] }).valid, false);
});

test("insights follow exact boundaries, exclude invalid-status courses, and identify rules", () => {
  const grades = [59, 60, 74.99, 75, 89.99, 90, 100];
  const courses = grades.map((semesterGrade, index) => ({ courseCode: `C${index}`, courseName: `Course ${index}`, componentType: "Lecture", units: 3, semesterGrade, finalized: true }));
  courses.push({ courseCode: "PROV", courseName: "Provisional", componentType: "Lecture", units: 3, semesterGrade: 30, finalized: false });
  courses.push({ courseCode: "ZERO", courseName: "Zero units", componentType: "Lecture", units: 0, semesterGrade: 50, finalized: true });
  const response = generateAcademicInsights({ courses });
  assert.deepEqual(response.result.insights.map(({ indicator }) => indicator), ["Below supplied passing threshold", "May need attention", "May need attention", "No threshold alert", "No threshold alert", "Strong current result", "Strong current result"]);
  assert.equal(response.result.insights[0].ruleId, "below-supplied-passing-threshold");
  assert.equal(response.result.excludedCourses.length, 2);
  assert.match(response.result.disclaimer, /not official/);
  assert.equal(generateAcademicInsights({ courses: [{ ...courses[0], finalized: "yes" }] }).valid, false);
});

test("curriculum has distinct lecture/lab components and only the documented four semesters", () => {
  assert.equal(curriculum.length, 42);
  assert.deepEqual(new Set(curriculum.map(({ yearLevel, semester }) => `${yearLevel}-${semester}`)), new Set(["1-1", "1-2", "2-1", "2-2"]));
  assert.equal(curriculum.find(({ courseCode }) => courseCode === "S-ITCS214LA").componentType, "Laboratory");
});
