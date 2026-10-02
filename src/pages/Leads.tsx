import { useEffect, useState } from "react";
import { Download, KeyRound, RefreshCw } from "lucide-react";
import { LeadQR } from "../components/LeadQR";
import { Badge, Btn, Card, CardHead, PageHead, Table, Td, Tr } from "../components/ui";

type Lead = { name: string; company: string; email: string; phone: string; meeting?: string; note?: string; at: string };

/** Admin · fuar lead listesi (Vercel Blob'dan, ADMIN_KEY ile). */
export default function Leads() {
  const [key, setKey] = useState(() => {
    try {
      return localStorage.getItem("hvg.adminKey") || "";
    } catch {
      return "";
    }
  });
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (k = key) => {
    if (!k) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/leads", { headers: { "x-admin-key": k } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Hata");
      setLeads(j.leads);
      try {
        localStorage.setItem("hvg.adminKey", k);
      } catch {
        /* ignore */
      }
    } catch (x) {
      setErr((x as Error).message);
    }
    setBusy(false);
  };

  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fade-up">
      <PageHead
        title="Admin · Fuar Lead'leri"
        sub="QR formundan gelen kayıtlar · her kayıt ayrıca e-posta ile size iletilir"
        right={
          <>
            <Btn icon={RefreshCw} onClick={() => load()}>{busy ? "Yükleniyor…" : "Yenile"}</Btn>
            {leads && (
              <a href={`/api/leads?format=csv&key=${encodeURIComponent(key)}`} className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-bold text-[#04161a]">
                <Download size={14} /> Excel (CSV)
              </a>
            )}
          </>
        }
      />
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Card>
          <CardHead title="Admin anahtarı" sub="Vercel'de tanımladığınız ADMIN_KEY" icon={KeyRound} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex gap-2"
          >
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-panel2 px-3 text-[13px] text-ink outline-none focus:border-accent" />
            <Btn variant="solid">Listele</Btn>
          </form>
          {err && <p className="mt-2 text-[12px] text-danger">{err}</p>}
        </Card>
        <LeadQR />
      </div>
      {leads && (
        <Card>
          <CardHead title={`${leads.length} kayıt`} sub="En yeni en üstte" right={<Badge tone="ok">canlı</Badge>} />
          <Table head={["Zaman", "Ad Soyad", "Firma", "E-posta", "Telefon", "Toplantı", "Not"]}>
            {leads.map((l) => (
              <Tr key={l.at + l.email}>
                <Td className="num whitespace-nowrap">{new Date(l.at).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</Td>
                <Td className="font-semibold text-ink">{l.name}</Td>
                <Td>{l.company}</Td>
                <Td>
                  <a className="text-accent" href={`mailto:${l.email}`}>{l.email}</a>
                </Td>
                <Td>
                  <a className="text-accent" href={`tel:${l.phone}`}>{l.phone}</a>
                </Td>
                <Td>{l.meeting}</Td>
                <Td>{l.note}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
