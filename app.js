let metricBtn = document.getElementById("metricBtn");
let imperialBtn = document.getElementById("imperialBtn");
let metricInputs = document.getElementById("metricInputs");
let imperialInputs = document.getElementById("imperialInputs");
let genderBtns = document.querySelectorAll(".gender button");
let calcBtn = document.getElementById("calcBtn");
let resetBtn = document.getElementById("resetBtn");
let resultCard = document.getElementById("resultCard");
let bmiValueEl = document.getElementById("bmiValue");
let bmiStatusSpan = document.getElementById("bmiStatusSpan");
let bmiInfo = document.getElementById("bmiInfo");
let historyBtn = document.getElementById("historyBtn");
let historyCount = document.getElementById("historyCount");
let historyModal = document.getElementById("historyModal");
let closeHistory = document.getElementById("closeHistory");
let historyList = document.getElementById("historyList");

let history = JSON.parse(localStorage.getItem("bmiHistory")) || [];
let unit = "metric";

function updateBadge() { historyCount.textContent = history.length; }
updateBadge();

// Unit toggle
metricBtn.onclick = () => {
    unit = "metric";
    metricBtn.classList.add("active"); imperialBtn.classList.remove("active");
    metricInputs.classList.remove("hide"); imperialInputs.classList.add("hide");
};

imperialBtn.onclick = () => {
    unit = "imperial";
    imperialBtn.classList.add("active"); metricBtn.classList.remove("active");
    imperialInputs.classList.remove("hide"); metricInputs.classList.add("hide");
};

// Gender toggle
genderBtns.forEach(btn => {
    btn.onclick = () => {
        genderBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    };
});

// Field error helper
function fieldErr(id, show) {
    let input = document.getElementById(id);
    let msg = document.getElementById("err-" + id);
    if (!msg) return;
    if (show) {
        input.classList.add("input-error");
        msg.classList.add("show");
    } else {
        input.classList.remove("input-error");
        msg.classList.remove("show");
    }
}

// Clear error on typing
["name", "age", "heightCm", "weightKg", "feet", "weightLbs"].forEach(id => {
    let el = document.getElementById(id);
    if (el) el.oninput = () => fieldErr(id, false);
});

// Calculate
calcBtn.onclick = () => {
    let name = document.getElementById("name").value.trim();
    let age  = document.getElementById("age").value;
    let valid = true;

    fieldErr("name", !name); if (!name) valid = false;
    fieldErr("age",  !age);  if (!age)  valid = false;

    let bmi;
    if (unit === "metric") {
        let h = document.getElementById("heightCm").value;
        let w = document.getElementById("weightKg").value;
        fieldErr("heightCm", !h); if (!h) valid = false;
        fieldErr("weightKg", !w); if (!w) valid = false;
        if (!valid) return;
        bmi = w / ((h / 100) ** 2);
    } else {
        let ft   = document.getElementById("feet").value;
        let inch = document.getElementById("inches").value || 0;
        let w    = document.getElementById("weightLbs").value;
        fieldErr("feet",      !ft); if (!ft) valid = false;
        fieldErr("weightLbs", !w);  if (!w)  valid = false;
        if (!valid) return;
        let totalInches = ft * 12 + Number(inch);
        bmi = (703 * w) / (totalInches ** 2);
    }

    if (!valid) return;

    bmi = bmi.toFixed(2);

    let status, colorClass;
    if (bmi < 18.5)    { status = "Underweight"; colorClass = "under"; }
    else if (bmi < 25) { status = "Normal";      colorClass = "normal"; }
    else if (bmi < 30) { status = "Overweight";  colorClass = "over"; }
    else               { status = "Obese";        colorClass = "obese"; }

    resultCard.classList.remove("hide");
    bmiValueEl.textContent = bmi;
    bmiValueEl.className = "bmi-value " + colorClass;
    bmiStatusSpan.textContent = status;
    bmiStatusSpan.className = "status-" + colorClass;
    bmiInfo.innerHTML = `
        <div class="bmi-info-chip">
            <div class="chip-label">Age</div>
            <div class="chip-value">${age}</div>
        </div>
        <div class="bmi-info-chip">
            <div class="chip-label">Status</div>
            <div class="chip-value ${colorClass}">${status}</div>
        </div>`;

    history.push(`${name} - BMI ${bmi} (${status})`);
    localStorage.setItem("bmiHistory", JSON.stringify(history));
    updateBadge();
};

// Reset
resetBtn.onclick = () => location.reload();

// Render history list
function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((item, index) => {
        let [namePart, bmiPart] = item.split(" - BMI ");
        let bmiVal = bmiPart.split(" ")[0];
        let status = bmiPart.match(/\((.*?)\)/)[1];
        let initial = namePart.charAt(0).toUpperCase();
        let li = document.createElement("li");
        if (status === "Underweight") li.classList.add("underweight");
        else if (status === "Normal") li.classList.add("normal");
        else if (status === "Overweight") li.classList.add("overweight");
        else if (status === "Obese") li.classList.add("obese");
        li.innerHTML = `
            <div class="history-left">
                <div class="profile-icon">${initial}</div>
                <div class="history-details">
                    <span><strong>Name:</strong> ${namePart}</span>
                    <span><strong>BMI:</strong> ${bmiVal}</span>
                    <span><strong>Status:</strong> ${status}</span>
                </div>
            </div>
            <div class="history-right"><button>Delete</button></div>`;
        li.querySelector("button").onclick = () => {
            history.splice(index, 1);
            localStorage.setItem("bmiHistory", JSON.stringify(history));
            updateBadge();
            renderHistory();
        };
        historyList.appendChild(li);
    });
}

// Open / close modal
historyBtn.onclick = () => { historyModal.classList.remove("hide"); renderHistory(); };
closeHistory.onclick = () => historyModal.classList.add("hide");

// Delete all
document.getElementById("deleteAllHistory").onclick = () => {
    history = [];
    localStorage.removeItem("bmiHistory");
    updateBadge();
    renderHistory();
};
