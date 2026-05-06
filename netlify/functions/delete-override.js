import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return response(405, {
        error: "Method tidak diizinkan."
      });
    }

    const body = JSON.parse(event.body || "{}");

    const {
      adminPassword,
      shiftDate,
      shiftName
    } = body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return response(401, {
        error: "Password admin salah."
      });
    }

    if (!shiftDate || !shiftName) {
      return response(400, {
        error: "Tanggal dan shift wajib diisi."
      });
    }

    const allowedShifts = ["Siang", "Malam"];

    if (!allowedShifts.includes(shiftName)) {
      return response(400, {
        error: "Shift tidak valid."
      });
    }

    const { error } = await supabase
      .from("schedule_overrides")
      .delete()
      .eq("shift_date", shiftDate)
      .eq("shift_name", shiftName);

    if (error) {
      return response(500, {
        error: error.message
      });
    }

    return response(200, {
      success: true,
      message: "Jadwal dikembalikan ke jadwal otomatis."
    });
  } catch (error) {
    return response(500, {
      error: error.message
    });
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}