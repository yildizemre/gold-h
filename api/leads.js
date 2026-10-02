/** GET /api/leads — admin listesi (header x-admin-key = ADMIN_KEY env). ?format=csv ile Excel'e uygun CSV. */
import { get, list } from "@vercel/blob";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || Object.entries(process.env).find(([k]) => k.endsWith("READ_WRITE_TOKEN"))?.[1];

async function readBlob(b) {
  for (const access of ["private", "public"]) {
    try {
      const r = await get(b.pathname, { access, ...(TOKEN ? { token: TOKEN } : {}) });
      if (r && r.statusCode === 200) return JSON.parse(await new Response(r.stream).text());
    } catch {
      /* try next */
    }
  }
  return JSON.parse(await (await fetch(b.url, { cache: "no-store" })).text());
}

export default async function handler(req, res) {
  const key = req.headers["x-admin-key"] || req.query.key;
  if (key !== (process.env.ADMIN_KEY || "emre1234")) return res.status(401).json({ ok: false, error: "Yetkisiz" });
  if (!TOKEN && !process.env.BLOB_STORE_ID)
    return res.status(500).json({ ok: false, error: "Vercel Blob bağlı değil: Vercel > Storage > Create > Blob > projeye bağla > Redeploy." });
  const out = [];
  let cursor;
  try {
  do {
    const r = await list({ prefix: "leads/", cursor, limit: 1000, ...(TOKEN ? { token: TOKEN } : {}) });
    for (const b of r.blobs) {
      try {
        out.push(await readBlob(b));
      } catch {
        /* skip broken */
      }
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Depo okunamadı: " + (e?.message || e) });
  }
  out.sort((a, b) => (a.at < b.at ? 1 : -1));
  if (req.query.format === "csv") {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "﻿Zaman;Ad Soyad;Firma;E-posta;Telefon;Toplantı;Not\n" + out.map((l) => [l.at, l.name, l.company, l.email, l.phone, l.meeting, l.note].map(q).join(";")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="hypevision-fuar-leadleri.csv"');
    return res.status(200).send(csv);
  }
  return res.status(200).json({ ok: true, leads: out });
}
