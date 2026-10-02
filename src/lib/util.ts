export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Deterministic PRNG so the demo never re-shuffles between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Demo "now": 2 Ekim 2026 Cuma 18:20 — the demo day of the jewellery plant panel. */
export const DEMO_NOW = new Date(2026, 9, 2, 18, 20, 0);

/** Time on the demo day. */
export function at(h: number, m: number, s = 0) {
  return new Date(2026, 9, 2, h, m, s);
}

export function minutesAgo(min: number) {
  return new Date(DEMO_NOW.getTime() - min * 60_000);
}

const p2 = (n: number) => String(n).padStart(2, "0");

export function hhmm(d: Date) {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

export function hhmmss(d: Date) {
  return `${hhmm(d)}:${p2(d.getSeconds())}`;
}

/** "01:48" from 108 seconds */
export function mmss(totalSeconds: number) {
  const neg = totalSeconds < 0;
  const t = Math.abs(Math.round(totalSeconds));
  return `${neg ? "-" : ""}${p2(Math.floor(t / 60))}:${p2(t % 60)}`;
}

/** Seconds between a date and demo now. */
export function secsSince(d: Date, from: Date = DEMO_NOW) {
  return Math.round((from.getTime() - d.getTime()) / 1000);
}

export function relTime(d: Date, from: Date = DEMO_NOW) {
  const diff = Math.round((from.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "şimdi";
  if (diff < 60) return `${diff} dk önce`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

const nf0 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export function n(v: number, d = 0) {
  if (!d) return nf0.format(v);
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

export function pct(v: number, d = 0) {
  return `%${n(v, d)}`;
}

export function tl(v: number) {
  return `${nf0.format(v)} TL`;
}

export function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}
