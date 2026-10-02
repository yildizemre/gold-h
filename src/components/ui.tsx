import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cx } from "../lib/util";
import { useLang, type LS } from "../i18n";

export type Tone = "accent" | "warn" | "danger" | "ok" | "violet" | "mute";

export const TONE: Record<Tone, { text: string; bg: string; ring: string; raw: string }> = {
  accent: { text: "text-accent", bg: "bg-accent/12", ring: "ring-accent/30", raw: "var(--c-accent)" },
  warn: { text: "text-warn", bg: "bg-warn/12", ring: "ring-warn/30", raw: "var(--c-warn)" },
  danger: { text: "text-danger", bg: "bg-danger/12", ring: "ring-danger/30", raw: "var(--c-danger)" },
  ok: { text: "text-ok", bg: "bg-ok/12", ring: "ring-ok/30", raw: "var(--c-ok)" },
  violet: { text: "text-violet", bg: "bg-violet/12", ring: "ring-violet/30", raw: "var(--c-violet)" },
  mute: { text: "text-mute", bg: "bg-panel3", ring: "ring-line", raw: "var(--c-text-mute)" },
};

/* ------------------------------- Card ------------------------------- */

export function Card({
  children,
  className,
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={cx("card min-w-0", pad && "p-4", className)}>{children}</div>
  );
}

export function CardHead({
  title,
  sub,
  right,
  icon: Icon,
  tone = "accent",
}: {
  title: LS | string;
  sub?: LS | string;
  right?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const { l } = useLang();
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className={cx("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg", TONE[tone].bg, TONE[tone].text)}>
            <Icon size={15} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] font-semibold text-ink">{l(title)}</h3>
          {sub && <p className="mt-0.5 text-[11.5px] leading-snug text-mute">{l(sub)}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ------------------------------- Badge / Pill ------------------------------- */

export function Badge({
  children,
  tone = "mute",
  icon: Icon,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1",
        TONE[tone].bg,
        TONE[tone].text,
        TONE[tone].ring,
        className
      )}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

export function Dot({ tone = "ok", pulse }: { tone?: Tone; pulse?: boolean }) {
  return (
    <span
      className={cx("inline-block size-1.5 rounded-full", pulse && "rec-dot")}
      style={{ background: TONE[tone].raw }}
    />
  );
}

/* ------------------------------- KPI ------------------------------- */

export function Kpi({
  label,
  value,
  unit,
  sub,
  delta,
  deltaGood,
  icon: Icon,
  tone = "accent",
  onClick,
}: {
  label: LS | string;
  value: string;
  unit?: string;
  sub?: LS | string;
  delta?: string;
  /** true = green, false = red, undefined = neutral */
  deltaGood?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
  onClick?: () => void;
}) {
  const { l } = useLang();
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cx(
        "card group p-3.5 text-left transition",
        onClick && "hover:border-accent/40 hover:bg-panel2"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11.5px] font-medium text-mute">{l(label)}</span>
        {Icon && (
          <span className={cx("grid size-6 place-items-center rounded-md", TONE[tone].bg, TONE[tone].text)}>
            <Icon size={13} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cx("num text-[26px] font-bold leading-none", TONE[tone].text)}>{value}</span>
        {unit && <span className="text-[13px] font-semibold text-dim">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={cx(
              "inline-flex items-center gap-0.5 text-[11px] font-semibold",
              deltaGood === undefined ? "text-mute" : deltaGood ? "text-ok" : "text-danger"
            )}
          >
            {deltaGood === undefined ? null : deltaGood ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {delta}
          </span>
        )}
        {sub && <span className="truncate text-[11px] text-mute">{l(sub)}</span>}
      </div>
    </Comp>
  );
}

/* ------------------------------- Progress ------------------------------- */

export function Bar({
  value,
  max = 100,
  tone,
  threshold,
  height = 6,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  /** percentage marker line */
  threshold?: number;
  height?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const auto: Tone = pct >= 90 ? "danger" : pct >= 75 ? "warn" : "accent";
  const t = tone ?? auto;
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-panel3" style={{ height }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: TONE[t].raw }}
      />
      {threshold != null && (
        <span
          className="absolute top-0 h-full w-px bg-ink/45"
          style={{ left: `${threshold}%` }}
        />
      )}
    </div>
  );
}

export function Gauge({
  value,
  max = 100,
  size = 116,
  label,
  tone,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: ReactNode;
  tone?: Tone;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const auto: Tone = pct >= 90 ? "danger" : pct >= 75 ? "warn" : "ok";
  const t = tone ?? auto;
  const r = size / 2 - 9;
  const circ = Math.PI * r; // half circle
  return (
    <div className="relative" style={{ width: size, height: size * 0.62 }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`}>
        <path
          d={`M 9 ${size * 0.5} A ${r} ${r} 0 0 1 ${size - 9} ${size * 0.5}`}
          fill="none"
          stroke="var(--c-panel-3)"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          d={`M 9 ${size * 0.5} A ${r} ${r} 0 0 1 ${size - 9} ${size * 0.5}`}
          fill="none"
          stroke={TONE[t].raw}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">{label}</div>
    </div>
  );
}

/* ------------------------------- Page header ------------------------------- */

export function PageHead({
  title,
  sub,
  right,
}: {
  title: LS | string | ReactNode;
  sub?: LS | string;
  right?: ReactNode;
}) {
  const { l } = useLang();
  const isLS = (v: unknown): v is LS => typeof v === "string" || (!!v && typeof v === "object" && "tr" in v);
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">{isLS(title) ? l(title) : title}</h1>
        {sub && <p className="mt-1 text-[12.5px] text-mute">{l(sub)}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/* ------------------------------- Button ------------------------------- */

export function Btn({
  children,
  icon: Icon,
  variant = "ghost",
  onClick,
  active,
  className,
  size = "md",
}: {
  children?: ReactNode;
  icon?: LucideIcon;
  variant?: "ghost" | "solid" | "outline" | "danger";
  onClick?: () => void;
  active?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition whitespace-nowrap";
  const sizes = size === "sm" ? "h-7 px-2 text-[11px]" : "h-8.5 px-3 text-[12px]";
  const variants = {
    ghost: cx(
      "border border-line bg-panel2 text-dim hover:border-accent/40 hover:text-ink",
      active && "border-accent/50 bg-accent/12 text-accent"
    ),
    solid: "bg-accent text-[#04161a] hover:brightness-110",
    outline: "border border-accent/45 bg-accent/10 text-accent hover:bg-accent/18",
    danger: "border border-danger/40 bg-danger/12 text-danger hover:bg-danger/20",
  }[variant];
  return (
    <button onClick={onClick} className={cx(base, sizes, variants, className)}>
      {Icon && <Icon size={size === "sm" ? 12 : 14} />}
      {children}
    </button>
  );
}

/* ------------------------------- Table ------------------------------- */

export function Table({ head, children }: { head: (LS | string)[]; children: ReactNode }) {
  const { l } = useLang();
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[520px] border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-line text-left">
            {head.map((h, i) => (
              <th key={i} className="pb-2 pr-3 text-[10.5px] font-semibold uppercase tracking-wide text-mute">
                {l(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cx("border-b border-linesoft last:border-0", onClick && "cursor-pointer hover:bg-panel2")}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cx("py-2.5 pr-3 align-middle text-dim", className)}>{children}</td>;
}

/* ------------------------------- Empty ------------------------------- */

export function Empty({ text }: { text: LS | string }) {
  const { l } = useLang();
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line bg-panel2 py-8 text-[12px] text-mute">
      {l(text)}
    </div>
  );
}

/* ------------------------------- RichText ------------------------------- */

/** Renders **bold** segments with an accent highlight — used for AI summaries. */
export function RichText({ value, className }: { value: LS | string; className?: string }) {
  const { l } = useLang();
  const parts = l(value).split("**");
  return (
    <span className={className}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

/* ------------------------------- Insight ------------------------------- */

export function Insight({
  children,
  tone = "accent",
  icon: Icon,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cx(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11.5px] leading-relaxed ring-1",
        TONE[tone].bg,
        TONE[tone].ring,
        "text-dim"
      )}
    >
      {Icon && <Icon size={14} className={cx("mt-0.5 shrink-0", TONE[tone].text)} />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
