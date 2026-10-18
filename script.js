
const plans = {
  starter: { name: "Starter", monthly: 15, signup: 20 },
  unlimited: { name: "Unlimited", monthly: 25, signup: 0 },
  plus: { name: "Flex Plus", monthly: 10, signup: 50 }
};

const money = value => "$" + value.toLocaleString("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
}).replace(/\.00$/, "");

const select = document.getElementById("plan-select");
const slider = document.getElementById("months");

function updateCalculator() {
  const plan = plans[select.value];
  const months = Number(slider.value);
  const monthlyTotal = plan.monthly * months;
  const total = monthlyTotal + plan.signup;
  const average = months > 0 ? total / months : null;

  document.getElementById("months-value").textContent = months;
  document.getElementById("total-cost").textContent = money(total);
  document.getElementById("monthly-total").textContent =
    money(monthlyTotal);
  document.getElementById("signup-total").textContent =
    money(plan.signup);
  document.getElementById("average-cost").textContent =
    average === null ? "N/A" : money(average);

  document.getElementById("active-equation").textContent =
    `y = ${plan.monthly}x${plan.signup ? " + " + plan.signup : ""}`;

  document.getElementById("substitution").textContent =
    `y = ${plan.monthly}(${months})${plan.signup ? " + " + plan.signup : ""} = ${total}`;

  document.getElementById("cost-explanation").textContent =
    `${months} ${months === 1 ? "month" : "months"} of ${plan.name} membership.`;

  drawGraph();
}

select.addEventListener("change", updateCalculator);
slider.addEventListener("input", updateCalculator);

document.querySelectorAll(".choose-plan").forEach(button => {
  button.addEventListener("click", () => {
    select.value = button.dataset.plan;
    updateCalculator();
    document.getElementById("calculator").scrollIntoView({
      behavior: "smooth"
    });
  });
});


function drawGraph() {
  const canvas = document.getElementById("cost-graph");
  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const pad = { left: 52, right: 15, top: 20, bottom: 38 };

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxMonths = 12;
  const maxCost = 350;

  const px = x => pad.left + (x / maxMonths) * plotW;
  const py = y => pad.top + plotH - (y / maxCost) * plotH;

  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px Arial";
  ctx.lineWidth = 1;

  // Horizontal grid lines and cost labels.
  for (let cost = 0; cost <= maxCost; cost += 50) {
    const y = py(cost);

    ctx.beginPath();
    ctx.strokeStyle = "#e8ece5";
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = "#788174";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("$" + cost, pad.left - 10, y);
  }

  // Vertical grid lines and month labels.
  for (let month = 0; month <= maxMonths; month += 2) {
    const x = px(month);

    ctx.beginPath();
    ctx.strokeStyle = "#eef0eb";
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, height - pad.bottom);
    ctx.stroke();

    ctx.fillStyle = "#788174";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(month, x, height - pad.bottom + 10);
  }

  // Axis labels.
  ctx.fillStyle = "#566052";
  ctx.textAlign = "center";
  ctx.fillText("Months", pad.left + plotW / 2, height - 5);

  ctx.save();
  ctx.translate(13, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Total cost ($)", 0, 0);
  ctx.restore();

  const colors = {
    starter: "#668e43",
    unlimited: "#508db5",
    plus: "#d28a54"
  };

  Object.entries(plans).forEach(([key, plan]) => {
    ctx.beginPath();
    ctx.strokeStyle = colors[key];
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";

    for (let month = 0; month <= maxMonths; month++) {
      const cost = plan.monthly * month + plan.signup;
      const x = px(month);
      const y = py(cost);

      if (month === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Mark every two-month point.
    for (let month = 0; month <= maxMonths; month += 2) {
      const cost = plan.monthly * month + plan.signup;

      ctx.beginPath();
      ctx.fillStyle = colors[key];
      ctx.arc(px(month), py(cost), 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Generate a table of sample values.
function buildTable() {
  const tbody = document.getElementById("values-table");
  tbody.innerHTML = "";

  for (let month = 0; month <= 12; month += 2) {
    const row = document.createElement("tr");
    const values = [
      month,
      plans.starter.monthly * month + plans.starter.signup,
      plans.unlimited.monthly * month + plans.unlimited.signup,
      plans.plus.monthly * month + plans.plus.signup
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = index === 0 ? value : money(value);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  }
}

document.getElementById("reset-graph").addEventListener("click", () => {
  drawGraph();
});

window.addEventListener("resize", drawGraph);


const questions = [
  {
    question: "Starter costs $20 upfront and $15 per month. Which equation represents its total cost?",
    answers: ["y = 20x + 15", "y = 15x + 20", "y = 35x"],
    correct: 1,
    explanation: "The monthly fee is the slope (15), and the signup fee is the y-intercept (20)."
  },
  {
    question: "Which membership equation represents direct variation?",
    answers: ["y = 10x + 50", "y = 25x", "y = 15x + 20"],
    correct: 1,
    explanation: "Direct variation has the form y = kx. Its graph passes through the origin."
  },
  {
    question: "For y = 10x + 50, what does 10 represent?",
    answers: ["The signup fee", "The total after one month", "The monthly fee and slope"],
    correct: 2,
    explanation: "The coefficient of x is the slope, which tells us the cost increases by $10 each month."
  },
  {
    question: "Starter costs y = 15x + 20. Unlimited costs y = 25x. When are their costs equal?",
    answers: ["2 months", "4 months", "10 months"],
    correct: 0,
    explanation: "Set the equations equal: 15x + 20 = 25x. Then 20 = 10x, so x = 2 months."
  }
];

let questionIndex = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const question = questions[questionIndex];

  answered = false;
  document.getElementById("quiz-progress").textContent =
    `QUESTION ${questionIndex + 1} OF ${questions.length}`;

  document.getElementById("quiz-score").textContent =
    `SCORE: ${score}`;

  document.getElementById("quiz-progress-bar").style.width =
    `${((questionIndex + 1) / questions.length) * 100}%`;

  document.getElementById("quiz-question").textContent =
    question.question;

  document.getElementById("quiz-feedback").textContent = "";

  const answers = document.getElementById("quiz-answers");
  answers.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = answer;

    button.addEventListener("click", () => chooseAnswer(index, button));
    answers.appendChild(button);
  });

  const next = document.getElementById("quiz-next");
  next.disabled = true;
  next.textContent = "Choose an answer";
}

function chooseAnswer(index, button) {
  if (answered) return;
  answered = true;

  const question = questions[questionIndex];
  const correct = index === question.correct;

  if (correct) score++;

  document.querySelectorAll(".quiz-option").forEach((option, i) => {
    option.disabled = true;

    if (i === question.correct) {
      option.classList.add("selected");
    }
  });

  document.getElementById("quiz-feedback").textContent =
    (correct ? "Correct! " : "Nope. ") + question.explanation;

  document.getElementById("quiz-score").textContent =
    `SCORE: ${score}`;

  const next = document.getElementById("quiz-next");
  next.disabled = false;
  next.textContent =
    questionIndex === questions.length - 1
      ? "See results"
      : "Next question →";
}

document.getElementById("quiz-next").addEventListener("click", () => {
  if (!answered) return;
0
  if (questionIndex < questions.length - 1) {
    questionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  document.getElementById("quiz-progress").textContent =
    "QUIZ COMPLETE";

  document.getElementById("quiz-score").textContent =
    `SCORE: ${score} / ${questions.length}`;

  document.getElementById("quiz-question").textContent =
    score === questions.length
      ? "Perfect score! You've mastered the basics."
      : "Nice work! Review your answers and try again.";

  document.getElementById("quiz-answers").innerHTML = "";

  document.getElementById("quiz-feedback").textContent =
    `You scored ${score} out of ${questions.length} (${score * 25}%).`;

  const next = document.getElementById("quiz-next");
  next.disabled = false;
  next.textContent = "Try again";

  next.onclick = () => {
    questionIndex = 0;
    score = 0;
    next.onclick = null;
    renderQuestion();
  };
}

// Initialize everything.
buildTable();
renderQuestion();
updateCalculator();
