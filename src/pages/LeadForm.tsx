import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

/** Public form opened from the fair QR (/iletisim). Works on any phone, no login. */
export default function LeadForm() {
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", meeting: "Bu hafta", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Hype Vision · İletişim";
    document.documentElement.classList.add("light");
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErr("");
    // local backup in case the network drops on the fair floor
    try {
      const q = JSON.parse(localStorage.getItem("hvg.leadBackup") || "[]");
      q.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem("hvg.leadBackup", JSON.stringify(q));
    } catch {
      /* ignore */
    }
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Gönderilemedi");
      setState("done");
    } catch (x) {
      setErr((x as Error).message);
      setState("error");
    }
  };

  const inp = "mt-1.5 h-12 w-full rounded-xl border border-line bg-panel2 px-3.5 text-[15px] text-ink outline-none focus:border-accent";

  return (
    <div className="min-h-full bg-bg text-ink">
      <div className="bg-[linear-gradient(120deg,#050F1C,#0B315A)] px-5 pb-10 pt-7 text-white">
        <div className="mx-auto max-w-[520px]">
          <img src="/logo-white.png" alt="Hype Vision" className="h-8 w-auto" />
          <div className="mt-6 text-[12px] font-bold uppercase tracking-[0.18em] text-[#16C6D9]">Kuyum Üretim Zekâsı</div>
          <h1 className="mt-2 text-[27px] font-extrabold leading-tight">
            Atölyenizdeki her gram, <span className="text-[#E8B931]">kamerayla kayıt altında.</span>
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">Bilgilerinizi bırakın; sizinle iletişime geçelim ve atölyenize özel bir tanıtım toplantısı planlayalım.</p>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-[520px] px-4 pb-10">
        {state === "done" ? (
          <div className="card p-6 text-center">
            <CheckCircle2 size={44} className="mx-auto text-ok" />
            <h2 className="mt-3 text-[21px] font-bold">Teşekkürler {f.name.split(" ")[0]}!</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-dim">
              Bilgileriniz bize ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçip tanıtım toplantısını planlayacak.
            </p>
            <a href="/sunum" className="mt-5 inline-flex h-11 items-center rounded-xl bg-accent px-5 text-[14px] font-bold text-[#04161a]">
              Sunumu incele →
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-3.5 p-5">
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">Ad Soyad</span>
              <input required value={f.name} onChange={set("name")} autoComplete="name" className={inp} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">Firma adı</span>
              <input required value={f.company} onChange={set("company")} autoComplete="organization" className={inp} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">E-posta</span>
              <input required type="email" value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" className={inp} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">Telefon</span>
              <input required type="tel" minLength={7} value={f.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" placeholder="05xx xxx xx xx" className={inp} />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">Tanıtım toplantısı için uygun zaman</span>
              <select value={f.meeting} onChange={set("meeting")} className={inp}>
                {["Bu hafta", "Gelecek hafta", "Bu ay içinde", "Önce e-posta ile bilgi"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-bold uppercase tracking-wide text-mute">Not (isteğe bağlı)</span>
              <textarea value={f.note} onChange={set("note")} rows={2} className={inp.replace("h-12", "") + " py-2.5"} />
            </label>
            {state === "error" && <p className="rounded-lg bg-danger/10 px-3 py-2 text-[13px] text-danger">{err}</p>}
            <button disabled={state === "sending"} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-bold text-[#04161a] disabled:opacity-60">
              {state === "sending" ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} Gönder
            </button>
            <p className="text-center text-[11px] leading-relaxed text-mute">Bilgileriniz yalnızca Hype Vision tarafından sizinle iletişim kurmak için kullanılır.</p>
          </form>
        )}
      </div>
    </div>
  );
}
