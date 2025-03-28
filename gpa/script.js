const form = document.getElementById("course-form");
const courseList = document.getElementById("course-list");
const unweightedDisplay = document.getElementById("unweighted-gpa");
const weightedDisplay = document.getElementById("weighted-gpa");
const goalInput = document.getElementById("goal-gpa");
const progressBar = document.getElementById("goal-progress");
const whatIfForm = document.getElementById("what-if-form");
const whatIfResult = document.getElementById("what-if-result");

let courses = [];
let gpaGoal = 4.0;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhHoP9RIyNBBx_2Pdc_uYMjinfdNe0rWI",
    authDomain: "productivitysuite-afe76.firebaseapp.com",
    projectId: "productivitysuite-afe76",
    storageBucket: "productivitysuite-afe76.firebasestorage.app",
    messagingSenderId: "213747265695",
    appId: "1:213747265695:web:5092bca79d1f584426f2aa",
    measurementId: "G-JY20JJ4S1R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

function applyDarkModeSetting() {
  const isDark = localStorage.getItem("darkmode") === "true";
  document.body.classList.toggle("darkmode", isDark);
}
applyDarkModeSetting();

onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user.uid;
      const docSnap = await getDoc(doc(db, "gpa", currentUser));
      if (docSnap.exists()) {
        const data = docSnap.data();
        courses = data.courses || [];
        gpaGoal = data.goal || 4.0;
        goalInput.value = gpaGoal;
        updateDisplay();
      }
    }
  });
  
  async function saveToFirestore() {
    if (!currentUser) return;
    await setDoc(doc(db, "gpa", currentUser), { courses, goal: gpaGoal });
  } 

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("course-name").value.trim();
    const gradeInput = document.getElementById("grade").value.trim();
    const credits = parseFloat(document.getElementById("credits").value) || 1;
    const grade = convertToGPA(gradeInput);
    if (grade === null) {
      alert("Invalid grade. Use letters (A, B+, etc.) or percent (90%).");
      return;
    }
    courses.push({ name, grade, credits });
    updateDisplay();
    form.reset();
    saveToFirestore();
  });
  
  goalInput.addEventListener("change", () => {
    gpaGoal = parseFloat(goalInput.value) || 4.0;
    updateDisplay();
    saveToFirestore();
  });
  
  document.getElementById("clear-btn").addEventListener("click", () => {
    if (!confirm("Are you sure you want to clear all courses and GPA data?")) return;
    courses = [];
    updateDisplay();
    saveToFirestore();
  });
  
  whatIfForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentGrade = parseFloat(document.getElementById("current-grade").value);
    const finalWeight = parseFloat(document.getElementById("final-weight").value);
    const targetGrade = parseFloat(document.getElementById("target-grade").value);
  
    if (isNaN(currentGrade) || isNaN(finalWeight) || isNaN(targetGrade)) {
      whatIfResult.textContent = "Please fill in all fields with valid numbers.";
      return;
    }
  
    const weightFraction = finalWeight / 100;
    const neededFinal = (targetGrade - currentGrade * (1 - weightFraction)) / weightFraction;
  
    if (neededFinal > 100) {
      whatIfResult.textContent = `⚠️ You would need a ${neededFinal.toFixed(1)}% on the final — above 100% is not usually possible.`;
    } else if (neededFinal < 0) {
      whatIfResult.textContent = `🎉 You're already guaranteed at least a ${targetGrade}% in the course!`;
    } else {
      whatIfResult.textContent = `You need a ${neededFinal.toFixed(1)}% on the final exam to finish with a ${targetGrade}% in the course.`;
    }
  });
  
  function convertToGPA(input) {
    const letterMap = {
      "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
      "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0.0
    };
    const upper = input.toUpperCase();
    if (letterMap.hasOwnProperty(upper)) return letterMap[upper];
    const percent = parseFloat(input);
    if (!isNaN(percent)) {
      if (percent >= 90) return 4.0;
      if (percent >= 85) return 3.7;
      if (percent >= 80) return 3.3;
      if (percent >= 75) return 3.0;
      if (percent >= 70) return 2.7;
      if (percent >= 65) return 2.3;
      if (percent >= 60) return 2.0;
      if (percent >= 50) return 1.0;
      return 0.0;
    }
    return null;
  }