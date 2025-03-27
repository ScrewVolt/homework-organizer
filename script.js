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

function createTaskElement(title, subject, due) {
    const task = document.createElement("div");
    task.classList.add("task");
    task.draggable = true;
  
    // Create task content
    task.innerHTML = `
      <div class="task-info">
        <strong>${title}</strong><br>
        <span class="tag">${subject}</span><br>
        <small>Due: ${due}</small>
      </div>
      <button class="delete-btn">❌</button>
    `;

    // Color-code subjects
    const tag = task.querySelector(".tag");
    if (subject.toLowerCase().includes("math")) tag.style.backgroundColor = "#3b82f6";
    else if (subject.toLowerCase().includes("english")) tag.style.backgroundColor = "#22c55e";
    else if (subject.toLowerCase().includes("science")) tag.style.backgroundColor = "#f97316";
    else if (subject.toLowerCase().includes("history")) tag.style.backgroundColor = "#a855f7";
    else tag.style.backgroundColor = "#6b7280"; // default gray

  
    // Drag functionality
    task.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.outerHTML);
      task.remove();
      saveTasks();
    });
  
    // Delete functionality
    task.querySelector(".delete-btn").addEventListener("click", () => {
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
