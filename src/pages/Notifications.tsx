import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { AlertCard } from "../components/incident";
import { Chip, FilterBar, FilterGroup, Seg, StateBox } from "../components/kit";
import { Btn, PageHead } from "../components/ui";
import { CITY } from "../data/city";
import { CAT_META, CATS, STATUS_META, type Cat, type Sev, type Status } from "../data/incidents";
import { incidentStore, useIncidents } from "../data/store";

export default function Notifications() {
  const all = useIncidents();
  const [view, setView] = useState<"group" | "time">("group");
  const [sev, setSev] = useState<Sev | "all">("all");
  const [cat, setCat] = useState<Cat | "all">("all");
  const [status, setStatus] = useState<Status | "all" | "open">("all");

  const list = useMemo(
    () =>
      all.filter(
        (i) =>
          (sev === "all" || i.sev === sev) &&
          (cat === "all" || i.cat === cat) &&
          (status === "all" || (status === "open" ? i.status === "new" || i.status === "review" : i.status === status))
      ),
    [all, sev, cat, status]
  );
  const unread = all.filter((i) => i.unread).length;
  const count = (s: Sev) => all.filter((i) => i.sev === s).length;

  return (
    <div className="fade-up">
      <PageHead
        title="Bildirimler"
        sub={`${CITY.full} · ${CITY.day} · ${all.length} bildirim · ${unread} okunmamış · her bildirim kamera görüntüsüyle`}
        right={
          <>
            <Seg
              value={view}
              onChange={setView}
              options={[
                { v: "group", label: "Modüle göre" },
                { v: "time", label: "Zaman sırası" },
              ]}
            />
            <Btn icon={CheckCheck} onClick={() => incidentStore.markAllRead()}>
              Tümünü okundu say
            </Btn>
          </>
        }
      />

      <FilterBar>
        <FilterGroup label="Önem">
          <Chip active={sev === "all"} onClick={() => setSev("all")}>Tümü · {all.length}</Chip>
          <Chip active={sev === "critical"} onClick={() => setSev("critical")} tone="danger">Kritik · {count("critical")}</Chip>
          <Chip active={sev === "warning"} onClick={() => setSev("warning")} tone="warn">Uyarı · {count("warning")}</Chip>
          <Chip active={sev === "info"} onClick={() => setSev("info")}>Bilgi · {count("info")}</Chip>
        </FilterGroup>
        <FilterGroup label="Durum">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>Tümü</Chip>
          <Chip active={status === "open"} onClick={() => setStatus("open")}>Açık</Chip>
          {(Object.keys(STATUS_META) as Status[]).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {STATUS_META[s].label}
            </Chip>
          ))}
        </FilterGroup>
        <div className="w-full border-t border-linesoft pt-2.5">
          <FilterGroup label="Modül">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>Tümü</Chip>
            {CATS.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {CAT_META[c].emoji} {CAT_META[c].short}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </FilterBar>

      {!list.length ? (
        <StateBox kind="empty" text="Bu filtrelerle eşleşen bildirim yok." />
      ) : view === "time" ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...list]
            .sort((a, b) => b.at.getTime() - a.at.getTime())
            .map((i) => (
              <AlertCard key={i.id} inc={i} stacked />
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {CATS.map((c) => {
            const items = list.filter((i) => i.cat === c).sort((a, b) => a.no - b.no);
            if (!items.length) return null;
            return (
              <section key={c}>
                <h2 className="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-ink">
                  <span className="num grid size-6 place-items-center rounded-md text-[12px] text-white" style={{ background: CAT_META[c].color }}>
                    {CAT_META[c].no}
                  </span>
                  {CAT_META[c].label}
                  <span className="num rounded bg-panel3 px-1.5 text-[11px] text-mute">{items.length}</span>
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((i) => (
                    <AlertCard key={i.id} inc={i} stacked />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
