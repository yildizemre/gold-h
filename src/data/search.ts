import { CAT_META, CATS, INCIDENTS } from "./incidents";
import { DISTRICTS } from "./city";

export type Hit = { kind: "Modül" | "Bölüm" | "Olay" | "Kamera" | "Parti"; label: string; sub: string; to: string; keys: string };

const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/[#\s-]/g, "");

const LOTS = [
  { id: "PRT-24817", sub: "120 × 14K yüzük · Döküm → CNC", to: "/izlenebilirlik" },
  { id: "PRT-24809", sub: "Cila → Paketleme · −0,28 g", to: "/izlenebilirlik" },
  { id: "SİP-55120", sub: "48 yüzük · paketleme klibi", to: "/paketleme" },
  { id: "SİP-55134", sub: "60 yüzük · sayım farkı giderildi", to: "/paketleme" },
];

export const SEARCH_INDEX: Hit[] = [
  { kind: "Modül" as const, label: "Öneri Modüller", sub: "CCTV ile ek analizler · yetki onayı", to: "/oneriler", keys: "öneri oneri yetki onay kasa kkd yangın sabotaj telefon ziyaretçi toz" },
  ...CATS.map((c) => ({ kind: "Modül" as const, label: CAT_META[c].label, sub: `Modül ${CAT_META[c].no}`, to: CAT_META[c].to, keys: `${CAT_META[c].label} ${CAT_META[c].short}` })),
  ...DISTRICTS.map((d) => ({ kind: "Bölüm" as const, label: d.name, sub: `${d.cams} kamera · ${INCIDENTS.filter((i) => i.district === d.id).length} bildirim`, to: `/incidents?m=${d.id}`, keys: `${d.name} bölüm` })),
  ...INCIDENTS.map((i) => ({ kind: "Olay" as const, label: i.id, sub: `#${i.no} ${i.title} · ${i.place}`, to: `/incidents?id=${i.id}`, keys: `${i.id} ${i.title} ${i.place} ${i.unit}` })),
  ...[...new Set(INCIDENTS.map((i) => i.cam))].map((c) => ({ kind: "Kamera" as const, label: c.split(" · ")[0], sub: c.split(" · ")[1] ?? "", to: "/cameras", keys: c })),
  ...LOTS.map((v) => ({ kind: "Parti" as const, label: v.id, sub: v.sub, to: v.to, keys: `${v.id} parti sipariş` })),
];

export function searchAll(q: string, limit = 8): Hit[] {
  const n = norm(q);
  if (!n) return [];
  const scored = SEARCH_INDEX.map((h) => {
    const toks = h.keys.split(" ").map(norm);
    const l = norm(h.label);
    const all = norm(h.keys + h.label);
    const score = l === n || toks.includes(n) ? 0 : l.startsWith(n) || toks.some((t) => t.startsWith(n)) ? 1 : all.includes(n) ? 2 : -1;
    return { h, score };
  }).filter((x) => x.score >= 0);
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((x) => x.h);
}
