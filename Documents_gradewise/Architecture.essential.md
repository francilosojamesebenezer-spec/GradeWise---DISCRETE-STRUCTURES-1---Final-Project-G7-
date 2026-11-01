# GradeWise Architecture Review (Essential)

## Purpose

This document reviews the GradeWise architecture from a practical implementation perspective.

It answers three questions:

1. What can break?
2. What edge cases are missing?
3. What parts are over-engineered for a student prototype?

The goal is to reduce project risk and ensure the system remains achievable within the project's scope.

---

# 1. What Can Break?

## 1.1 Assessment Weight Configuration

### Risk

The system assumes students will enter valid assessment weights.

Example:

EA = 40%
SA = 40%
CP = 40%

Total = 120%

or

EA = 20%
SA = 20%
CP = 20%

Total = 60%

### Impact

Grade calculations become invalid.

### Recommendation

Block calculations until:

```text
Total Weight = 100%
```

with a small tolerance for decimal values.

---

## 1.2 Earned Points Greater Than Maximum Points

### Example

```text
Earned = 110
Maximum = 100
```

### Impact

Performance exceeds 100%.

Produces impossible grades.

### Recommendation

Reject input immediately.

---

## 1.3 Division by Zero

### Example

```text
Earned = 50
Maximum = 0
```

### Impact

Calculation engine crashes.

### Recommendation

Validate:

```text
Maximum Points > 0
```

before calculation.

---

## 1.4 Missing Grades Treated as Zero

### Example

Student has not yet received a score.

System interprets:

```text
blank = 0
```

instead of

```text
blank = not graded
```

### Impact

Grade becomes artificially lower.

### Recommendation

Use three states:

```text
Scored
Zero Score
Not Yet Graded
```

---

## 1.5 GPA Inclusion Errors

### Example

Course status:

```text
Provisional
```

but included in GPA.

### Impact

Incorrect GPA.

### Recommendation

Only finalized grades are included.

---

## 1.6 Incorrect Grade Point Conversion

### Example

Semester grade:

```text
89.9
```

System rounds:

```text
90
```

instead of

```text
floor(89.9) = 89
```

### Impact

Wrong GPA.

### Recommendation

Always floor before conversion.

---

## 1.7 Local Storage Corruption

### Example

Browser storage contains:

```json
{
  "grade": "hello"
}
```

### Impact

Calculations fail.

### Recommendation

Validate restored data before use.

---

# 2. Missing Edge Cases

These are not fully addressed in the PRD.

---

## 2.1 Remaining Weight = 0

Example:

```text
Current Grade = 85
Remaining Weight = 0%
Target Grade = 90
```

Question:

Can the student still reach 90?

Answer:

No.

The calculator must clearly explain that no assessments remain.

---

## 2.2 Negative Inputs

Examples:

```text
-10
-50
-100
```

### Recommendation

Disallow all negative values.

---

## 2.3 Decimal Weights

Example:

```text
33.33
33.33
33.34
```

Total:

```text
100.00
```

Floating-point precision may produce:

```text
99.999999
```

### Recommendation

Allow small tolerance.

Example:

```text
99.99 – 100.01
```

---

## 2.4 Impossible Targets

Example:

```text
Current Contribution = 40
Remaining Weight = 50%
Target Grade = 100
```

Required Score:

```text
120%
```

### Recommendation

Show:

```text
Target Unattainable
```

and display highest possible grade.

---

## 2.5 Empty GPA

Example:

Student has entered no finalized grades.

### Recommendation

Display:

```text
No eligible courses available.
```

instead of:

```text
0.00 GPA
```

---

## 2.6 Zero Unit Courses

Example:

```text
SEPR = 0 Units
```

### Recommendation

Exclude from GPA.

---

## 2.7 Duplicate Course Entries

Example:

```text
ITCS214
ITCS214
ITCS214
```

entered three times.

### Impact

Inflated GPA.

### Recommendation

Prevent duplicates.

---

## 2.8 Browser Refresh

Example:

Student spends 20 minutes entering grades.

Page refreshes.

Everything disappears.

### Recommendation

Either:

- warn users
- or save locally

---

## 2.9 Invalid Curriculum Configuration

Example:

```json
{
  "courseCode": "ITCS214"
}
```

missing units.

### Impact

GPA calculations break.

### Recommendation

Validate curriculum data on load.

---

## 2.10 Mobile Screens

Example:

320px width phones.

### Impact

Tables overflow.

### Recommendation

Test using:

```text
320px
375px
768px
1024px
```

---

# 3. What Is Over-Engineered?

This is the most important section.

For a student capstone prototype, some requirements may be unnecessary.

---

## 3.1 Academic Insights

### Current Design

Separate feature.

Separate rules engine.

Separate dashboard metrics.

### Reality

Current logic:

```text
if grade < 60
if grade < 75
if grade < 90
```

This is not really an AI system.

### Recommendation

Keep it simple:

```javascript
if (grade < 60)
if (grade < 75)
if (grade < 90)
else
```

No separate architecture needed.

---

## 3.2 Complex Curriculum Management

### Current Design

Curriculum configurations.

Assessment configurations.

Multiple validation layers.

### Reality

Only 4 semesters are supported.

Less than 50 courses.

### Recommendation

Store everything inside static JSON files.

No need for advanced management.

---

## 3.3 Dashboard Analytics

### Current Design

Dashboard summaries.

Insights counts.

Statistics.

Aggregate reporting.

### Reality

The project's core value is:

```text
Grade Calculator
Required Score
GPA Calculator
Simulator
```

### Recommendation

Keep dashboard minimal.

---

## 3.4 Course Configuration Engine

### Current Design

Potentially loading unique assessment configurations per course.

### Reality

Weights are usually entered manually.

### Recommendation

Use:

```text
User-entered weights
```

until official values exist.

---

## 3.5 Excessive Validation Layers

Current PRD introduces validation at many levels.

### Recommendation

One shared validator module:

```text
validators.js
```

is enough.

---

# 4. Biggest Technical Risks

Ranked from highest to lowest.

## High Risk

### 1. GPA Conversion Logic

Most likely source of grading errors.

---

### 2. Weight Validation

Incorrect weights invalidate all results.

---

### 3. Missing vs Zero Scores

Students frequently confuse these.

---

## Medium Risk

### 4. Mobile Responsiveness

Likely issue during presentation.

---

### 5. Local Storage

Saved data may break after updates.

---

## Low Risk

### 6. Calculation Speed

Not a concern.

Calculations are lightweight.

---

### 7. Browser Compatibility

Modern browsers can easily handle GradeWise.

---

# Recommended Simplified Architecture

For the prototype, the entire system can realistically be reduced to:

```text
GradeWise

├── Dashboard
├── Grade Calculator
├── Required Score Calculator
├── Grade Goal Simulator
├── GPA Calculator
├── Academic Insights

Shared Modules

├── Validation Engine
├── Grade Engine
├── GPA Engine
└── Curriculum Data (JSON)
```

Nothing more is needed for a successful capstone demonstration.

---

# Final Verdict

The PRD is solid and complete, but the biggest risk is not missing features—it's overbuilding.

For the first version, focus on:

1. Accurate Grade Calculator
2. Accurate Required Score Calculator
3. Accurate GPA Calculator
4. Simple Academic Insights
5. Responsive UI

Everything else can be treated as future enhancements.
