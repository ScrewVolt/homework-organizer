const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const sessionCount = document.getElementById("session-count");
const modeButtons = document.querySelectorAll(".mode-btn");

const logDropdown = document.getElementById("session-log");
const focusTaskInput = document.getElementById("focus-task");
const checklist = document.getElementById("checklist");
const newCheckInput = document.getElementById("new-check");
const addCheckBtn = document.getElementById("add-check");
const autoRestartCheckbox = document.getElementById("auto-restart");

const goalInput = document.getElementById("goal-input");
const progressFill = document.getElementById("progress-fill");
const focusRating = document.getElementById("focus-rating");
const stars = document.querySelectorAll("#stars span");
const badgeContainer = document.getElementById("badges");
const focusAverageDisplay = document.getElementById("focus-average");

const currentUser = localStorage.getItem("currentUser") || "default";

let interval;
let mode = "work";
let timeLeft = 25 * 60;
let isRunning = false;

const durations = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

const badgeMilestones = [5, 10, 25, 50, 100];

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  interval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(interval);
      isRunning = false;
      playNotification();
      handleSessionEnd();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(interval);
  timeLeft = durations[mode];
  isRunning = false;
  updateDisplay();
}

function switchMode(newMode) {
  mode = newMode;
  resetTimer();
  modeButtons.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
}

function handleSessionEnd() {
  if (mode === "work") {
    incrementTodaySession();
    const total = getTodaySessionCount();
    sessionCount.textContent = total;
    updateGoalProgress();
    showFocusRating();
    checkForBadges(total);
    updateFocusAverage();
    mode = total % 4 === 0 ? "longBreak" : "shortBreak";
  } else {
    mode = "work";
  }
  switchMode(mode);
  updateLogDropdown();

  if (autoRestartCheckbox.checked) {
    startTimer();
  }
}

function playNotification() {
  new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3").play();
  if ("Notification" in window && Notification.permission === "granted") {
    const message = mode === "work"
      ? "🎉 Pomodoro complete! Time for a break."
      : "☕ Break over! Time to get back to work.";
    new Notification(message);
  }
}

function getTodayKey() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getStorageKey(base) {
  return `${base}_${currentUser}`;
}

function incrementTodaySession() {
  const key = getTodayKey();
  const logKey = getStorageKey("pomodoroLog");
  const log = JSON.parse(localStorage.getItem(logKey) || "{}");
  log[key] = (log[key] || 0) + 1;
  localStorage.setItem(logKey, JSON.stringify(log));
}

function getTodaySessionCount() {
  const key = getTodayKey();
  const log = JSON.parse(localStorage.getItem(getStorageKey("pomodoroLog")) || "{}");
  return log[key] || 0;
}

function updateLogDropdown() {
  const log = JSON.parse(localStorage.getItem(getStorageKey("pomodoroLog")) || "{}");
  logDropdown.innerHTML = "";
  Object.keys(log).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
    const entry = document.createElement("option");
    entry.textContent = `${date} – ${log[date]} sessions`;
    logDropdown.appendChild(entry);
  });
}

function updateGoalProgress() {
  const goal = parseInt(goalInput.value, 10) || 0;
  const current = getTodaySessionCount();
  const percent = Math.min((current / goal) * 100, 100);
  progressFill.style.width = `${percent}%`;
}

function showFocusRating() {
  focusRating.classList.remove("hidden");
}

stars.forEach(star => {
  star.addEventListener("click", () => {
    const rating = star.dataset.rating;
    saveFocusRating(rating);
    focusRating.classList.add("hidden");
    updateFocusAverage();
  });
});

function saveFocusRating(rating) {
  const key = getTodayKey();
  const ratingsKey = getStorageKey("focusRatings");
  const ratings = JSON.parse(localStorage.getItem(ratingsKey) || "{}");
  if (!ratings[key]) ratings[key] = [];
  ratings[key].push(Number(rating));
  localStorage.setItem(ratingsKey, JSON.stringify(ratings));
}

function updateFocusAverage() {
  const key = getTodayKey();
  const ratings = JSON.parse(localStorage.getItem(getStorageKey("focusRatings")) || "{}");
  const todayRatings = ratings[key] || [];
  if (todayRatings.length === 0) {
    focusAverageDisplay.textContent = "-";
    return;
  }
  const avg = todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length;
  focusAverageDisplay.textContent = avg.toFixed(2) + " / 5";
}

function checkForBadges(count) {
  badgeContainer.innerHTML = "";
  badgeMilestones.forEach(milestone => {
    if (count >= milestone) {
      const badge = document.createElement("span");
      badge.textContent = `${milestone}x 🎯`;
      badgeContainer.appendChild(badge);
    }
  });
}

addCheckBtn.addEventListener("click", () => {
  const itemText = newCheckInput.value.trim();
  if (itemText === "") return;
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox"> ${itemText}</label>`;
  checklist.appendChild(li);
  newCheckInput.value = "";
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    switchMode(btn.dataset.mode);
  });
});

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

updateDisplay();
sessionCount.textContent = getTodaySessionCount();
updateGoalProgress();
updateLogDropdown();
updateFocusAverage();
checkForBadges(getTodaySessionCount());