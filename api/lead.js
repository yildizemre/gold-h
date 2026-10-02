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

  const result = { saved: false };

  // 3 deneme: fuar ağında anlık kopmalara karşı
  for (let i = 0; i < 3 && !result.saved; i++) try {
    await put(`leads/${lead.at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 7)}.json`, JSON.stringify(lead), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    result.saved = true;
  } catch (e) {
    console.error("blob", e?.message);
  }

  if (!result.saved) return res.status(500).json({ ok: false, error: "Kayıt şu an alınamadı, lütfen standa bildirin." });
  return res.status(200).json({ ok: true, ...result });
}
