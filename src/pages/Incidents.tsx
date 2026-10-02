import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderSearch, Maximize2, ShieldCheck } from "lucide-react";
import { ChainStrip, OperatorActions, Shot, useOpenIncident } from "../components/incident";
import { Chip, DataTable, FilterBar, FilterGroup, KpiCard, StateBox, type Col } from "../components/kit";
import { Badge, Btn, Card, CardHead, PageHead } from "../components/ui";
import { CAT_META, CATS, SEV_META, STATUS_META, type Cat, type Incident, type Status } from "../data/incidents";
import { CITY, DISTRICTS } from "../data/city";
import { incidentStore, useIncidents } from "../data/store";
import { hhmmss } from "../lib/util";

type Row = Incident & { unread: boolean; notes: string[] };

export default function Incidents() {
  const all = useIncidents() as Row[];
  const [sp, setSp] = useSearchParams();
  const open = useOpenIncident();
  const [group, setGroup] = useState<Cat | "all">("all");
  const [district, setDistrict] = useState<string>("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [selId, setSelId] = useState<string>(all.find((i) => i.no === 14)!.id);

  useEffect(() => {
    const id = sp.get("id");
    const m = sp.get("m");
    if (m) {
      setDistrict(m);
      setSp({}, { replace: true });
    }
    if (id) {
      setSelId(id);
      incidentStore.markRead(id);
      setSp({}, { replace: true });
    }
  }, [sp, setSp]);

  const rows = useMemo(() => all.filter((i) => (group === "all" || i.cat === group) && (district === "all" || i.district === district) && (status === "all" || i.status === status)), [all, group, district, status]);
  const sel = all.find((i) => i.id === selId);

  const cols: Col<Row>[] = [
    { key: "no", label: "#", render: (r) => <span className="num font-bold text-mute">{r.no}</span>, sort: (r) => r.no },
    { key: "id", label: "Olay ID", render: (r) => <span className="num font-bold text-ink">{r.id}</span>, sort: (r) => r.id },
    { key: "title", label: "Olay", render: (r) => <span className="font-semibold text-ink">{r.title}</span>, sort: (r) => r.title },
    { key: "mod", label: "Modül", render: (r) => `${CAT_META[r.cat].emoji} ${CAT_META[r.cat].short}`, sort: (r) => CAT_META[r.cat].no },
    { key: "place", label: "Konum", render: (r) => r.place, sort: (r) => r.place },
    { key: "unit", label: "Sorumlu", render: (r) => r.unit, sort: (r) => r.unit },
    { key: "t", label: "Zaman", render: (r) => <span className="num">{hhmmss(r.at)}</span>, sort: (r) => r.at.getTime() },
    { key: "sev", label: "Önem", render: (r) => <Badge tone={SEV_META[r.sev].tone}>{SEV_META[r.sev].label}</Badge>, sort: (r) => ["info", "warning", "critical"].indexOf(r.sev) },
    { key: "st", label: "Durum", render: (r) => <Badge tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].label}</Badge>, sort: (r) => r.status },
  ];

  const cnt = (s: Status[]) => all.filter((i) => s.includes(i.status)).length;

  return (
    <div className="fade-up">
      <PageHead title="Olay & Kanıt Merkezi" sub={`Tüm AI olayları ve kamera kanıtları · ${CITY.full} · ${CITY.day}`} />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard label="Bugünkü olay" value={`${all.length}`} icon={FolderSearch} />
        <KpiCard label="Yeni" value={`${cnt(["new"])}`} icon={ShieldCheck} tone="danger" alert />
        <KpiCard label="Ekip yolda" value={`${cnt(["review"])}`} icon={ShieldCheck} tone="warn" />
        <KpiCard label="Doğrulandı" value={`${cnt(["verified"])}`} icon={ShieldCheck} tone="accent" />
        <KpiCard label="Çözüldü / yanlış alarm" value={`${cnt(["closed", "false"])}`} icon={ShieldCheck} tone="ok" />
      </div>

      <FilterBar>
        <FilterGroup label="Kategori">
          <Chip active={group === "all"} onClick={() => setGroup("all")}>Tümü</Chip>
          {CATS.map((g) => (
            <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
              {CAT_META[g].short} <span className="num opacity-70">{all.filter((i) => i.cat === g).length}</span>
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Bölüm">
          <Chip active={district === "all"} onClick={() => setDistrict("all")}>Tümü</Chip>
          {DISTRICTS.map((d) => (
            <Chip key={d.id} active={district === d.id} onClick={() => setDistrict(d.id)}>
              {d.name}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Durum">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>Tümü</Chip>
          {(Object.keys(STATUS_META) as Status[]).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {STATUS_META[s].label}
            </Chip>
          ))}
        </FilterGroup>
      </FilterBar>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <DataTable
            rows={rows}
            cols={cols}
            rowKey={(r) => r.id}
            onRow={(r) => {
              setSelId(r.id);
              incidentStore.markRead(r.id);
            }}
            search={(r) => `${r.id} ${r.title} ${r.cam} ${r.place} ${r.unit}`}
            initialSort={{ key: "t", dir: "desc" }}
            pageSize={15}
            rowClass={(r) => (r.id === selId ? "bg-accent/8" : r.unread ? "font-semibold" : undefined)}
          />
        </Card>

        <Card className="xl:sticky xl:top-0 xl:self-start">
          {sel ? (
            <>
              <CardHead
                title={`#${sel.no} · ${sel.title}`}
                sub={`${sel.id} · ${sel.place} · ${hhmmss(sel.at)} · → ${sel.unit}`}
                icon={ShieldCheck}
                tone={SEV_META[sel.sev].tone}
                right={
                  <Btn size="sm" icon={Maximize2} onClick={() => open(sel.id)}>
                    Detay
                  </Btn>
                }
              />
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Badge tone={SEV_META[sel.sev].tone}>{SEV_META[sel.sev].label}</Badge>
                <Badge tone={STATUS_META[sel.status].tone}>{STATUS_META[sel.status].label}</Badge>
                <Badge tone="mute">
                  {CAT_META[sel.cat].emoji} {CAT_META[sel.cat].label}
                </Badge>
              </div>
              <Shot inc={sel} onClick={() => open(sel.id)} />
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                {sel.facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 text-[12px]">
                    <dt className="text-mute">{k}</dt>
                    <dd className="num text-right font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12.5px] leading-relaxed text-dim">{sel.detail}</p>
              <div className="mt-3">
                <ChainStrip inc={sel} onPick={(x) => setSelId(x)} />
              </div>
              {sel.notes.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {sel.notes.map((n, i) => (
                    <div key={i} className="rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] text-dim">
                      {n}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 border-t border-line pt-3">
                <OperatorActions id={sel.id} status={sel.status} />
              </div>
            </>
          ) : (
            <StateBox kind="empty" text="Bir olay seçin" />
          )}
        </Card>
      </div>
    </div>
  );
}
