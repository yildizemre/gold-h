/**
 * POST /api/lead — fuar QR formu. Lead'i Vercel Blob'a JSON olarak kaydeder (e-posta gönderilmez).
 * Env: BLOB_READ_WRITE_TOKEN (Vercel Blob bağlanınca otomatik), ADMIN_KEY (admin listesi için)
 */
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const lead = {
    name: String(b.name || "").trim().slice(0, 120),
    company: String(b.company || "").trim().slice(0, 160),
    email: String(b.email || "").trim().slice(0, 160),
    phone: String(b.phone || "").trim().slice(0, 40),
    note: String(b.note || "").trim().slice(0, 600),
    meeting: String(b.meeting || "").trim().slice(0, 80),
    at: new Date().toISOString(),
  };
  if (!lead.name || !lead.company || !/^\S+@\S+\.\S+$/.test(lead.email) || lead.phone.length < 7)
    return res.status(400).json({ ok: false, error: "Lütfen tüm alanları doldurun." });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN yok: Vercel > Storage > Blob store oluşturup projeye bağlayın, sonra Redeploy.");
    return res.status(500).json({ ok: false, error: "Kayıt deposu bağlı değil (Vercel Blob). Lütfen standa bildirin." });
  }
  const result = { saved: false };

  const path = `leads/${lead.at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 7)}.json`;
  let lastErr = "";
  // 3 deneme · store private ya da public olabilir, ikisini de dene
  for (let i = 0; i < 3 && !result.saved; i++) {
    for (const access of ["private", "public"]) {
      if (result.saved) break;
      try {
        await put(path, JSON.stringify(lead), { access, contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
        result.saved = true;
      } catch (e) {
        lastErr = e?.message || String(e);
        console.error("blob", access, lastErr);
      }
    }
  }
  if (!result.saved) return res.status(500).json({ ok: false, error: "Kayıt şu an alınamadı: " + lastErr });
  return res.status(200).json({ ok: true, ...result });
}
