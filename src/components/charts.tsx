import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLang, type LS } from "../i18n";
import { cx } from "../lib/util";
import { TONE, type Tone } from "./ui";

export const C = {
  accent: "#18d5e8",
  warn: "#f6ae2d",
  danger: "#fb5d5d",
  ok: "#16c79a",
  violet: "#8b7cf6",
  mute: "#64748b",
};

export type SeriesDef = {
  key: string;
  name: LS | string;
  color: string;
  type?: "area" | "line" | "bar";
  dashed?: boolean;
  stackId?: string;
  barSize?: number;
};

function Tip({ active, payload, label }: any) {
  const { l } = useLang();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-2.5 py-2 shadow-xl">
      <div className="mb-1 text-[10.5px] font-semibold text-mute">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11.5px]">
          <span className="size-2 rounded-sm" style={{ background: p.color || p.fill }} />
          <span className="text-dim">{l(p.name)}</span>
          <span className="num ml-auto font-semibold text-ink">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Combined area / line / bar chart driven by a series definition list. */
export function Chart({
  data,
  xKey = "t",
  series,
  height = 210,
  yWidth = 30,
  refLines,
  stacked,
}: {
  data: any[];
  xKey?: string;
  series: SeriesDef[];
  height?: number;
  yWidth?: number;
  refLines?: { y: number; label: string; color?: string }[];
  stacked?: boolean;
}) {
  const { l } = useLang();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.42} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--c-line)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tickMargin={8} interval="preserveStartEnd" />
          <YAxis axisLine={false} tickLine={false} width={yWidth} tickMargin={4} />
          <Tooltip content={<Tip />} cursor={{ stroke: "var(--c-accent)", strokeOpacity: 0.3 }} />
          {refLines?.map((r, i) => (
            <ReferenceLine
              key={i}
              y={r.y}
              stroke={r.color ?? C.warn}
              strokeDasharray="5 5"
              strokeOpacity={0.7}
              label={{ value: r.label, position: "insideTopRight", fill: r.color ?? C.warn, fontSize: 10 }}
            />
          ))}
          {series.map((s) =>
            s.type === "bar" ? (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={l(s.name)}
                fill={s.color}
                radius={[3, 3, 0, 0]}
                barSize={s.barSize ?? 14}
                stackId={stacked ? s.stackId ?? "a" : s.stackId}
              />
            ) : s.type === "line" ? (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={l(s.name)}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                activeDot={{ r: 3.5 }}
              />
            ) : (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={l(s.name)}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#g-${s.key})`}
                stackId={stacked ? s.stackId ?? "a" : s.stackId}
              />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Legend({ series }: { series: SeriesDef[] }) {
  const { l } = useLang();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {series.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-mute">
          <span className="size-2 rounded-sm" style={{ background: s.color }} />
          {l(s.name)}
        </span>
      ))}
    </div>
  );
}

/** Horizontal ranked bars — crisper than recharts for small label lists. */
export function RankBars({
  items,
  max,
  unit,
  formatter,
}: {
  items: { label: LS | string; value: number; tone?: Tone; hint?: LS | string }[];
  max?: number;
  unit?: string;
  formatter?: (v: number) => string;
}) {
  const { l } = useLang();
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const tone = it.tone ?? "accent";
        return (
          <div key={i}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-[12px] text-dim">{l(it.label)}</span>
              <span className="num shrink-0 text-[12px] font-semibold text-ink">
                {formatter ? formatter(it.value) : it.value}
                {unit && <span className="ml-0.5 text-[10.5px] font-medium text-mute">{unit}</span>}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel3">
              <div
                className="h-full rounded-full"
                style={{ width: `${(it.value / top) * 100}%`, background: TONE[tone].raw }}
              />
            </div>
            {it.hint && <div className="mt-1 text-[10.5px] text-mute">{l(it.hint)}</div>}
          </div>
        );
      })}
    </div>
  );
}

/** Weekly x hourly density grid. */
export function Heatmap({
  rows,
  hourLabels,
  onCell,
}: {
  rows: { day: LS | string; values: number[] }[];
  hourLabels?: number[];
  onCell?: (day: number, hour: number) => void;
}) {
  const { l } = useLang();
  const labels = hourLabels ?? [0, 4, 8, 12, 16, 20];
  const color = (v: number) => {
    if (v < 10) return "var(--c-panel-3)";
    const t = Math.min(1, v / 100);
    if (t > 0.8) return `color-mix(in srgb, ${C.danger} ${40 + t * 55}%, transparent)`;
    if (t > 0.55) return `color-mix(in srgb, ${C.warn} ${35 + t * 55}%, transparent)`;
    return `color-mix(in srgb, ${C.accent} ${18 + t * 70}%, transparent)`;
  };
  return (
    <div className="space-y-1">
      {rows.map((r, di) => (
        <div key={di} className="flex items-center gap-1.5">
          <span className="w-16 shrink-0 truncate text-[10.5px] font-medium text-mute">{l(r.day)}</span>
          <div className="flex flex-1 gap-[2px]">
            {r.values.map((v, hi) => (
              <button
                key={hi}
                onClick={onCell ? () => onCell(di, hi) : undefined}
                title={`${l(r.day)} ${String(hi).padStart(2, "0")}:00 — ${v}%`}
                className={cx(
                  "h-5 flex-1 rounded-[3px] transition",
                  onCell && "hover:ring-1 hover:ring-accent/60"
                )}
                style={{ background: color(v) }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="w-16 shrink-0" />
        <div className="flex flex-1 justify-between text-[10px] text-mute">
          {labels.map((h) => (
            <span key={h}>{String(h).padStart(2, "0")}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Donut({
  value,
  max,
  size = 132,
  thickness = 13,
  center,
  tone,
}: {
  value: number;
  max: number;
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  tone?: Tone;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const auto: Tone = pct >= 90 ? "danger" : pct >= 75 ? "warn" : "ok";
  const t = tone ?? auto;
  const data = [
    { name: "v", value: pct },
    { name: "r", value: 100 - pct },
  ];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size / 2 - thickness}
          outerRadius={size / 2 - 2}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
        >
          <Cell fill={TONE[t].raw} />
          <Cell fill="var(--c-panel-3)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
    </div>
  );
}

/** Simple flow diagram for entrance → reception → elevator style paths. */
export function FlowPath({
  steps,
}: {
  steps: { label: LS | string; value: number; sub?: LS | string; tone?: Tone }[];
}) {
  const { l } = useLang();
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="flex items-stretch gap-1.5">
      {steps.map((s, i) => {
        const tone = s.tone ?? "accent";
        const h = 26 + (s.value / max) * 40;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-end justify-center" style={{ height: 70 }}>
              <div
                className="w-full rounded-t-md"
                style={{ height: h, background: `color-mix(in srgb, ${TONE[tone].raw} 28%, transparent)`, borderTop: `2px solid ${TONE[tone].raw}` }}
              />
            </div>
            <span className="num text-[13px] font-bold text-ink">{s.value}</span>
            <span className="text-center text-[10.5px] leading-tight text-mute">{l(s.label)}</span>
            {s.sub && <span className="text-center text-[10px] text-mute/80">{l(s.sub)}</span>}
          </div>
        );
      })}
    </div>
  );
}
