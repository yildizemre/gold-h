import { useState } from "react";
import {
  CameraOff,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Footprints,
  Gem,
  HardHat,
  KeyRound,
  PackageSearch,
  RotateCcw,
  ScanLine,
  ShieldQuestion,
  Smartphone,
  Sparkles,
  Truck,
  UserCheck,
  Vault,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../auth";
import { Chip } from "../components/kit";
import { Badge, Btn, PageHead } from "../components/ui";
import { CITY } from "../data/city";
import { PROPOSALS, proposalStore, useDecisions, type Decision, type Proposal } from "../data/proposals";
import { cx } from "../lib/util";

const ICONS: Record<string, LucideIcon> = { Vault, PackageSearch, ScanLine, Gem, HardHat, Flame, Footprints, CameraOff, Sparkles, Truck, Smartphone, UserCheck };

const now = () => new Date().toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

type Filter = "all" | "open" | Decision;

export default function Proposals() {
  const { user } = useAuth();
  const dec = useDecisions();
  const [filter, setFilter] = useState<Filter>("all");
  const [ask, setAsk] = useState<Proposal | null>(null);

  const count = (d: Decision) => PROPOSALS.filter((p) => dec[p.id]?.d === d).length;
  const open = PROPOSALS.filter((p) => !dec[p.id]).length;
  const list = PROPOSALS.filter((p) => {
    const d = dec[p.id]?.d;
    if (filter === "all") return true;
    if (filter === "open") return !d;
    return d === filter;
  });

  const canApprove = !!user?.approve;

  return (
    <div className="fade-up">
      <PageHead
        title="Öneri Modüller · Eklensin mi?"
        sub={`${CITY.full} · yalnızca mevcut CCTV kameralarıyla yapılabilecek ek analizler · her modül sizin yetkinizle devreye alınır`}
        right={<Badge tone={canApprove ? "ok" : "warn"} className="px-2 py-1">{canApprove ? "Onay yetkiniz var" : "Onaya gönderebilirsiniz"}</Badge>}
      />

      {/* intro */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-accent/25 bg-panel p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, var(--c-accent), transparent 70%)" }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/30">
            <ShieldQuestion size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-ink">Hype Vision size soruyor: bu modülleri de ekleyelim mi?</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
              Aşağıdaki analizler ek sensör ya da yeni kamera gerektirmeden, yalnızca mevcut kameralarınızla çalışır. Hiçbir modül sizin onayınız olmadan açılmaz;
              onayladığınız modül için hangi kameralara ve verilere erişileceği yetki ekranında tek tek gösterilir.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-4 gap-2 text-center">
            {[
              ["Öneri", PROPOSALS.length, "text-ink"],
              ["Onaylanan", count("approved"), "text-ok"],
              ["Bekleyen", count("pending"), "text-warn"],
              ["Hayır", count("declined"), "text-mute"],
            ].map(([l, v, c]) => (
              <div key={l as string} className="rounded-lg border border-line bg-panel2 px-2.5 py-1.5">
                <div className={cx("num text-[18px] font-bold", c as string)}>{v}</div>
                <div className="text-[10px] text-mute">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>Tümü · {PROPOSALS.length}</Chip>
        <Chip active={filter === "open"} onClick={() => setFilter("open")} tone="accent">Karar bekleyen · {open}</Chip>
        <Chip active={filter === "approved"} onClick={() => setFilter("approved")} tone="ok">Onaylanan · {count("approved")}</Chip>
        <Chip active={filter === "pending"} onClick={() => setFilter("pending")} tone="warn">Onaya gönderilen · {count("pending")}</Chip>
        <Chip active={filter === "declined"} onClick={() => setFilter("declined")}>Şimdilik hayır · {count("declined")}</Chip>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((p) => {
          const Icon = ICONS[p.icon] ?? Sparkles;
          const rec = dec[p.id];
          return (
            <div key={p.id} className={cx("card flex flex-col p-4", rec?.d === "approved" && "ring-1 ring-ok/40", rec?.d === "declined" && "opacity-70")}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold leading-snug text-ink">{p.title}</div>
                  <div className="mt-0.5 text-[11px] text-mute">{p.area}</div>
                </div>
                <Badge tone={p.priority === "Yüksek" ? "danger" : "mute"}>{p.priority}</Badge>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-dim">{p.what}</p>
              <ul className="mt-2 space-y-1">
                {p.how.map((h) => (
                  <li key={h} className="flex items-start gap-1.5 text-[11.5px] text-dim">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-ok" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-lg bg-panel2 px-2.5 py-2 text-[11.5px] leading-relaxed text-dim">
                <b className="text-ink">Kazanç: </b>
                {p.value}
              </div>

              <div className="mt-auto pt-3">
                {!rec && (
                  <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
                    <span className="flex-1 text-[12px] font-semibold text-ink">Bu modülü ekleyelim mi?</span>
                    <div className="flex gap-2">
                      <Btn variant="solid" icon={Check} onClick={() => setAsk(p)} className="flex-1 sm:flex-none">
                        Evet, ekle
                      </Btn>
                      <Btn icon={X} onClick={() => proposalStore.set(p.id, { d: "declined", by: user?.title ?? "", at: now() })} className="flex-1 sm:flex-none">
                        Şimdilik hayır
                      </Btn>
                    </div>
                  </div>
                )}
                {rec && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    {rec.d === "approved" && (
                      <Badge tone="ok" className="px-2 py-1">
                        <CheckCircle2 size={12} /> Yetki verildi · kurulum planlandı
                      </Badge>
                    )}
                    {rec.d === "pending" && (
                      <Badge tone="warn" className="px-2 py-1">
                        <Clock size={12} /> Yönetim onayı bekleniyor
                      </Badge>
                    )}
                    {rec.d === "declined" && (
                      <Badge tone="mute" className="px-2 py-1">
                        <XCircle size={12} /> Şimdilik eklenmeyecek
                      </Badge>
                    )}
                    <span className="text-[10.5px] text-mute">
                      {rec.by} · {rec.at}
                    </span>
                    <span className="ml-auto flex gap-1.5">
                      {rec.d === "pending" && canApprove && (
                        <Btn size="sm" variant="solid" icon={KeyRound} onClick={() => setAsk(p)}>
                          Yetki ver
                        </Btn>
                      )}
                      <Btn size="sm" icon={RotateCcw} onClick={() => proposalStore.set(p.id, null)}>
                        Geri al
                      </Btn>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {ask && <PermissionDialog p={ask} canApprove={canApprove} onClose={() => setAsk(null)} who={user?.title ?? ""} />}
    </div>
  );
}

function PermissionDialog({ p, canApprove, onClose, who }: { p: Proposal; canApprove: boolean; onClose: () => void; who: string }) {
  const [ok, setOk] = useState(false);
  const Icon = ICONS[p.icon] ?? Sparkles;
  const submit = () => {
    proposalStore.set(p.id, { d: canApprove ? "approved" : "pending", by: who, at: now() });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-label="kapat" />
      <div className="fade-up relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-2xl border border-line bg-panel p-5 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <KeyRound size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-accent">{canApprove ? "Yetki onayı" : "Onay talebi"}</div>
            <h3 className="text-[17px] font-bold leading-snug text-ink">{p.title}</h3>
          </div>
          <button onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-panel2 text-mute hover:text-ink" aria-label="kapat">
            <X size={15} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-panel2 p-3">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-bold text-ink">
            <Icon size={14} className="text-accent" /> Bu modül için erişilecek kaynaklar
          </div>
          <ul className="space-y-1.5">
            {p.needs.map((n) => (
              <li key={n} className="flex items-start gap-2 text-[12px] text-dim">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-ok" /> {n}
              </li>
            ))}
            <li className="flex items-start gap-2 text-[12px] text-dim">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-ok" /> Görüntü tesisinizdeki sunucuda işlenir, dışarı çıkmaz · yüz tanıma yok
            </li>
          </ul>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-3 text-[12.5px] leading-relaxed text-dim hover:border-accent/40">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--c-accent)]" />
          <span>
            {canApprove ? (
              <>
                <b className="text-ink">{CITY.full}</b> adına, yukarıdaki kameraların <b className="text-ink">{p.title}</b> modülü için analiz edilmesine yetki veriyorum.
              </>
            ) : (
              <>Bu modülün eklenmesi için yönetime onay talebi göndermek istiyorum.</>
            )}
          </span>
        </label>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Btn onClick={onClose}>Vazgeç</Btn>
          <button
            disabled={!ok}
            onClick={submit}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-[13px] font-bold text-[#04161a] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <KeyRound size={15} /> {canApprove ? "Yetki ver ve ekle" : "Onaya gönder"}
          </button>
        </div>
        <p className="mt-3 text-[10.5px] text-mute">Karar kaydı: {who} · istediğiniz zaman geri alınabilir.</p>
      </div>
    </div>
  );
}
