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
const calendarEl = document.querySelector("#calendar");
const summaryEl = document.querySelector("#summary");

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

loadSchedule();

async function loadSchedule() {
  const month = Number(monthSelect.value);
  const year = Number(yearInput.value);

  try {
    calendarEl.innerHTML = "<p>Memuat jadwal...</p>";

    const res = await fetch(`/.netlify/functions/get-schedule?month=${month}&year=${year}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Gagal mengambil jadwal.");
    }

    currentOverrides = json.overrides || [];

    renderCalendar(year, month, currentOverrides);
    renderSummary(year, month, currentOverrides);
  } catch (error) {
    calendarEl.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

function renderCalendar(year, month, overrides) {
  calendarEl.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayName = getDayName(date);

    const card = document.createElement("div");
    card.className = "day-card";

    const title = document.createElement("h3");
    title.textContent = `${dayName}, ${day} ${monthNames[month - 1]} ${year}`;
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