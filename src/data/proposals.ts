/**
 * Extra CCTV-only modules we can offer a gold / jewellery manufacturer. The customer decides in the panel
 * ("Öneri Modüller"): an approver role grants permission and the module is queued for setup, other roles
 * send it for approval. Decisions live in localStorage so the demo remembers them.
 */
import { useSyncExternalStore } from "react";

export type Proposal = {
  id: string;
  title: string;
  icon: string;
  area: string;
  what: string;
  how: string[];
  value: string;
  /** cameras / data the module needs permission for */
  needs: string[];
  priority: "Yüksek" | "Orta";
};

export const PROPOSALS: Proposal[] = [
  {
    id: "vault",
    title: "Kasa Odası · Çift Kişi Kuralı",
    icon: "Vault",
    area: "Kasa & değerli metal odası",
    what: "Kasa odasına tek kişi girdiğinde, kasa kapağı uzun süre açık kaldığında veya kasa mesai dışında açıldığında uyarır.",
    how: ["Kasa odasında kişi sayımı (en az 2 kişi kuralı)", "Kasa kapağı açık kalma süresi", "Mesai dışı kasa açılışı"],
    value: "Değerli metalin en yoğun bulunduğu noktada insan hatası ve suistimal riskini kapatır.",
    needs: ["Kasa odası kamerası (1–2 adet)", "Mesai takvimi"],
    priority: "Yüksek",
  },
  {
    id: "unattended",
    title: "Gözetimsiz Bırakılan Altın",
    icon: "PackageSearch",
    area: "Tezgâh · CNC · paketleme masaları",
    what: "Tepsi, kase veya ürünün masada sahipsiz bırakıldığını (istasyon boşken masada ürün kaldığını) tespit eder.",
    how: ["Masa üstünde ürün / tepsi algılama", "İstasyon boş + ürün var süresi", "Mola ve vardiya devrinde kontrol"],
    value: "Ürünün masada açıkta kalmasından kaynaklanan kayıp ve karışıklığı önler.",
    needs: ["Tezgâh ve masa kameraları (mevcut)"],
    priority: "Yüksek",
  },
  {
    id: "exit",
    title: "Çıkış Kontrol Noktası Doğrulama",
    icon: "ScanLine",
    area: "Personel çıkışı · turnike / dedektör",
    what: "Mesai çıkışında her personelin dedektör / kontrol noktasından geçtiğini, kontrolün atlanmadığını doğrular.",
    how: ["Çıkış sayısı ↔ kontrol noktası geçiş sayısı", "Kontrol noktasını atlayan geçiş", "Kalabalık çıkışta kontrol süresi"],
    value: "Çıkış prosedürünün her gün, her personel için uygulandığını kanıtlar.",
    needs: ["Personel çıkış kamerası", "Dedektör alanı kamerası"],
    priority: "Yüksek",
  },
  {
    id: "floor",
    title: "Yere Düşen Parça Tespiti",
    icon: "Gem",
    area: "Tezgâh altı · CNC çevresi · cila",
    what: "Zeminde parlak küçük nesne (yüzük, taş, talaş) belirdiğinde konumunu işaretler.",
    how: ["Zemin bölgesinde parlak nesne algılama", "Düşme anının klibi", "Gün sonu zemin raporu"],
    value: "Kayıp ürün ve hurdaya karışan metal azalır, gram farkının bir kaynağı kapanır.",
    needs: ["Zemini gören mevcut kameralar"],
    priority: "Orta",
  },
  {
    id: "ppe",
    title: "Eritme & Döküm KKD Denetimi",
    icon: "HardHat",
    area: "Eritme · döküm · asit bölümü",
    what: "Fırın ve döküm başında yüz siperi, ısıya dayanıklı eldiven ve önlük; asit bölümünde maske ve gözlük kullanımını denetler.",
    how: ["KKD eksikliği anlık bildirimi", "Bölüm bazında KKD uyum oranı", "İSG raporu"],
    value: "İş kazası riskini ve İSG denetim cezalarını azaltır.",
    needs: ["Döküm ve asit bölümü kameraları"],
    priority: "Orta",
  },
  {
    id: "fire",
    title: "Fırın Duman / Alev Erken Uyarı",
    icon: "Flame",
    area: "Eritme fırınları · kimyasal depo",
    what: "Fırın çevresinde olağan dışı duman, alev veya kıvılcımı ve kimyasal depoda dumanı saniyeler içinde bildirir.",
    how: ["Duman ve alev algılama", "Mesai dışı fırın bölgesi ısı / ışık değişimi", "Güvenlik + bakım ekibine eş zamanlı bildirim"],
    value: "Yangın dedektörü devreye girmeden ilk dakikalarda müdahale.",
    needs: ["Fırın ve kimyasal depo kameraları"],
    priority: "Orta",
  },
  {
    id: "zone",
    title: "Yetkisiz Bölge Geçişi",
    icon: "Footprints",
    area: "Kasa · döküm · paketleme sınırları",
    what: "Bölüm önlüğü / yelek rengine göre personelin kendi bölümü dışındaki yasak alanlara girişini tespit eder.",
    how: ["Bölge bazlı yetki tanımı", "Önlük / yelek rengi ile bölüm ayrımı (yüz tanıma yok)", "Geçiş klibi"],
    value: "Değerli metalin bulunduğu alanlara gereksiz trafik azalır.",
    needs: ["Bölüm geçiş kameraları", "Bölüm – önlük rengi listesi"],
    priority: "Orta",
  },
  {
    id: "tamper",
    title: "Kamera Sabotaj Tespiti",
    icon: "CameraOff",
    area: "Tüm kameralar",
    what: "Kameranın kapatılması, lensin örtülmesi, açısının çevrilmesi veya görüntünün bulanıklaşmasını anında bildirir.",
    how: ["Görüntü kaybı / siyah ekran", "Açı değişimi ve örtme", "Bulanıklık ve ışık kaybı"],
    value: "Kör nokta oluşmaz; diğer tüm modüllerin güvenilirliğini korur.",
    needs: ["Tüm kameralar (ek kamera yok)"],
    priority: "Yüksek",
  },
  {
    id: "dust",
    title: "Atölye Tozu & Filtre Toplama",
    icon: "Sparkles",
    area: "Cila · tezgâh · süpürge noktaları",
    what: "Cila tozu, süpürge tozu ve filtre değişimlerinin yapıldığını ve toplanan tozun tartılıp kasaya gittiğini doğrular.",
    how: ["Toz toplama / filtre değişim anı", "Tartı ile eşleştirme", "Haftalık toz geri kazanım raporu"],
    value: "Tozla kaybolan altın geri kazanım sürecinde kayıt altına alınır.",
    needs: ["Cila ve toz toplama noktası kameraları"],
    priority: "Orta",
  },
  {
    id: "shipping",
    title: "Sevkiyat & Zırhlı Araç Yükleme",
    icon: "Truck",
    area: "Sevkiyat kapısı · yükleme alanı",
    what: "Yükleme sırasında kapının açık kalma süresini, alandaki kişi sayısını ve koli sayısını izler; her sevkiyatın klibini oluşturur.",
    how: ["Kapı açık süresi ve kişi sayısı", "Yüklenen koli sayımı", "Sevkiyat klibi + irsaliye eşleşmesi"],
    value: "Sevkiyat anı da paketleme gibi kanıtlı hâle gelir.",
    needs: ["Sevkiyat kapısı kamerası", "İrsaliye / sipariş listesi"],
    priority: "Orta",
  },
  {
    id: "phone",
    title: "Üretim Alanında Telefon Kullanımı",
    icon: "Smartphone",
    area: "Tezgâh · paketleme · kasa",
    what: "Telefon kullanımının yasak olduğu alanlarda cep telefonu kullanımını tespit eder.",
    how: ["Telefon kullanma pozu algılama", "Bölge bazlı yasak tanımı", "Günlük özet (kişi değil istasyon bazlı)"],
    value: "Fotoğraf / görüntü sızdırma riskini ve dikkat dağınıklığını azaltır.",
    needs: ["Tezgâh ve paketleme kameraları (mevcut)"],
    priority: "Orta",
  },
  {
    id: "visitor",
    title: "Ziyaretçi Refakat Kuralı",
    icon: "UserCheck",
    area: "Showroom · üretim alanı girişi",
    what: "Ziyaretçi / tedarikçi kartlı kişinin üretim alanında refakatsiz dolaşmasını tespit eder.",
    how: ["Ziyaretçi yeleği / kartı ile ayrım", "Refakatsiz süre", "Giriş – çıkış eşleşmesi"],
    value: "Dışarıdan gelen kişilerin üretim alanındaki hareketi kontrol altında olur.",
    needs: ["Giriş ve koridor kameraları"],
    priority: "Orta",
  },
];

export type Decision = "approved" | "pending" | "declined";
export type DecisionRec = { d: Decision; by: string; at: string };

const KEY = "hvg.proposals";

function load(): Record<string, DecisionRec> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

let state: Record<string, DecisionRec> = load();
const subs = new Set<() => void>();

export const proposalStore = {
  set(id: string, rec: DecisionRec | null) {
    const next = { ...state };
    if (rec) next[id] = rec;
    else delete next[id];
    state = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode */
    }
    subs.forEach((f) => f());
  },
};

export function useDecisions() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => state
  );
}

/** Proposals the customer has not decided on yet (sidebar badge). */
export function useOpenProposals() {
  const d = useDecisions();
  return PROPOSALS.filter((p) => !d[p.id] || d[p.id].d === "pending").length;
}
