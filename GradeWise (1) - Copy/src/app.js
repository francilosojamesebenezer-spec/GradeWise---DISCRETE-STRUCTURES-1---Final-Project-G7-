import curriculum from "./data/curriculum.json" with { type: "json" };
import templates from "./data/assessmentTemplates.json" with { type: "json" };
import { calculateGrade, calculateRequiredScore, simulateGrade, calculateSemesterGPA, generateAcademicInsights } from "./index.js";

const STORAGE_KEY = "gradewise.semesterRecords.v1";
const TITLES = { dashboard: "Overview", grade: "Grade Calc", required: "Target Score", simulator: "Goal Planner", gpa: "GPA Tracker", insights: "Insights" };
const coursesByCode = new Map(curriculum.map((course) => [course.courseCode, course]));
let records = readSavedCourses();
let activeView = "dashboard";

function readSavedCourses() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const accepted = [];
    for (const item of parsed) {
      const course = item && typeof item.courseCode === "string" ? coursesByCode.get(item.courseCode) : null;
      if (!course) continue;
      const normalized = {
        courseCode: course.courseCode,
        courseName: course.courseName,
        componentType: course.componentType,
        units: course.units,
        yearLevel: course.yearLevel,
        semester: course.semester,
        midtermGrade: item.midtermGrade,
        finalGrade: item.finalGrade,
        finalized: item.finalized,
      };
      if (item.yearLevel !== undefined && item.yearLevel !== course.yearLevel) continue;
      if (item.semester !== undefined && item.semester !== course.semester) continue;
      if (calculateSemesterGPA({ courses: [...accepted, normalized] }).valid) accepted.push(normalized);
    }
    return accepted;
  } catch {
    return [];
  }
}

function saveCourses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    showErrors("gpaErrors", ["This browser could not save the course list. Check that browser storage is available."]);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function numericValue(id) {
  const value = document.getElementById(id).value.trim();
  return value === "" ? Number.NaN : Number(value);
}

function showErrors(id, errors) {
  const container = document.getElementById(id);
  if (!errors.length) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }
  container.hidden = false;
  const list = document.createElement("ul");
  for (const error of errors) {
    const item = document.createElement("li");
    item.textContent = typeof error === "string" ? error : error.message;
    list.append(item);
  }
  container.replaceChildren(list);
}

function showView(viewName) {
  if (!TITLES[viewName]) return;
  activeView = viewName;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  document.querySelectorAll(".nav-item").forEach((item) => {
    const selected = item.dataset.view === viewName;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-current", selected ? "page" : "false");
  });
  document.getElementById("currentCrumb").textContent = TITLES[viewName];
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("mobileMenu").setAttribute("aria-expanded", "false");
  window.location.hash = viewName === "dashboard" ? "" : viewName;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function fillCourseSelect(select, includeUnits = false) {
  select.innerHTML = curriculum.map((course) => {
    const suffix = includeUnits ? ` · ${course.units} unit${course.units === 1 ? "" : "s"}` : "";
    return `<option value="${escapeHtml(course.courseCode)}">${escapeHtml(course.courseCode)} — ${escapeHtml(course.courseName)}${suffix}</option>`;
  }).join("");
}

function renderGradeCategories() {
  const course = coursesByCode.get(document.getElementById("gradeCourse").value);
  if (!course) return;
  document.getElementById("gradeComponent").value = course.componentType;
  const categoryNames = templates.components[course.componentType] ?? [];
  document.getElementById("categoryRows").innerHTML = categoryNames.map((name) => `
    <tr data-category="${escapeHtml(name)}">
      <td class="category-name">${escapeHtml(name)}</td>
      <td><input aria-label="${name} weight percentage" data-role="weight" type="number" min="0" max="100" step="any" placeholder="%" required /></td>
      <td><input aria-label="${name} earned points" data-role="earned" type="number" min="0" step="any" placeholder="—" disabled /></td>
      <td><input aria-label="${name} maximum points" data-role="maximum" type="number" min="0.000001" step="any" placeholder="—" disabled /></td>
      <td><label class="graded-check"><input data-role="graded" type="checkbox" /><span>Graded</span></label></td>
    </tr>`).join("");
  document.querySelectorAll("#categoryRows [data-role=graded]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    const row = checkbox.closest("tr");
    row.querySelector("[data-role=earned]").disabled = !checkbox.checked;
    row.querySelector("[data-role=maximum]").disabled = !checkbox.checked;
    if (!checkbox.checked) {
      row.querySelector("[data-role=earned]").value = "";
      row.querySelector("[data-role=maximum]").value = "";
    }
  }));
}

function numberText(number, digits = 2) {
  return Number(number).toLocaleString(undefined, { maximumFractionDigits: digits });
}

function renderGradeResult(result) {
  const selectedCourse = coursesByCode.get(result.courseCode);
  const categoryRows = result.categories.map((category) => `<div class="result-stat"><span>${escapeHtml(category.categoryName)} · ${category.graded ? `${numberText(category.performance)}%` : "Pending"}</span><strong>${category.weightedContribution === null ? "—" : `${numberText(category.weightedContribution)} pts`}</strong></div>`).join("");
  document.getElementById("gradeResult").innerHTML = `<div class="result-filled">
    <div class="result-overline">${escapeHtml(result.courseCode)} · ${escapeHtml(result.term.toUpperCase())} RESULT</div>
    <p class="result-subtitle" style="margin:7px 0 0">${escapeHtml(selectedCourse?.courseName ?? "")}</p>
    <div class="result-number">${numberText(result.weightedContribution)}<em> / 100</em></div>
    <p class="result-subtitle">Current weighted contribution</p>
    <div class="result-stat-list">
      ${categoryRows}
      <div class="result-stat"><span>Remaining weight</span><strong>${numberText(result.remainingWeight)}%</strong></div>
      <div class="result-stat"><span>Highest possible grade</span><strong>${numberText(result.highestPossibleGrade)}</strong></div>
      <div class="result-stat"><span>Calculation status</span><strong><span class="status-chip ${result.status === "Provisional" ? "provisional" : ""}">${escapeHtml(result.status)}</span></strong></div>
    </div>
    ${result.pendingCategories.length ? `<div class="pending-list">${result.pendingCategories.map((category) => `<span class="pending-tag">${escapeHtml(category)} pending</span>`).join("")}</div>` : ""}
  </div>`;
}

function renderPlanningResult(elementId, response, type) {
  const result = response.result;
  if (type === "required") {
    let headline = "No additional score needed";
    let detail = "Your current contribution already meets the target under these assumptions.";
    let score = "—";
    if (result.status === "ScoreRequired") {
      headline = "Average needed on remaining work";
      detail = `You would need an average of ${numberText(result.requiredScore)}% across the remaining assessments to reach ${numberText(result.targetGrade)}.`;
      score = `${numberText(result.requiredScore)}<em>%</em>`;
    } else if (result.status === "Unattainable") {
      headline = "Target is out of reach under this model";
      detail = `The required average is ${numberText(result.requiredScore)}%. The highest possible numerical grade is ${numberText(result.highestPossibleGrade)}.`;
      score = `${numberText(result.requiredScore)}<em>% needed</em>`;
    } else if (result.status === "NoRemainingWeight") {
      headline = "No grade weight remains";
      detail = `No assessments remain in this model. Your highest possible numerical grade is ${numberText(result.highestPossibleGrade)}.`;
      score = `${numberText(result.highestPossibleGrade)}<em> max</em>`;
    }
    document.getElementById(elementId).innerHTML = `<div class="result-filled"><div class="result-overline">REQUIRED SCORE RESULT</div><div class="result-number">${score}</div><p class="result-subtitle">${escapeHtml(headline)}</p><div class="result-stat-list"><div class="result-stat"><span>Current contribution</span><strong>${numberText(result.currentContribution)}</strong></div><div class="result-stat"><span>Remaining grade weight</span><strong>${numberText(result.remainingWeight)}%</strong></div><div class="result-stat"><span>Highest possible grade</span><strong>${numberText(result.highestPossibleGrade)}</strong></div></div><p class="result-subtitle" style="margin-top:13px">${escapeHtml(detail)}</p><span class="status-chip ${result.attainable ? "" : "provisional"}">${result.attainable ? "Attainable under model" : "Not attainable"}</span></div>`;
  } else {
    const scenarios = result.scenarios.map((scenario) => `<div class="scenario-card"><span>${scenario.hypotheticalScore}% average</span><strong>${numberText(scenario.projectedGrade)}</strong></div>`).join("");
    document.getElementById(elementId).innerHTML = `<div class="result-filled"><div class="result-overline">HYPOTHETICAL RESULT</div><div class="result-number">${numberText(result.projectedGrade)}<em> / 100</em></div><p class="result-subtitle">If you average ${numberText(result.hypotheticalScore)}% on remaining assessments, your projected numerical grade would be ${numberText(result.projectedGrade)}.</p><div class="result-stat-list"><div class="result-stat"><span>Current contribution</span><strong>${numberText(result.currentContribution)}</strong></div><div class="result-stat"><span>Remaining grade weight</span><strong>${numberText(result.remainingWeight)}%</strong></div></div><div class="scenario-cards">${scenarios}</div><p class="form-hint" style="margin-top:12px">Scenarios are hypothetical, not a prediction.</p></div>`;
  }
}

function getGpaResult() {
  return calculateSemesterGPA({ courses: currentSemesterRecords() });
}

function selectedSemester() {
  const yearLevel = Number(document.getElementById("gpaYear").value);
  const semester = Number(document.getElementById("gpaSemester").value);
  return Number.isInteger(yearLevel) && yearLevel > 0 && Number.isInteger(semester) && semester > 0 ? { yearLevel, semester } : null;
}

function currentSemesterRecords() {
  const selection = selectedSemester();
  return selection ? records.filter((record) => record.yearLevel === selection.yearLevel && record.semester === selection.semester) : [];
}

function badgeClass(course) {
  if (!course.finalized) return "status-chip provisional";
  return "status-chip";
}

function renderGpa() {
  const response = getGpaResult();
  const result = response.valid ? response.result : null;
  const gpaRows = document.getElementById("gpaRows");
  if (result) {
    gpaRows.innerHTML = result.courses.map((course) => {
      const status = course.finalized ? course.gradeStatus : "Provisional";
      return `<tr>
        <td>${escapeHtml(course.courseCode)}<span class="course-sub">${escapeHtml(course.courseName)} · ${escapeHtml(course.componentType)}</span></td>
        <td>${numberText(course.units, 2)}</td><td>${numberText(course.midtermGrade)}</td><td>${numberText(course.finalGrade)}</td>
        <td>${numberText(course.semesterGrade)}</td><td class="grade-point-cell">${numberText(course.gradePoint, 2)}</td>
        <td><span class="${badgeClass(course)}">${escapeHtml(status)}</span></td>
        <td><button type="button" class="remove-course" data-remove="${escapeHtml(course.courseCode)}" aria-label="Remove ${escapeHtml(course.courseCode)}">×</button></td>
      </tr>`;
    }).join("");
    document.getElementById("gpaBigValue").textContent = result.semesterGPAFormatted ?? "—";
    document.getElementById("gpaBigHint").textContent = !selectedSemester() ? "Choose a year and semester to calculate GPA." : result.semesterGPA === null ? "No eligible finalized course grades yet." : "Weighted by eligible course units.";
    document.getElementById("gpaUnitValue").textContent = numberText(result.totalEligibleUnits, 2);
    document.getElementById("gpaFinalizedValue").textContent = String(result.courses.length);
    document.getElementById("gpaExcludedValue").textContent = `${result.excludedCourses.length} excluded from GPA`;
    document.getElementById("gpaEmpty").hidden = result.courses.length > 0;
    document.getElementById("gpaEmpty").style.display = result.courses.length > 0 ? "none" : "block";
    document.getElementById("gpaEmpty").innerHTML = result.courses.length ? "" : `<span>∑</span><strong>No course grades yet</strong><p>Add your course components above to start calculating your semester GPA.</p>`;
  }
  showErrors("gpaErrors", response.valid ? [] : response.errors);
  updateCourseOptions();
  updateDashboard();
  renderInsights();
}

function updateCourseOptions() {
  const select = document.getElementById("gpaCourse");
  const selected = select.value;
  const semester = selectedSemester();
  const available = semester ? curriculum.filter((course) => course.yearLevel === semester.yearLevel && course.semester === semester.semester) : [];
  select.innerHTML = available.length ? available.map((course) => {
    const added = records.some((record) => record.courseCode === course.courseCode);
    return `<option value="${escapeHtml(course.courseCode)}" ${added ? "disabled" : ""}>${escapeHtml(course.courseCode)} — ${escapeHtml(course.courseName)} · ${course.units} unit${course.units === 1 ? "" : "s"}${added ? " · added" : ""}</option>`;
  }).join("") : `<option value="">${semester ? "No courses in this semester" : "Choose year and semester first"}</option>`;
  if (selected && !records.some((record) => record.courseCode === selected)) select.value = selected;
  const noOptions = !semester || available.every((course) => records.some((record) => record.courseCode === course.courseCode));
  select.disabled = !semester || available.length === 0;
  document.querySelector("#gpaForm button[type=submit]").disabled = noOptions;
}

function updateDashboard() {
  const response = getGpaResult();
  if (!response.valid) return;
  const result = response.result;
  const semesterRecords = currentSemesterRecords();
  const semester = selectedSemester();
  document.getElementById("metricCourses").textContent = String(semesterRecords.length);
  document.getElementById("metricCourseFoot").textContent = semester ? `Year ${semester.yearLevel} · Semester ${semester.semester}` : "Choose a semester in GPA calculator";
  document.getElementById("metricProvisional").textContent = String(semesterRecords.filter((record) => !record.finalized).length);
  document.getElementById("metricGpa").textContent = result.semesterGPAFormatted ?? "—";
  document.getElementById("metricUnits").textContent = !semester ? "Choose a semester in GPA calculator" : result.totalEligibleUnits ? `${numberText(result.totalEligibleUnits)} eligible units` : "No finalized courses yet";
  const insightsResponse = generateAcademicInsights({ courses: result.courses });
  const insights = insightsResponse.valid ? insightsResponse.result.insights : [];
  document.getElementById("metricAttention").textContent = String(insights.filter((insight) => insight.numericalGrade < 75).length);
  const preview = document.getElementById("dashboardInsights");
  if (!insights.length) {
    preview.innerHTML = `<div class="empty-mini"><span>✳</span><strong>Your insights will show up here.</strong><p>Add finalized course grades to see the rules behind each indicator.</p></div>`;
  } else {
    preview.innerHTML = insights.slice(0, 3).map((insight) => `<div class="mini-insight"><span class="mini-dot" style="background:${insight.numericalGrade < 60 ? "#cd7564" : insight.numericalGrade < 75 ? "#d4ac4c" : insight.numericalGrade < 90 ? "#6cad82" : "#8f7cc4"}"></span><span><b>${escapeHtml(insight.courseCode)} · ${escapeHtml(insight.indicator)}</b><small>${numberText(insight.numericalGrade)} numerical grade</small></span></div>`).join("");
  }
}

function renderInsights() {
  const response = getGpaResult();
  const insightResponse = response.valid ? generateAcademicInsights({ courses: response.result.courses }) : { valid: false, result: null };
  const insights = insightResponse.valid ? insightResponse.result.insights : [];
  document.getElementById("insightsSummary").textContent = insights.length ? `${insights.length} finalized course ${insights.length === 1 ? "component" : "components"} evaluated. Each card shows the rule and explanation.` : "No eligible finalized course grades yet. Add finalized grades in Semester GPA to generate insights.";
  const grid = document.getElementById("insightGrid");
  if (!insights.length) {
    grid.innerHTML = `<article class="panel insight-card"><span class="insight-status-mark ok">✳</span><div><h3>Waiting for finalized grades</h3><p>Once you add finalized course grades, this page will explain which rule applies to each eligible course.</p><div class="insight-meta"><span>Rule-based</span><span>Not an official decision</span></div></div></article>`;
    return;
  }
  const classes = { "Below supplied passing threshold": ["alert", "!"], "May need attention": ["watch", "!"], "No threshold alert": ["ok", "✓"], "Strong current result": ["strong", "✦"] };
  grid.innerHTML = insights.map((insight) => {
    const [style, mark] = classes[insight.indicator];
    return `<article class="panel insight-card"><span class="insight-status-mark ${style}">${mark}</span><div><h3>${escapeHtml(insight.courseCode)} · ${numberText(insight.numericalGrade)} <span class="insight-meta"><span>${escapeHtml(insight.indicator)}</span></span></h3><p>${escapeHtml(insight.explanation)}</p><div class="insight-meta"><code>Rule: ${escapeHtml(insight.ruleId)}</code></div></div></article>`;
  }).join("");
}

document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
document.querySelectorAll("[data-navigate]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.navigate)));
window.addEventListener("hashchange", () => {
  const requested = window.location.hash.slice(1) || "dashboard";
  if (TITLES[requested] && requested !== activeView) showView(requested);
});
document.getElementById("mobileMenu").addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  const isOpen = sidebar.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
document.querySelector(".notice-close").addEventListener("click", (event) => event.currentTarget.closest(".notice").remove());

fillCourseSelect(document.getElementById("gradeCourse"));
document.getElementById("gradeCourse").addEventListener("change", renderGradeCategories);
renderGradeCategories();

document.getElementById("gradeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const categories = [...document.querySelectorAll("#categoryRows tr")].map((row) => {
    const graded = row.querySelector("[data-role=graded]").checked;
    const weightField = row.querySelector("[data-role=weight]").value.trim();
    const earnedField = row.querySelector("[data-role=earned]").value.trim();
    const maxField = row.querySelector("[data-role=maximum]").value.trim();
    return {
      categoryName: row.dataset.category,
      weight: weightField === "" ? Number.NaN : Number(weightField),
      earnedPoints: graded ? (earnedField === "" ? Number.NaN : Number(earnedField)) : null,
      maxPoints: graded ? (maxField === "" ? Number.NaN : Number(maxField)) : null,
      graded,
    };
  });
  const response = calculateGrade({ courseCode: document.getElementById("gradeCourse").value, componentType: document.getElementById("gradeComponent").value, term: document.getElementById("gradeTerm").value, categories });
  showErrors("gradeErrors", response.errors);
  if (response.valid) renderGradeResult(response.result);
});

document.getElementById("requiredForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const response = calculateRequiredScore({ currentContribution: numericValue("requiredCurrent"), remainingWeight: numericValue("requiredWeight"), targetGrade: numericValue("requiredTarget") });
  showErrors("requiredErrors", response.errors);
  if (response.valid) renderPlanningResult("requiredResult", response, "required");
});

document.getElementById("simulatorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const response = simulateGrade({ currentContribution: numericValue("simCurrent"), remainingWeight: numericValue("simWeight"), hypotheticalScore: numericValue("simScore") });
  showErrors("simErrors", response.errors);
  if (response.valid) renderPlanningResult("simulatorResult", response, "simulator");
});

document.getElementById("gpaForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const code = document.getElementById("gpaCourse").value;
  const selectedCourse = coursesByCode.get(code);
  const current = document.getElementById("gpaMidterm").value.trim();
  const final = document.getElementById("gpaFinal").value.trim();
  const midtermGrade = current === "" ? Number.NaN : Number(current);
  const finalGrade = final === "" ? Number.NaN : Number(final);
  if (!selectedCourse) {
    showErrors("gpaErrors", ["Choose a course component that has not already been added."]);
    return;
  }
  if (!Number.isFinite(midtermGrade) || midtermGrade < 0 || midtermGrade > 100 || !Number.isFinite(finalGrade) || finalGrade < 0 || finalGrade > 100) {
    showErrors("gpaErrors", ["Enter both midterm and final-term numerical grades from 0 to 100."]);
    return;
  }
  const semester = selectedSemester();
  if (!semester) {
    showErrors("gpaErrors", ["Choose the year level and semester before adding grades."]);
    return;
  }
  records.push({ courseCode: selectedCourse.courseCode, courseName: selectedCourse.courseName, componentType: selectedCourse.componentType, units: selectedCourse.units, yearLevel: semester.yearLevel, semester: semester.semester, midtermGrade, finalGrade, finalized: document.getElementById("gpaFinalized").checked });
  saveCourses();
  document.getElementById("gpaForm").reset();
  showErrors("gpaErrors", []);
  renderGpa();
});

document.getElementById("gpaRows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  records = records.filter((record) => record.courseCode !== button.dataset.remove);
  saveCourses();
  renderGpa();
});

document.getElementById("clearCourses").addEventListener("click", () => {
  if (!records.length) return;
  if (!window.confirm("Clear all course grades from this browser? This cannot be undone.")) return;
  records = [];
  saveCourses();
  renderGpa();
});

document.getElementById("gpaCourse").addEventListener("change", () => showErrors("gpaErrors", []));
document.getElementById("gpaYear").addEventListener("change", () => renderGpa());
document.getElementById("gpaSemester").addEventListener("change", () => renderGpa());
renderGpa();
const initialHash = window.location.hash.slice(1);
if (TITLES[initialHash]) showView(initialHash);
else showView(activeView);
