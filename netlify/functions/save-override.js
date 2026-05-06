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
      shiftName,
      guardName,
      note
    } = body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return response(401, {
        error: "Password admin salah."
      });
    }

    if (!shiftDate || !shiftName || !guardName) {
      return response(400, {
        error: "Tanggal, shift, dan petugas wajib diisi."
      });
    }

    const allowedShifts = ["Siang", "Malam"];
    const allowedGuards = ["Made", "Irfan", "Hendra"];

    if (!allowedShifts.includes(shiftName)) {
      return response(400, {
        error: "Shift tidak valid."
      });
    }

    if (!allowedGuards.includes(guardName)) {
      return response(400, {
        error: "Nama petugas tidak valid."
      });
    }

    const { data, error } = await supabase
      .from("schedule_overrides")
      .upsert(
        {
          shift_date: shiftDate,
          shift_name: shiftName,
          guard_name: guardName,
          note: note || null
        },
        {
          onConflict: "shift_date,shift_name"
        }
      )
      .select()
      .single();

    if (error) {
      return response(500, {
        error: error.message
      });
    }

    return response(200, {
      success: true,
      data
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