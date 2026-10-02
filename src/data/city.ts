/**
 * The panel is sent to many jewellery manufacturers, so the company name is not hard-coded:
 * open the link with `?firma=Altınyıldız%20Kuyumculuk` and the whole panel and deck switch to that name.
 * The choice is remembered in the browser. (Kept the `CITY` / `DISTRICTS` names from the shared template.)
 */
const KEY = "hvg.firm";
const DEFAULT = "Örnek Kuyumculuk";

function readFirm(): string {
  try {
    const q = new URLSearchParams(window.location.search).get("firma");
    if (q != null) {
      const clean = q.trim();
      if (clean) localStorage.setItem(KEY, clean);
      else localStorage.removeItem(KEY);
      return clean || DEFAULT;
    }
    return localStorage.getItem(KEY) || DEFAULT;
  } catch {
    return DEFAULT;
  }
}

const name = readFirm();

export const CITY = {
  name,
  full: name,
  center: "Üretim İzleme Merkezi",
  day: "2 Ekim 2026 · Cuma",
  dayShort: "02.10.2026",
  shift: "Mesai 08:00–17:30",
  lastData: "18:19:58",
};

/** Production areas of the plant (template name: DISTRICTS). */
export const DISTRICTS = [
  { id: "dokum", name: "Eritme & Döküm", cams: 8, staff: 9 },
  { id: "cnc", name: "CNC İşleme", cams: 12, staff: 14 },
  { id: "tezgah", name: "Tezgâh & Montaj", cams: 10, staff: 22 },
  { id: "cila", name: "Cila & Yüzey", cams: 6, staff: 11 },
  { id: "kalite", name: "Tartı & Kalite", cams: 6, staff: 6 },
  { id: "paket", name: "Paketleme", cams: 8, staff: 10 },
  { id: "kasa", name: "Kasa & Sevkiyat", cams: 6, staff: 4 },
  { id: "cevre", name: "Çevre & Girişler", cams: 16, staff: 5 },
] as const;

export type DistrictId = (typeof DISTRICTS)[number]["id"];

export const CAM_STATS = {
  total: DISTRICTS.reduce((a, d) => a + d.cams, 0),
  online: 70,
  warning: 1,
  offline: 1,
};

/** Units notifications are routed to. */
export const UNITS = [
  "Üretim Müdürlüğü",
  "Kalite & İzlenebilirlik",
  "Güvenlik Amirliği",
  "İnsan Kaynakları",
  "Paketleme & Sevkiyat",
  "Kasa / Değerli Metal",
  "Bakım & Teknik",
] as const;

export type Unit = (typeof UNITS)[number];
