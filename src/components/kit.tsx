/**
 * Product-level building blocks: KpiCard, AIInsight, StatusBadge, ChartCard, FilterBar,
 * DataTable, Drawer, Tabs and the loading / empty / error states.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { cx } from "../lib/util";
import { Badge, Btn, Card, CardHead, RichText, TONE, type Tone } from "./ui";

/* ------------------------------- Sparkline ------------------------------- */

export function Sparkline({ data, tone = "accent", height = 30 }: { data: { v: number }[]; tone?: Tone; height?: number }) {
  const id = useMemo(() => `sp${Math.random().toString(36).slice(2, 8)}`, []);
  const c = TONE[tone].raw;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={c} strokeWidth={1.6} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------- KpiCard ------------------------------- */

export function KpiCard({
  label,
  value,
  unit,
  sub,
  delta,
  good,
  icon: Icon,
  tone = "accent",
  spark,
  onClick,
  alert,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: ReactNode;
  delta?: string;
  /** true green, false red, undefined neutral */
  good?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
  spark?: { v: number }[];
  onClick?: () => void;
  alert?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  const up = delta ? !delta.trim().startsWith("-") && !delta.trim().startsWith("−") : true;
  return (
    <Comp
      onClick={onClick}
      className={cx(
        "card group relative flex min-w-0 flex-col overflow-hidden p-3.5 text-left transition",
        onClick && "hover:border-accent/40 hover:bg-panel2",
        alert && "border-danger/45"
      )}
    >
      {alert && <span className="absolute inset-x-0 top-0 h-0.5 bg-danger" />}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11.5px] font-medium text-mute">{label}</span>
        {Icon && (
          <span className={cx("grid size-6 shrink-0 place-items-center rounded-md", TONE[tone].bg, TONE[tone].text)}>
            <Icon size={13} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cx("num text-[25px] font-bold leading-none", TONE[tone].text)}>{value}</span>
        {unit && <span className="num text-[12.5px] font-semibold text-dim">{unit}</span>}
      </div>
      <div className="mt-2 flex min-h-[16px] items-center gap-2">
        {delta && (
          <span
            className={cx(
              "inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold",
              good === undefined ? "text-mute" : good ? "text-ok" : "text-danger"
            )}
          >
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {delta}
          </span>
        )}
        {sub && <span className="truncate text-[11px] text-mute">{sub}</span>}
      </div>
      {spark && (
        <div className="-mx-1 mt-2">
          <Sparkline data={spark} tone={tone === "mute" ? "accent" : tone} height={26} />
        </div>
      )}
    </Comp>
  );
}

/* ------------------------------- AI ------------------------------- */

export function AIInsight({ children, tone = "accent", title = "HypeVision AI Insight" }: { children: ReactNode; tone?: Tone; title?: string }) {
  return (
    <div className={cx("relative overflow-hidden rounded-xl px-3.5 py-3 ring-1", TONE[tone].bg, TONE[tone].ring)}>
      <div className={cx("mb-1 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide", TONE[tone].text)}>
        <Sparkles size={12} />
        {title}
      </div>
      <div className="text-[12.5px] leading-relaxed text-dim">{typeof children === "string" ? <RichText value={children} /> : children}</div>
    </div>
  );
}

/* ------------------------------- Status ------------------------------- */

export function StatusBadge({ label, tone, dot }: { label: string; tone: Tone; dot?: boolean }) {
  return (
    <Badge tone={tone}>
      {dot && <span className={cx("size-1.5 rounded-full", tone === "danger" && "rec-dot")} style={{ background: TONE[tone].raw }} />}
      {label}
    </Badge>
  );
}

/* ------------------------------- ChartCard ------------------------------- */

export function ChartCard({
  title,
  sub,
  icon,
  tone,
  right,
  children,
  className,
}: {
  title: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: Tone;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHead title={title} sub={sub} icon={icon} tone={tone} right={right} />
      {children}
    </Card>
  );
}

/* ------------------------------- Segmented / Tabs / Chips ------------------------------- */

export function Seg<T extends string>({ value, options, onChange, size = "md" }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-line bg-panel2 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cx(
            "whitespace-nowrap rounded-md font-semibold transition",
            size === "sm" ? "px-2 py-1 text-[10.5px]" : "px-2.5 py-1.5 text-[11.5px]",
            value === o.v ? "bg-accent text-[#04161a]" : "text-mute hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, tabs, onChange }: { value: T; tabs: { v: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.v}
          onClick={() => onChange(t.v)}
          className={cx(
            "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[12.5px] font-semibold transition",
            value === t.v ? "border-accent text-accent" : "border-transparent text-mute hover:text-ink"
          )}
        >
          {t.label}
          {t.count != null && <span className="num rounded bg-panel3 px-1.5 text-[10px] text-dim">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, children, onClick, tone }: { active?: boolean; children: ReactNode; onClick?: () => void; tone?: Tone }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
        active
          ? tone
            ? cx(TONE[tone].bg, TONE[tone].text, "border-transparent ring-1", TONE[tone].ring)
            : "border-accent/50 bg-accent/12 text-accent"
          : "border-line bg-panel2 text-mute hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder = "Ara…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={cx("flex h-8 items-center gap-2 rounded-lg border border-line bg-panel2 px-2.5 text-mute focus-within:border-accent/50", className)}>
      <Search size={13} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-[12px] text-ink outline-none placeholder:text-mute"
      />
      {value && (
        <button onClick={() => onChange("")} className="text-mute hover:text-ink">
          <X size={12} />
        </button>
      )}
    </label>
  );
}

/** FilterBar: a row of labelled chip groups + optional search. */
export function FilterBar({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="card mb-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 p-3">
      {children}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-[10px] font-bold uppercase tracking-wide text-mute">{label}</span>
      {children}
    </div>
  );
}

/* ------------------------------- States ------------------------------- */

export function StateBox({ kind, text, onRetry }: { kind: "loading" | "empty" | "error"; text?: string; onRetry?: () => void }) {
  const Icon = kind === "loading" ? Loader2 : kind === "error" ? AlertTriangle : Search;
  const msg = text ?? (kind === "loading" ? "Veriler yükleniyor…" : kind === "error" ? "Veri alınamadı. Bağlantıyı kontrol edin." : "Bu filtre için kayıt yok.");
  return (
    <div
      className={cx(
        "grid place-items-center gap-2 rounded-xl border border-dashed py-10 text-center",
        kind === "error" ? "border-danger/40 bg-danger/6" : "border-line bg-panel2"
      )}
    >
      <Icon size={18} className={cx(kind === "loading" && "animate-spin", kind === "error" ? "text-danger" : "text-mute")} />
      <span className={cx("text-[12px]", kind === "error" ? "text-danger" : "text-mute")}>{msg}</span>
      {onRetry && (
        <Btn size="sm" icon={RefreshCw} onClick={onRetry}>
          Yeniden dene
        </Btn>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-lg bg-panel3", className)} />;
}

/* ------------------------------- DataTable ------------------------------- */

export type Col<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  className?: string;
  align?: "right";
};

export function DataTable<T>({
  rows,
  cols,
  rowKey,
  onRow,
  search,
  pageSize = 10,
  initialSort,
  toolbar,
  empty,
  rowClass,
}: {
  rows: T[];
  cols: Col<T>[];
  rowKey: (r: T) => string | number;
  onRow?: (r: T) => void;
  /** returns searchable text; enables the search box */
  search?: (r: T) => string;
  pageSize?: number;
  initialSort?: { key: string; dir: "asc" | "desc" };
  toolbar?: ReactNode;
  empty?: string;
  rowClass?: (r: T) => string | undefined;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let out = rows;
    if (search && q.trim()) {
      const needle = q.trim().toLocaleLowerCase("tr");
      out = out.filter((r) => search(r).toLocaleLowerCase("tr").includes(needle));
    }
    if (sort) {
      const col = cols.find((c) => c.key === sort.key);
      if (col?.sort) {
        const f = col.sort;
        out = [...out].sort((a, b) => {
          const va = f(a);
          const vb = f(b);
          const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "tr");
          return sort.dir === "asc" ? r : -r;
        });
      }
    }
    return out;
  }, [rows, q, sort, cols, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, cur * pageSize + pageSize);

  return (
    <div>
      {(search || toolbar) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {search && (
            <SearchBox
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(0);
              }}
              className="w-full sm:w-64"
            />
          )}
          {toolbar}
          <span className="num ml-auto text-[11px] text-mute">{filtered.length} kayıt</span>
        </div>
      )}
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-line text-left">
              {cols.map((c) => (
                <th key={c.key} className={cx("whitespace-nowrap pb-2 pr-3 text-[10.5px] font-semibold uppercase tracking-wide text-mute", c.align === "right" && "text-right")}>
                  {c.sort ? (
                    <button
                      onClick={() =>
                        setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "desc" }))
                      }
                      className={cx("inline-flex items-center gap-1 uppercase hover:text-ink", sort?.key === c.key && "text-accent")}
                    >
                      {c.label}
                      <ArrowUpDown size={10} />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRow ? () => onRow(r) : undefined}
                className={cx("border-b border-linesoft last:border-0", onRow && "cursor-pointer hover:bg-panel2", rowClass?.(r))}
              >
                {cols.map((c) => (
                  <td key={c.key} className={cx("whitespace-nowrap py-2.5 pr-3 align-middle text-dim", c.align === "right" && "text-right", c.className)}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!slice.length && <StateBox kind="empty" text={empty} />}
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-mute">
          <span className="num">
            {cur * pageSize + 1}–{Math.min(filtered.length, cur * pageSize + pageSize)} / {filtered.length}
          </span>
          <button disabled={cur === 0} onClick={() => setPage(cur - 1)} className="grid size-7 place-items-center rounded-md border border-line bg-panel2 disabled:opacity-40">
            <ChevronLeft size={13} />
          </button>
          <button disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="grid size-7 place-items-center rounded-md border border-line bg-panel2 disabled:opacity-40">
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Drawer / Modal ------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  sub,
  children,
  width = "max-w-[760px]",
  head,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  width?: string;
  head?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} aria-label="kapat" />
      <aside className={cx("drawer-in relative flex h-full w-full flex-col border-l border-line bg-panel shadow-2xl", width)}>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            {head}
            <h3 className="text-[16px] font-bold leading-snug text-ink">{title}</h3>
            {sub && <div className="mt-0.5 text-[12px] text-mute">{sub}</div>}
          </div>
          <button onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-panel2 text-mute transition hover:text-ink">
            <X size={15} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

/* ------------------------------- Misc ------------------------------- */

export function Stat({ label, value, tone, sub }: { label: string; value: ReactNode; tone?: Tone; sub?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 px-2.5 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-mute">{label}</div>
      <div className={cx("num mt-0.5 truncate text-[13.5px] font-bold", tone ? TONE[tone].text : "text-ink")}>{value}</div>
      {sub && <div className="mt-0.5 truncate text-[10.5px] text-mute">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-1 flex items-center justify-between gap-2">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-mute">{children}</h2>
      {right}
    </div>
  );
}

export function KpiGrid({ children, cols = "xl:grid-cols-6" }: { children: ReactNode; cols?: string }) {
  return <div className={cx("mb-4 grid grid-cols-2 gap-3 md:grid-cols-3", cols)}>{children}</div>;
}
