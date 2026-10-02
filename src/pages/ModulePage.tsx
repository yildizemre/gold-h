import { useNavigate } from "react-router-dom";
import { BellRing, CheckCircle2, ListChecks, MonitorPlay, Route, Sparkles } from "lucide-react";
import { Chart, Legend, RankBars } from "../components/charts";
import { AlertGrid } from "../components/incident";
import { AIInsight, ChartCard, KpiCard, SectionTitle } from "../components/kit";
import { Badge, Btn, Card, CardHead, PageHead, Table, Td, TONE, Tr } from "../components/ui";
import { CITY } from "../data/city";
import { CAT_META, incidentsOf, type Cat } from "../data/incidents";
import { MODULES } from "../data/modules";
import { cx, n } from "../lib/util";

/** Slide of the deck that belongs to each module (see Presentation.tsx). */
const SLIDE_OF: Record<Cat, number> = { trace: 6, cnc: 7, staff: 8, scrap: 9, perimeter: 10, afterhours: 11, packing: 11 };

export default function ModulePage({ cat }: { cat: Cat }) {
  const nav = useNavigate();
  const meta = CAT_META[cat];
  const m = MODULES[cat];
  const incs = incidentsOf(cat);
  const crit = incs.filter((i) => i.sev === "critical").length;

  return (
    <div className="fade-up">
      <PageHead
        title={
          <span className="flex items-center gap-2.5">
            <span className="num grid size-8 place-items-center rounded-lg text-[15px] font-bold text-white" style={{ background: meta.color }}>
              {meta.no}
            </span>
            {meta.label}
          </span>
        }
        sub={`${m.tagline} · ${CITY.full} · ${CITY.day}`}
        right={
          <>
            <Btn icon={BellRing} variant="outline" onClick={() => nav("/notifications")}>
              {incs.length} bildirim{crit ? ` · ${crit} kritik` : ""}
            </Btn>
            <Btn icon={MonitorPlay} onClick={() => nav(`/sunum#${SLIDE_OF[cat]}`)}>
              Sunumda gör
            </Btn>
          </>
        }
      />

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHead title="Modül ne yapar?" sub={m.intro} icon={Sparkles} />
          <div className="grid gap-2 sm:grid-cols-2">
            {m.capabilities.map((c) => (
              <div key={c} className="flex items-start gap-2 rounded-lg border border-line bg-panel2 px-2.5 py-2 text-[12px] text-dim">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" />
                {c}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Bildirimlerin gittiği sorumlular" sub="Her bildirim görüntüsüyle birlikte ilgili sorumlunun ekranına ve telefonuna düşer" icon={Route} />
          <div className="flex flex-wrap gap-1.5">
            {m.units.map((u) => (
              <Badge key={u} tone="accent" className="px-2 py-1 text-[11.5px]">
                {u}
              </Badge>
            ))}
          </div>
          <div className="mt-3">
            <AIInsight>{m.insight}</AIInsight>
          </div>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {m.kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} unit={k.unit} sub={k.sub} tone={k.tone} delta={k.delta} good={k.good} alert={k.tone === "danger"} />
        ))}
      </div>

      <SectionTitle>Bugünkü görüntülü bildirimler · {incs.length}</SectionTitle>
      <div className="mb-5">
        <AlertGrid items={incs} />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title={m.chart.title} sub={m.chart.sub} right={<Legend series={m.chart.series} />}>
          <Chart data={m.chart.data} series={m.chart.series} height={240} stacked={m.chart.series.some((s) => s.stackId)} />
        </ChartCard>
        <Card>
          <CardHead title={m.rank.title} sub={m.rank.sub} icon={ListChecks} />
          <RankBars items={m.rank.items} unit={m.rank.unit} formatter={(v) => n(v, v % 1 ? 1 : 0)} />
        </Card>
      </div>

      <Card>
        <CardHead title={m.table.title} sub={m.table.sub} />
        <Table head={m.table.head}>
          {m.table.rows.map((r) => (
            <Tr key={r.cells[0]}>
              {r.cells.map((c, i) => (
                <Td key={i} className={cx(i === 0 && "font-semibold text-ink", i === r.cells.length - 1 && r.tone && TONE[r.tone].text)}>
                  {c}
                </Td>
              ))}
            </Tr>
          ))}
        </Table>
      </Card>

    </div>
  );
}
