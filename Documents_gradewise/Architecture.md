# GradeWise Architecture Document

## Version

1.0

## Product

GradeWise - Smart Academic Performance and Decision Support System

---

# 1. System Overview

GradeWise is a client-side web application designed to help BSCS students calculate grades, simulate academic outcomes, compute semester GPA, and view academic insights through explainable rules.

The system follows a lightweight architecture that prioritizes:

- Simplicity
- Maintainability
- Transparency
- Responsiveness
- Calculation Accuracy

No account system, backend server, cloud database, or AI service is required for the initial prototype.

---

# 2. High-Level Architecture

```text
┌─────────────────────┐
│      User           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Browser        │
│ (Desktop / Mobile)  │
└──────────┬──────────┘
           │
           ▼
┌────────────────────────────────────┐
│           GradeWise UI             │
│                                    │
│  Dashboard                         │
│  Grade Calculator                  │
│  Required Score Calculator         │
│  Grade Goal Simulator              │
│  GPA Calculator                    │
│  Academic Insights                 │
└──────────┬─────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│        Application Layer           │
│                                    │
│  Validation Engine                 │
│  Grade Calculation Engine          │
│  GPA Engine                        │
│  Academic Rules Engine             │
└──────────┬─────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│           Data Layer               │
│                                    │
│ Curriculum Configuration           │
│ Course Units                       │
│ Grade Conversion Rules             │
│ Assessment Weights                 │
│ Local Storage (Optional)           │
└────────────────────────────────────┘
```

---

# 3. Architectural Style

The project uses a:

## Client-Side Layered Architecture

The application is divided into:

### Presentation Layer

Handles:

- User Interface
- Forms
- Navigation
- Validation Messages
- Result Display

### Business Logic Layer

Handles:

- Grade calculations
- GPA calculations
- Score simulations
- Academic indicators

### Data Layer

Handles:

- Curriculum data
- Grade conversion tables
- Course configurations
- Optional local storage

---

# 4. Technology Stack

## Frontend

### HTML

Responsible for:

- Page structure
- Forms
- Navigation
- Layout

### CSS

Responsible for:

- Styling
- Responsive design
- Accessibility

### JavaScript

Responsible for:

- Calculations
- Validation
- Dynamic content updates
- State management

---

# 5. Module Architecture

## Dashboard Module

### Responsibilities

- Application landing page
- Navigation hub
- GPA summary
- Academic overview
- Attention indicators

### Inputs

- Stored calculator results
- GPA data

### Outputs

- Summary cards
- Navigation links

---

## Grade Calculator Module

### Responsibilities

- Manage assessment categories
- Validate weights
- Compute weighted contributions
- Handle pending categories

### Inputs

```text
Course
Component
Term
Category Weights
Earned Points
Maximum Points
```

### Outputs

```text
Current Contribution
Remaining Weight
Highest Possible Grade
Pending Categories
```

---

## Required Score Calculator Module

### Responsibilities

- Calculate required scores
- Determine attainability

### Formula

```text
Required Score =
(Target Grade - Current Contribution)
÷ Remaining Weight
```

### Outputs

```text
Required Average
Attainable Status
Highest Possible Grade
```

---

## Grade Goal Simulator Module

### Responsibilities

- Simulate future outcomes
- Compare scenarios

### Formula

```text
Projected Grade =
Current Contribution +
(Remaining Weight × Hypothetical Score)
```

### Outputs

```text
Projected Grade
Scenario Comparison
```

---

## GPA Calculator Module

### Responsibilities

- Convert grades to grade points
- Calculate GPA

### Inputs

```text
Course Units
Midterm Grade
Final Grade
Finalization Status
```

### Outputs

```text
Semester Grade
Grade Point
Semester GPA
```

---

## Academic Insights Module

### Responsibilities

- Analyze finalized grades
- Generate indicators
- Provide explanations

### Outputs

```text
Strong Current Result
No Threshold Alert
May Need Attention
Below Passing Threshold
```

---

# 6. Data Architecture

## Curriculum Configuration

Stored as JSON.

Example:

```json
{
  "courseCode": "S-ITCS214",
  "courseName": "Data Structures and Algorithms",
  "units": 2,
  "type": "Lecture"
}
```

---

## Assessment Configuration

Example:

```json
{
  "EA": 50,
  "SA": 30,
  "CP": 20
}
```

---

## Grade Conversion Configuration

Example:

```json
{
  "98-100": 4.0,
  "95-97": 3.75,
  "92-94": 3.5
}
```

---

# 7. Directory Structure

Recommended structure:

```text
GradeWise/
│
├── public/
│
├── src/
│   │
│   ├── pages/
│   │   ├── Dashboard
│   │   ├── GradeCalculator
│   │   ├── RequiredScore
│   │   ├── Simulator
│   │   ├── GPACalculator
│   │   └── AcademicInsights
│   │
│   ├── components/
│   │
│   ├── data/
│   │   ├── curriculum.json
│   │   ├── gradeScale.json
│   │   └── assessmentConfigs.json
│   │
│   ├── services/
│   │   ├── gradeEngine.js
│   │   ├── gpaEngine.js
│   │   └── insightsEngine.js
│   │
│   ├── utils/
│   │   └── validators.js
│   │
│   ├── App.js
│   └── main.js
│
├── README.md
├── PRD.md
└── ARCHITECTURE.md
```

---

# 8. Data Flow

## Grade Calculation Flow

```text
User Input
      │
      ▼
Validation Engine
      │
      ▼
Grade Calculation Engine
      │
      ▼
Result Formatter
      │
      ▼
UI Output
```

---

## GPA Calculation Flow

```text
Course Grades
       │
       ▼
Grade Conversion
       │
       ▼
Grade Points
       │
       ▼
GPA Engine
       │
       ▼
Final GPA
```

---

## Academic Insights Flow

```text
Finalized Grades
        │
        ▼
Academic Rules Engine
        │
        ▼
Indicator Selection
        │
        ▼
Explanation Generator
        │
        ▼
Student Recommendations
```

---

# 9. Validation Architecture

The Validation Engine performs:

## Input Validation

- Required fields
- Numeric values only
- Valid ranges
- Weight validation

## Business Rule Validation

- Weights total 100%
- Earned ≤ Maximum Points
- Maximum Points > 0
- GPA eligible courses exist
- Remaining weight available

---

# 10. Optional Local Storage Architecture

If implemented:

```text
Browser Local Storage
        │
        ▼
Saved Calculator Inputs
        │
        ▼
Restore Previous Session
```

Data remains:

- Browser-specific
- Device-specific
- Non-synchronized

---

# 11. Security and Privacy

## Security

The prototype:

- Does not store passwords
- Does not connect to external APIs
- Does not require authentication

## Privacy

The prototype:

- Collects no personal information
- Uses locally entered academic data only
- Does not share information externally

---

# 12. Error Handling Strategy

The system must handle:

- Empty fields
- Invalid numbers
- Negative values
- Missing weights
- Incorrect weight totals
- Division by zero
- No GPA-eligible courses
- Missing course configurations

Errors should provide:

- Clear messages
- Corrective guidance
- Prevent invalid calculations

---

# 13. Scalability Considerations

Future versions may support:

- User accounts
- Cloud storage
- Multi-semester tracking
- Cumulative GPA
- Administrator dashboard
- Curriculum management
- Analytics
- Exportable reports

The current modular architecture allows these features to be added without major redesign.

---

# 14. System Constraints

Current prototype limitations:

- No server backend
- No database
- No AI prediction engine
- No official university integration
- No synchronization across devices
- No automated retrieval of grades

---

# 15. Architecture Principles

GradeWise is built using the following principles:

1. Simplicity over complexity.
2. Transparent calculations.
3. Explainable academic insights.
4. Consistent business rules.
5. Responsive design.
6. Separation of concerns.
7. Configuration-driven academic data.
8. Maintainable and extensible code structure.

---

# Architecture Summary

GradeWise uses a lightweight layered web architecture where the browser hosts the user interface, calculation engines, validation logic, GPA engine, and academic insight rules. Academic configurations are stored separately from application logic to improve maintainability and future scalability. The architecture prioritizes correctness, usability, transparency, and ease of development while remaining suitable for an academic prototype and classroom demonstration.
