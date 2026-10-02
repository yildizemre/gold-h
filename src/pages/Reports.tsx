import { useState } from "react";
import { CalendarDays, Check, Download, FileBarChart, Mail } from "lucide-react";
import { Chart, Legend } from "../components/charts";
import { ChartCard } from "../components/kit";
import { Badge, Btn, Card, CardHead, PageHead } from "../components/ui";
import { CITY } from "../data/city";

const REPORTS = [
  { t: "Günlük Üretim Özeti", who: "Genel Müdür", when: "Her gün 08:00", fmt: "PDF + e-posta" },
  { t: "Metal Dengesi · Takoz & Hurda", who: "Kasa / Değerli Metal", when: "Her gün 18:00", fmt: "Excel + PDF · tartı klipleriyle" },
  { t: "Parti İzlenebilirlik ve Gram Farkı", who: "Kalite & İzlenebilirlik", when: "Her gün 18:00", fmt: "PDF · parti bazlı" },
  { t: "CNC Sayım ↔ ERP Uyuşmazlığı", who: "Üretim Müdürlüğü", when: "Vardiya sonu", fmt: "Excel" },
  { t: "Personel / İstasyon Verimliliği", who: "Üretim · İK", when: "Haftalık · Pazartesi", fmt: "PDF" },
  { t: "Çevre Güvenliği ve Mesai Dışı Giriş", who: "Güvenlik Amirliği", when: "Her sabah 07:00", fmt: "PDF · gece klipleri" },
  { t: "Paketleme Klip Arşivi", who: "Paketleme & Sevkiyat", when: "Sipariş bazlı", fmt: "Link · müşteriye paylaşılabilir" },
];

const WEEK = ["Cum", "Cmt", "Paz", "Pzt", "Sal", "Çar", "Per"].map((t, i) => ({
  t,
  crit: [4, 1, 0, 3, 5, 4, 6][i],
  warn: [9, 3, 1, 8, 10, 7, 9][i],
  solved: [19, 6, 2, 17, 21, 18, 16][i],
}));
const WEEK_SERIES = [
  { key: "crit", name: "Kritik", color: "#fb5d5d", type: "bar" as const, stackId: "w", barSize: 18 },
  { key: "warn", name: "Uyarı", color: "#f6ae2d", type: "bar" as const, stackId: "w", barSize: 18 },
  { key: "solved", name: "Çözülen", color: "#16c79a", type: "line" as const },
];

export default function Reports() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="fade-up">
      <PageHead title="Raporlar" sub={`${CITY.full} · sorumlu bazlı otomatik raporlar · e-posta / PDF / Excel / ERP entegrasyonu`} />

      <ChartCard className="mb-4" title="Son 7 gün" sub="Bildirim ve çözüm trendi" icon={CalendarDays} right={<Legend series={WEEK_SERIES} />}>
        <Chart data={WEEK} series={WEEK_SERIES} height={230} />
      </ChartCard>

      <Card>
        <CardHead title="Hazır rapor şablonları" sub="Her sorumlu kendi raporunu kendi saatinde alır" icon={FileBarChart} />
        <div className="grid gap-2 md:grid-cols-2">
          {REPORTS.map((r) => (
            <div key={r.t} className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-panel2 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                <FileBarChart size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">{r.t}</div>
                <div className="truncate text-[11px] text-mute">
                  {r.who} · {r.when}
                </div>
                <Badge tone="mute" className="mt-1 max-w-full truncate">
                  {r.fmt}
                </Badge>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <Btn size="sm" icon={done === r.t ? Check : Download} onClick={() => setDone(r.t)}>
                  {done === r.t ? "Hazırlandı" : "İndir"}
                </Btn>
                <Btn size="sm" icon={Mail} variant="outline">
                  Abone ol
                </Btn>
              </div>
            </div>
          ))}
        </div>
        {done && <p className="mt-3 text-[11.5px] text-mute">Demo ortamı: rapor dosyası canlı kurulumda üretilir.</p>}
      </Card>
    </div>
  );
}
