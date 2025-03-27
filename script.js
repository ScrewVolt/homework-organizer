const form = document.getElementById("task-form");
const todoCol = document.getElementById("todo");
const inProgressCol = document.getElementById("in-progress");
const doneCol = document.getElementById("done");

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const due = document.getElementById("due").value;

  const task = createTaskElement(title, subject, due);
  todoCol.appendChild(task);
  saveTasks();
  form.reset();
});

// Create task element
function createTaskElement(title, subject, due) {
  const task = document.createElement("div");
  task.classList.add("task");
  task.draggable = true;
  task.textContent = `${title} | ${subject} | Due: ${due}`;

  task.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.outerHTML);
    task.remove();
    saveTasks();
  });

  return task;
}

// Allow columns to accept drops
[...document.querySelectorAll(".column")].forEach(col => {
  col.addEventListener("dragover", (e) => e.preventDefault());
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    const html = e.dataTransfer.getData("text/plain");
    col.insertAdjacentHTML("beforeend", html);
    saveTasks();
    restoreDrag(); // Rebind drag events
  });
});

// Save to localStorage
function saveTasks() {
  const data = {
    todo: todoCol.innerHTML,
    progress: inProgressCol.innerHTML,
    done: doneCol.innerHTML
  };
  localStorage.setItem("tasks", JSON.stringify(data));
}

// Load tasks on page load
function loadTasks() {
  const data = JSON.parse(localStorage.getItem("tasks"));
  if (!data) return;
  todoCol.innerHTML = data.todo;
  inProgressCol.innerHTML = data.progress;
  doneCol.innerHTML = data.done;
  restoreDrag(); // Rebind after loading
}

// Rebind drag events after loading or dropping
function restoreDrag() {
  document.querySelectorAll(".task").forEach(task => {
    task.draggable = true;
    task.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.outerHTML);
      task.remove();
      saveTasks();
    });
  });
}

// Load existing tasks
loadTasks();
