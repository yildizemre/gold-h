/** GET /api/leads — admin listesi (header x-admin-key = ADMIN_KEY env). ?format=csv ile Excel'e uygun CSV. */
import { list } from "@vercel/blob";

export default async function handler(req, res) {
  const key = req.headers["x-admin-key"] || req.query.key;
  if (key !== (process.env.ADMIN_KEY || "emre1234")) return res.status(401).json({ ok: false, error: "Yetkisiz" });
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix: "leads/", cursor, limit: 1000 });
    for (const b of r.blobs) {
      try {
        out.push(await (await fetch(b.url, { cache: "no-store" })).json());
      } catch {
        /* skip broken */
      }
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
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
