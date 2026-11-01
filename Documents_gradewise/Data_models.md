# DATA_MODELS.md

# GradeWise Data Models

## Purpose

This document defines the core data structures used throughout the GradeWise application.

The models are documentation models only and do not require separate JavaScript class files. They serve as a reference for developers when implementing calculations, validation, local storage, and user interfaces.

---

# 1. Course Model

## Purpose

Represents a course from the preloaded BSCS curriculum.

## Structure

```javascript
{
  courseCode: string,
  courseName: string,
  componentType: string,
  units: number,
  yearLevel: number,
  semester: number
}
```

## Fields

| Field         | Type   | Description              |
| ------------- | ------ | ------------------------ |
| courseCode    | string | Unique course identifier |
| courseName    | string | Official course title    |
| componentType | string | Lecture or Laboratory    |
| units         | number | Course units             |
| yearLevel     | number | Student year level       |
| semester      | number | Semester number          |

## Example

```json
{
  "courseCode": "S-ITCS214",
  "courseName": "Data Structures and Algorithms Lec",
  "componentType": "Lecture",
  "units": 2,
  "yearLevel": 2,
  "semester": 1
}
```

---

# 2. Assessment Category Model

## Purpose

Represents a grading category used by the Grade Calculator.

Examples:

- EA
- SA
- CP

## Structure

```javascript
{
  categoryName: string,
  weight: number,
  earnedPoints: number | null,
  maxPoints: number | null,
  graded: boolean
}
```

## Fields

| Field        | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| categoryName | string  | Assessment category name       |
| weight       | number  | Percentage weight              |
| earnedPoints | number  | Earned points                  |
| maxPoints    | number  | Maximum possible points        |
| graded       | boolean | Indicates whether scores exist |

## Example

```json
{
  "categoryName": "EA",
  "weight": 50,
  "earnedPoints": 80,
  "maxPoints": 100,
  "graded": true
}
```

---

# 3. Grade Record Model

## Purpose

Stores a complete grade-calculation session for one course.

## Structure

```javascript
{
  id: string,
  courseCode: string,
  componentType: string,
  term: string,
  categories: AssessmentCategory[],
  weightedContribution: number,
  remainingWeight: number,
  highestPossibleGrade: number,
  status: string
}
```

## Fields

| Field                | Type   | Description                 |
| -------------------- | ------ | --------------------------- |
| id                   | string | Unique identifier           |
| courseCode           | string | Related course              |
| componentType        | string | Lecture or Laboratory       |
| term                 | string | Midterm or Final            |
| categories           | array  | Assessment categories       |
| weightedContribution | number | Current earned contribution |
| remainingWeight      | number | Remaining percent           |
| highestPossibleGrade | number | Maximum achievable grade    |
| status               | string | Complete or Provisional     |

## Example

```json
{
  "id": "GR001",
  "courseCode": "S-ITCS214",
  "componentType": "Lecture",
  "term": "Midterm",
  "categories": [],
  "weightedContribution": 76.5,
  "remainingWeight": 40,
  "highestPossibleGrade": 100,
  "status": "Provisional"
}
```

---

# 4. Required Score Result Model

## Purpose

Stores the output of the Required Score Calculator.

## Structure

```javascript
{
  currentContribution: number,
  remainingWeight: number,
  targetGrade: number,
  requiredScore: number | null,
  attainable: boolean,
  highestPossibleGrade: number
}
```

## Example

```json
{
  "currentContribution": 55,
  "remainingWeight": 40,
  "targetGrade": 90,
  "requiredScore": 87.5,
  "attainable": true,
  "highestPossibleGrade": 95
}
```

---

# 5. Grade Simulation Model

## Purpose

Stores a hypothetical grade simulation result.

## Structure

```javascript
{
  currentContribution: number,
  remainingWeight: number,
  hypotheticalScore: number,
  projectedGrade: number
}
```

## Example

```json
{
  "currentContribution": 55,
  "remainingWeight": 40,
  "hypotheticalScore": 90,
  "projectedGrade": 91
}
```

---

# 6. GPA Course Record Model

## Purpose

Represents a course included in GPA computation.

## Structure

```javascript
{
  courseCode: string,
  courseName: string,
  componentType: string,
  units: number,
  midtermGrade: number,
  finalGrade: number,
  semesterGrade: number,
  gradePoint: number,
  finalized: boolean
}
```

## Fields

| Field         | Type    | Description             |
| ------------- | ------- | ----------------------- |
| courseCode    | string  | Course code             |
| courseName    | string  | Course title            |
| componentType | string  | Lecture or Laboratory   |
| units         | number  | Units                   |
| midtermGrade  | number  | Midterm numerical grade |
| finalGrade    | number  | Final numerical grade   |
| semesterGrade | number  | Computed semester grade |
| gradePoint    | number  | Converted grade point   |
| finalized     | boolean | Eligible for GPA        |

## Example

```json
{
  "courseCode": "S-ITCS214",
  "courseName": "Data Structures and Algorithms Lec",
  "componentType": "Lecture",
  "units": 2,
  "midtermGrade": 89,
  "finalGrade": 90,
  "semesterGrade": 89,
  "gradePoint": 3.25,
  "finalized": true
}
```

---

# 7. GPA Summary Model

## Purpose

Represents a completed GPA calculation.

## Structure

```javascript
{
  totalEligibleUnits: number,
  totalWeightedPoints: number,
  semesterGPA: number
}
```

## Example

```json
{
  "totalEligibleUnits": 23,
  "totalWeightedPoints": 72.5,
  "semesterGPA": 3.15
}
```

---

# 8. Academic Insight Model

## Purpose

Represents a rule-based academic performance indicator.

## Structure

```javascript
{
  courseCode: string,
  numericalGrade: number,
  indicator: string,
  explanation: string
}
```

## Indicator Types

### Below Passing Threshold

```text
Numerical Grade < 60
```

### May Need Attention

```text
60 <= Numerical Grade < 75
```

### No Threshold Alert

```text
75 <= Numerical Grade < 90
```

### Strong Current Result

```text
Numerical Grade >= 90
```

## Example

```json
{
  "courseCode": "S-ITCS214",
  "numericalGrade": 68,
  "indicator": "May Need Attention",
  "explanation": "Grade falls between 60 and 74 under the prototype rules."
}
```

---

# 9. Dashboard Summary Model

## Purpose

Provides dashboard overview information.

## Structure

```javascript
{
  totalCourses: number,
  provisionalCourses: number,
  finalizedCourses: number,
  attentionCount: number,
  semesterGPA: number | null
}
```

## Example

```json
{
  "totalCourses": 10,
  "provisionalCourses": 4,
  "finalizedCourses": 6,
  "attentionCount": 2,
  "semesterGPA": 3.28
}
```

---

# 10. Local Storage Model

## Purpose

Represents the complete saved browser session.

## Structure

```javascript
{
  gradeRecords: GradeRecord[],
  gpaRecords: GPACourseRecord[],
  lastUpdated: string
}
```

## Example

```json
{
  "gradeRecords": [],
  "gpaRecords": [],
  "lastUpdated": "2026-10-22T20:00:00Z"
}
```

---

# Model Relationships

```text
Course
  │
  ├── GradeRecord
  │        │
  │        └── AssessmentCategory
  │
  ├── GPACourseRecord
  │        │
  │        └── AcademicInsight
  │
  └── DashboardSummary


GradeRecord
   │
   ├── RequiredScoreResult
   │
   └── GradeSimulation


GPACourseRecord
   │
   └── GPASummary
```

---

# Design Notes

1. Models are documentation-only and do not require separate class files.
2. Course data should come from `curriculum.json`.
3. Grade-point mappings should come from `gradeScale.json`.
4. Assessment templates should come from `assessmentTemplates.json`.
5. All calculations should use shared services to ensure consistency across modules.
6. All numerical values should be validated before being processed by the calculation engines.
7. Missing grades and zero grades must always be treated as different states.
