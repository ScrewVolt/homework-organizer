const form = document.getElementById("task-form");
const todoCol = document.getElementById("todo");
const inProgressCol = document.getElementById("in-progress");
const doneCol = document.getElementById("done");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export-pdf");

const currentUser = localStorage.getItem("currentUser") || "default";

let taskBeingEdited = null;
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editSubject = document.getElementById("edit-subject");
const editDue = document.getElementById("edit-due");
const cancelEdit = document.getElementById("cancel-edit");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const due = document.getElementById("due").value;

  const task = createTaskElement(title, subject, due);
  todoCol.appendChild(task);
  sortTasksByDate(todoCol);
  saveTasks();
  form.reset();
});

function createTaskElement(title, subject, due) {
  const task = document.createElement("div");
  task.classList.add("task");
  task.draggable = true;

  task.dataset.title = title;
  task.dataset.subject = subject;
  task.dataset.due = due;

  task.innerHTML = `
    <div class="task-info">
      <strong>${title}</strong><br>
      <span class="tag">${subject}</span><br>
      <small>Due: ${due}</small>
    </div>
    <button class="delete-btn">❌</button>
  `;

  const tag = task.querySelector(".tag");
  if (subject.toLowerCase().includes("math")) tag.style.backgroundColor = "#3b82f6";
  else if (subject.toLowerCase().includes("english")) tag.style.backgroundColor = "#22c55e";
  else if (subject.toLowerCase().includes("science")) tag.style.backgroundColor = "#f97316";
  else if (subject.toLowerCase().includes("history")) tag.style.backgroundColor = "#a855f7";
  else tag.style.backgroundColor = "#6b7280";

  task.addEventListener("dragstart", (e) => {
    const taskData = {
      title,
      subject,
      due,
      sourceId: task.parentElement.id
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(taskData));
    setTimeout(() => task.classList.add("dragging"), 0);
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
  });

  task.querySelector(".delete-btn").addEventListener("click", () => {
    task.remove();
    saveTasks();
  });

  task.querySelector(".task-info").addEventListener("click", () => {
    taskBeingEdited = task;
    editTitle.value = task.dataset.title;
    editSubject.value = task.dataset.subject;
    editDue.value = task.dataset.due;
    editModal.classList.remove("hidden");
  });

  return task;
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!taskBeingEdited) return;

  const title = editTitle.value;
  const subject = editSubject.value;
  const due = editDue.value;

  const newTask = createTaskElement(title, subject, due);
  taskBeingEdited.parentNode.replaceChild(newTask, taskBeingEdited);
  sortTasksByDate(taskBeingEdited.parentNode);

  editModal.classList.add("hidden");
  taskBeingEdited = null;
  saveTasks();
});

cancelEdit.addEventListener("click", () => {
  editModal.classList.add("hidden");
  taskBeingEdited = null;
});

[...document.querySelectorAll(".column")].forEach(col => {
  col.addEventListener("dragover", (e) => e.preventDefault());

  col.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const sourceCol = document.getElementById(data.sourceId);
    const tasks = [...sourceCol.getElementsByClassName("task")];

    for (let task of tasks) {
      if (
        task.dataset.title === data.title &&
        task.dataset.subject === data.subject &&
        task.dataset.due === data.due
      ) {
        task.remove();
        break;
      }
    }

    const newTask = createTaskElement(data.title, data.subject, data.due);
    col.appendChild(newTask);
    sortTasksByDate(col);
    saveTasks();
  });
});

function sortTasksByDate(column) {
  const tasks = Array.from(column.getElementsByClassName("task"));
  tasks.sort((a, b) => new Date(a.dataset.due) - new Date(b.dataset.due));
  tasks.forEach(task => column.appendChild(task));
}

function saveTasks() {
  const data = {
    todo: todoCol.innerHTML,
    progress: inProgressCol.innerHTML,
    done: doneCol.innerHTML
  };
  localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem(`tasks_${currentUser}`));
  if (!data) return;
  todoCol.innerHTML = data.todo;
  inProgressCol.innerHTML = data.progress;
  doneCol.innerHTML = data.done;
  restoreTasks(todoCol);
  restoreTasks(inProgressCol);
  restoreTasks(doneCol);
}

function restoreTasks(column) {
  column.querySelectorAll(".task").forEach(task => {
    const title = task.querySelector("strong").textContent.trim();
    const subject = task.querySelector(".tag").textContent.trim();
    const due = task.querySelector("small").textContent.replace("Due: ", "").trim();

    task.dataset.title = title;
    task.dataset.subject = subject;
    task.dataset.due = due;

    const tag = task.querySelector(".tag");
    if (subject.toLowerCase().includes("math")) tag.style.backgroundColor = "#3b82f6";
    else if (subject.toLowerCase().includes("english")) tag.style.backgroundColor = "#22c55e";
    else if (subject.toLowerCase().includes("science")) tag.style.backgroundColor = "#f97316";
    else if (subject.toLowerCase().includes("history")) tag.style.backgroundColor = "#a855f7";
    else tag.style.backgroundColor = "#6b7280";

    task.draggable = true;
    task.addEventListener("dragstart", (e) => {
      const taskData = JSON.stringify({
        title,
        subject,
        due,
        sourceId: task.parentElement.id
      });
      e.dataTransfer.setData("text/plain", taskData);
      setTimeout(() => task.classList.add("dragging"), 0);
    });
    task.addEventListener("dragend", () => {
      task.classList.remove("dragging");
    });

    task.querySelector(".delete-btn").addEventListener("click", () => {
      task.remove();
      saveTasks();
    });

    task.querySelector(".task-info").addEventListener("click", () => {
      taskBeingEdited = task;
      editTitle.value = task.dataset.title;
      editSubject.value = task.dataset.subject;
      editDue.value = task.dataset.due;
      editModal.classList.remove("hidden");
    });
  });
  sortTasksByDate(column);
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  document.querySelectorAll(".task").forEach(task => {
    const title = task.dataset.title.toLowerCase();
    const subject = task.dataset.subject.toLowerCase();
    const match = title.includes(keyword) || subject.includes(keyword);
    task.style.display = match ? "block" : "none";
  });
});

exportBtn.addEventListener("click", () => {
  const tasks = document.querySelectorAll(".task");
  let text = "Homework Organizer Tasks\n\n";
  tasks.forEach(task => {
    const title = task.dataset.title;
    const subject = task.dataset.subject;
    const due = task.dataset.due;
    text += `Title: ${title}\nSubject: ${subject}\nDue: ${due}\n\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "homework_tasks.txt";
  link.click();
});

loadTasks();