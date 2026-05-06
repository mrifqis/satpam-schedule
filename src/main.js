import "./style.css";

const guards = ["Made", "Irfan", "Hendra"];
const shifts = ["Siang", "Malam"];

const baseDate = new Date(2026, 4, 6);
// 6 Mei 2026
// Siang = Made
// Malam = Irfan

let currentOverrides = [];

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

const monthSelect = document.querySelector("#monthSelect");
const yearInput = document.querySelector("#yearInput");
const loadButton = document.querySelector("#loadButton");
const saveButton = document.querySelector("#saveButton");
const calendarEl = document.querySelector("#calendar");
const summaryEl = document.querySelector("#summary");
const messageEl = document.querySelector("#message");

const today = new Date();

monthNames.forEach((name, index) => {
  const option = document.createElement("option");
  option.value = String(index + 1);
  option.textContent = name;
  monthSelect.appendChild(option);
});

monthSelect.value = String(today.getMonth() + 1);
yearInput.value = String(today.getFullYear());

loadButton.addEventListener("click", loadSchedule);
saveButton.addEventListener("click", saveOverride);

loadSchedule();

async function loadSchedule() {
  const month = Number(monthSelect.value);
  const year = Number(yearInput.value);

  setMessage("Memuat jadwal...");

  try {
    const res = await fetch(`/.netlify/functions/get-schedule?month=${month}&year=${year}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Gagal mengambil jadwal.");
    }

    currentOverrides = json.overrides || [];

    renderCalendar(year, month, currentOverrides);
    renderSummary(year, month, currentOverrides);

    setMessage("");
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function saveOverride() {
  const adminPassword = document.querySelector("#adminPassword").value;
  const shiftDate = document.querySelector("#shiftDate").value;
  const shiftName = document.querySelector("#shiftName").value;
  const guardName = document.querySelector("#guardName").value;
  const note = document.querySelector("#note").value;

  setMessage("Menyimpan perubahan...");

  try {
    const res = await fetch("/.netlify/functions/save-override", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adminPassword,
        shiftDate,
        shiftName,
        guardName,
        note
      })
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Gagal menyimpan perubahan.");
    }

    setMessage("Perubahan berhasil disimpan.");

    const savedDate = new Date(`${shiftDate}T00:00:00`);
    monthSelect.value = String(savedDate.getMonth() + 1);
    yearInput.value = String(savedDate.getFullYear());

    await loadSchedule();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function renderCalendar(year, month, overrides) {
  calendarEl.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = toDateKey(date);
    const dayName = getDayName(date);

    const card = document.createElement("div");
    card.className = "day-card";

    const title = document.createElement("h3");
    title.textContent = `${dayName}, ${day} ${monthNames[month - 1]}`;
    card.appendChild(title);

    shifts.forEach((shiftName) => {
      const baseGuard = getBaseGuard(date, shiftName);
      const actualGuard = getActualGuard(date, shiftName, overrides);
      const isChanged = baseGuard !== actualGuard;

      const row = document.createElement("div");
      row.className = `shift-row ${isChanged ? "changed" : ""}`;

      row.innerHTML = `
        <span>${shiftName}</span>
        <strong>${actualGuard}</strong>
        ${isChanged ? `<small>Diganti dari ${baseGuard}</small>` : ""}
      `;

      card.appendChild(row);
    });

    calendarEl.appendChild(card);
  }
}

function renderSummary(year, month, overrides) {
  const summary = {
    Made: { Siang: 0, Malam: 0, Total: 0 },
    Irfan: { Siang: 0, Malam: 0, Total: 0 },
    Hendra: { Siang: 0, Malam: 0, Total: 0 }
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    shifts.forEach((shiftName) => {
      const guard = getActualGuard(date, shiftName, overrides);
      summary[guard][shiftName]++;
      summary[guard].Total++;
    });
  }

  summaryEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Petugas</th>
          <th>Siang</th>
          <th>Malam</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${guards
          .map(
            (guard) => `
              <tr>
                <td>${guard}</td>
                <td>${summary[guard].Siang}</td>
                <td>${summary[guard].Malam}</td>
                <td>${summary[guard].Total}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function getBaseGuard(date, shiftName) {
  const dayDiff = getDaysDiff(date, baseDate);
  const shiftIndexInDay = shiftName === "Siang" ? 0 : 1;
  const totalShiftIndex = dayDiff * 2 + shiftIndexInDay;

  const guardIndex = positiveModulo(totalShiftIndex, guards.length);
  return guards[guardIndex];
}

function getActualGuard(date, shiftName, overrides) {
  const dateString = toDateKey(date);

  const override = overrides.find((item) => {
    return item.shift_date === dateString && item.shift_name === shiftName;
  });

  if (override) {
    return override.guard_name;
  }

  return getBaseGuard(date, shiftName);
}

function getDaysDiff(dateA, dateB) {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((a - b) / oneDay);
}

function positiveModulo(number, divisor) {
  return ((number % divisor) + divisor) % divisor;
}

function toDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function getDayName(date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long"
  }).format(date);
}

function setMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? "error" : "success";
}