import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { DEMO_ROLES, useAuth } from "../auth";
import { CityChip, Logo } from "../components/Layout";
import { CITY } from "../data/city";
import { Shot } from "../components/incident";
import { incidentByNo } from "../data/incidents";
import { cx } from "../lib/util";

const STILLS = [4, 6, 3, 5].map(incidentByNo);

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [roleId, setRoleId] = useState(DEMO_ROLES[1].id);
  const role = DEMO_ROLES.find((r) => r.id === roleId)!;

  useEffect(() => {
    document.title = `Hype Vision Kuyum Üretim · ${CITY.full}`;
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login(roleId);
    nav("/");
  };

  return (
    <div className="relative min-h-full overflow-x-hidden bg-bg text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--c-accent)_14%,transparent),transparent_60%)]" />

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 pb-1 pt-5 sm:px-8 lg:px-12">
        <Logo height={34} />
        <CityChip size="lg" />
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] items-center gap-8 px-4 pb-10 pt-4 sm:px-8 lg:grid-cols-[1.15fr_440px] lg:gap-16 lg:px-12 lg:pt-8">
        <div className="hidden lg:block">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-accent">kuyum üretim zekâsı</p>
          <h1 className="max-w-[580px] text-[40px] font-bold leading-[1.1] tracking-tight xl:text-[44px]">
            Atölyenizdeki her gram, kamerayla kayıt altında.
          </h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-dim">
            Tartı ve barkoddan CNC kapağına, takoz ve hurdadan çevre çitine, paketleme klibinden mesai dışı girişe — mevcut kameralarınızı 7 modülde ölçülebilir veriye ve kanıta dönüştürüyoruz.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {STILLS.map((s) => (
              <Shot key={s.id} inc={s} className="rounded-2xl shadow-[0_10px_30px_-18px_rgba(15,30,45,0.45)]" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-8">
            {[
              { v: "7", t: "modül · tek platform" },
              { v: "72", t: "mevcut kamera · yeni yatırım yok" },
              { v: "23", t: "görüntülü AI bildirim türü" },
            ].map((s) => (
              <div key={s.t}>
                <div className="num text-[26px] font-bold text-accent">{s.v}</div>
                <div className="mt-0.5 text-[12px] text-mute">{s.t}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="card w-full rounded-[24px] p-5 shadow-[0_28px_80px_-32px_rgba(15,30,45,0.35)] sm:p-7">
          <h2 className="text-[24px] font-bold tracking-tight">Panele giriş</h2>
          <p className="mt-1 text-[13px] text-mute">Rolünü seç, menü ve ekranlar otomatik düzenlenir.</p>

          <div className="mt-5 grid grid-cols-1 gap-2">
            {DEMO_ROLES.map((r) => {
              const active = r.id === roleId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleId(r.id)}
                  className={cx(
                    "flex min-h-[54px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                    active ? "border-accent bg-accent/8 ring-1 ring-accent/25" : "border-line bg-panel2 hover:border-accent/40"
                  )}
                >
                  <span className={cx("num grid size-10 shrink-0 place-items-center rounded-xl text-[12px] font-bold", active ? "bg-accent text-[#04161a]" : "bg-panel text-mute ring-1 ring-line")}>
                    {r.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("block truncate text-[13.5px] font-semibold", active ? "text-accent" : "text-ink")}>{r.title}</span>
                    <span className="block truncate text-[11.5px] text-mute">{r.scope}</span>
                  </span>
                  {active && <ArrowRight size={16} className="shrink-0 text-accent" />}
                </button>
              );
            })}
          </div>

          <label className="mt-5 block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-mute">E-posta</span>
            <input readOnly value={role.email} className="num mt-1.5 h-11 w-full rounded-xl border border-line bg-panel2 px-3.5 text-[13.5px] text-ink outline-none" />
          </label>
          <label className="mt-3 block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-mute">Şifre</span>
            <input type="password" defaultValue="demo" className="mt-1.5 h-11 w-full rounded-xl border border-line bg-panel2 px-3.5 text-[14px] tracking-widest text-ink outline-none focus:border-accent" />
          </label>

          <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-bold text-[#04161a] transition hover:brightness-110 active:scale-[0.99]">
            <LogIn size={17} /> Giriş yap
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-mute">
            <Sparkles size={12} className="text-accent" /> Demo ortamı · şifre: demo
          </p>
        </form>
      </div>
    </div>
  );
}
