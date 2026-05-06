import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export async function handler(event) {
  try {
    const month = Number(event.queryStringParameters?.month);
    const year = Number(event.queryStringParameters?.year);

    if (!month || !year) {
      return response(400, {
        error: "Parameter month dan year wajib diisi."
      });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("schedule_overrides")
      .select("*")
      .gte("shift_date", startDate)
      .lte("shift_date", endDate)
      .order("shift_date", { ascending: true });

    if (error) {
      return response(500, { error: error.message });
    }

    return response(200, {
      overrides: data
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