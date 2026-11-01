# GradeWise

This repository contains the GradeWise academic prototype: a responsive, dependency-free single-page website connected to an independent JavaScript calculation layer. Curriculum and grading configuration are separate JSON files. Course inputs entered through the GPA calculator are saved in the current browser only.

## Requirements and implementation decisions

- `PRD.md` defines the weighted category calculation, required-score and simulation formulas, the 42 configured course components, the floored semester grade conversion table, finalized-only GPA, zero-unit exclusion, and insight thresholds.
- `Architecture.md` places calculations, validation, and academic rules in client-side JavaScript modules and data in JSON.
- `Architecture.essential.md` calls out pending-versus-zero, exact weight validation with tolerance, invalid point totals, GPA exclusions, duplicate courses, empty GPA, and simple deterministic rules.
- `Data_models.md` supplies the course, assessment, grade record, GPA, and insight fields. Results retain those fields and add explicit validation metadata and relevant derived details.

No conflicts between the four documents block this engine. Data models do not define an error envelope or statuses for required-score edge cases, so every API returns `{ valid, errors, result }`; valid required-score results add `status` (`ScoreRequired`, `AlreadyAchieved`, `Unattainable`, or `NoRemainingWeight`). A pending assessment category uses `graded: false` and null score fields. A zero score uses `graded: true`, `earnedPoints: 0`, and a positive maximum. Category totals within 0.01 percentage point of 100 are accepted to handle decimal representation.

The course list and conversion table are reproduced from the project documents and remain subject to the PRD's verification notice. Assessment category names are listed by component, but `assessmentTemplates.json` has no weights because no verified weights were supplied. Students must pass syllabus weights to the grade engine. The API currently supports `Midterm` and `Final` as the PRD's terms.

One modeling limitation remains: the PRD discusses assessments that may still be ungraded inside a category, while `AssessmentCategory` only has one `graded` boolean and no field for the fraction of category work completed. This engine follows the documented model and treats each category as either fully represented by its entered totals (`graded: true`) or entirely pending (`graded: false`). It cannot calculate remaining weight for a partially graded category without a documented model change; the frontend should not imply that this partial-category case is represented.

## Install and run

Use Node.js 22 or later (native JSON module imports and `node:test` are used) and Python 3 for the static development server. No package installation is needed. The equivalent direct commands are useful if npm is not on your PATH:

```sh
node --test
python3 -m http.server 4173 --bind 127.0.0.1
```

You can also use `npm test` and `npm start` when npm is installed.

Open `http://localhost:4173` after starting the server. The development server binds to `127.0.0.1` only. Serve the files over HTTP so the browser can load the JSON module imports. Select a year and semester before entering course grades. The course list is saved in `localStorage` on that browser; it does not sync across devices.

## Public API

All functions return `{ valid: boolean, errors: Array<{ field, code, message }>, result: object | null }`. Invalid input gives `valid: false`, one or more corrective errors, and `result: null`.

```js
import {
  calculateGrade,
  calculateRequiredScore,
  simulateGrade,
  calculateSemesterGPA,
  generateAcademicInsights,
  curriculum,
  gradeScale,
  assessmentTemplates,
} from "./src/index.js";
```

### Grade Calculator

Responsibility: validate category weights and score totals, compute category performances and weighted contributions, identify pending categories, and calculate the current and highest possible contribution.

Input uses the documented Assessment Category model plus the required course/component/term selectors. `courseCode` must exist in `curriculum.json`; `componentType` must match it. Terms are `Midterm` or `Final`. Lecture categories support EA, SA, CP; laboratory supports EA, SA. Score totals are totals for graded work within a category.

```js
const grade = calculateGrade({
  courseCode: "S-ITCS214",
  componentType: "Lecture",
  term: "Midterm",
  categories: [
    { categoryName: "EA", weight: 50, earnedPoints: 80, maxPoints: 100, graded: true },
    { categoryName: "SA", weight: 30, earnedPoints: 90, maxPoints: 100, graded: true },
    { categoryName: "CP", weight: 20, earnedPoints: null, maxPoints: null, graded: false },
  ],
});
// grade.result.weightedContribution === 67
// grade.result.remainingWeight === 20
// grade.result.highestPossibleGrade === 87
// grade.result.status === "Provisional"
```

Errors include missing fields, unknown course/component/term, unsupported or duplicate categories, invalid scores, earned points above maximum, and total weights outside 100% ± 0.01. Dependencies: curriculum, category templates, shared validators.

### Required Score Calculator

Responsibility: calculate the average needed on remaining grade weight. `remainingWeight` is a percentage (for example, 40), while the formula converts it to 0.40.

```js
calculateRequiredScore({ currentContribution: 55, remainingWeight: 40, targetGrade: 90 }).result;
// { currentContribution: 55, remainingWeight: 40, targetGrade: 90,
//   requiredScore: 87.5, attainable: true, highestPossibleGrade: 95,
//   status: "ScoreRequired" }
```

An already met target has `requiredScore: null` and `status: "AlreadyAchieved"`. A score over 100 is returned as a mathematical result but `attainable` is false and status is `Unattainable`. With zero remaining weight, `requiredScore` is null and status is `NoRemainingWeight` unless the target is already met. Rejects non-finite/out-of-range numbers and a current contribution plus remaining weight above 100. Dependencies: shared validators.

### Grade Goal Simulator

Responsibility: calculate a hypothetical projected result and standard 70/80/90/100 comparison scenarios. Output is explicitly labeled with `status: "Hypothetical"` (or `NoRemainingWeight`); it is not a prediction.

```js
simulateGrade({ currentContribution: 55, remainingWeight: 40, hypotheticalScore: 90 }).result;
// projectedGrade: 91; scenarios: 70, 80, 90, 100
```

Rejects invalid ranges and inconsistent grade state. Dependencies: shared validators.

### Semester GPA Calculator

Responsibility: compute each course component's mean semester numerical grade, floor before conversion, and calculate the unit-weighted GPA over finalized positive-unit components. Curriculum units are authoritative. Courses are keyed by unique curriculum `courseCode`; lecture and laboratory entries use separate codes.

```js
const gpa = calculateSemesterGPA({ courses: [
  { courseCode: "G-PSYC101", courseName: "Understanding the Self", componentType: "Lecture", midtermGrade: 86, finalGrade: 86, finalized: true },
  { courseCode: "G-MATH100", courseName: "Mathematics in the Modern World", componentType: "Lecture", midtermGrade: 98, finalGrade: 98, finalized: true },
] });
// gpa.result.semesterGPA === 3.5; gpa.result.semesterGPAFormatted === "3.50"
```

Each derived course record has the documented GPA fields plus `conversionGrade` and `gradeStatus`. The result includes `eligibleCourses`, `excludedCourses` with reason (`Provisional` or `ZeroUnits`), eligible units, weighted points, a two-decimal numeric GPA and formatted string. An empty eligible set has `semesterGPA: null` and `status: "NoEligibleCourses"`. Rejects unknown or duplicate course codes, mismatched components/units, missing values, and grades outside 0–100. Dependencies: curriculum, grade scale, shared validators.

### Academic Insights

Responsibility: create deterministic indicators for finalized, positive-unit course grades, including the rule ID and explanation. Input accepts the `courses` list from the GPA result.

```js
const insights = generateAcademicInsights({ courses: gpa.result.courses });
// insights.result.insights contains courseCode, numericalGrade, indicator,
// ruleId, and explanation; excluded provisional/zero-unit records are listed.
```

Invalid grade data causes a validation result and no insights. The output carries a disclaimer that indicators are not official decisions or predictions. Dependencies: shared validators.

## Files

```text
src/
  app.js                       # DOM rendering, forms, navigation, browser storage
  data/
    assessmentTemplates.json  # names only; weights intentionally absent
    curriculum.json            # 42 components from PRD, grouped by year/semester
    gradeScale.json            # supplied grade-point conversion ranges
  services/
    gradeEngine.js
    gpaEngine.js
    insightsEngine.js
    planningEngine.js
  utils/validation.js
  index.js
test/engine.test.js
index.html
styles.css
favicon.svg
```

## Frontend integration

The current frontend is in `index.html`, `styles.css`, and `src/app.js`. It provides the dashboard, grade calculator, required score tool, simulator, semester GPA list, and academic insights. `src/app.js` gathers form values into documented input objects and calls the pure functions in `src/index.js`. The UI checks `valid` before rendering `result` and shows validation messages. Local storage is limited to GPA course inputs and remains outside the calculation services. The engine does not read or manipulate the DOM.

## Assumptions and open items

- Assessment weights remain user-entered; no official or sample default weights have been invented.
- The curriculum and conversion table are project-provided but unverified against current DLSU-D policy, as the PRD states.
- A course component can appear only once in a semester GPA input; a lab is a separate course code/component.
- GPA course entry is scoped to one of the four curriculum year/semester groups at a time; other entered semester records stay in the same browser and can be viewed by switching the selector.
- Partial grading within an assessment category is not representable by the current `AssessmentCategory` data model. See the modeling limitation above.
- Incomplete grades are represented by `finalized: false` and are excluded like other provisional records; no separate incomplete-grade policy was supplied.
- There is no backend, account system, cloud persistence, term-level assessment-weight configuration, or official-policy verification.
