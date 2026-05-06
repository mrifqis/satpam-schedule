import "./style.css";

const adminPasswordEl = document.querySelector("#adminPassword");
const shiftDateEl = document.querySelector("#shiftDate");
const shiftNameEl = document.querySelector("#shiftName");
const guardNameEl = document.querySelector("#guardName");
const noteEl = document.querySelector("#note");
const saveButton = document.querySelector("#saveButton");
const deleteButton = document.querySelector("#deleteButton");
const messageEl = document.querySelector("#message");

const today = new Date();
shiftDateEl.value = toDateKey(today);

saveButton.addEventListener("click", saveOverride);
deleteButton.addEventListener("click", deleteOverride);

async function saveOverride() {
  const adminPassword = adminPasswordEl.value;
  const shiftDate = shiftDateEl.value;
  const shiftName = shiftNameEl.value;
  const guardName = guardNameEl.value;
  const note = noteEl.value;

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

    setMessage("Perubahan jadwal berhasil disimpan.");
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function deleteOverride() {
  const adminPassword = adminPasswordEl.value;
  const shiftDate = shiftDateEl.value;
  const shiftName = shiftNameEl.value;

  const confirmed = confirm(
    `Kembalikan jadwal ${shiftDate} shift ${shiftName} ke jadwal otomatis?`
  );

  if (!confirmed) {
    return;
  }

  setMessage("Menghapus perubahan manual...");

  try {
    const res = await fetch("/.netlify/functions/delete-override", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adminPassword,
        shiftDate,
        shiftName
      })
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Gagal menghapus perubahan.");
    }

    setMessage("Perubahan manual berhasil dihapus. Jadwal kembali otomatis.");
  } catch (error) {
    setMessage(error.message, true);
  }
}

function setMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? "error" : "success";
}

function toDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}