import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Ban, Check, CheckCheck, Eye, ImagePlus, Maximize2, MessageSquarePlus, Send, Sparkles, X } from "lucide-react";
import { CITY, DISTRICTS } from "../data/city";
import { CAT_META, SEV_META, STATUS_META, chainOf, incidentById, type Incident, type Status } from "../data/incidents";
import { incidentStore, useIncidents } from "../data/store";
import { cx, hhmmss, relTime } from "../lib/util";
import { Drawer, Stat } from "./kit";
import { Badge, Btn, TONE } from "./ui";

/* ------------------------------------------------------------------ */
/*  Photo — image with a neutral "slot" fallback until the file exists */
/* ------------------------------------------------------------------ */

/**
 * Notification images live in public/bildirimler/<slug>.jpg. Until the user drops the file in, a neutral camera slot
 * with the expected file name is shown in the same box. `bg` images (blurred backdrop) simply disappear.
 */
export function Photo({ src, alt = "", className, label, bg }: { src: string; alt?: string; className?: string; label?: string; bg?: boolean }) {
  // try the given .jpg, then the same name as .png (ChatGPT exports png), then the slot
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [src]);
  const bad = step >= 2;
  const cur = step === 1 ? src.replace(/\.jpg$/i, ".png") : src;
  const setBad = () => setStep((x) => (x === 0 && /\.jpg$/i.test(src) ? 1 : 2));
  if (bad && bg) return null;
  if (bad)
    return (
      <div className={cx(className, "flex flex-col items-center justify-center gap-1 overflow-hidden bg-[radial-gradient(ellipse_at_center,#13283b,#08131f)] p-2 text-center text-white/70")}>
        <ImagePlus className="size-[18%] max-h-10 min-h-4 text-[#D4A017]/80" strokeWidth={1.5} />
        {label && <span className="line-clamp-1 max-w-full text-[clamp(9px,1.4cqw,13px)] font-semibold">{label}</span>}
        <span className="line-clamp-1 max-w-full font-mono text-[clamp(8px,1.1cqw,11px)] text-white/45">{src.replace(/^\//, "")}</span>
      </div>
    );
  return <img src={cur} alt={alt} aria-hidden={bg || undefined} decoding="async" className={className} draggable={false} onError={setBad} />;
}

/* ------------------------------------------------------------------ */
/*  Shot — the CCTV image of a notification (overlays are baked in)    */
/* ------------------------------------------------------------------ */

export function Shot({
  inc,
  className,
  onClick,
  zoom = true,
}: {
  inc: Incident;
  className?: string;
  onClick?: () => void;
  zoom?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cx("group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-black", onClick && "cursor-pointer", className)}
    >
      <Photo src={inc.img} bg className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-xl" />
      <Photo src={inc.img} alt={inc.title} label={inc.cam} className="absolute inset-0 size-full object-contain" />
      {onClick && zoom && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <Maximize2 size={15} />
          </span>
        </span>
      )}
    </div>
  );
}

/** Fullscreen image viewer. */
export function Lightbox({ inc, onClose }: { inc: Incident; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4" onClick={onClose}>
      <Photo src={inc.img} alt={inc.title} label={inc.cam} className="aspect-[16/10] max-h-[88vh] w-[min(1100px,92vw)] max-w-full rounded-lg object-contain" />
      <div className="mt-3 text-center text-[13px] font-semibold text-white">
        {inc.no}. {inc.title} · {inc.cam} · {hhmmss(inc.at)}
      </div>
      <button className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10 text-white" aria-label="kapat">
        <X size={16} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Context: open any incident from anywhere                           */
/* ------------------------------------------------------------------ */

const Ctx = createContext<{ open: (id: string) => void }>({ open: () => {} });
export const useOpenIncident = () => useContext(Ctx).open;

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      open: (x: string) => {
        incidentStore.markRead(x);
        setId(x);
      },
    }),
    []
  );
  return (
    <Ctx.Provider value={value}>
      {children}
      {id && <IncidentDrawer id={id} onClose={() => setId(null)} onSwitch={setId} />}
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Chain: related notifications of the same story, in time order      */
/* ------------------------------------------------------------------ */

export function ChainStrip({ inc, onPick }: { inc: Incident; onPick: (id: string) => void }) {
  const chain = chainOf(inc);
  if (chain.length < 2) return null;
  return (
    <div>
      <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-mute">Olay zinciri · {chain.length} kare</h4>
      <div className={cx("grid gap-2", chain.length === 2 ? "grid-cols-2" : chain.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
        {chain.map((c) => (
          <button key={c.id} onClick={() => onPick(c.id)} className="text-left">
            <Shot inc={c} zoom={false} className={cx(c.id === inc.id ? "ring-2 ring-accent" : "opacity-75 hover:opacity-100")} />
            <div className="mt-1 flex items-center gap-1 text-[10.5px]">
              <span className="num font-bold text-ink">{hhmmss(c.at)}</span>
              <span className="truncate text-mute">{c.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Vertical timeline of a chain with thumbnails. */
export function ChainTimeline({ chain, onPick }: { chain: Incident[]; onPick?: (id: string) => void }) {
  return (
    <ol className="relative space-y-3 border-l border-line pl-4">
      {chain.map((c) => {
        const tone = SEV_META[c.sev].tone;
        return (
          <li key={c.id} className="relative">
            <span className="absolute -left-[21px] top-1 size-2.5 rounded-full ring-2 ring-panel" style={{ background: TONE[tone].raw }} />
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="num text-[11px] font-bold text-mute">{hhmmss(c.at)} · {c.cam}</div>
                <div className={cx("text-[13px] font-semibold", c.sev === "critical" ? "text-danger" : "text-ink")}>{c.title}</div>
                {c.lines.map((l) => (
                  <div key={l} className="text-[11.5px] text-dim">
                    {l}
                  </div>
                ))}
              </div>
              <button onClick={onPick ? () => onPick(c.id) : undefined} className="w-44 shrink-0">
                <Shot inc={c} zoom={false} />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Operator actions                                                   */
/* ------------------------------------------------------------------ */

export function OperatorActions({ id, status }: { id: string; status: Status }) {
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const act = (s: Status) => incidentStore.setStatus(id, s);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Btn variant="solid" icon={CheckCheck} onClick={() => act("verified")} active={status === "verified"}>
          Doğrulandı
        </Btn>
        <Btn icon={Ban} onClick={() => act("false")} active={status === "false"}>
          Yanlış Alarm
        </Btn>
        <Btn icon={Send} onClick={() => act("review")} active={status === "review"}>
          Ekip Yönlendir
        </Btn>
        <Btn icon={Check} onClick={() => act("closed")} active={status === "closed"}>
          Çözüldü
        </Btn>
        <Btn icon={MessageSquarePlus} variant="outline" onClick={() => setNoteOpen((v) => !v)}>
          Not Ekle
        </Btn>
      </div>
      {noteOpen && (
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Not yazın…"
            className="h-8.5 min-w-0 flex-1 rounded-lg border border-line bg-panel2 px-3 text-[12px] text-ink outline-none focus:border-accent/50"
          />
          <Btn
            variant="solid"
            onClick={() => {
              if (!note.trim()) return;
              incidentStore.addNote(id, `${note.trim()} — Operatör`);
              setNote("");
              setNoteOpen(false);
            }}
          >
            Kaydet
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer                                                             */
/* ------------------------------------------------------------------ */

export function IncidentDrawer({ id, onClose, onSwitch }: { id: string; onClose: () => void; onSwitch: (id: string) => void }) {
  const all = useIncidents();
  const inc = all.find((i) => i.id === id) ?? (incidentById(id) as (typeof all)[number] | undefined);
  const nav = useNavigate();
  const [big, setBig] = useState(false);
  if (!inc) return null;
  const sev = SEV_META[inc.sev];
  const st = STATUS_META[inc.status];
  const pick = (x: string) => {
    incidentStore.markRead(x);
    onSwitch(x);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-[980px]"
      head={
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="num text-[11px] font-bold text-mute">
            #{inc.no} · {inc.id}
          </span>
          <Badge tone={sev.tone}>{sev.label}</Badge>
          <Badge tone={st.tone}>{st.label}</Badge>
          <Badge tone="mute">
            {CAT_META[inc.cat].emoji} {CAT_META[inc.cat].label}
          </Badge>
        </div>
      }
      title={inc.title}
      sub={`${inc.place} · ${inc.cam} · ${hhmmss(inc.at)} · ${relTime(inc.at)}`}
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <Shot inc={inc} onClick={() => setBig(true)} />
          <ChainStrip inc={inc} onPick={pick} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/8 p-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wide text-accent">Yönlendirilen sorumlu</div>
              <div className="mt-0.5 text-[15px] font-bold text-ink">{inc.unit}</div>
            </div>
            {inc.routedIn != null && (
              <div className="text-right">
                <div className="num text-[18px] font-bold text-accent">{inc.routedIn} sn</div>
                <div className="text-[10.5px] text-mute">tespit → sorumlu</div>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-line bg-panel2 p-3">
            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-mute">Görüntüden okunan</div>
            <dl className="space-y-1">
              {inc.facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[12px]">
                  <dt className="text-mute">{k}</dt>
                  <dd className="num text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-[12.5px] leading-relaxed text-dim">{inc.detail}</p>
          {inc.action !== "—" && (
            <div className={cx("rounded-xl px-3 py-2.5 ring-1", TONE.accent.bg, TONE.accent.ring)}>
              <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-accent">
                <Sparkles size={11} /> Önerilen aksiyon
              </div>
              <p className="text-[12px] leading-relaxed text-dim">{inc.action}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Olay ID" value={inc.id} />
            <Stat label="Firma" value={CITY.full} />
            <Stat label="Kamera" value={inc.cam.split(" · ")[0]} sub={inc.cam.split(" · ")[1]} />
            <Stat label="Zaman" value={hhmmss(inc.at)} sub={CITY.dayShort} />
            <Stat label="Bölüm" value={DISTRICTS.find((d) => d.id === inc.district)?.name ?? "—"} sub={inc.place} />
          </div>
        </div>
      </div>

      {inc.notes.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-mute">Operatör notları</h4>
          <div className="space-y-1.5">
            {inc.notes.map((n, i) => (
              <div key={i} className="rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] text-dim">
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <OperatorActions id={inc.id} status={inc.status} />
        <button
          onClick={() => {
            onClose();
            nav(CAT_META[inc.cat].to);
          }}
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:underline"
        >
          İlgili modüle git · {CAT_META[inc.cat].label} <ArrowRight size={12} />
        </button>
      </div>
      {big && <Lightbox inc={inc} onClose={() => setBig(false)} />}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/*  AlertCard — notification with image                                */
/* ------------------------------------------------------------------ */

export function AlertCard({ inc, compact, stacked }: { inc: Incident & { unread?: boolean }; compact?: boolean; stacked?: boolean }) {
  const open = useOpenIncident();
  const sev = SEV_META[inc.sev];

  if (stacked)
    return (
      <div className={cx("card overflow-hidden transition hover:border-accent/40", inc.unread && (inc.sev === "critical" ? "border-danger/50" : "border-warn/45"))}>
        <Shot inc={inc} onClick={() => open(inc.id)} className="rounded-none border-0" />
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="num grid size-5 place-items-center rounded bg-panel3 text-[10px] font-bold text-mute">{inc.no}</span>
            <Badge tone={sev.tone}>{sev.label}</Badge>
            <span className="num text-[11px] font-bold text-ink">{hhmmss(inc.at)}</span>
            {inc.unread && <span className="rec-dot ml-auto size-2 rounded-full bg-danger" />}
          </div>
          <p className="mt-1.5 text-[13.5px] font-bold leading-snug text-ink">{inc.title}</p>
          {inc.lines.map((l, i) => (
            <p key={i} className={cx("text-[11.5px] leading-snug", i === 0 ? "font-semibold text-dim" : "text-mute")}>
              {l}
            </p>
          ))}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate text-[10.5px] text-mute">
              {CAT_META[inc.cat].emoji} {inc.place}
            </span>
            <Btn size="sm" variant={inc.sev === "critical" ? "danger" : "outline"} onClick={() => open(inc.id)}>
              İncele
            </Btn>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={cx(
        "relative flex gap-3 rounded-xl border bg-panel2 p-2.5 transition hover:border-accent/40",
        inc.unread ? (inc.sev === "critical" ? "border-danger/45" : "border-warn/40") : "border-line"
      )}
    >
      {inc.unread && <span className={cx("absolute bottom-3 left-0 top-3 w-0.5 rounded-full", inc.sev === "critical" ? "bg-danger" : "bg-warn")} />}
      <button onClick={() => open(inc.id)} className={cx("shrink-0", compact ? "w-32" : "w-44 sm:w-56")}>
        <Shot inc={inc} zoom={false} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={sev.tone}>{sev.label}</Badge>
          <span className="num text-[11px] font-bold text-ink">{hhmmss(inc.at).slice(0, 5)}</span>
          <span className="text-[10.5px] text-mute">· {CAT_META[inc.cat].short}</span>
        </div>
        <p className="mt-1 text-[13px] font-bold leading-snug text-ink">{inc.title}</p>
        {inc.lines.map((l, i) => (
          <p key={i} className={cx("text-[11.5px] leading-snug", i === 0 ? "font-semibold text-dim" : "text-mute")}>
            {l}
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Btn size="sm" variant={inc.sev === "critical" ? "danger" : "outline"} icon={Eye} onClick={() => open(inc.id)}>
            İncele
          </Btn>
        </div>
      </div>
    </div>
  );
}

/** Grid of notification cards for a module page. */
export function AlertGrid({ items, cols = "md:grid-cols-2 xl:grid-cols-3" }: { items: Incident[]; cols?: string }) {
  const all = useIncidents();
  const list = items.map((i) => all.find((x) => x.id === i.id)!);
  return (
    <div className={cx("grid grid-cols-1 gap-3", cols)}>
      {list.map((i) => (
        <AlertCard key={i.id} inc={i} stacked />
      ))}
    </div>
  );
}
