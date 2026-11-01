import curriculum from "../data/curriculum.json" with { type: "json" };
import gradeScale from "../data/gradeScale.json" with { type: "json" };
import { isFiniteNumber, numericError, resultError, resultOk, roundTo, stringError } from "../utils/validation.js";

const coursesByCode = new Map(curriculum.map((course) => [course.courseCode, course]));

export function convertNumericalGrade(flooredGrade) {
  if (!Number.isInteger(flooredGrade) || flooredGrade < 0 || flooredGrade > 100) return null;
  return gradeScale.find((range) => flooredGrade >= range.minimum && flooredGrade <= range.maximum) ?? null;
}

/** Calculate course semester grades, grade points, exclusions, and unit-weighted semester GPA. */
export function calculateSemesterGPA(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return resultError([{ field: "input", code: "invalid_type", message: "Input must be an object." }]);
  if (!Array.isArray(input.courses)) return resultError([{ field: "courses", code: "invalid_type", message: "courses must be an array." }]);
  const seen = new Set();
  const calculatedCourses = [];
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
    const configured = coursesByCode.get(course.courseCode);
    if (!configured) errors.push({ field: `${prefix}.courseCode`, code: "unknown_configuration", message: `Unknown course code: ${course.courseCode}.` });
    else {
      if (configured.componentType !== course.componentType) errors.push({ field: `${prefix}.componentType`, code: "configuration_mismatch", message: "The component type does not match the curriculum." });
      if (course.units !== undefined && course.units !== configured.units) errors.push({ field: `${prefix}.units`, code: "configuration_mismatch", message: "Units must match the curriculum configuration." });
    }
    if (typeof course.courseCode === "string") {
      if (seen.has(course.courseCode)) errors.push({ field: `${prefix}.courseCode`, code: "duplicate", message: "A course component may appear only once in a semester calculation." });
      seen.add(course.courseCode);
    }
    const units = configured?.units ?? course.units;
    const unitError = numericError(`${prefix}.units`, units, { min: 0 });
    if (unitError) errors.push(unitError);
    for (const field of ["midtermGrade", "finalGrade"]) {
      const error = numericError(`${prefix}.${field}`, course[field], { min: 0, max: 100 });
      if (error) errors.push(error);
    }
    if (typeof course.finalized !== "boolean") errors.push({ field: `${prefix}.finalized`, code: "invalid_type", message: "finalized must be a boolean." });
    if (!isFiniteNumber(course.midtermGrade) || !isFiniteNumber(course.finalGrade) || !isFiniteNumber(units)) return;
    const semesterGrade = roundTo((course.midtermGrade + course.finalGrade) / 2);
    const conversionGrade = Math.floor(semesterGrade);
    const conversion = convertNumericalGrade(conversionGrade);
    calculatedCourses.push({ courseCode: course.courseCode, courseName: course.courseName, componentType: course.componentType, units, midtermGrade: course.midtermGrade, finalGrade: course.finalGrade, semesterGrade, conversionGrade, gradePoint: conversion.gradePoint, gradeStatus: conversion.status, finalized: course.finalized });
  });
  if (errors.length) return resultError(errors);

  const eligibleCourses = calculatedCourses.filter((course) => course.finalized && course.units > 0);
  const excludedCourses = calculatedCourses.filter((course) => !course.finalized || course.units === 0).map((course) => ({
    courseCode: course.courseCode,
    courseName: course.courseName,
    reason: !course.finalized ? "Provisional" : "ZeroUnits",
  }));
  const totalEligibleUnits = eligibleCourses.reduce((sum, course) => sum + course.units, 0);
  const totalWeightedPoints = roundTo(eligibleCourses.reduce((sum, course) => sum + course.units * course.gradePoint, 0));
  const semesterGPA = totalEligibleUnits === 0 ? null : Math.round((totalWeightedPoints / totalEligibleUnits + Number.EPSILON) * 100) / 100;
  return resultOk({
    courses: calculatedCourses,
    eligibleCourses,
    excludedCourses,
    totalEligibleUnits,
    totalWeightedPoints,
    semesterGPA,
    semesterGPAFormatted: semesterGPA === null ? null : semesterGPA.toFixed(2),
    status: semesterGPA === null ? "NoEligibleCourses" : "Calculated",
  });
}
