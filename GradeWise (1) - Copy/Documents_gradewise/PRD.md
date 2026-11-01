GradeWise
Product Requirements Document (PRD)
Product Name: GradeWise
Product Type: Responsive web-based academic calculator and decision-support prototype
Target Users: First- and second-year BS Computer Science students at De La Salle University-Dasmariñas (DLSU-D)
Project Stage: Functional academic prototype
Primary Objective: Demonstrate how grade calculations, hypothetical outcome simulations, and transparent academic indicators can help students make more informed academic decisions.

1. Project Overview
   1.1 Product Description
   GradeWise is a Smart Academic Performance and Decision Support System designed to help first- and second-year BSCS students understand and plan their academic performance.
   The system combines academic calculators with basic analytical features. Rather than simply displaying a numerical grade, GradeWise helps students understand their current weighted contribution, determine what scores they need to achieve a target, simulate different possible outcomes, calculate their semester GPA, and identify subjects that may require additional attention.
   The initial version will be a calculator-first website. Students will not need to create an account, register, or connect to university records to use the system.
   1.2 Problem Statement
   Students often need to calculate their grades manually, determine the scores required to achieve a target, and estimate how their remaining assessments may affect their academic results.
   These calculations can become confusing when subjects have different assessment categories, weights, units, and lecture or laboratory components. Missing assessments can also make it difficult to distinguish between a provisional calculation and a completed grade.
   GradeWise aims to make these calculations easier to perform and interpret through a centralized, accessible website.
   1.3 Proposed Solution
   GradeWise will provide a single website where students can:
   Calculate weighted grades using configured assessment categories and weights.
   Distinguish completed assessments from assessments that have not yet been graded.
   Calculate the average score needed on remaining assessments to reach a target.
   Simulate hypothetical scores and compare possible grade outcomes.
   Calculate semester GPA using the project's specified grade-point conversion rules.
   Review rule-based academic indicators and explanations.
   The system will prioritize accurate calculations, understandable results, and a simple user experience rather than complex account management or artificial intelligence.
   1.4 Project Objectives
   General objective
   To develop a functional web-based academic calculator that demonstrates how academic calculations and transparent decision-support indicators can assist BSCS students in planning and understanding their academic performance.
   Specific objectives
   Provide an accessible interface for entering and calculating academic scores.
   Implement weighted-grade calculations that follow the configured assessment rules.
   Help students determine the average score required to reach a target numerical grade.
   Allow students to compare hypothetical future assessment scores.
   Calculate semester GPA using the supplied course-unit and grade-point rules.
   Display understandable indicators for subjects that may need attention.
   Validate user inputs and prevent calculations based on invalid assessment weights or incomplete required fields.
   Demonstrate the complete workflow from entering scores to interpreting results without requiring student accounts.

2. Target Users and User Needs
   Primary users
   First- and second-year BSCS students at DLSU-D who want to calculate their grades, understand possible outcomes, and plan their academic priorities.
   User needs
   Students should be able to:
   Select a subject or course component without manually recreating the curriculum.
   Enter assessment scores and maximum possible points.
   See how completed assessments contribute to their grade.
   Understand which information is still missing.
   Find out whether their target is attainable under their current assumptions.
   Compare alternative future-score scenarios.
   Calculate semester GPA while accounting for different course units.
   Understand why the system identifies a subject as potentially needing attention.
   User assumptions
   The prototype assumes that students can obtain their assessment weights, scores, and course information from their instructors or course materials.
   GradeWise will not retrieve official grades, enrollment records, or course information directly from DLSU-D systems.

3. Scope of the Initial Prototype
   3.1 Features included in the minimum viable prototype
   Feature
   Priority
   Purpose
   Dashboard
   Essential
   Provide an overview and navigation to all tools
   Grade Calculator
   Essential
   Calculate weighted assessment contributions
   Required Score Calculator
   Essential
   Calculate the average score needed to reach a target
   Grade Goal Simulator
   Essential
   Compare hypothetical future-score scenarios
   Semester GPA Calculator
   Essential
   Calculate GPA using eligible units and grade points
   Academic Insights
   Essential, rule-based
   Display transparent academic indicators
   Preloaded curriculum
   Essential
   Provide a fixed list of first- and second-year BSCS courses
   Input validation
   Essential
   Prevent invalid weights, scores, units, and calculations
   Responsive interface
   Essential
   Support desktop, tablet, and mobile screens

3.2 Features excluded from the initial prototype
The following features are outside the initial scope:
Student registration and login.
Password creation and recovery.
Administrator accounts and role-based permissions.
A dedicated administrator dashboard.
Online databases and cloud synchronization.
Automatic access to official university records.
Machine-learning models or AI-based academic predictions.
Notifications, email reminders, and messaging.
Enrollment management and prerequisite checking.
Official transcript generation.
Cumulative GPA, course-repeat, withdrawal, and special academic-status calculations unless specifically added in a later version.
These features may be considered future enhancements, but they are not necessary to demonstrate the project's main concept.
3.3 Data persistence
The initial prototype may operate within a browser session without saving personal data.
If locally saved data is implemented, it must be clearly identified as browser-local data. It may be lost if browser storage is cleared and will not automatically synchronize between devices.
Cloud storage is not required.

4. Main User Workflow
   GradeWise follows this workflow:
   Select a course → Enter scores → Calculate → Explore possible outcomes → Review insights → Decide what to prioritize
   Workflow details
   The student opens GradeWise.
   The student selects a calculator from the dashboard.
   The student selects a course or component where applicable.
   The student enters the required scores, weights, target, or course units.
   GradeWise validates the inputs.
   The system calculates the result using the defined formulas.
   The result page displays the numerical output and a plain-language explanation.
   The student may adjust hypothetical inputs to explore different outcomes.
   The student reviews any applicable academic indicators.
   The system must not imply that a hypothetical score is a prediction of what the student will actually achieve.

5. Functional Requirements
   5.1 Dashboard
   Purpose: Provide a central starting point for the website.
   The dashboard shall:
   Display the GradeWise name and a short description of its purpose.
   Provide navigation to the Grade Calculator, Required Score Calculator, Grade Goal Simulator, Semester GPA Calculator, and Academic Insights.
   Show a summary of entered course grades when relevant data is available.
   Display the calculated semester GPA when eligible finalized course grades exist.
   Show the number of entered subjects that meet the prototype's academic-attention rules.
   Provide a clear notice that results depend on user-entered information and are not official university grades.
   The dashboard must remain useful when no data has been entered.
   5.2 Grade Calculator
   Purpose: Calculate weighted numerical grades using assessment categories and their configured weights.
   Course and component selection
   The system shall provide a fixed, preloaded list of courses from the supplied first- and second-year BSCS curriculum.
   Where applicable, lecture and laboratory components must be selectable separately. Their course units and assessment configurations must remain distinct.
   The student must also select the applicable term, such as midterm or final term.
   Assessment categories
   The initial supported category structures are:
   Lecture component
   EA
   SA
   CP
   Laboratory component
   EA
   SA
   The exact meaning of each category and its weight must be based on the relevant course configuration or instructor-provided information.
   The example category weights discussed during planning are illustrative only. They must not be treated as official default weights for every subject.
   Score entry
   For each category, the student can enter:
   Category weight as a percentage.
   Total earned points from completed assessments.
   Total maximum points from completed assessments.
   The calculator will use category totals rather than assuming every assessment has an independent percentage weight.
   For a category with graded assessments:
   Category performance percentage:
   (Total earned points ÷ Total maximum points) × 100
   Category weighted contribution:
   Category performance percentage × Category weight ÷ 100
   The current overall weighted contribution is the sum of the weighted contributions from categories with graded assessments.
   Weight validation
   The system must require the configured category weights to total exactly 100%, allowing only a small numeric tolerance for decimal precision, before calculating a grade.
   If the weights do not total 100%, the system must display an explanatory validation message and must not present the result as valid.
   Missing assessments
   The system must distinguish between:
   Completed assessment with a zero score: The student earned zero points, and those points must be included in the calculation.
   Assessment not yet graded: No score has been entered, and the system must not treat it as a completed zero.
   Category with no graded assessments: The category is pending and has no earned contribution yet.
   When a category contains graded assessments, the calculator uses the earned and maximum points from those graded assessments to calculate that category's current performance. The category retains its configured weight.
   Ungraded assessments do not earn points in the current calculation, but their associated category weight remains relevant when estimating future outcomes.
   The interface must label an incomplete calculation as provisional.
   Grade Calculator output
   The result must show:
   Selected course and component.
   Selected term.
   Current weighted contribution.
   Remaining grade weight, when applicable.
   Category-level score and weighted contribution.
   Pending categories.
   Highest possible numerical grade under the assumption that all remaining work receives 100%.
   A provisional or complete-data label, as appropriate.
   The result must distinguish the contribution earned so far from a finalized overall course grade.
   5.3 Required Score Calculator
   Purpose: Calculate the average score needed on remaining assessments to reach a target numerical grade.
   Inputs
   The student enters:
   Current weighted contribution, expressed in points out of 100.
   Remaining grade weight as a percentage.
   Target numerical grade from 0 to 100.
   The current contribution must be the contribution already earned toward the final numerical grade, not a normalized average that ignores the remaining weight.
   Formula
   Let:
   C = current weighted contribution.
   R = remaining grade weight expressed as a decimal.
   T = target numerical grade.
   S = required average score on remaining assessments.
   When remaining weight is greater than zero:
   S = (T − C) ÷ R
   For example, if the student has earned 55 weighted points, has 40% of the grade remaining, and wants a final numerical grade of 90:
   S = (90 − 55) ÷ 0.40 = 87.5%
   The student needs an average of 87.5% on the remaining assessments under these assumptions.
   Required-score result rules
   If the required score is between 0% and 100%, display the required average.
   If the current contribution already meets the target, display that no additional score is required to reach that target under the model.
   If the required score exceeds 100%, label the target as unattainable under the current assumptions and show the highest possible numerical grade.
   If no grade weight remains, compare the current contribution with the target and explain that no remaining assessments are available in the model.
   Reject negative weights, invalid targets, and values outside the permitted range.
   The system must not guarantee that a student will achieve the target.
   5.4 Grade Goal Simulator
   Purpose: Allow students to explore how hypothetical scores could affect their numerical grade.
   Inputs
   The student enters:
   Current weighted contribution.
   Remaining grade weight.
   A hypothetical average score on the remaining assessments.
   Formula
   Projected numerical grade = Current contribution + (Remaining weight × Hypothetical average score)
   Remaining weight must be converted from a percentage to a decimal before multiplication.
   For example, if the current contribution is 55, 40% remains, and the student explores a hypothetical score of 90:
   Projected grade = 55 + (0.40 × 90) = 91
   Required behavior
   The simulator shall:
   Display the projected numerical grade.
   Explain which inputs produced the result.
   Allow the student to change the hypothetical score.
   Compare example scenarios such as 70%, 80%, 90%, and 100%.
   Update results whenever a new valid scenario is calculated.
   Label the results as hypothetical rather than predictive.
   The simulator must use the same grade-weight assumptions as the Required Score Calculator.
   5.5 Semester GPA Calculator
   Purpose: Calculate the student's semester GPA from course numerical grades and eligible course units.
   Required inputs
   For each course component, the system needs:
   Course name or code.
   Course component, where relevant.
   Course units.
   Midterm numerical grade.
   Final-term numerical grade.
   Grade-finalization status.
   Lecture and laboratory components must be recorded separately because they may have different units and grades.
   Where a course is selected from the preloaded curriculum, its units should be supplied by the curriculum configuration rather than requiring students to re-enter them unnecessarily.
   Semester numerical grade formula
   First calculate the average of the midterm and final-term numerical grades:
   Semester numerical grade = (Midterm grade + Final-term grade) ÷ 2
   Next, take the floor of that average:
   Grade-conversion input = floor(Semester numerical grade)
   Only then convert the floored numerical grade into a grade point using the supplied conversion table.
   The system must not convert the midterm and final-term grades into grade points separately and then average those grade points.
   Grade-point conversion table
   Floored numerical grade
   Grade point
   Status
   98–100
   4.00
   Passed
   95–97
   3.75
   Passed
   92–94
   3.50
   Passed
   89–91
   3.25
   Passed
   86–88
   3.00
   Passed
   83–85
   2.75
   Passed
   80–82
   2.50
   Passed
   77–79
   2.25
   Passed
   74–76
   2.00
   Passed
   71–73
   1.75
   Passed
   68–70
   1.50
   Passed
   64–67
   1.25
   Passed
   60–63
   1.00
   Passed
   Below 60
   0.00
   Failed

This table is the conversion scale supplied for the project. Its current official applicability must be verified before the system is used beyond the classroom prototype.
GPA formula
Semester GPA = Σ(Course units × Course grade point) ÷ Σ(Eligible course units)
The system must:
Include only finalized course grades in the GPA calculation.
Exclude zero-unit courses from both the numerator and denominator.
Keep lecture and laboratory units separate.
Display the GPA to two decimal places.
Show the number of eligible units included.
Identify provisional course grades that were excluded.
Display an explanatory empty state when no eligible course grades exist.
The initial prototype calculates semester GPA only. Cumulative GPA and special cases such as repeated courses are outside the initial scope.
5.6 Academic Insights
Purpose: Demonstrate basic academic decision support using understandable rules rather than machine learning.
Academic Insights shall analyze the finalized numerical grades entered into the GPA calculator and provide a plain-language indicator for each eligible course.
Initial prototype rules
The following thresholds are proposed demonstration rules, not verified official university academic-standing policies.
Condition
Indicator
Suggested explanation
Numerical grade below 60
Below supplied passing threshold
Review the result and confirm the course status with the instructor.
Numerical grade from 60 to below 75
May need attention
Consider reviewing difficult topics, assessments, and available academic support.
Numerical grade from 75 to below 90
No threshold alert
The grade is above the prototype's attention threshold. Continue monitoring upcoming requirements.
Numerical grade of 90 or higher
Strong current result
The entered grade indicates strong performance under the prototype's rules.

The system must show the rule behind each indicator so students understand why it appears.
Recommendation limitations
The initial version will not claim to predict actual academic success.
It will not automatically determine a student's ability, motivation, or likelihood of failing. It will not provide an official academic-standing decision.
More advanced subject prioritization based on remaining assessment weight, student-reported difficulty, and target grades may be added after the core calculations are validated.

6. Curriculum and Course Configuration
   6.1 Curriculum scope
   The preloaded curriculum is limited to the first and second years of BSCS and includes the following four semester configurations.
   The course list and units below are taken from the curriculum information previously supplied for the project. They have not been independently verified as the current official DLSU-D curriculum.
   First Year, First Semester
   Course code
   Course name
   Units
   G-PSYC101
   Understanding the Self
   3
   G-MATH100
   Mathematics in the Modern World
   3
   S-ITCS111
   Introduction to Computing Lec
   2
   S-ITCS111LA
   Introduction to Computing Lab
   1
   S-ITCS112
   Fundamentals of Programming Lec
   2
   S-ITCS112LA
   Fundamentals of Programming Lab
   1
   D-REED001
   Our Christian Faith and Lasallian Identity
   3
   G-PHED001
   Physical Fitness and Self-Testing Activities
   2
   G-NSTP001
   Towards One Goal: Social Transformation
   3
   G-SOSC001
   Mga Babasahin Hinggil sa Kasaysayan ng Pilipinas
   3
   D-SEPR000
   Student Engagement Program
   0
   Total

23

First Year, Second Semester
Course code
Course name
Units
G-ENGL101
English for Purposive Communication
3
S-SCEN001TP
Environmental Science
3
G-FILI101
Diskurso sa Filipino
3
S-ITCS123
Intermediate Programming Lec
2
S-ITCS123LA
Intermediate Programming Lab
1
S-CSPC121
Object-Oriented Programming Lec
2
S-CSPC121LA
Object-Oriented Programming Lab
1
D-REED002
Christian Discipleship in the Modern World
3
G-PHED002
Individual-Dual Sports/Dance
2
G-NSTP002
Community Service by Focus Programs: Health, Education, Livelihood, Pastoral and Self-Governance (HELPs)
3
Total

23

Second Year, First Semester
Course code
Course name
Units
G-SOSC003
Art Appreciation
3
B-ENTR000
Entrepreneurial Mindset
3
S-ITCS214
Data Structures and Algorithms Lec
2
S-ITCS214LA
Data Structures and Algorithms Lab
1
S-ITCS215
Human Computer Interaction Lec
2
S-ITCS215LA
Human Computer Interaction Lab
1
S-CSPC212
Discrete Structures 1
3
S-MATH200
Number Theory
3
D-REED003
Christian Commitment in Contemporary Society
3
G-PHED003
Swimming
2
Total

23

Second Year, Second Semester
Course code
Course name
Units
S-GSTS001
Science, Technology and Society
3
G-SOSC004
Ethics
3
S-ITCS226
Information Management Lec
2
S-ITCS226LA
Information Management Lab
1
S-ITCS227
Application Development and Emerging Technologies Lec
2
S-ITCS227LA
Application Development and Emerging Technologies Lab
1
S-CSPC223
Programming Languages Lec
2
S-CSPC223LA
Programming Languages Lab
1
S-CSPC224
Discrete Structures 2
3
D-REED004
The Catholic Social Teaching and Our Social Responsibility
3
G-PHED004
Team Sports
2
Total

23

6.2 Course configuration rules
The initial prototype will use a fixed curriculum. Students will not be able to create or edit official curriculum entries.
Course names, codes, units, components, and semester groupings should be stored in a configuration file or equivalent structured data source.
Assessment weights must be configured separately for the relevant subject, component, and term. A weight configuration must not be assumed to apply to every course.
Where an actual weight configuration is unavailable, the system must allow the student to enter the weights from their syllabus or instructor-provided information. The system must validate that the weights total 100% before calculating a valid weighted grade.
A dedicated administrator interface is not required for this prototype.

7. User Interface and Experience Requirements
   7.1 Design principles
   The website should be:
   Simple enough for students to use without training.
   Consistent across all calculators.
   Readable on desktop and mobile screens.
   Clear about which fields are required.
   Explicit about the meaning of numerical results.
   Transparent about missing information and calculation assumptions.
   7.2 Main navigation
   The website should contain the following navigation items:
   Dashboard
   Grade Calculator
   Required Score Calculator
   Grade Goal Simulator
   Semester GPA Calculator
   Academic Insights
   7.3 Result presentation
   Every calculator must display its result with a short explanation.
   For example, the Required Score Calculator should not merely display 87.5%. It should explain that the student needs an average of 87.5% across the remaining assessments to reach the target, given the current contribution and remaining weight.
   7.4 Validation and feedback
   The interface must:
   Display errors near the relevant input or in a clear message.
   Prevent negative scores and invalid maximum points.
   Prevent weights outside the permitted range.
   Explain when category weights do not total 100%.
   Identify pending categories and provisional results.
   Explain when a target is unattainable.
   Provide a clear empty state before any calculations are performed.
   Ask for confirmation before destructive actions, such as clearing the entire GPA list.
   7.5 Accessibility
   The prototype should use:
   Readable font sizes and sufficient color contrast.
   Text labels for all form fields.
   Buttons with clear action names.
   Indicators that use text as well as color.
   Responsive layouts that work on small screens.
   Clear feedback that does not rely exclusively on visual color differences.

8. Data and Technical Requirements
   8.1 Recommended implementation approach
   The initial prototype can be implemented using:
   HTML for the website structure.
   CSS for the visual design and responsive layout.
   JavaScript for calculations, validation, interactions, and display updates.
   Structured JavaScript objects or JSON configuration for the fixed curriculum, course units, grade-point conversion table, and any verified assessment configurations.
   This is a recommendation rather than a mandatory technology stack. It keeps the prototype small and allows the team to demonstrate the main functionality without setting up a backend.
   8.2 Data handling
   The system will use information entered by the student, including assessment scores, hypothetical scores, and course grades.
   The initial version will not require personally identifying information.
   If local browser storage is added, the website must explain that the information is stored on that browser and may not be available on another device.
   No database or server-side account system is required for the initial prototype.
   8.3 Calculation consistency
   The grade engine should use shared calculation functions where appropriate.
   The Required Score Calculator and Grade Goal Simulator must use consistent definitions for current weighted contribution and remaining grade weight.
   The GPA Calculator and Academic Insights must use the same finalized semester numerical grade and grade-point conversion rules.
   The system must avoid silently rounding a numerical grade upward before applying the required floor rule.
   8.4 Error handling
   The system must handle:
   Empty required fields.
   Invalid numerical inputs.
   Earned points greater than maximum points.
   Zero or negative maximum points.
   Assessment weights that do not total 100%.
   No remaining grade weight.
   Required scores greater than 100%.
   No eligible GPA courses.
   Zero-unit courses.
   Provisional grades excluded from GPA.
   Missing course or term configuration.
   When information is insufficient, the system must explain what is missing instead of generating a misleading result.

9. Non-Functional Requirements
   Performance
   Calculations should run immediately after valid input submission. The system does not require computationally intensive processing.
   Reliability
   The calculations must produce consistent results for the same valid inputs. Important formulas must be verified using hand-calculated test cases.
   Usability
   A student should be able to select a calculator, enter the required information, and understand the displayed result without consulting technical documentation.
   Compatibility
   The website should work in modern desktop and mobile browsers.
   Maintainability
   Course data, grade conversion rules, and assessment configurations should be kept separate from presentation code as much as practical. This makes it easier to correct or update academic rules.
   Privacy
   The initial prototype should avoid collecting personal identifiers, account credentials, or unnecessary student information.
   Transparency
   The website must identify its results as calculations or rule-based indicators, not official university records or guaranteed predictions.

10. Acceptance Criteria
    The prototype will be considered functionally complete when the following conditions are met.
    Grade Calculator
    Students can select a preloaded course and relevant component.
    Students can enter category weights and category score totals.
    Category weights must total 100% before a valid calculation is shown.
    The weighted contribution is calculated correctly.
    A completed zero score is treated as a real score.
    Ungraded categories are identified as pending.
    Incomplete results are labeled provisional.
    The highest possible numerical grade is calculated correctly when remaining weight exists.
    Required Score Calculator
    Students can enter the current weighted contribution, remaining weight, and target.
    The required average is calculated using the specified formula.
    A target that requires more than 100% is identified as unattainable under the current assumptions.
    The system displays the highest possible numerical grade when a target is unattainable.
    The zero-remaining-weight case is handled correctly.
    Grade Goal Simulator
    Students can enter a hypothetical future average.
    The projected numerical grade is calculated correctly.
    The system compares multiple hypothetical scores.
    Results are clearly labeled hypothetical.
    Semester GPA Calculator
    The semester numerical grade is calculated by averaging midterm and final-term numerical grades.
    The average is floored before grade-point conversion.
    Grade points match the supplied conversion table.
    Course units are included correctly.
    Zero-unit courses are excluded from the numerator and denominator.
    Provisional course grades are excluded.
    The GPA is displayed to two decimal places.
    Academic Insights
    Insights are generated from eligible finalized grades.
    The system explains the rule behind each indicator.
    The system uses the configured prototype thresholds.
    The system does not present the indicators as official university decisions or predictions.
    General website behavior
    All navigation links open the correct view.
    Forms reject invalid values.
    Empty states display correctly.
    The layout works on desktop and mobile.
    No account registration is required.
    The site clearly identifies itself as a prototype and explains its limitations.

11. Calculation Test Cases
    The following cases should be included in the team's testing checklist.
    Test A: Weighted contribution
    Assume a course has:
    EA: 50% weight, score 80%.
    SA: 30% weight, score 90%.
    CP: 20% weight, score 100%.
    Expected calculation:
    (80 × 0.50) + (90 × 0.30) + (100 × 0.20) = 87
    Expected result: 87 weighted points out of 100, assuming all categories are graded.
    These weights are illustrative test values, not official course weights.
    Test B: Invalid category weights
    Assume the weights are 50%, 30%, and 15%.
    Expected result: The system rejects the calculation because the weights total 95%, not 100%.
    Test C: Required score
    Assume:
    Current contribution: 55.
    Remaining weight: 40%.
    Target: 90.
    Expected calculation:
    (90 − 55) ÷ 0.40 = 87.5
    Expected result: Required average of 87.5%.
    Test D: Unattainable target
    Assume:
    Current contribution: 55.
    Remaining weight: 40%.
    Target: 100.
    Expected calculation:
    (100 − 55) ÷ 0.40 = 112.5
    Expected result: The target is unattainable under the stated assumptions. The highest possible numerical grade is 95 if the student earns 100% on all remaining work.
    Test E: Semester grade conversion
    Assume:
    Midterm numerical grade: 89.
    Final-term numerical grade: 90.
    Expected semester numerical grade:
    (89 + 90) ÷ 2 = 89.5
    Apply the floor rule:
    floor(89.5) = 89
    Using the supplied table, the expected grade point is 3.25.
    Test F: GPA calculation
    Assume two finalized course components:
    Course A: 3 units, grade point 3.00.
    Course B: 2 units, grade point 4.00.
    Expected GPA:
    ((3 × 3.00) + (2 × 4.00)) ÷ (3 + 2) = 3.40
    Expected result: 3.40 GPA.
    Test G: Zero-unit course
    Assume a course has zero units and a grade point of 4.00.
    Expected result: The course does not change the GPA numerator or denominator.
    Test H: Provisional grade
    Assume one finalized course and one provisional course are entered.
    Expected result: Only the finalized course contributes to GPA, and the interface identifies the excluded provisional course.

12. Academic Rules That Must Be Verified
    Before treating the system as more than a classroom prototype, the team should verify the following:
    The current official BSCS curriculum, course codes, units, and semester groupings.
    The official grade-point conversion table and its numerical boundaries.
    The applicable category weights for each course, component, and term.
    Whether the proposed academic-attention thresholds are appropriate for the demonstration.
    The treatment of incomplete grades, course repeats, withdrawals, and other special cases if those features are ever added.
    The project must not present unverified sample values as official university policy.
    For the initial demonstration, unknown assessment weights should remain configurable rather than being invented.

13. Project Risks and Mitigation
    Risk
    Potential impact
    Mitigation
    Incorrect grade formulas
    Misleading results
    Test each formula against hand-calculated examples
    Unverified course weights
    Incorrect weighted grades
    Require verified configurations or user-entered weights
    Confusion between zero and missing scores
    Incorrect current contribution
    Use explicit score-entry and pending states
    Misinterpreted academic indicators
    Students may assume official standing
    Display explanations and disclaimers
    Expanding the scope
    Delayed completion
    Exclude accounts, cloud databases, and AI predictions
    Incorrect GPA inclusion
    Inaccurate semester GPA
    Test units, finalization status, and conversion boundaries
    Incomplete mobile layout
    Difficult use on phones
    Test responsive layouts at multiple screen sizes
    Unsaved browser data
    Lost entries
    Clearly explain storage limitations and avoid promising synchronization

14. Suggested Development Plan
    Stage 1: Build the core calculator
    Implement course selection, category score entry, weight validation, weighted contributions, and pending-category handling.
    Completion goal: The Grade Calculator produces accurate results for valid inputs and rejects invalid weights.
    Stage 2: Add score planning tools
    Implement the Required Score Calculator and Grade Goal Simulator using shared calculation logic.
    Completion goal: Students can calculate required scores and compare hypothetical outcomes.
    Stage 3: Add GPA calculation
    Implement the supplied grade-point table, semester numerical grade averaging, flooring, unit weighting, and provisional-grade exclusion.
    Completion goal: GPA results match hand-calculated test cases.
    Stage 4: Add Academic Insights
    Implement the proposed rule-based indicators and plain-language explanations.
    Completion goal: Students can understand why an entered course grade receives a particular indicator.
    Stage 5: Polish and test the interface
    Improve navigation, validation messages, empty states, mobile responsiveness, and prototype disclaimers.
    Completion goal: A student can complete the main demonstration workflow without assistance.
    Stage 6: Prepare the classroom demonstration
    Prepare sample data that demonstrates:
    Calculating a weighted grade.
    Determining a required score.
    Comparing hypothetical outcomes.
    Calculating semester GPA.
    Reviewing an academic indicator and its explanation.
    Completion goal: The team can demonstrate the main GradeWise concept from beginning to end using repeatable test data.

15. Future Enhancements
    These features may be considered after the prototype meets its acceptance criteria:
    Student accounts and secure cloud storage.
    A dedicated administrator dashboard.
    Configurable course and assessment management.
    More detailed subject-priority recommendations based on remaining grade weight and student-reported difficulty.
    Cumulative GPA calculations.
    Historical performance tracking across semesters.
    Exportable reports.
    Additional academic-planning tools.
    These are optional future enhancements, not requirements for the current project.

16. Definition of Success
    The GradeWise prototype will successfully demonstrate its concept if students can use it to calculate academic results accurately, explore hypothetical outcomes, understand the limitations of incomplete data, and interpret the system's rule-based indicators.
    The project will be evaluated primarily on functional correctness, usability, transparency, and its ability to demonstrate academic decision support, rather than on the number of advanced features it contains.
    Final Product Statement
    GradeWise is a calculator-first academic decision-support prototype for first- and second-year BSCS students at DLSU-D. It combines weighted-grade calculations, required-score analysis, hypothetical grade simulations, semester GPA computation, and explainable academic indicators in a responsive website. By focusing on accurate calculations and understandable results without requiring accounts, cloud infrastructure, or AI prediction models, the project demonstrates its core concept within a manageable student-development scope.
