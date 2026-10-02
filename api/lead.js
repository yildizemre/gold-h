/**
 * POST /api/lead — fuar QR formu.
 * 1) Lead'i Vercel Blob'a JSON olarak kaydeder (admin ekranı buradan okur)
 * 2) Hype Vision'a bildirim maili atar (yedek: lead asla kaybolmaz)
 * 3) Ziyaretçiye imzalı, HTML tanıtım + toplantı planlama maili atar
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, (opsiyonel) NOTIFY_TO, SITE_URL, BLOB_READ_WRITE_TOKEN
 */
import nodemailer from "nodemailer";
import { put } from "@vercel/blob";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function mailHtml(l, site) {
  const meet = `mailto:${process.env.SMTP_USER}?subject=${encodeURIComponent("Tanıtım toplantısı · " + l.company)}&body=${encodeURIComponent(
    `Merhaba Emre Bey,\n\n${l.company} için Hype Vision tanıtım toplantısı planlamak istiyoruz.\nUygun olduğumuz zamanlar: \n\n${l.name}\n${l.phone}`
  )}`;
  return `<!doctype html><html><body style="margin:0;background:#eef2f6;font-family:Segoe UI,Arial,sans-serif;color:#0f1e2d">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:28px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px -20px rgba(0,0,0,.35)">
<tr><td style="background:linear-gradient(120deg,#050F1C,#0B315A);padding:30px 32px">
<img src="${site}/logo-white.png" alt="Hype Vision" height="34" style="display:block;height:34px">
<div style="margin-top:22px;color:#16C6D9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Kuyum Üretim Zekâsı</div>
<div style="margin-top:8px;color:#fff;font-size:26px;font-weight:800;line-height:1.2">Atölyenizdeki her gram,<br><span style="color:#E8B931">kamerayla kayıt altında.</span></div>
</td></tr>
<tr><td style="padding:28px 32px 8px;font-size:15px;line-height:1.65">
<p style="margin:0 0 14px">Merhaba <b>${esc(l.name)}</b>,</p>
<p style="margin:0 0 14px">Standımıza uğradığınız ve <b>${esc(l.company)}</b> adına bilgi bıraktığınız için teşekkür ederiz. Mevcut CCTV kameralarınızla, ek sensör kurmadan şunları yapıyoruz:</p>
<table cellpadding="0" cellspacing="0" width="100%" style="font-size:14px">
${[
  ["⚖️", "Tartı & barkod izlenebilirlik", "Her tartım, barkod ve QR kabulü görüntüsüyle; gram farkı anında"],
  ["⚙️", "CNC makine denetimi", "Kapak açılışı, çevrim, tepsi sayımı — PLC olmadan"],
  ["🪙", "Takoz & hurda", "Tartılmadan çıkan kova, günlük metal dengesi"],
  ["🛡️", "Çevre çiti & mesai dışı giriş", "Gece ihlali saniyeler içinde güvenlikte"],
  ["📦", "Paketleme klibi", "Her sipariş kendi kanıt klibiyle sevk edilir"],
].map(([e, t, x]) => `<tr><td style="padding:7px 10px 7px 0;font-size:20px;vertical-align:top">${e}</td><td style="padding:7px 0"><b>${t}</b><br><span style="color:#5b6b7b">${x}</span></td></tr>`).join("")}
</table>
<p style="margin:18px 0 6px">Sizin atölyenize özel <b>30 dakikalık bir tanıtım toplantısı</b> planlamak isteriz. Size uygun zamanı bildirmeniz yeterli:</p>
</td></tr>
<tr><td align="center" style="padding:10px 32px 6px">
<a href="${meet}" style="display:inline-block;background:#16C6D9;color:#04161a;text-decoration:none;font-weight:800;font-size:15px;padding:14px 26px;border-radius:12px">📅 Tanıtım toplantısı planla</a>
&nbsp;
<a href="${site}/sunum" style="display:inline-block;background:#0B315A;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:12px">Sunumu incele →</a>
</td></tr>
<tr><td style="padding:26px 32px 30px">
<table cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e8ee;padding-top:18px;width:100%"><tr>
<td style="padding-top:18px;font-size:13px;line-height:1.6;color:#33475b">
<b style="font-size:15px;color:#0f1e2d">Emre Yıldız</b><br>Hype Vision<br>
<a href="mailto:emre.yildiz@hypevisionlab.com" style="color:#0e7f8c">emre.yildiz@hypevisionlab.com</a> · <a href="https://hypevisionlab.com" style="color:#0e7f8c">hypevisionlab.com</a><br>
<span style="color:#7a8a99">GTÜ Teknopark, Gebze / Kocaeli</span>
</td><td align="right" style="padding-top:18px"><img src="${site}/logo-dark.png" alt="Hype Vision" height="26" style="height:26px"></td>
</tr></table></td></tr>
</table>
<div style="font-size:11px;color:#8796a5;margin-top:14px">Bu e-postayı fuar standımızda bilgilerinizi paylaştığınız için aldınız.</div>
</td></tr></table></body></html>`;
}

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

  const site = process.env.SITE_URL || `https://${req.headers.host}`;
  const result = { saved: false, notified: false, welcomed: false };

  try {
    await put(`leads/${lead.at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 7)}.json`, JSON.stringify(lead), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    result.saved = true;
  } catch (e) {
    console.error("blob", e?.message);
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const tx = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const from = `"Emre Yıldız · Hype Vision" <${process.env.SMTP_USER}>`;
    try {
      await tx.sendMail({
        from,
        to: process.env.NOTIFY_TO || process.env.SMTP_USER,
        replyTo: lead.email,
        subject: `🟢 Yeni fuar lead'i · ${lead.company} · ${lead.name}`,
        text: `Ad Soyad: ${lead.name}\nFirma: ${lead.company}\nE-posta: ${lead.email}\nTelefon: ${lead.phone}\nToplantı: ${lead.meeting}\nNot: ${lead.note}\nZaman: ${lead.at}`,
      });
      result.notified = true;
    } catch (e) {
      console.error("notify", e?.message);
    }
    try {
      await tx.sendMail({ from, to: lead.email, subject: "Hype Vision · Kuyum üretiminde görüntü işleme — tanıtım toplantısı", html: mailHtml(lead, site) });
      result.welcomed = true;
    } catch (e) {
      console.error("welcome", e?.message);
    }
  }

  if (!result.saved && !result.notified) return res.status(500).json({ ok: false, error: "Kayıt şu an alınamadı, lütfen standa bildirin." });
  return res.status(200).json({ ok: true, ...result });
}
