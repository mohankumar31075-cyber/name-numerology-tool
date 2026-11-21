/**
 * Client for https://hinducalendar.app/mcp
 * Same engine as HinduCalendar app — for accurate WhatsApp replies.
 */

export const MCP_URL = "https://hinducalendar.app/mcp";

export const CITIES: Record<string, { lat: number; lon: number; tz: string }> = {
  Bengaluru: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  Bangalore: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  Ujjain: { lat: 23.1765, lon: 75.7885, tz: "Asia/Kolkata" },
  Mumbai: { lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  Delhi: { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  Chennai: { lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
  Hyderabad: { lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" },
  Mysuru: { lat: 12.2958, lon: 76.6394, tz: "Asia/Kolkata" },
  Kolkata: { lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
  Pune: { lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
};

async function mcpCall(name: string, args: Record<string, unknown>) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "MCP error");
  const text = json.result?.content?.[0]?.text;
  if (!text) throw new Error("Empty MCP response");
  return JSON.parse(text);
}

function toIst(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export async function getPanchangReport(opts: {
  date: string;
  city?: string;
  lat?: number;
  lon?: number;
  lang?: string;
}) {
  const city = opts.city || "Bengaluru";
  const loc = CITIES[city] || CITIES.Bengaluru;
  const lat = opts.lat ?? loc.lat;
  const lon = opts.lon ?? loc.lon;
  const lang = opts.lang || "en";

  const p = await mcpCall("get_panchang", {
    date: opts.date,
    lat,
    lon,
    tz: loc.tz,
    lang,
  });

  const lines = [
    `📅 *Panchang — ${opts.date}*`,
    `📍 ${city}`,
    ``,
    `*Tithi:* ${p.tithi?.name} (${p.paksha} Paksha)`,
    `  ends ~ ${toIst(p.tithi?.end_time)}`,
    `*Nakshatra:* ${p.nakshatra?.name}`,
    `  ends ~ ${toIst(p.nakshatra?.end_time)}`,
    `*Yoga:* ${p.yoga?.name}`,
    `*Karana:* ${p.karana?.name}`,
    `*Vaar:* ${p.vaar?.name}`,
    `*Maah:* ${p.month?.name} / ${p.month_purnimant_name} (Purnimant)`,
    ``,
    `☀️ Sunrise: ${toIst(p.sunrise)}`,
    `🌅 Sunset: ${toIst(p.sunset)}`,
    `🌙 Moonrise: ${toIst(p.moonrise)}`,
    `🌙 Moonset: ${toIst(p.moonset)}`,
    ``,
    `Sun: ${p.sun_sign?.name} · Moon: ${p.moon_sign?.name}`,
    `Ritu: ${p.ritu_name} · Ayana: ${p.ayan_name}`,
    `Vikram ${p.vikram_samvat} · Shaka ${p.shaka_samvat}`,
    ``,
    `_Source: hinducalendar.app engine_`,
  ];

  return { raw: p, whatsappText: lines.join("\n"), city, date: opts.date };
}

export async function getMuhurtaReport(opts: {
  timeIso: string;
  city?: string;
  fullDay?: boolean;
  lang?: string;
}) {
  const city = opts.city || "Bengaluru";
  const loc = CITIES[city] || CITIES.Bengaluru;
  const m = await mcpCall("get_muhurta", {
    time: opts.timeIso,
    lat: loc.lat,
    lon: loc.lon,
    lang: opts.lang || "en",
    full_day: !!opts.fullDay,
  });

  const lines = [
    `🕰 *Muhurta / Choghadiya — ${city}*`,
    `Time: ${opts.timeIso}`,
    ``,
    m.sunrise ? `Sunrise: ${toIst(m.sunrise)}` : null,
    m.sunset ? `Sunset: ${toIst(m.sunset)}` : null,
    m.current_lagna ? `Current Lagna: ${JSON.stringify(m.current_lagna)}` : null,
    m.current_choghadiya ? `Choghadiya: ${JSON.stringify(m.current_choghadiya)}` : null,
    m.current_hora ? `Hora: ${JSON.stringify(m.current_hora)}` : null,
    ``,
    `_Source: hinducalendar.app_`,
  ].filter(Boolean) as string[];

  return { raw: m, whatsappText: lines.join("\n"), city };
}

export async function getBirthDetailsReport(opts: {
  timeIso: string;
  city?: string;
  lat?: number;
  lon?: number;
}) {
  const city = opts.city || "Bengaluru";
  const loc = CITIES[city] || CITIES.Bengaluru;
  const b = await mcpCall("get_birth_details", {
    time: opts.timeIso,
    lat: opts.lat ?? loc.lat,
    lon: opts.lon ?? loc.lon,
    ayanamsa: "Lahiri",
  });

  const lines = [
    `⭐ *Birth details (Janma)*`,
    `Time: ${opts.timeIso}`,
    `Place: ${city}`,
    ``,
    `*Nakshatra:* ${b.nakshatra?.name || b.nakshatra}`,
    `*Pada / Naam akshar:* ${b.pada?.naam_akshar || b.pada?.index || "—"}`,
    `*Chandra Rashi (Moon):* ${b.chandra_rashi?.name || b.chandra_rashi}`,
    `*Lagna Rashi:* ${b.lagna_rashi?.name || b.lagna_rashi}`,
    ``,
    `_Source: hinducalendar.app kundali engine_`,
  ];

  return { raw: b, whatsappText: lines.join("\n"), city };
}

export async function getFestivalReport(opts: { year: number; festival?: string; city?: string }) {
  const city = opts.city || "Ujjain";
  const loc = CITIES[city] || CITIES.Ujjain;
  const f = await mcpCall("get_festival_dates", {
    year: opts.year,
    festival: opts.festival,
    lat: loc.lat,
    lon: loc.lon,
  });

  const list = Array.isArray(f) ? f : f.festivals || f.results || [f];
  const lines = [
    `🪔 *Festivals ${opts.year}*${opts.festival ? ` — ${opts.festival}` : ""}`,
    ``,
    ...list.slice(0, 25).map((item: Record<string, unknown>) => {
      const name = item.name || item.festival || "Festival";
      const date = item.date || item.start || "";
      return `• ${name}: ${date}`;
    }),
    ``,
    `_Source: hinducalendar.app_`,
  ];

  return { raw: f, whatsappText: lines.join("\n") };
}
