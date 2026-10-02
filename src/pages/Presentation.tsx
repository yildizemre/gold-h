/**
 * Sunum modu — Hype Vision × Altın / kuyum üreticisi.
 * 1600×900 sabit tuval, pencereye ölçeklenir. ← → / Space ile gezilir, Esc panele döner, F tam ekran.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileDown, LayoutDashboard, Maximize, Printer, X } from "lucide-react";
import { CAT_META, CATS, INCIDENTS, incidentByNo, incidentsOf, type Cat, type Incident } from "../data/incidents";
import { MODULES } from "../data/modules";
import { PROPOSALS } from "../data/proposals";
import { Photo } from "../components/incident";
import { CAM_STATS, CITY } from "../data/city";
import type { Tone as PanelTone } from "../components/ui";
import { hhmmss } from "../lib/util";

const CYAN = "#16C6D9";
const ORANGE = "#FA9628";
const W = 1600;
const H = 900;
/** `/sunum?pdf` renders every slide stacked, without animation — used to export the PDF deck. */
const PRINT = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("pdf");
/** `?pdf=10-19` prints only that slide range (1-based) — keeps headless screenshots under the texture limit. */
const AUTO_PRINT = PRINT && new URLSearchParams(window.location.search).has("yazdir");

const RANGE = (() => {
  const m = /^(\d+)-(\d+)$/.exec(new URLSearchParams(window.location.search).get("pdf") ?? "");
  return m ? [Number(m[1]) - 1, Number(m[2]) - 1] : [0, 999];
})();

type Tone = "cyan" | "red" | "amber" | "green";
const TONE_C: Record<Tone, string> = { cyan: CYAN, red: "#FF6B6B", amber: "#F6AE2D", green: "#2BD4A4" };

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

const d = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function Bg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: "#050F1C" }}>
      <div className="aurora absolute -right-40 -top-56 size-[900px] rounded-full opacity-50 blur-[120px]" style={{ background: "radial-gradient(circle, #0E6E86, transparent 65%)" }} />
      <div className="aurora-2 absolute -bottom-72 -left-52 size-[900px] rounded-full opacity-45 blur-[120px]" style={{ background: "radial-gradient(circle, #0B315A, transparent 65%)" }} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative size-full overflow-hidden text-white">
      <Bg />
      <div className="relative size-full">{children}</div>
    </div>
  );
}

function Kicker({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="rise mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.06] px-4 py-1.5 text-[15px] font-semibold tracking-wide text-white/85 backdrop-blur" style={d(delay)}>
      <span className="size-2 rounded-full" style={{ background: CYAN, boxShadow: `0 0 12px ${CYAN}` }} />
      {children}
    </div>
  );
}

function Title({ children, size = 60, delay = 80 }: { children: ReactNode; size?: number; delay?: number }) {
  return (
    <h1 className="rise font-extrabold leading-[1.04] tracking-[-0.03em]" style={{ fontSize: size, ...d(delay) }}>
      {children}
    </h1>
  );
}

function Glass({ children, className = "", delay = 0, glow }: { children: ReactNode; className?: string; delay?: number; glow?: string }) {
  return (
    <div
      className={`rise relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045] backdrop-blur-md ${className}`}
      style={{ ...d(delay), boxShadow: glow ? `0 20px 60px -30px ${glow}, inset 0 1px 0 rgba(255,255,255,.06)` : "inset 0 1px 0 rgba(255,255,255,.06)" }}
    >
      {glow && <span className="absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />}
      {children}
    </div>
  );
}

/** Animates the numeric part of "2.430 TL", "%96,8", "45 / 48" etc. */
function CountUp({ value }: { value: string }) {
  const m = /^([^\d]*)(\d[\d.,]*)(.*)$/.exec(value);
  const skip = PRINT || !m || value.includes(":") || /\d\s*\/\s*\d/.test(value) || value.includes("–");
  const target = skip ? 0 : Number(m![2].replace(/\./g, "").replace(",", "."));
  const decimals = skip ? 0 : (m![2].split(",")[1] ?? "").length;
  const [v, setV] = useState(skip ? target : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (skip) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [skip, target]);
  if (skip) return <>{value}</>;
  const s = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
  return (
    <>
      {m![1]}
      {s}
      {m![3]}
    </>
  );
}

function Kpi({ v, l, tone = "cyan", delay = 0, big }: { v: string; l: string; tone?: Tone; delay?: number; big?: boolean }) {
  const c = TONE_C[tone];
  return (
    <Glass delay={delay} glow={c} className="px-6 py-5">
      <div className="font-mono font-bold leading-none tracking-tight" style={{ color: c, fontSize: big ? 48 : 38 }}>
        <CountUp value={v} />
      </div>
      <div className="mt-2.5 text-[15px] leading-snug text-white/65">{l}</div>
    </Glass>
  );
}

function Pic({ inc, onZoom, className = "", delay = 0, compact, aspect = "16/10" }: { inc: Incident; onZoom: (i: Incident) => void; className?: string; delay?: number; compact?: boolean; aspect?: string }) {
  return (
    <button
      onClick={() => onZoom(inc)}
      className={`rise group relative block overflow-hidden rounded-[20px] bg-black text-left ring-1 ring-white/12 transition hover:ring-[#16C6D9]/70 ${className}`}
      style={{ ...d(delay), boxShadow: "0 30px 70px -35px rgba(22,198,217,.55)" }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
        <Photo src={inc.img} bg className="absolute inset-0 size-full scale-110 object-cover opacity-55 blur-2xl" />
        <Photo src={inc.img} alt={inc.title} label={inc.cam} className="absolute inset-0 size-full object-contain transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent ${compact ? "px-3 pb-2 pt-8" : "px-4 pb-3 pt-12"}`}>
        <div className={`flex items-center gap-2 font-bold text-white ${compact ? "text-[12.5px]" : "text-[15px]"}`}>
          <span className="grid size-6 shrink-0 place-items-center rounded-md font-mono text-[12px] text-[#04161a]" style={{ background: CYAN }}>
            {inc.no}
          </span>
          <span className="truncate">{inc.title}</span>
        </div>
        {!compact && (
          <div className="mt-0.5 font-mono text-[12.5px] text-white/65">
            {inc.place} · {hhmmss(inc.at)}
          </div>
        )}
      </div>
    </button>
  );
}

function Steps({ items, delay = 0 }: { items: string[]; delay?: number }) {
  return (
    <ol className="space-y-2.5">
      {items.map((b, k) => (
        <li key={b} className="rise flex items-start gap-3.5 text-[19px] leading-snug text-white/85" style={d(delay + k * 90)}>
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/[0.06] font-mono text-[13px] font-bold" style={{ color: CYAN }}>
            {k + 1}
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ol>
  );
}

function Output({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="rise relative overflow-hidden rounded-[20px] p-[1px]" style={{ ...d(delay), background: `linear-gradient(120deg, ${CYAN}, rgba(22,198,217,.1) 60%, ${ORANGE})` }}>
      <div className="rounded-[19px] bg-[#071A2C] px-5 py-4">
        <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: CYAN }}>
          Çıktı
        </div>
        <div className="text-[17px] leading-snug text-white/90">{children}</div>
      </div>
    </div>
  );
}

type ModuleProps = {
  kicker: string;
  title: ReactNode;
  lead: string;
  steps: string[];
  kpis: { v: string; l: string; tone?: Tone }[];
  output: ReactNode;
  imgs: number[];
  onZoom: (i: Incident) => void;
};

/** Module slide: story left, hero notification image + thumbnails right. */
function ModuleSlide({ kicker, title, lead, steps, kpis, output, imgs, onZoom }: ModuleProps) {
  const incs = imgs.map(incidentByNo);
  const [hero, ...rest] = incs;
  return (
    <Frame>
      <div className="grid size-full grid-cols-[560px_1fr] gap-14 px-20 pb-[76px] pt-[92px]">
        <div className="flex min-h-0 flex-col">
          <div>
            <Kicker>{kicker}</Kicker>
          </div>
          <Title size={46}>{title}</Title>
          <p className="rise mb-5 mt-4 text-[18px] leading-relaxed text-white/60" style={d(160)}>
            {lead}
          </p>
          <Steps items={steps} delay={240} />
          <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
            {kpis.map((k, i) => (
              <Kpi key={k.l} {...k} delay={420 + i * 80} />
            ))}
          </div>
          <div className="mt-3">
            <Output delay={600}>{output}</Output>
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-center gap-4">
          <Pic inc={hero} onZoom={onZoom} delay={200} aspect="16/8.6" />
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${rest.length}, minmax(0,1fr))` }}>
            {rest.map((i, k) => (
              <Pic key={i.id} inc={i} onZoom={onZoom} delay={320 + k * 100} compact />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/*  Slides                                                             */
/* ------------------------------------------------------------------ */

type SlideFn = (zoom: (i: Incident) => void, go: (to: string) => void) => ReactNode;

const toTone = (t?: PanelTone): Tone => (t === "danger" ? "red" : t === "warn" ? "amber" : t === "ok" ? "green" : "cyan");

function CityMark({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-5">
      <img src="/logo-white.png" alt="Hype Vision" style={{ height: size }} className="w-auto" />
      <span className="text-[26px] font-light text-white/40">×</span>
      <span className="inline-flex items-center rounded-xl bg-white/[0.07] px-4 py-2 font-bold text-white ring-1 ring-white/15" style={{ fontSize: size * 0.62 }}>
        {CITY.full}
      </span>
    </div>
  );
}

const GOLD = "#E8B931";

/** Copy for the 7 module slides — numbers come from the panel's module data. */
const MOD_COPY: Record<Cat, { title: ReactNode; steps: string[]; output: ReactNode; kpi: number[] }> = {
  trace: {
    title: (
      <>
        Her tartım, her barkod <span className="text-grad">görüntüsüyle kayıtlı</span>
      </>
    ),
    steps: ["Tartı ekranı ve barkod okutma anını aynı kayda bağlar", "Hedef bölümde QR ile kabulü doğrular", "Çıkış ↔ kabul gram farkını toleransla karşılaştırır", "Barkodsuz / QR'sız transferi anında bildirir"],
    output: <>Partinin bölümden bölüme yolculuğu tartı + barkod + klip ile kanıtlı; gram farkı nerede oluştuysa o an görülür.</>,
    kpi: [0, 2, 3, 4],
  },
  cnc: {
    title: (
      <>
        CNC kapağı <span className="text-grad">kaç kez açıldı?</span> Artık biliyorsunuz
      </>
    ),
    steps: ["Sensör / PLC olmadan kapak açılış-kapanış ve çevrimi izler", "Çevrim bitti ama kapak açılmadı — boşta bekleme süresi", "Çıkış tepsisindeki ürünü tek tek sayar, beklenenle karşılaştırır", "Çevrimsiz (ürünsüz) açılışı ve operatör yokluğunu bildirir"],
    output: <>TRAY-07 14:32'de 24/24, 14:36'da 23/24 → eksik ürün 4 dakikalık klip ile anında incelemede.</>,
    kpi: [0, 1, 2, 3],
  },
  staff: {
    title: (
      <>
        Personel makine başında <span className="text-grad">ne kadar duruyor?</span>
      </>
    ),
    steps: ["İstasyon başında çalışma pozisyonunda geçen süre", "Makine çalışırken başı boş kalan istasyon", "Mola ve vardiya başlangıç uyumu", "Bölüm / vardiya bazında verimlilik · yüz tanıma yok"],
    output: <>Hangi bölümün, hangi saatte, neden boş kaldığı ölçülü: CNC hattında doluluk %74 → hedef %82.</>,
    kpi: [0, 1, 2, 3],
  },
  scrap: {
    title: (
      <>
        Ne kadar takoz, ne kadar hurda — <span className="text-grad">gram gram</span>
      </>
    ),
    steps: ["Döküm sonrası takoz / yolluk tartımını kayda alır", "Bölüm bazında hurda oranını hesaplar", "Tartılmadan taşınan kova / kabı yakalar", "Günlük metal dengesini çıkarır"],
    output: <>Günün metal dengesi %99,96 · 1,9 g fark — farkın kaynağı (tartılmadan çıkan kova) görüntüsüyle belli.</>,
    kpi: [0, 1, 2, 3],
  },
  perimeter: {
    title: (
      <>
        Çitte ihlal olduğu an <span className="text-grad">güvenlik biliyor</span>
      </>
    ),
    steps: ["Çite tırmanma, atlama ve kesmeyi tespit eder", "Çit dışında şüpheli bekleyen kişi / aracı izler", "Devriye kontrol noktalarını doğrular", "Kedi, yaprak, far gibi yanlış alarmları eler"],
    output: <>02:14 kuzey çit ihlali → 3 sn'de güvenlik kulübesinde, ekip 2 dk'da sahada.</>,
    kpi: [1, 2, 3, 4],
  },
  afterhours: {
    title: (
      <>
        Mesai bitti — <span className="text-grad">güvenlik dışında kim içeride?</span>
      </>
    ),
    steps: ["Güvenlik üniformalı personeli diğerlerinden ayırır", "Mesai dışı yasak bölgeleri tanımlar", "Fazla mesai / erken giriş onayıyla eşleştirir", "Kasa koridoru için sıfır tolerans"],
    output: <>00:48'de kasa koridorunda üniformasız kişi → doğrulandı, sabah tutanak; onaysız fazla mesai anında bölüm sorumlusunda.</>,
    kpi: [0, 1, 2, 3],
  },
  packing: {
    title: (
      <>
        Her kutu <span className="text-grad">kendi klibiyle</span> sevk ediliyor
      </>
    ),
    steps: ["Tepsiden alınan ürünü ve kapatılan kutuyu sayar", "Sipariş / koli QR'ına bağlı klip oluşturur", "Sayım tutmazsa koli kapanmadan uyarır", "Kutuya girmeden masadan ayrılan ürünü yakalar"],
    output: <>Müşteri "eksik geldi" dediğinde sipariş klibi tek tıkla: son 30 günde 3 itiraz aynı gün kapandı.</>,
    kpi: [0, 1, 2, 3],
  },
};

const moduleSlide = (c: Cat): { name: string; section: string; render: SlideFn } => {
  const meta = CAT_META[c];
  const m = MODULES[c];
  const copy = MOD_COPY[c];
  return {
    name: meta.short,
    section: `Modül ${meta.no} / 7`,
    render: (zoom) => (
      <ModuleSlide
        kicker={`${meta.no} · ${meta.label}`}
        title={copy.title}
        lead={m.tagline}
        steps={copy.steps}
        kpis={copy.kpi.map((k) => ({ v: `${m.kpis[k].value}${m.kpis[k].unit ? ` ${m.kpis[k].unit}` : ""}`, l: m.kpis[k].label, tone: toTone(m.kpis[k].tone) }))}
        output={copy.output}
        imgs={incidentsOf(c).slice(0, 4).map((i) => i.no)}
        onZoom={zoom}
      />
    ),
  };
};

const JOURNEY = [
  ["08:42", "Döküm çıkışı", "Tartı 412,36 g + barkod · kamera anı kayda bağladı", CYAN],
  ["09:05", "CNC kabul", "QR okutuldu · 120 yüzük CNC hattında", CYAN],
  ["14:32", "CNC çıkış sayımı", "TRAY-07 · 24 / 24 · ERP ile eşleşti", CYAN],
  ["14:10", "Tezgâh → Cila", "Tartı + barkod · gram farkı yok", GOLD],
  ["16:30", "Paketleme kabul", "QR + tartı · tolerans içinde", GOLD],
  ["17:05", "Kutulama klibi", "120 ürün → 120 kutu · klip siparişe bağlandı", "#2BD4A4"],
] as const;

const PILOT = [
  { day: 1, t: "Keşif", x: "Kamera envanteri, tartı / barkod noktaları, öncelikli modüller" },
  { day: 7, t: "Kurulum", x: "Tesis içi edge sunucu, kamera ve tartı / ERP bağlantısı" },
  { day: 14, t: "Canlı bildirim", x: "Sorumlulara bildirim, rol bazlı panel, paketleme klipleri" },
  { day: 30, t: "Sonuç raporu", x: "Gram farkı, hurda, verimlilik etkisi · yaygınlaştırma" },
];

const SLIDES: { name: string; section: string; render: SlideFn }[] = [
  {
    name: "Kapak",
    section: "",
    render: () => {
      const stack = [4, 6, 3].map(incidentByNo);
      return (
        <Frame>
          <div className="grid size-full grid-cols-[1fr_560px] gap-6 px-24 py-20">
            <div className="flex flex-col">
              <div className="rise">
                <CityMark size={42} />
              </div>
              <div className="my-auto">
                <Kicker delay={120}>Kuyum Üretim Zekâsı · Altın Üreticileri İçin</Kicker>
                <Title size={78} delay={200}>
                  Atölyenizdeki her gram,
                  <br />
                  <span className="text-grad">kamerayla kayıt altında.</span>
                </Title>
                <p className="rise mt-8 max-w-[780px] text-[23px] leading-relaxed text-white/65" style={d(320)}>
                  Tartı ve barkoddan CNC kapağına, takoz ve hurdadan çevre çitine, mesai dışı girişten paketleme klibine kadar — mevcut kameralarınızı yapay zekâ ile 7 modülde ölçülebilir veriye ve kanıta dönüştürüyoruz.
                </p>
                <div className="rise mt-10 flex gap-3" style={d(440)}>
                  {["7 modül · tek platform", "Mevcut kameralar", "Görüntü tesiste kalır", "30 gün pilot"].map((t) => (
                    <span key={t} className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-[16px] font-semibold text-white/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rise text-[16px] text-white/45" style={d(520)}>
                Hype Vision · GTÜ Teknopark, Gebze · hypevisionlab.com
              </div>
            </div>
            <div className="relative" style={{ perspective: 1600 }}>
              {stack.map((inc, k) => (
                <div
                  key={inc.id}
                  className="rise absolute w-[480px] overflow-hidden rounded-[22px] ring-1 ring-white/15"
                  style={{
                    top: 30 + k * 230,
                    left: 20 + (k % 2) * 60,
                    transform: `rotateY(-16deg) rotateX(6deg) rotateZ(${k === 1 ? 2 : -2}deg)`,
                    boxShadow: "0 40px 90px -30px rgba(0,0,0,.8), 0 0 60px -20px rgba(232,185,49,.35)",
                    ...d(300 + k * 150),
                  }}
                >
                  <Photo src={inc.img} label={inc.title} className="aspect-[16/10] w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </Frame>
      );
    },
  },
  {
    name: "Hype Vision",
    section: "Biz kimiz",
    render: () => (
      <Frame>
        <div className="grid size-full grid-cols-[1fr_560px] gap-14 px-24 pb-[76px] pt-[92px]">
          <div className="flex flex-col">
            <div>
              <Kicker>Hype Vision</Kicker>
            </div>
            <Title size={60}>
              2020'den beri görüntü işleme ile <span className="text-grad">operasyon zekâsı</span>
            </Title>
            <p className="rise mt-6 text-[21px] leading-relaxed text-white/65" style={d(160)}>
              Sahadaki IP kameralardan gelen görüntüyü yapay zekâ ile analiz ediyor; güvenlik, verimlilik ve üretim süreçlerini otomatikleştiriyoruz. Ham video yerine{" "}
              <b className="text-white">anlamlandırılmış veri</b> üretiyoruz: bildirim, sayım, gram, klip ve rapor.
            </p>
            <div className="mt-auto grid grid-cols-2 gap-4">
              {[
                ["📹", "Mevcut kameralarınız", "Yeni kamera yatırımı yok · marka bağımsız (ONVIF / RTSP)"],
                ["🏭", "Tesis içinde kurulum", "Görüntü kendi sunucunuzda işlenir, dışarı çıkmaz"],
                ["⚖️", "Tartı · barkod · ERP", "Tartı, barkod / QR okuyucu ve ERP kayıtlarıyla eşleşir"],
                ["🔒", "KVKK uyumlu", "Yüz tanıma yok · istasyon ve bölge bazlı ölçüm"],
              ].map(([e, t, x], k) => (
                <Glass key={t} delay={260 + k * 80} className="flex gap-4 p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-[24px]">{e}</span>
                  <span>
                    <span className="block text-[19px] font-bold">{t}</span>
                    <span className="mt-1 block text-[15px] leading-snug text-white/60">{x}</span>
                  </span>
                </Glass>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <Kpi v="2020+" l="Saha deneyimi · endüstriyel yapay zekâ" delay={200} big />
            <Kpi v="7/24" l="Otomatik AI denetim — gece, mesai dışı, her istasyon" delay={300} big tone="green" />
            <Kpi v="0,1–3 sn" l="Olay anından bildirime tespit süresi" delay={400} big tone="amber" />
            <Glass delay={500} className="p-5 text-[17px] leading-relaxed text-white/70">
              Fabrika, banka ve perakendede kurduğumuz platformu <b className="text-white">kuyum ve altın üretimine</b> uyarladık.
            </Glass>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Problem",
    section: "Neden şimdi",
    render: () => (
      <Frame>
        <div className="size-full px-24 pb-[76px] pt-[92px]">
          <Kicker>Neden şimdi</Kicker>
          <Title size={56}>
            Altın üretiminde kayıp <span className="text-grad">gramla başlar</span> — ve çoğu zaman görülmez.
          </Title>
          <div className="mt-10 grid grid-cols-4 gap-4">
            {[
              ["⚖️", "Gram farkı", "Bölümler arası fark çıkıyor, nerede oluştuğu bilinmiyor."],
              ["🏷️", "Barkodsuz transfer", "Tepsi tartılmadan, okutulmadan el değiştiriyor."],
              ["⚙️", "CNC sayımı", "Kapak kaç kez açıldı, kaç ürün işlendi — ERP'ye güven."],
              ["👷", "Verimlilik", "Makine başı boş kalma süresi ölçülmüyor."],
              ["🪙", "Takoz & hurda", "Tartılmadan taşınan kova, metal dengesini bozuyor."],
              ["🛡️", "Çevre çiti", "Gece ihlali sabah kayıttan aranarak bulunuyor."],
              ["🌙", "Mesai dışı", "Güvenlik dışında kimin içeride olduğu bilinmiyor."],
              ["📦", "Paketleme", "Müşteri 'eksik geldi' dediğinde kanıt yok."],
            ].map(([e, t, x], k) => (
              <Glass key={t} delay={180 + k * 60} className="p-6">
                <div className="text-[34px]">{e}</div>
                <div className="mt-3 text-[21px] font-bold">{t}</div>
                <div className="mt-1.5 text-[15.5px] leading-snug text-white/58">{x}</div>
              </Glass>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-[18px]">
            <Glass delay={700} className="p-5 text-white/55">
              <b className="text-white/85">Bugün —</b> elle tutulan tartı defteri, örneklemeli kontrol, olay sonrası kayıt izleme, kanıtı aranarak bulunan görüntü.
            </Glass>
            <Glass delay={780} glow={GOLD} className="p-5 text-white/85">
              <b style={{ color: GOLD }}>Hype Vision ile —</b> her tartım ve transfer görüntülü, 7/24 denetim, saniyeler içinde bildirim, siparişe bağlı klip.
            </Glass>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Nasıl çalışır",
    section: "Mimari",
    render: () => (
      <Frame>
        <div className="size-full px-24 pb-[76px] pt-[92px]">
          <Kicker>Mimari</Kicker>
          <Title size={58}>
            Kamera + tartı + barkod → <span className="text-grad">yapay zekâ → doğru sorumlu</span>
          </Title>
          <div className="relative mt-16">
            <div className="grow-x absolute left-[8%] right-[8%] top-[64px] h-[2px]" style={{ background: `linear-gradient(90deg, ${CYAN}, rgba(22,198,217,.2), ${GOLD})`, ...d(300) }} />
            <div className="relative grid grid-cols-4 gap-6">
              {[
                ["📹", "Mevcut kameralar", `${CAM_STATS.total} kamera · CNC, tezgâh, tartı, paketleme, kasa, çevre çiti`, "RTSP / ONVIF"],
                ["⚖️", "Tartı · barkod · QR · ERP", "Tartı değeri, okutulan barkod ve ERP kaydı görüntüyle aynı zaman çizgisinde", "Entegrasyon"],
                ["🧠", "Hype Vision AI · Edge", "Kişi, ürün, kapak, tepsi, kutu, çit ihlali tespiti · tesis içi sunucuda", "Görüntü dışarı çıkmaz"],
                ["📲", "İlgili sorumlu", "Üretim, kalite, güvenlik, İK, kasa · panel + mobil + WhatsApp", "Klip · kanıtlı kapanış"],
              ].map(([e, t, x, tag], k) => (
                <div key={t} className="rise flex flex-col items-center text-center" style={d(380 + k * 140)}>
                  <span className="grid size-[128px] place-items-center rounded-[30px] border border-white/12 bg-[#081A2C] text-[54px] shadow-[0_0_60px_-20px_rgba(22,198,217,.6)]">{e}</span>
                  <div className="mt-6 text-[24px] font-bold">{t}</div>
                  <div className="mt-2 text-[16px] leading-snug text-white/60">{x}</div>
                  <span className="mt-4 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 font-mono text-[13px]" style={{ color: CYAN }}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid grid-cols-4 gap-4">
            <Kpi v={`${CAM_STATS.total}`} l="mevcut kamera · tek platformda" delay={900} />
            <Kpi v="0,1–3 sn" l="olay anından bildirime" tone="amber" delay={980} />
            <Kpi v="7" l="modül · tek panel" tone="green" delay={1060} />
            <Kpi v="0" l="sensör / yeni kamera yatırımı" delay={1140} />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "7 modül",
    section: "Platform",
    render: (_z, go) => (
      <Frame>
        <div className="size-full px-20 pb-[70px] pt-[88px]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Kicker>Tek platform</Kicker>
              <Title size={52}>
                <span className="text-grad">7 modül</span>, tek panel, mevcut kameralar
              </Title>
            </div>
            <div className="rise pb-2 text-right text-[17px] text-white/55" style={d(200)}>
              Modüller tek tek veya birlikte devreye alınır.
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-4">
            {CATS.map((c, k) => {
              const meta = CAT_META[c];
              const inc = incidentsOf(c)[0];
              return (
                <button key={c} onClick={() => go(meta.to)} className="rise group overflow-hidden rounded-[18px] bg-white/[0.04] text-left ring-1 ring-white/10 transition hover:ring-[#16C6D9]/60" style={d(200 + k * 70)}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Photo src={inc.img} alt={meta.label} label={inc.cam} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-xl font-mono text-[17px] font-bold text-white shadow-lg" style={{ background: meta.color }}>
                      {meta.no}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-[18px] font-bold leading-tight">{meta.label}</div>
                    <div className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-white/55">{MODULES[c].tagline}</div>
                  </div>
                </button>
              );
            })}
            <button onClick={() => go("/oneriler")} className="rise flex flex-col justify-center rounded-[18px] border border-dashed p-6 text-left transition hover:bg-white/[0.04]" style={{ borderColor: `${GOLD}88`, ...d(200 + 7 * 70) }}>
              <div className="text-[44px] font-extrabold leading-none" style={{ color: GOLD }}>
                +12
              </div>
              <div className="mt-3 text-[19px] font-bold">Öneri modül</div>
              <div className="mt-1 text-[14px] leading-snug text-white/60">Sadece CCTV ile eklenebilecek analizler — onayınızla devreye girer.</div>
            </button>
          </div>
        </div>
      </Frame>
    ),
  },
  ...CATS.map(moduleSlide),
  {
    name: "Bir partinin yolculuğu",
    section: "İzlenebilirlik",
    render: (zoom) => (
      <Frame>
        <div className="grid size-full grid-cols-[1fr_640px] gap-14 px-24 pb-[76px] pt-[92px]">
          <div className="flex flex-col">
            <div>
              <Kicker>PRT-24817 · 120 adet 14 ayar yüzük</Kicker>
            </div>
            <Title size={50}>
              Bir partinin yolculuğu: <span className="text-grad">her adım tartılı, okutulu, görüntülü</span>
            </Title>
            <ol className="relative mt-9 space-y-4 border-l-2 border-white/10 pl-8">
              {JOURNEY.map(([t, h, x, c], k) => (
                <li key={h} className="rise relative" style={d(240 + k * 110)}>
                  <span className="absolute -left-[42px] top-1 size-4 rounded-full ring-4 ring-[#050F1C]" style={{ background: c, boxShadow: `0 0 16px ${c}` }} />
                  <div className="flex items-baseline gap-4">
                    <span className="w-[80px] shrink-0 font-mono text-[18px] font-bold" style={{ color: c }}>
                      {t}
                    </span>
                    <span>
                      <span className="block text-[21px] font-bold">{h}</span>
                      <span className="block text-[16px] text-white/60">{x}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <Pic inc={incidentByNo(1)} onZoom={zoom} delay={200} aspect="16/10" />
            <div className="grid grid-cols-2 gap-4">
              <Pic inc={incidentByNo(2)} onZoom={zoom} delay={320} compact />
              <Pic inc={incidentByNo(19)} onZoom={zoom} delay={420} compact />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Kpi v="6" l="kontrol noktası" delay={500} />
              <Kpi v="±0,15 g" l="tolerans" delay={580} tone="amber" />
              <Kpi v="1 tık" l="partinin tüm klipleri" delay={660} tone="green" />
            </div>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Öneri modüller",
    section: "Size soruyoruz",
    render: (_z, go) => (
      <Frame>
        <div className="size-full px-20 pb-[70px] pt-[88px]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Kicker>Sadece CCTV ile · ek sensör yok</Kicker>
              <Title size={52}>
                Bunları da <span className="text-grad">ekleyelim mi?</span>
              </Title>
            </div>
            <div className="rise max-w-[460px] pb-2 text-right text-[17px] leading-snug text-white/60" style={d(200)}>
              Hiçbiri sizin onayınız olmadan açılmaz. Panelde her modül için <b className="text-white">“Evet, ekle”</b> deyip kameralara erişim yetkisini verirsiniz.
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-3.5">
            {PROPOSALS.map((p, k) => (
              <Glass key={p.id} delay={220 + k * 45} className="flex flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[17px] font-bold leading-tight">{p.title}</span>
                  {p.priority === "Yüksek" && (
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: `${GOLD}22`, color: GOLD }}>
                      öncelikli
                    </span>
                  )}
                </div>
                <div className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-white/58">{p.what}</div>
                <div className="mt-auto flex gap-2 pt-3 text-[12.5px] font-bold">
                  <span className="rounded-lg px-2.5 py-1 text-[#04161a]" style={{ background: CYAN }}>
                    Evet, ekle
                  </span>
                  <span className="rounded-lg border border-white/20 px-2.5 py-1 text-white/70">Şimdilik hayır</span>
                </div>
              </Glass>
            ))}
          </div>
          <div className="rise mt-6 flex justify-center" style={d(900)}>
            <button onClick={() => go("/oneriler")} className="rounded-2xl px-8 py-3.5 text-[19px] font-bold text-[#04161a] transition hover:brightness-110" style={{ background: GOLD, boxShadow: `0 20px 50px -18px ${GOLD}` }}>
              Panelde onay ekranını aç →
            </button>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Günün özeti",
    section: "Demo günü",
    render: () => (
      <Frame>
        <div className="size-full px-24 pb-[76px] pt-[92px]">
          <Kicker>{CITY.day} · demo günü</Kicker>
          <Title size={56}>
            Bir günde üretim izleme merkezine <span className="text-grad">ne düştü?</span>
          </Title>
          <div className="mt-10 grid grid-cols-4 gap-4">
            <Kpi v={`${INCIDENTS.length}`} l="görüntülü AI bildirimi" big delay={150} />
            <Kpi v={`${INCIDENTS.filter((i) => i.sev === "critical").length}`} l="kritik olay · güvenlik, CNC, hurda" big tone="red" delay={230} />
            <Kpi v="2,8 sn" l="ortalama tespit → sorumlu" big tone="amber" delay={310} />
            <Kpi v={`${CAM_STATS.online} / ${CAM_STATS.total}`} l="kamera online · analizde" big tone="green" delay={390} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <Kpi v="1.426" l="tartım + barkod kaydı görüntüyle eşleşti" delay={470} />
            <Kpi v="2.184" l="CNC kapak açılışı sayıldı" delay={530} />
            <Kpi v="3.912 g" l="takoz · geri eritmeye kayıtlı" tone="amber" delay={590} />
            <Kpi v="38" l="paketleme klibi · siparişe bağlı" tone="green" delay={650} />
          </div>
          <Glass delay={760} glow={GOLD} className="mt-6 p-6 text-[19px] leading-relaxed text-white/75">
            Gece kuzey çit ihlali, CNC çıkış tepsisindeki eksik ürün ve tartılmadan çıkan hurda kovası — üçü de <b className="text-white">kimse fark etmeden önce</b> ilgili sorumlunun ekranındaydı.
          </Glass>
          <div className="mt-5 grid grid-cols-7 gap-3">
            {CATS.map((c, k) => {
              const meta = CAT_META[c];
              const incs = incidentsOf(c);
              return (
                <div key={c} className="rise overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10" style={d(840 + k * 50)}>
                  <Photo src={incs[0].img} className="aspect-[4/3] w-full object-cover" />
                  <div className="px-3 py-2">
                    <div className="truncate text-[13px] font-bold">{meta.short}</div>
                    <div className="font-mono text-[12px] text-white/55">{incs.length} bildirim</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "KVKK & entegrasyon",
    section: "Güven",
    render: () => (
      <Frame>
        <div className="grid size-full grid-cols-2 gap-12 px-24 pb-[76px] pt-[92px]">
          <div>
            <Kicker>Veri güvenliği</Kicker>
            <Title size={50}>
              KVKK uyumlu, <span className="text-grad">kendi tesisinizde</span>
            </Title>
            <div className="mt-8 space-y-4">
              {[
                ["🔒", "Yüz tanıma yok", "Verimlilik istasyon bazlı, güvenlik üniforma / bölge bazlı ölçülür."],
                ["🏭", "Görüntü dışarı çıkmaz", "Analiz tesis içindeki edge sunucuda yapılır."],
                ["👥", "Rol bazlı erişim", "Üretim, kalite, güvenlik, İK yalnızca kendi modülünü görür."],
                ["🧾", "İz kaydı", "Kim, hangi klibi, ne zaman açtı — denetlenebilir."],
              ].map(([e, t, x], k) => (
                <Glass key={t} delay={200 + k * 80} className="flex items-center gap-5 px-6 py-5">
                  <span className="text-[32px]">{e}</span>
                  <span>
                    <span className="block text-[21px] font-bold">{t}</span>
                    <span className="block text-[16.5px] text-white/60">{x}</span>
                  </span>
                </Glass>
              ))}
            </div>
          </div>
          <div>
            <Kicker delay={100}>Entegrasyon</Kicker>
            <Title size={50} delay={160}>
              Mevcut sistemlerinize <span className="text-grad">bağlanır</span>
            </Title>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {["Hassas tartılar (RS-232 / TCP)", "Barkod & QR okuyucular", "ERP / üretim takip", "Mevcut VMS / NVR", "Kartlı geçiş sistemi", "Kasa & metal hesabı", "E-posta · SMS · WhatsApp", "Mobil bildirim uygulaması"].map((t, k) => (
                <div key={t} className="rise rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-[26px] text-[19px] font-semibold text-white/85" style={d(300 + k * 60)}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Pilot",
    section: "Sonraki adım",
    render: () => (
      <Frame>
        <div className="size-full px-24 pb-[76px] pt-[92px]">
          <Kicker>Pilot</Kicker>
          <Title size={58}>
            30 günde <span className="text-grad">kendi atölyenizde</span> görün
          </Title>
          <Glass delay={250} className="relative mt-12 px-10 pb-10 pt-12">
            <div className="relative mx-[12.5%] h-[8px] rounded-full bg-white/10">
              <div className="grow-x absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg, ${CYAN}, ${GOLD})`, ...d(500) }} />
              {PILOT.map((m, k) => (
                <span
                  key={m.day}
                  className="rise absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-[#071A2C] font-mono text-[15px] font-bold"
                  style={{ left: `${(k / (PILOT.length - 1)) * 100}%`, color: CYAN, borderColor: CYAN, ...d(650 + k * 120) }}
                >
                  {m.day}
                </span>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-4 gap-6 text-center">
              {PILOT.map((m, k) => (
                <div key={m.day} className="rise" style={d(800 + k * 120)}>
                  <div className="font-mono text-[14px] font-bold uppercase tracking-[0.18em]" style={{ color: CYAN }}>
                    {m.day}. gün
                  </div>
                  <div className="mt-1 text-[24px] font-bold">{m.t}</div>
                  <div className="mt-1.5 text-[16px] leading-snug text-white/60">{m.x}</div>
                </div>
              ))}
            </div>
          </Glass>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Glass delay={1000} className="p-6">
              <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.2em] text-white/50">Firmanızdan</div>
              <div className="text-[18px] leading-relaxed text-white/80">Kamera erişimi (RTSP), tartı / barkod veri çıkışı, bir sunucu alanı ve her bölümden bir irtibat kişisi.</div>
            </Glass>
            <Glass delay={1080} glow={CYAN} className="p-6">
              <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: CYAN }}>
                Hype Vision'dan
              </div>
              <div className="text-[18px] leading-relaxed text-white/80">Edge sunucu kurulumu, modül eğitimi, panel, sorumlu bildirimleri ve pilot sonu etki raporu.</div>
            </Glass>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 text-[17px] text-white/70">
            {["📹 Yeni kamera / sensör gerekmez", "🏭 Görüntü tesiste işlenir · KVKK uyumlu", "📊 Pilot sonunda ölçülmüş gram / hurda / verimlilik etkisi"].map((t, k) => (
              <div key={t} className="rise rounded-2xl border border-white/10 bg-black/20 px-5 py-4" style={d(1100 + k * 80)}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Frame>
    ),
  },
  {
    name: "Panele geçiş",
    section: "",
    render: (_z, go) => (
      <Frame>
        <div className="flex size-full flex-col items-center justify-center px-24 text-center">
          <div className="rise">
            <CityMark size={46} />
          </div>
          <div className="mt-14">
            <Title size={80} delay={150}>
              Şimdi paneli <span className="text-grad">birlikte inceleyelim.</span>
            </Title>
          </div>
          <p className="rise mt-6 text-[22px] text-white/60" style={d(280)}>
            Üretim Özeti · Bildirimler · 7 Modül · Öneri Modüller · Olay & Kanıt Merkezi · Raporlar
          </p>
          <div className="rise mt-12 flex gap-4" style={d(400)}>
            <button onClick={() => go("/")} className="rounded-2xl px-9 py-4 text-[21px] font-bold text-[#04161a] transition hover:brightness-110" style={{ background: CYAN, boxShadow: `0 20px 50px -15px ${CYAN}` }}>
              Panele geç →
            </button>
            <button onClick={() => go("/oneriler")} className="rounded-2xl border border-white/25 bg-white/[0.04] px-9 py-4 text-[21px] font-bold text-white transition hover:bg-white/10">
              Öneri modülleri onayla
            </button>
          </div>
          <div className="rise mt-16 text-[17px] text-white/45" style={d(500)}>
            30 gün pilot · hypevisionlab.com · GTÜ Teknopark, Gebze
          </div>
        </div>
      </Frame>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Player                                                             */
/* ------------------------------------------------------------------ */

function readHash() {
  const m = /^#(\d+)$/.exec(window.location.hash);
  return m ? Math.min(SLIDES.length - 1, Math.max(0, Number(m[1]) - 1)) : 0;
}

function PrintDeck() {
  useEffect(() => {
    document.documentElement.classList.add("print-mode");
    document.title = `Hype Vision Kuyum Üretim Sunumu · ${CITY.full}`;
    if (!AUTO_PRINT) return () => document.documentElement.classList.remove("print-mode");
    // wait for every slide image before opening the print dialog
    const imgs = [...document.images];
    let cancelled = false;
    Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => ((im.onload = r), (im.onerror = r))))))
      .then(() => document.fonts?.ready)
      .then(() => setTimeout(() => !cancelled && window.print(), 400));
    return () => {
      cancelled = true;
      document.documentElement.classList.remove("print-mode");
    };
  }, []);
  const noop = () => {};
  return (
    <div className="print-deck bg-[#02070D]">
      {RANGE[1] === 999 && (
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#040C15]/95 px-4 py-3 text-white backdrop-blur">
        <span className="mr-auto text-[13px] text-white/70">
          {CITY.full} · {SLIDES.length} slayt · Yazdır penceresinde <b className="text-white">Hedef: PDF olarak kaydet</b> seçin
        </span>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold text-[#04161a]" style={{ background: CYAN }}>
          <Printer size={15} /> Yazdır / PDF kaydet
        </button>
      </div>
      )}
      {SLIDES.map((sl, k) => (k < RANGE[0] || k > RANGE[1] ? null : (
        <div key={sl.name} className="relative overflow-hidden" style={{ width: W, height: H, breakAfter: "page" }}>
          {sl.render(noop, noop)}
          {k > 0 && k < SLIDES.length - 1 && (
            <>
              <div className="pointer-events-none absolute left-20 top-8 flex items-center gap-3">
                <img src="/logo-white.png" alt="" className="h-[22px] w-auto opacity-90" />
                <span className="text-white/30">×</span>
                <span className="text-[15px] font-semibold text-white/80">{CITY.full}</span>
              </div>
              <div className="pointer-events-none absolute right-20 top-8 flex items-center gap-3 font-mono text-[14px] text-white/45">
                <span className="uppercase tracking-[0.18em]">{sl.section}</span>
                <span className="text-white/80">
                  {String(k + 1).padStart(2, "0")}
                  <span className="text-white/35"> / {SLIDES.length}</span>
                </span>
              </div>
            </>
          )}
        </div>
      )))}
    </div>
  );
}

export default function Presentation() {
  if (PRINT) return <PrintDeck />;
  return <SlidePlayer />;
}

function PdfMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.07] px-3 text-[12px] font-bold hover:bg-white/15" aria-label="PDF indir">
        <FileDown size={15} /> <span className="hidden sm:inline">PDF indir</span>
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-[60px] z-50 overflow-hidden rounded-xl border border-white/10 bg-[#071A2C] shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-11 sm:right-0 sm:w-[320px]">
          <a href="/sunum?pdf&yazdir" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.06]">
            <Printer size={17} className="mt-0.5 shrink-0" style={{ color: CYAN }} />
            <span>
              <span className="block text-[13px] font-bold">{CITY.full} adıyla PDF</span>
              <span className="block text-[11.5px] text-white/55">Yazdır penceresi açılır → "PDF olarak kaydet"</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}

function SlidePlayer() {
  const nav = useNavigate();
  const [i, setI] = useState(readHash);
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState<Incident | null>(null);

  const go = useCallback((to: string) => nav(to), [nav]);
  const move = useCallback((dlt: number) => setI((x) => Math.min(SLIDES.length - 1, Math.max(0, x + dlt))), []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${i + 1}`);
  }, [i]);

  useEffect(() => {
    const onHash = () => setI(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, (window.innerHeight - 52) / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom) {
        if (e.key === "Escape") setZoom(null);
        return;
      }
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        move(1);
      } else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(SLIDES.length - 1);
      else if (e.key === "Escape") nav("/");
      else if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.().catch(() => {});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, nav, zoom]);

  const s = SLIDES[i];
  const chrome = i > 0 && i < SLIDES.length - 1;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#02070D] text-white">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "center" }} className="relative shrink-0 overflow-hidden rounded-xl shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
          <div key={i} className="slide-in size-full">
            {s.render(setZoom, go)}
          </div>

          {/* in-slide chrome */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-white/5">
            <div className="h-full transition-all duration-500" style={{ width: `${((i + 1) / SLIDES.length) * 100}%`, background: `linear-gradient(90deg, ${CYAN}, ${ORANGE})` }} />
          </div>
          {chrome && (
            <>
              <div className="pointer-events-none absolute left-20 top-8 flex items-center gap-3">
                <img src="/logo-white.png" alt="" className="h-[22px] w-auto opacity-90" />
                <span className="text-white/30">×</span>
                <span className="text-[15px] font-semibold text-white/80">{CITY.full}</span>
              </div>
              <div className="pointer-events-none absolute right-20 top-8 flex items-center gap-3 font-mono text-[14px] text-white/45">
                <span className="uppercase tracking-[0.18em]">{s.section}</span>
                <span className="text-white/80">
                  {String(i + 1).padStart(2, "0")}
                  <span className="text-white/35"> / {SLIDES.length}</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* control bar */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-t border-white/[0.06] bg-[#040C15] px-4">
        <div className="mx-auto hidden items-center gap-1.5 md:flex">
          {SLIDES.map((sl, k) => (
            <button
              key={sl.name}
              title={`${k + 1}. ${sl.name}`}
              onClick={() => setI(k)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: k === i ? 28 : 8, background: k === i ? CYAN : k < i ? "rgba(22,198,217,.45)" : "rgba(255,255,255,.18)" }}
            />
          ))}
        </div>
        <span className="mr-auto truncate font-mono text-[12px] text-white/50 md:mr-0">
          {i + 1} / {SLIDES.length}
          <span className="hidden sm:inline"> · {s.name}</span>
        </span>
        <PdfMenu />
        <button onClick={() => move(-1)} disabled={i === 0} className="grid size-8 place-items-center rounded-lg bg-white/[0.07] hover:bg-white/15 disabled:opacity-30" aria-label="Önceki">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => move(1)} disabled={i === SLIDES.length - 1} className="grid size-8 place-items-center rounded-lg bg-white/[0.07] hover:bg-white/15 disabled:opacity-30" aria-label="Sonraki">
          <ChevronRight size={16} />
        </button>
        <button onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} className="hidden size-8 place-items-center rounded-lg bg-white/[0.07] hover:bg-white/15 sm:grid" aria-label="Tam ekran" title="Tam ekran (F)">
          <Maximize size={15} />
        </button>
        <button onClick={() => nav("/")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold text-[#04161a]" style={{ background: CYAN }}>
          <LayoutDashboard size={14} /> Panele geç
        </button>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-6 backdrop-blur" onClick={() => setZoom(null)}>
          <Photo src={zoom.img} alt={zoom.title} label={zoom.cam} className="aspect-[16/10] max-h-[86vh] w-[min(1200px,92vw)] max-w-full rounded-2xl object-contain" />
          <div className="mt-3 text-center text-[15px] font-semibold">
            {zoom.no}. {zoom.title} · {zoom.place} · {hhmmss(zoom.at)}
          </div>
          <button className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/10" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
