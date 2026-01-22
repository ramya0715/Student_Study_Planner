const KEY_SUBJECTS = "studyplanner_subjects";
const KEY_TASKS = "studyplanner_tasks";
const KEY_TASK_DATE = "studyplanner_task_date";


const subName = document.getElementById("subName");
const examDate = document.getElementById("examDate");
const priority = document.getElementById("priority");

const addSubBtn = document.getElementById("addSubBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const subjectsList = document.getElementById("subjectsList");
const msg = document.getElementById("msg");

const generateBtn = document.getElementById("generateBtn");
const timetable = document.getElementById("timetable");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const resetTasksBtn = document.getElementById("resetTasksBtn");
const taskList = document.getElementById("taskList");

let subjects = JSON.parse(localStorage.getItem(KEY_SUBJECTS)) || [];
let tasks = JSON.parse(localStorage.getItem(KEY_TASKS)) || [];


function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function showMsg(text, color = "green") {
  msg.innerText = text;
  msg.style.color = color;
  setTimeout(() => {
    msg.innerText = "";
  }, 2000);
}

function saveSubjects() {
  localStorage.setItem(KEY_SUBJECTS, JSON.stringify(subjects));
}

function saveTasks() {
  localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
}

function daysLeft(dateStr) {
  const today = new Date();
  const exam = new Date(dateStr);
  const diff = exam.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPriorityClass(p) {
  if (p === "High") return "high";
  if (p === "Medium") return "medium";
  return "low";
}

function renderSubjects() {
  subjectsList.innerHTML = "";

  if (subjects.length === 0) {
    subjectsList.innerHTML = `<p class="small">No subjects added yet ✅</p>`;
    return;
  }

  subjects
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .forEach((s) => {
      const left = daysLeft(s.examDate);

      const div = document.createElement("div");
      div.className = "subjectCard";

      div.innerHTML = `
        <div>
          <div style="font-weight:800">${s.name}</div>
          <div class="small">📅 Exam: ${s.examDate}</div>
          <div class="small">⏳ Days left: ${left < 0 ? "Passed" : left}</div>
        </div>

        <div>
          <span class="badge ${getPriorityClass(s.priority)}">${s.priority} Priority</span>
        </div>

        <div class="small">
          Suggested: ${left <= 3 ? "3 hrs/day" : left <= 10 ? "2 hrs/day" : "1 hr/day"}
        </div>

        <button class="iconBtn" onclick="deleteSubject(${s.id})">🗑️</button>
      `;

      subjectsList.appendChild(div);
    });
}

function addSubject() {
  const name = subName.value.trim();
  const date = examDate.value;
  const p = priority.value;

  if (name === "" || date === "") {
    showMsg("❌ Please enter subject name and exam date", "red");
    return;
  }

  const newSub = {
    id: Date.now(),
    name: name,
    examDate: date,
    priority: p,
  };

  subjects.push(newSub);
  saveSubjects();
  renderSubjects();

  subName.value = "";
  examDate.value = "";
  priority.value = "Medium";

  showMsg("✅ Subject added");
}

function deleteSubject(id) {
  subjects = subjects.filter((s) => s.id !== id);
  saveSubjects();
  renderSubjects();
  showMsg("🗑️ Subject deleted", "orange");
}

function clearAllSubjects() {
  if (subjects.length === 0) {
    showMsg("Nothing to clear ✅", "orange");
    return;
  }

  const ok = confirm("Delete all subjects?");
  if (!ok) return;

  subjects = [];
  saveSubjects();
  renderSubjects();
  timetable.innerHTML = "";
  showMsg("✅ All subjects cleared");
}


function generateTimetable() {
  timetable.innerHTML = "";

  if (subjects.length === 0) {
    timetable.innerHTML = `<p class="small">Add subjects first to generate timetable ✅</p>`;
    return;
  }

  // pick nearest upcoming exam
  const upcoming = subjects
    .filter((s) => daysLeft(s.examDate) >= 0)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const focus = upcoming.length > 0 ? upcoming[0] : subjects[0];

    const plan = [
    { day: "Today", tasks: ["Read concepts", "Write notes", "Practice 5 questions"] },
    { day: "Tomorrow", tasks: ["Revise previous topics", "Solve 10 MCQs", "Short notes"] },
    { day: "Day 3", tasks: ["Important 13-mark questions", "Previous year QP", "Quick revision"] },
  ];

  plan.forEach((p) => {
    const box = document.createElement("div");
    box.className = "dayPlan";

    box.innerHTML = `
      <h3>📌 ${p.day} - Focus: ${focus.name} (${focus.priority})</h3>
      <ul>
        ${p.tasks.map((t) => `<li>${t}</li>`).join("")}
      </ul>
    `;

    timetable.appendChild(box);
  });

  showMsg("✅ Timetable generated");
}

// -------------------- Daily Checklist --------------------
function resetTasksIfNewDay() {
  const savedDate = localStorage.getItem(KEY_TASK_DATE);
  const today = todayString();

  if (savedDate !== today) {
        tasks = tasks.map((t) => ({ ...t, done: false }));
    localStorage.setItem(KEY_TASK_DATE, today);
    saveTasks();
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="small">No tasks added today ✅</li>`;
    return;
  }

  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = "taskItem";

    li.innerHTML = `
      <div class="taskLeft">
        <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTask(${t.id})" />
        <span class="taskText ${t.done ? "done" : ""}">${t.text}</span>
      </div>
      <button class="iconBtn" onclick="deleteTask(${t.id})">🗑️</button>
    `;

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Enter a task!");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    done: false,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
}

function toggleTask(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function resetTodayTasks() {
  if (tasks.length === 0) {
    showMsg("No tasks to reset ✅", "orange");
    return;
  }

  const ok = confirm("Reset all tasks to unchecked for today?");
  if (!ok) return;

  tasks = tasks.map((t) => ({ ...t, done: false }));
  saveTasks();
  renderTasks();
  showMsg("✅ Tasks reset");
}

addSubBtn.addEventListener("click", addSubject);
clearAllBtn.addEventListener("click", clearAllSubjects);

generateBtn.addEventListener("click", generateTimetable);

addTaskBtn.addEventListener("click", addTask);
resetTasksBtn.addEventListener("click", resetTodayTasks);

resetTasksIfNewDay();
renderSubjects();
renderTasks();
