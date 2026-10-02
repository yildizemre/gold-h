import { Cpu, PlugZap, ShieldCheck, Video, WifiOff } from "lucide-react";
import { RankBars } from "../components/charts";
import { KpiCard } from "../components/kit";
import { Badge, Card, CardHead, PageHead, Table, Td, Tr } from "../components/ui";
import { CAM_STATS, CITY, DISTRICTS } from "../data/city";
import { CAT_META, CATS } from "../data/incidents";
import { n } from "../lib/util";

/** Camera count that feeds each module (a camera can feed more than one module). */
const BY_MODULE: Record<string, number> = { trace: 14, cnc: 12, staff: 34, scrap: 8, perimeter: 16, afterhours: 28, packing: 8 };

const ISSUES = [
  { cam: "CLA-03", place: "Cila bölümü", issue: "Lens tozlandı · görüntü bulanık", tone: "warn" as const, since: "10:12" },
  { cam: "CVR-14", place: "Batı çit · otopark", issue: "Çevrimdışı · PoE switch", tone: "danger" as const, since: "15:41" },
];

export default function Cameras() {
  return (
    <div className="fade-up">
      <PageHead title="Kamera Altyapısı" sub={`${CITY.full} · mevcut kameralar · marka bağımsız (ONVIF / RTSP) · Hype Vision edge sunucuları`} />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Toplam kamera" value={`${CAM_STATS.total}`} sub="yeni kamera alınmadı" icon={Video} />
        <KpiCard label="Online · analizde" value={`${CAM_STATS.online}`} sub={`%${n((CAM_STATS.online / CAM_STATS.total) * 100, 1)} erişilebilirlik`} icon={ShieldCheck} tone="ok" />
        <KpiCard label="Görüntü uyarısı" value={`${CAM_STATS.warning}`} sub="bulanık · engel · açı" icon={PlugZap} tone="warn" />
        <KpiCard label="Çevrimdışı" value={`${CAM_STATS.offline}`} sub="otomatik arıza kaydı açıldı" icon={WifiOff} tone="danger" alert />
        <KpiCard label="Edge sunucu" value="2" sub="tesis içinde · görüntü dışarı çıkmaz" icon={Cpu} tone="violet" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHead title="Modüllere göre kamera kullanımı" sub="Bir kamera birden fazla modülü besleyebilir" />
          <RankBars items={CATS.map((c) => ({ label: `${CAT_META[c].no}. ${CAT_META[c].label}`, value: BY_MODULE[c] }))} unit=" kamera" />
        </Card>
        <Card>
          <CardHead title="Bölüm bazında kamera" sub="Online / toplam" />
          <Table head={["Bölüm", "Kamera", "Online", "Durum"]}>
            {DISTRICTS.map((d, i) => {
              const off = i === 3 || i === 7 ? 1 : 0;
              return (
                <Tr key={d.id}>
                  <Td className="font-semibold text-ink">{d.name}</Td>
                  <Td className="num">{d.cams}</Td>
                  <Td className="num">{d.cams - off}</Td>
                  <Td>{off ? <Badge tone="warn">{off} uyarı</Badge> : <Badge tone="ok">sağlıklı</Badge>}</Td>
                </Tr>
              );
            })}
          </Table>
        </Card>
      </div>

      <Card>
        <CardHead title="Kamera sağlığı uyarıları" sub="Kör kamera fark edilmeden kalmaz: bulanıklık, engel, açı değişimi ve bağlantı kaybı otomatik izlenir" />
        <Table head={["Kamera", "Konum", "Sorun", "Başlangıç"]}>
          {ISSUES.map((x) => (
            <Tr key={x.cam}>
              <Td className="num font-semibold text-ink">{x.cam}</Td>
              <Td>{x.place}</Td>
              <Td>
                <Badge tone={x.tone}>{x.issue}</Badge>
              </Td>
              <Td className="num">{x.since}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
