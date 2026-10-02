/**
 * Per-module content for the 7 module pages. Every page is built from the same template
 * (ModulePage): KPI row, a day chart, a ranked list, an operational table and the module's image notifications.
 */
import type { SeriesDef } from "../components/charts";
import type { Tone } from "../components/ui";
import type { Cat } from "./incidents";

export type ModuleDef = {
  cat: Cat;
  tagline: string;
  units: string[];
  intro: string;
  capabilities: string[];
  kpis: { label: string; value: string; unit?: string; sub: string; tone?: Tone; delta?: string; good?: boolean }[];
  chart: { title: string; sub: string; data: Record<string, number | string>[]; series: SeriesDef[]; ref?: { y: number; label: string } };
  rank: { title: string; sub: string; unit?: string; items: { label: string; value: number; tone?: Tone; hint?: string }[] };
  table: { title: string; sub: string; head: string[]; rows: { cells: string[]; tone?: Tone }[] };
  insight: string;
};

const HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];
const series = (cols: Record<string, number[]>, hours = HOURS) =>
  hours.map((h, i) => {
    const row: Record<string, number | string> = { t: `${h}:00` };
    for (const k in cols) row[k] = cols[k][i];
    return row;
  });

const BLUE = "#18d5e8";
const GOLD = "#D4A017";
const RED = "#fb5d5d";
const GREEN = "#16c79a";
const VIOLET = "#8b7cf6";

export const MODULES: Record<Cat, ModuleDef> = {
  trace: {
    cat: "trace",
    tagline: "Tartı + barkod + QR kayıtlarını kamera görüntüsüyle eşleştirir, partinin bölümden bölüme yolculuğunu kanıtlar",
    units: ["Kalite & İzlenebilirlik", "Kasa / Değerli Metal"],
    intro: "Ürün tartıya konduğunda, barkod okutulduğunda ve hedef bölümde QR ile kabul edildiğinde kamera o anı kayda bağlar. Gram farkı, barkodsuz transfer ve okutulmadan kabul edilen tepsi anında görünür.",
    capabilities: ["Tartı ekranı + barkod okutma anının klibi", "Çıkış ↔ kabul gram farkı kontrolü", "Barkodsuz / QR'sız transfer tespiti", "Parti bazında görüntülü izlenebilirlik zinciri"],
    kpis: [
      { label: "Tartım + barkod kaydı", value: "1.426", sub: "bugün · 7 tartı noktası", tone: "accent" },
      { label: "Bölümler arası transfer", value: "318", sub: "QR ile kabul edilen", tone: "ok" },
      { label: "Kamerayla eşleşme", value: "%99,1", sub: "tartı ↔ görüntü", tone: "ok", delta: "+%0,6", good: true },
      { label: "Gram farkı uyarısı", value: "4", sub: "tolerans ±0,15 g", tone: "warn" },
      { label: "Transfer sayım farkı", value: "1", sub: "18 → 17 · transfer istasyonu · 14:41", tone: "danger" },
    ],
    chart: {
      title: "Saatlik tartım ve transfer",
      sub: "Tartım kaydı · QR ile kabul edilen transfer",
      data: series({ tarti: [112, 168, 174, 181, 96, 158, 172, 166, 149, 50], qr: [21, 38, 41, 44, 18, 36, 40, 39, 31, 10] }),
      series: [
        { key: "tarti", name: "Tartım + barkod", color: GOLD, type: "area" },
        { key: "qr", name: "QR kabul", color: BLUE, type: "bar", barSize: 12 },
      ],
    },
    rank: {
      title: "Gram farkı · bölüm geçişleri",
      sub: "Bugünkü toplam fark (g)",
      unit: " g",
      items: [
        { label: "Cila → Paketleme", value: 0.42, tone: "warn", hint: "2 parti" },
        { label: "CNC → Tezgâh", value: 0.18 },
        { label: "Tezgâh → Cila", value: 0.11 },
        { label: "Döküm → CNC", value: 0.06 },
        { label: "Paketleme → Kasa", value: 0, tone: "ok" },
      ],
    },
    table: {
      title: "Son parti hareketleri",
      sub: "Her satır tartı, barkod ve kamera kaydıyla",
      head: ["Parti", "Ürün", "Rota", "Gram", "Durum"],
      rows: [
        { cells: ["PRT-24817", "120 × 14K yüzük", "Döküm → CNC", "412,36 g", "Eşleşti ✓"], tone: "ok" },
        { cells: ["PRT-24809", "80 × 22K alyans", "Cila → Paketleme", "286,40 → 286,12 g", "−0,28 g · inceleme"], tone: "warn" },
        { cells: ["PRT-24822", "64 × 14K yüzük", "CNC → Tezgâh", "228,90 g", "Eşleşti ✓"], tone: "ok" },
        { cells: ["TRAY-11 → 12", "18 → 17 ürün", "Tezgâh → Cila", "—", "Sayım farkı −1"], tone: "danger" },
        { cells: ["PRT-24826", "40 × 8K yüzük", "Döküm → CNC", "131,05 g", "Eşleşti ✓"], tone: "ok" },
      ],
    },
    insight: "Gram farklarının **%70'i Cila → Paketleme** geçişinde. Cila tartısının haftalık kalibrasyonu ve cila tozu tartımının partiye bağlanması farkı tahminen **0,1 g altına** indirir.",
  },

  cnc: {
    cat: "cnc",
    tagline: "CNC kapağının kaç kez açıldığını, kaç ürün konduğunu ve boşta bekleyen makineyi kamera ile sayar",
    units: ["Üretim Müdürlüğü", "Bakım & Teknik"],
    intro: "Makineye sensör takmadan, kamera ile her CNC'nin kapak açılışı, ürün yerleştirme / alma ve çevrim süresi ölçülür. Kamera sayımı ERP üretim girişiyle karşılaştırılır; fark varsa klibiyle bildirim gelir.",
    capabilities: ["Kapak açılma sayısı ve açık kalma süresi", "Çıkış tepsisi ürün sayımı (beklenen ↔ tespit)", "Kamera sayımı ↔ ERP üretim girişi", "Ürünsüz açılış, boşta bekleme, çevrim süresi"],
    kpis: [
      { label: "Kapak açılışı · bugün", value: "2.184", sub: "12 CNC", tone: "accent" },
      { label: "Ürün yerleştirme", value: "2.096", sub: "kamera sayımı", tone: "ok" },
      { label: "Tepsi sayım farkı", value: "1", unit: "adet", sub: "CNC-04 · TRAY-07 · 14:36", tone: "danger" },
      { label: "Ürünsüz açılış", value: "41", sub: "14'ü CNC-07'de", tone: "warn" },
      { label: "Ort. makine doluluğu", value: "%81", sub: "hedef %85", tone: "warn", delta: "-%4", good: false },
    ],
    chart: {
      title: "Saatlik kapak açılışı ve ürün",
      sub: "12 CNC toplamı",
      data: series({ kapak: [214, 246, 252, 249, 132, 228, 241, 236, 238, 148], urun: [208, 240, 247, 244, 126, 212, 228, 229, 225, 137] }),
      series: [
        { key: "kapak", name: "Kapak açılışı", color: VIOLET, type: "line" },
        { key: "urun", name: "Ürün konulan", color: BLUE, type: "area" },
      ],
    },
    rank: {
      title: "Makine doluluğu",
      sub: "08:00–18:00 · çalışma oranı",
      unit: "%",
      items: [
        { label: "CNC-04", value: 94, tone: "ok", hint: "TRAY-07 · 23/24 eksik" },
        { label: "CNC-03", value: 90, tone: "ok", hint: "14 açılış · 13 çevrim" },
        { label: "CNC-02", value: 86 },
        { label: "CNC-05", value: 71, tone: "warn", hint: "23 dk başı boş" },
        { label: "CNC-07", value: 58, tone: "danger", hint: "14 ürünsüz açılış" },
      ],
    },
    table: {
      title: "Makine bazında sayım",
      sub: "Kamera sayımı ↔ ERP",
      head: ["Makine", "Kapak", "Ürün (kamera)", "ERP", "Fark"],
      rows: [
        { cells: ["CNC-03", "14", "13", "13", "0 · 1 çevrimsiz açılış"], tone: "warn" },
        { cells: ["CNC-04", "362", "358", "357", "−1 · TRAY-07"], tone: "danger" },
        { cells: ["CNC-05", "251", "246", "246", "0"], tone: "ok" },
        { cells: ["CNC-07", "198", "179", "179", "0 · 14 ürünsüz açılış"], tone: "warn" },
        { cells: ["CNC-09", "284", "281", "281", "0"], tone: "ok" },
      ],
    },
    insight: "CNC-07'nin ürünsüz açılışları **13:00'ten sonra** başladı ve aynı saatlerde hurda oranı **%3,8**'e çıktı. Takım değişimi sonrası ayar kontrolünü standart yapmak günde **≈ 60 ürün** kapasite kazandırır.",
  },

  staff: {
    cat: "staff",
    tagline: "Personelin makine / tezgâh başında kalma süresi, istasyon doluluğu ve bölüm verimliliği",
    units: ["Üretim Müdürlüğü", "İnsan Kaynakları"],
    intro: "Kamera her istasyonda çalışma pozisyonunda geçen süreyi ölçer. Makine çalışırken başı boş kalan istasyon, uzayan mola ve bölüm bazında verimlilik raporlanır. Ölçüm istasyon bazlıdır, yüz tanıma kullanılmaz.",
    capabilities: ["Makine / tezgâh başında kalma süresi", "Çalışan makinede operatör yokluğu", "Mola ve vardiya başlangıç uyumu", "Bölüm ve vardiya bazında verimlilik"],
    kpis: [
      { label: "Ort. personel verimliliği", value: "%83", sub: "tüm bölümler · istasyon bazlı", tone: "accent", delta: "+%2", good: true },
      { label: "En verimli bölüm", value: "%91", sub: "Paketleme", tone: "ok" },
      { label: "En düşük bölüm", value: "%74", sub: "CNC İşleme", tone: "warn" },
      { label: "Makine başı boş", value: "3", sub: "> 15 dk · bugün", tone: "warn" },
      { label: "Mola aşımı", value: "8", unit: "dk", sub: "Cila · öğle arası", tone: "violet" },
    ],
    chart: {
      title: "Saatlik istasyon doluluğu",
      sub: "Tüm üretim · çalışma pozisyonunda geçen süre",
      data: series({ dol: [72, 86, 89, 88, 41, 79, 87, 86, 84, 62] }),
      series: [{ key: "dol", name: "Doluluk %", color: GREEN, type: "area" }],
    },
    rank: {
      title: "Bölüm bazında verimlilik",
      sub: "Bugün · istasyon doluluğu",
      unit: "%",
      items: [
        { label: "Paketleme", value: 91, tone: "ok" },
        { label: "Tezgâh & Montaj", value: 86, tone: "ok" },
        { label: "Eritme & Döküm", value: 84 },
        { label: "Cila & Yüzey", value: 79, tone: "warn" },
        { label: "CNC İşleme", value: 74, tone: "warn" },
      ],
    },
    table: {
      title: "İstasyon uyarıları",
      sub: "Bugün · süre eşiği aşanlar",
      head: ["İstasyon", "Durum", "Süre", "Not"],
      rows: [
        { cells: ["CNC-05", "Makine çalışıyor, operatör yok", "23 dk", "Vardiya amiri bilgilendirildi"], tone: "warn" },
        { cells: ["Cila · 3 istasyon", "Mola sonrası geç dolum", "8 dk", "İK haftalık rapor"], tone: "warn" },
        { cells: ["T-09", "Malzeme bekleme", "41 dk (toplam)", "Besleme öne alındı"] },
        { cells: ["CNC-11", "Makine çalışıyor, operatör yok", "17 dk", "Takım almaya gitti"] },
      ],
    },
    insight: "CNC hattında operatör başına **2 makine** düşüyor; boş kalma olaylarının **%80'i** iki makinenin aynı anda ürün beklediği anlarda. Çevrim sürelerini kaydırmak doluluğu **%74 → %82**'ye çıkarabilir.",
  },

  scrap: {
    cat: "scrap",
    tagline: "Takoz ve hurda tartılarını kameraya bağlar: ne kadar takoz, ne kadar hurda çıktı, tartılmadan çıkan var mı",
    units: ["Kasa / Değerli Metal", "Üretim Müdürlüğü"],
    intro: "Döküm sonrası takoz / yolluk ve bölümlerin hurda tartımı kamera ile kayda alınır. Tartı ekranı, barkod ve tartımı yapan istasyon aynı kayıtta tutulur; tartılmadan bölümden çıkan kova anında bildirilir.",
    capabilities: ["Takoz / yolluk tartımı ve geri eritme kaydı", "Bölüm bazında hurda oranı", "Tartılmadan taşınan kova / kap tespiti", "Günlük metal dengesi (giren ↔ ürün + takoz + hurda)"],
    kpis: [
      { label: "Takoz · bugün", value: "3.912", unit: "g", sub: "5 döküm ağacı · 22K / 14K", tone: "accent" },
      { label: "Hurda · bugün", value: "184,7", unit: "g", sub: "tüm bölümler", tone: "warn" },
      { label: "Hurda oranı", value: "%2,9", sub: "hedef %2,5", tone: "warn", delta: "+%0,4", good: false },
      { label: "Tartısız çıkış", value: "1", sub: "Tezgâh B · 17:12", tone: "danger" },
      { label: "Metal dengesi", value: "%99,96", sub: "fark 1,9 g · tolerans içinde", tone: "ok" },
    ],
    chart: {
      title: "Saatlik takoz ve hurda",
      sub: "gram",
      data: series({ takoz: [0, 1248.6, 0, 864.2, 0, 0, 1042.5, 0, 756.7, 0], hurda: [12.4, 18.9, 21.6, 24.1, 6.2, 28.8, 22.3, 19.7, 20.4, 10.3] }),
      series: [
        { key: "takoz", name: "Takoz (g)", color: GOLD, type: "bar", barSize: 18 },
        { key: "hurda", name: "Hurda (g)", color: RED, type: "line" },
      ],
    },
    rank: {
      title: "Bölüm bazında hurda",
      sub: "Bugün (g)",
      unit: " g",
      items: [
        { label: "CNC İşleme", value: 78.4, tone: "danger", hint: "%3,8 · CNC-07" },
        { label: "Tezgâh & Montaj", value: 49.2, tone: "warn" },
        { label: "Cila & Yüzey", value: 31.6 },
        { label: "Eritme & Döküm", value: 18.3 },
        { label: "Paketleme", value: 7.2, tone: "ok" },
      ],
    },
    table: {
      title: "Takoz & hurda tartım kayıtları",
      sub: "Kamera ile doğrulanmış",
      head: ["Saat", "Tür", "Kaynak", "Gram", "Durum"],
      rows: [
        { cells: ["09:55", "Takoz 22K", "Döküm ağacı DA-0927", "1.248,6 g", "Geri eritme ✓"], tone: "ok" },
        { cells: ["11:20", "Takoz 14K", "Döküm ağacı DA-0928", "864,2 g", "Geri eritme ✓"], tone: "ok" },
        { cells: ["13:40", "Hurda", "CNC hattı", "46,2 g", "Eşik üstü %3,8"], tone: "warn" },
        { cells: ["14:30", "Takoz 14K", "Döküm ağacı DA-0929", "1.042,5 g", "Geri eritme ✓"], tone: "ok" },
        { cells: ["17:12", "Hurda", "Tezgâh B · HK-B2", "—", "Tartılmadan çıktı"], tone: "danger" },
      ],
    },
    insight: "Günün metal dengesi **1,9 g** farkla kapandı. Farkın büyük bölümü **tartılmadan taşınan Tezgâh B kovasından**; kova kasada tartıldığında denge tahminen **0,3 g**'a iner.",
  },

  perimeter: {
    cat: "perimeter",
    tagline: "Yüksek değerli ürün alanına yetkisiz giriş, kontrollü alan dışına çıkan ürün, sanal bölge ihlali",
    units: ["Güvenlik Amirliği", "Kasa / Değerli Metal"],
    intro: "Kasa, yüksek değerli ürün masaları ve ürün alanları sanal bölge olarak tanımlanır. Yetkisiz kişi girişi ve tanımlı alanın dışına çıkan ürün anında görüntüsüyle güvenliğe gider.",
    capabilities: ["Yüksek değerli alana yetkisiz giriş", "Kontrollü ürün alanı dışına çıkan ürün", "Ürünün son görüldüğü tepsi ile eşleşme", "Çevre çiti ve mesai dışı giriş (aynı altyapı)"],
    kpis: [
      { label: "Tanımlı kritik bölge", value: "14", sub: "kasa · ürün masaları · fire", tone: "accent" },
      { label: "Yetkisiz giriş", value: "1", sub: "PERSON-014 · 15:46", tone: "danger" },
      { label: "Alan dışı ürün", value: "1", sub: "OBJECT-191 · 16:08", tone: "danger" },
      { label: "Tespit → güvenlik", value: "3", unit: "sn", sub: "ortalama", tone: "ok" },
      { label: "Yetkili geçiş", value: "212", sub: "filtrelendi · alarm yok", tone: "violet" },
    ],
    chart: {
      title: "Saatlik kritik bölge hareketi",
      sub: "Yetkili geçiş · ihlal",
      data: series({ ok: [12, 24, 26, 25, 14, 22, 27, 29, 21, 12], bad: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0] }),
      series: [
        { key: "ok", name: "Yetkili geçiş", color: BLUE, type: "area" },
        { key: "bad", name: "İhlal", color: RED, type: "bar", barSize: 14 },
      ],
    },
    rank: {
      title: "Bölge bazında geçiş",
      sub: "Bugün",
      items: [
        { label: "Yüksek değerli ürün alanı", value: 64, tone: "danger", hint: "1 ihlal" },
        { label: "Kasa girişi", value: 48 },
        { label: "Ürün masaları", value: 57, tone: "warn", hint: "1 alan dışı ürün" },
        { label: "Fire alanı", value: 31 },
        { label: "Sevkiyat kapısı", value: 12, tone: "ok" },
      ],
    },
    table: {
      title: "Kritik bölge olay kaydı",
      sub: "02.10.2026",
      head: ["Saat", "Bölge", "Olay", "Sonuç"],
      rows: [
        { cells: ["15:46", "Yüksek değerli ürün alanı", "PERSON-014 yetkisiz giriş", "Güvenliğe iletildi"], tone: "danger" },
        { cells: ["16:08", "Ürün masası", "OBJECT-191 alan dışında", "TRAY-054'e geri"], tone: "danger" },
        { cells: ["16:18", "Kasa girişi", "PACKAGE-018 teslim", "Doğrulandı"], tone: "ok" },
      ],
    },
    insight: "Kritik bölge ihlallerinin ikisi de **15:30–16:15** arasında, vardiya devrine yakın. Bu aralıkta kasa ve ürün alanı için **çift onay** önerilir.",
  },

  afterhours: {
    cat: "afterhours",
    tagline: "Mesai bittikten sonra güvenlik personeli dışında içeri giren / içeride kalan var mı?",
    units: ["Güvenlik Amirliği", "İnsan Kaynakları"],
    intro: "Mesai saatleri ve izinli erken / geç giriş listesi tanımlanır. Mesai dışında üretim alanı, kasa koridoru ve depoda güvenlik üniformalı personel dışındaki her kişi tespit edilir; fazla mesai onayı yoksa bildirim gider.",
    capabilities: ["Güvenlik üniforması ↔ diğer personel ayrımı", "Bölge bazlı mesai dışı yasak alanlar", "Fazla mesai / erken giriş onayı eşleşmesi", "Kasa koridoru ve depo için sıfır tolerans"],
    kpis: [
      { label: "Mesai dışı tespit", value: "3", sub: "son 24 saat", tone: "warn" },
      { label: "Kasa koridoru", value: "1", sub: "00:48 · doğrulandı", tone: "danger" },
      { label: "Onaysız fazla mesai", value: "2", unit: "kişi", sub: "Tezgâh B · 17:58", tone: "warn" },
      { label: "Güvenlik personeli hareketi", value: "46", sub: "filtrelendi · alarm yok", tone: "ok" },
      { label: "İzinli erken giriş", value: "4", sub: "tanımlı liste", tone: "violet" },
    ],
    chart: {
      title: "Mesai dışı hareket",
      sub: "Güvenlik personeli · diğer kişiler",
      data: series(
        { guv: [6, 5, 4, 4, 5, 3, 6, 8, 5], diger: [0, 0, 1, 0, 0, 0, 0, 1, 2] },
        ["18", "20", "22", "00", "02", "04", "06", "07", "17"]
      ),
      series: [
        { key: "guv", name: "Güvenlik", color: GREEN, type: "area" },
        { key: "diger", name: "Güvenlik dışı", color: RED, type: "bar", barSize: 14 },
      ],
    },
    rank: {
      title: "Mesai dışı yasak bölgeler",
      sub: "Son 30 gün tespit",
      items: [
        { label: "Tezgâh & Montaj", value: 7, tone: "warn" },
        { label: "Eritme & Döküm", value: 5, hint: "4'ü izinli erken giriş" },
        { label: "Kasa koridoru", value: 2, tone: "danger" },
        { label: "Paketleme", value: 1 },
        { label: "Sevkiyat deposu", value: 0, tone: "ok" },
      ],
    },
    table: {
      title: "Mesai dışı giriş kaydı",
      sub: "Son 24 saat",
      head: ["Saat", "Bölge", "Kişi", "Onay", "Sonuç"],
      rows: [
        { cells: ["00:48", "Kasa koridoru", "1 · üniformasız", "Yok", "Tutanak"], tone: "danger" },
        { cells: ["06:12", "Döküm", "1", "Sonradan 07:40", "İzin listesine öneri"], tone: "warn" },
        { cells: ["17:58", "Tezgâh B", "2", "Yok", "Bölüm sorumlusunda"], tone: "warn" },
        { cells: ["Gece boyu", "Tüm alan", "Güvenlik · 46 hareket", "Tanımlı", "Alarm yok"], tone: "ok" },
      ],
    },
    insight: "Mesai dışı tespitlerin **%60'ı** onayı sonradan giriliyor. Fazla mesai onayını mesai bitmeden **17:15'e kadar** zorunlu yapmak yanlış alarmı neredeyse sıfırlar.",
  },

  packing: {
    cat: "packing",
    tagline: "Yüzüklerin kutuya paketlenmesini sayar, siparişe bağlı kanıt klibi oluşturur",
    units: ["Paketleme & Sevkiyat", "Kalite & İzlenebilirlik"],
    intro: "Paketleme masasında tepsiden alınan her ürün ve kapatılan her kutu sayılır. Sipariş ve koli QR'ı okunduğunda sistem paketleme sürecinin klibini oluşturup siparişe bağlar; sayım tutmazsa koli kapanmadan uyarı verir.",
    capabilities: ["Ürün → kutu sayımı (yüzük, alyans, set)", "Sipariş / koli QR'ına bağlı otomatik klip", "Sayım farkında koli kapanmadan uyarı", "Kutuya girmeden masadan ayrılan ürün"],
    kpis: [
      { label: "Paketlenen ürün", value: "2.346", sub: "38 sipariş · 4 masa", tone: "accent" },
      { label: "Oluşturulan klip", value: "38", sub: "her sipariş için", tone: "ok" },
      { label: "Sayım farkı", value: "2", sub: "koli kapanmadan yakalandı", tone: "warn" },
      { label: "Ort. paketleme süresi", value: "3,2", unit: "sn/ürün", sub: "hedef 3,5", tone: "ok", delta: "-%8", good: true },
      { label: "Müşteri itirazı", value: "0", sub: "son 30 gün · klip ile kapandı: 3", tone: "violet" },
    ],
    chart: {
      title: "Saatlik paketleme",
      sub: "Ürün · klip",
      data: series({ urun: [148, 262, 284, 291, 102, 246, 288, 279, 268, 178], klip: [2, 4, 5, 5, 2, 4, 5, 4, 4, 3] }),
      series: [
        { key: "urun", name: "Paketlenen ürün", color: BLUE, type: "area" },
        { key: "klip", name: "Klip", color: GOLD, type: "bar", barSize: 12 },
      ],
    },
    rank: {
      title: "Masa bazında hız",
      sub: "sn / ürün",
      unit: " sn",
      items: [
        { label: "Masa 3", value: 2.8, tone: "ok" },
        { label: "Masa 4", value: 3.1, tone: "ok" },
        { label: "Masa 1", value: 3.4 },
        { label: "Masa 2", value: 3.6, tone: "warn" },
      ],
    },
    table: {
      title: "Son siparişler ve klipler",
      sub: "Klip, siparişe ve koli QR'ına bağlı",
      head: ["Sipariş", "Masa", "Ürün", "Kutu", "Klip"],
      rows: [
        { cells: ["SİP-55120", "Masa 3", "48", "48", "02:36 ✓"], tone: "ok" },
        { cells: ["SİP-55134", "Masa 1", "60", "59 → 60", "03:41 · fark giderildi"], tone: "warn" },
        { cells: ["SİP-55141", "Masa 2", "36", "35 + 1 iade", "02:02 · iade kaydı"], tone: "warn" },
        { cells: ["SİP-55147", "Masa 4", "72", "72", "03:58 ✓"], tone: "ok" },
      ],
    },
    insight: "Son 30 günde 3 müşteri 'eksik ürün' itirazı **paketleme klibi gönderilerek** aynı gün kapandı. Klip linkinin sevk irsaliyesine eklenmesi itirazları baştan azaltır.",
  },
};
