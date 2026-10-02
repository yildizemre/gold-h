import { useNavigate } from "react-router-dom";
import { ArrowRight, BellRing, CheckCircle2, Download, HardHat, Route, ShieldAlert, Sparkles, Timer, Video } from "lucide-react";
import { Chart, Legend, RankBars } from "../components/charts";
import { AlertGrid, Shot } from "../components/incident";
import { ChartCard, KpiCard, SectionTitle } from "../components/kit";
import { Badge, Btn, Card, CardHead, PageHead, RichText, Table, Td, TONE, Tr } from "../components/ui";
import { CAM_STATS, CITY, DISTRICTS, UNITS } from "../data/city";
import { CAT_META, CATS, INCIDENTS, incidentsOf } from "../data/incidents";
import { MODULES } from "../data/modules";
import { useIncidents } from "../data/store";
import { cx, n } from "../lib/util";
import { LeadQR } from "../components/LeadQR";

const sevCount = (s: string) => INCIDENTS.filter((i) => i.sev === s).length;
const routed = INCIDENTS.filter((i) => i.routedIn != null);
const AVG_ROUTE = routed.reduce((a, b) => a + (b.routedIn ?? 0), 0) / routed.length;

export const AI_BRIEF = [
  `Bugün **${INCIDENTS.length} görüntülü AI bildirimi** üretildi: ${sevCount("critical")} kritik, ${sevCount("warning")} uyarı, ${sevCount("info")} bilgi. Bildirimler ortalama **${n(AVG_ROUTE, 1)} saniyede** ilgili sorumluya ulaştı.`,
  "**Adet doğru, gram yanlış:** TRAY-077'de 20/20 ürün ama **−2,65 g**; TRAY-024'te 24/24 ürün ama **−1,72 g**.",
  "**TRAY-018 rotadan çıkıp yetkisiz bölgeye** girdi; 15:46'da **PERSON-014 yüksek değerli ürün alanına** yetkisiz girdi.",
  "**FIRE-BOX-02 yerinden yetkisiz taşındı** (15:34); OBJECT-191 kontrollü ürün alanı dışına çıktı.",
  "CNC-04 çıkışında TRAY-07'de **1 ürün eksik** (24 → 23); transfer istasyonunda **18 → 17**; paketlemede **12 → 11**.",
  "Tartı-01 önünde **4 tepsi kuyrukta**, ortalama bekleme **08:42** — darboğaz tartıda.",
  "PACKAGE-018 ağırlık ve mühür doğrulanarak **kasaya teslim edildi** (16:18).",
];

const ACTIONS = [
  { t: "TRAY-077 ve TRAY-024 · gram farkını tek tek tartarak incele", to: "/izlenebilirlik", tone: "danger" as const },
  { t: "FIRE-BOX-02'yi yerine al, taşıyanla görüş", to: "/takoz-hurda", tone: "danger" as const },
  { t: "PERSON-014 kritik bölge girişi · kayda al", to: "/cevre-guvenlik", tone: "danger" as const },
  { t: "Tartı-01'e ikinci operatör · kuyruk 4 tepsi", to: "/personel", tone: "warn" as const },
  { t: "Yeni CCTV modüllerini incele · 12 öneri", to: "/oneriler", tone: "accent" as const },
];

const HOURS = Array.from({ length: 19 }, (_, i) => i);
const HOURLY = HOURS.map((h) => {
  const at = INCIDENTS.filter((i) => i.at.getHours() === h);
  return {
    t: `${String(h).padStart(2, "0")}:00`,
    crit: at.filter((i) => i.sev === "critical").length,
    warn: at.filter((i) => i.sev === "warning").length,
    info: at.filter((i) => i.sev === "info").length,
  };
});
const HOURLY_SERIES = [
  { key: "crit", name: "Kritik", color: "#fb5d5d", type: "bar" as const, stackId: "a", barSize: 16 },
  { key: "warn", name: "Uyarı", color: "#f6ae2d", type: "bar" as const, stackId: "a", barSize: 16 },
  { key: "info", name: "Bilgi", color: "#18d5e8", type: "bar" as const, stackId: "a", barSize: 16 },
];

/** Headline value of each module for the module strip. */
const HEADLINE: Record<string, number> = { trace: 3, cnc: 2, staff: 0, scrap: 3, perimeter: 1, afterhours: 0, packing: 2 };

export default function Dashboard() {
  const nav = useNavigate();
  const all = useIncidents();
  const critical = INCIDENTS.filter((i) => i.sev === "critical").sort((a, b) => b.at.getTime() - a.at.getTime());
  const solved = all.filter((i) => i.status === "closed").length;
  const open = all.filter((i) => i.status === "new" || i.status === "review").length;

  const unitRows = UNITS.map((u) => ({ label: u, value: INCIDENTS.filter((i) => i.unit === u).length }))
    .filter((u) => u.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="fade-up">
      <PageHead
        title="Üretim Özeti"
        sub={`${CITY.full} · ${CITY.center} · ${CITY.day} · 00:00–18:20 · ${CAM_STATS.total} kamera`}
        right={
          <>
            <Btn icon={BellRing} variant="outline" onClick={() => nav("/notifications")}>
              {INCIDENTS.length} bildirim
            </Btn>
            <Btn icon={Download} onClick={() => nav("/reports")}>
              Rapor
            </Btn>
          </>
        }
      />

      <div className="mb-4 flex justify-end">
        <LeadQR size={96} />
      </div>

      {/* AI summary */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-accent/25 bg-panel p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, var(--c-accent), transparent 70%)" }} />
        <div className="relative grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/30">
                <Sparkles size={16} />
              </span>
              <span className="text-[14px] font-bold text-ink">Hype Vision AI · Günün Üretim Özeti</span>
              <Badge tone="accent">18:20 itibarıyla</Badge>
              <Badge tone="danger">{sevCount("critical")} kritik</Badge>
            </div>
            <ul className="space-y-1.5">
              {AI_BRIEF.map((s, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-dim">
                  <span className={cx("mt-[7px] size-1.5 shrink-0 rounded-full", i === 0 ? "bg-ok" : "bg-accent/60")} />
                  <RichText value={s} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-panel2 p-3">
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-mute">Önerilen aksiyonlar</div>
            <div className="space-y-1.5">
              {ACTIONS.map((a) => (
                <button
                  key={a.t}
                  onClick={() => nav(a.to)}
                  className="group flex w-full items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-2 text-left text-[12px] font-medium text-ink transition hover:border-accent/40"
                >
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: TONE[a.tone].raw }} />
                  <span className="min-w-0 flex-1">{a.t}</span>
                  <ArrowRight size={13} className="shrink-0 text-mute transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="AI bildirimi · bugün" value={`${INCIDENTS.length}`} sub={`${sevCount("critical")} kritik · ${sevCount("warning")} uyarı`} icon={BellRing} onClick={() => nav("/notifications")} />
        <KpiCard label="Kritik olay" value={`${sevCount("critical")}`} sub="güvenlik · CNC · hurda · izlenebilirlik" icon={ShieldAlert} tone="danger" alert onClick={() => nav("/incidents")} />
        <KpiCard label="Ort. tespit → sorumlu" value={n(AVG_ROUTE, 1)} unit="sn" sub="kimse fark etmeden" icon={Route} tone="accent" />
        <KpiCard label="Çözülen / açık" value={`${solved}`} unit={`/ ${open} açık`} sub="kanıtlı kapanış" icon={CheckCircle2} tone="ok" onClick={() => nav("/incidents")} />
        <KpiCard label="Kamera altyapısı" value={`${CAM_STATS.online}`} unit={`/ ${CAM_STATS.total}`} sub={`${CAM_STATS.warning} uyarı · ${CAM_STATS.offline} çevrimdışı`} icon={Video} tone="warn" onClick={() => nav("/cameras")} />
        <KpiCard label="Personel verimliliği" value="%83" sub="istasyon bazlı · hedef %80" icon={HardHat} tone="violet" onClick={() => nav("/personel")} />
      </div>

      {/* Module strip */}
      <SectionTitle>6 modül · bugün</SectionTitle>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATS.map((c) => {
          const meta = CAT_META[c];
          const incs = incidentsOf(c);
          const k = MODULES[c].kpis[HEADLINE[c]];
          const crit = incs.filter((i) => i.sev === "critical").length;
          return (
            <button key={c} onClick={() => nav(meta.to)} className="card group overflow-hidden text-left transition hover:border-accent/40">
              <div className="relative">
                <Shot inc={incs[0]} className="rounded-none border-0" zoom={false} />
                <span className="num absolute left-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-[13px] font-bold text-white shadow-lg" style={{ background: meta.color }}>
                  {meta.no}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-ink">{meta.label}</span>
                  <ArrowRight size={14} className="shrink-0 text-mute transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={cx("num text-[20px] font-bold", TONE[k.tone ?? "accent"].text)}>{k.value}</span>
                  {k.unit && <span className="num text-[11.5px] font-semibold text-dim">{k.unit}</span>}
                  <span className="truncate text-[11px] text-mute">{k.label}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge tone="mute">{incs.length} bildirim</Badge>
                  {crit > 0 && <Badge tone="danger">{crit} kritik</Badge>}
                </div>
              </div>
            </button>
          );
        })}
        <button onClick={() => nav("/oneriler")} className="card group flex flex-col justify-center border-dashed p-5 text-left transition hover:border-accent/50">
          <span className="num text-[34px] font-bold text-accent">+12</span>
          <span className="mt-1 text-[14px] font-bold text-ink">Öneri modül · eklensin mi?</span>
          <span className="mt-1 text-[12px] leading-relaxed text-mute">Kasa çift kişi kuralı, gözetimsiz altın, çıkış kontrolü, kamera sabotajı… Yalnızca CCTV ile, sizin yetkinizle devreye girer.</span>
          <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-accent">Onay ekranını aç <ArrowRight size={13} /></span>
        </button>
      </div>

      <SectionTitle right={<button onClick={() => nav("/notifications")} className="text-[11px] font-semibold text-accent">Tüm bildirimler →</button>}>
        Günün kritik bildirimleri · {critical.length}
      </SectionTitle>
      <div className="mb-5">
        <AlertGrid items={critical} cols="md:grid-cols-2 xl:grid-cols-4" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <ChartCard title="Saatlik bildirim akışı" sub="Önem derecesine göre · 00:00–18:20" icon={Timer} right={<Legend series={HOURLY_SERIES} />}>
          <Chart data={HOURLY} series={HOURLY_SERIES} height={240} stacked />
        </ChartCard>
        <Card>
          <CardHead title="Sorumlu bazında yönlendirme" sub="Bildirim, görüntüsüyle ilgili sorumlunun ekranına ve telefonuna düşer" icon={Route} />
          <RankBars items={unitRows} unit=" olay" />
        </Card>
      </div>

      <Card>
        <CardHead title="Bölüm özeti" sub="Kamera, personel ve bugünkü bildirimler" />
        <Table head={["Bölüm", "Kamera", "Personel", "Bildirim", "Kritik", "Öne çıkan"]}>
          {DISTRICTS.map((d) => {
            const incs = INCIDENTS.filter((i) => i.district === d.id);
            const crit = incs.filter((i) => i.sev === "critical");
            const top = crit[0] ?? incs.find((i) => i.sev === "warning") ?? incs[0];
            return (
              <Tr key={d.id} onClick={() => nav(`/incidents?m=${d.id}`)}>
                <Td className="font-semibold text-ink">{d.name}</Td>
                <Td className="num">{d.cams}</Td>
                <Td className="num">{n(d.staff)}</Td>
                <Td className="num font-semibold text-ink">{incs.length}</Td>
                <Td>{crit.length ? <Badge tone="danger">{crit.length}</Badge> : <span className="text-mute">—</span>}</Td>
                <Td>{top ? `${CAT_META[top.cat].emoji} ${top.title}` : "—"}</Td>
              </Tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
