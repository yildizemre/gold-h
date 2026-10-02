import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  Factory,
  QrCode,
  Check,
  Clock,
  Cog,
  FileBarChart,
  Fence,
  Coins,
  Scale,
  Package,
  Users,
  ShieldQuestion,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sun,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useAuth, type NavKey } from "../auth";
import { useTheme } from "../theme";
import { CAM_STATS, CITY } from "../data/city";
import { searchAll, type Hit } from "../data/search";
import { incidentStore, useIncidents, useUnreadCount } from "../data/store";
import { useOpenProposals } from "../data/proposals";
import { cx, DEMO_NOW, hhmmss } from "../lib/util";
import { AlertCard, IncidentProvider } from "./incident";
import { Badge } from "./ui";

type NavItem = { key: NavKey; no: string; label: string; icon: LucideIcon; to: string };

const NAV_RAW: (Omit<NavItem, "no"> & { group?: string })[] = [
  { key: "dashboard", label: "Üretim Özeti", icon: LayoutDashboard, to: "/" },
  { key: "notifications", label: "Bildirimler", icon: BellRing, to: "/notifications" },
  { key: "trace", label: "Tartı & Barkod İzlenebilirlik", icon: Scale, to: "/izlenebilirlik", group: "Modüller" },
  { key: "cnc", label: "CNC Makine Denetimi", icon: Cog, to: "/cnc" },
  { key: "staff", label: "Personel & Süreç", icon: Users, to: "/personel" },
  { key: "scrap", label: "Takoz & Hurda", icon: Coins, to: "/takoz-hurda" },
  { key: "perimeter", label: "Kritik Bölge Güvenliği", icon: Fence, to: "/cevre-guvenlik" },
  { key: "packing", label: "Paketleme & Kasa", icon: Package, to: "/paketleme" },
  { key: "proposals", label: "Öneri Modüller · Onay", icon: ShieldQuestion, to: "/oneriler", group: "Ek modüller" },
  { key: "incidents", label: "Olay & Kanıt Merkezi", icon: ShieldCheck, to: "/incidents", group: "Yönetim" },
  { key: "cameras", label: "Kamera Altyapısı", icon: Video, to: "/cameras" },
  { key: "reports", label: "Raporlar", icon: FileBarChart, to: "/reports" },
  { key: "leads", label: "Admin · Fuar Lead'leri", icon: QrCode, to: "/admin" },
];
const NAV: (NavItem & { group?: string })[] = NAV_RAW.map((x, i) => ({ ...x, no: String(i + 1).padStart(2, "0") }));

/** Company chip — the name comes from the link (?firma=…). */
export function CityChip({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 font-bold text-ink ${size === "lg" ? "px-3 py-2 text-[15px]" : "px-2.5 py-1.5 text-[12.5px]"} ${className}`}>
      <Factory size={size === "lg" ? 17 : 14} className="text-accent" />
      {CITY.full}
    </span>
  );
}

/** Hype Vision logo — dark wordmark on light theme, white wordmark on dark theme. */
export function Logo({ height = 26, sub = true, variant }: { height?: number; sub?: boolean; variant?: "dark" | "white" }) {
  const { mode } = useTheme();
  const v = variant ?? (mode === "light" ? "dark" : "white");
  if (!sub) return <img src="/logo-icon.png" alt="Hype Vision" style={{ height: height + 6 }} className="w-auto select-none" draggable={false} />;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <img src={v === "dark" ? "/logo-dark.png" : "/logo-white.png"} alt="Hype Vision" style={{ height }} className="w-auto select-none" draggable={false} />
      <span className="pl-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-mute">Kuyum Üretim Zekâsı</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */

function Clock_() {
  const [now, setNow] = useState(DEMO_NOW);
  useEffect(() => {
    const id = setInterval(() => setNow((d) => new Date(d.getTime() + 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden text-right leading-tight sm:block">
      <div className="num text-[13px] font-bold text-ink">{hhmmss(now)}</div>
      <div className="text-[10px] text-mute">{now.toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" })}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GlobalSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const hits = searchAll(q);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, []);

  const go = (h: Hit) => {
    nav(h.to);
    setQ("");
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div ref={ref} className="relative w-full max-w-[420px]">
      <label className="flex h-8.5 items-center gap-2 rounded-lg border border-line bg-panel2 px-2.5 text-mute focus-within:border-accent/50">
        <Search size={14} />
        <input
          ref={input}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setIdx(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setIdx((i) => Math.min(i + 1, hits.length - 1));
            if (e.key === "ArrowUp") setIdx((i) => Math.max(i - 1, 0));
            if (e.key === "Enter" && hits[idx]) go(hits[idx]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="CNC-04, TRAY-07, PRT-24809, hurda, HVG-5206…"
          className="w-full min-w-0 bg-transparent text-[12px] text-ink outline-none placeholder:text-mute"
        />
        <kbd className="hidden rounded border border-line px-1 text-[9.5px] font-semibold text-mute md:inline">Ctrl K</kbd>
      </label>
      {open && q && (
        <div className="fade-up absolute left-0 right-0 top-10 z-40 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
          {hits.length ? (
            hits.map((h, i) => (
              <button
                key={h.kind + h.label}
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(h)}
                className={cx("flex w-full items-center gap-2.5 px-3 py-2 text-left", i === idx ? "bg-accent/10" : "hover:bg-panel2")}
              >
                <Badge tone={h.kind === "Olay" ? "danger" : h.kind === "Kamera" ? "violet" : h.kind === "Parti" ? "ok" : h.kind === "Bölüm" ? "warn" : "accent"}>
                  {h.kind}
                </Badge>
                <span className="num text-[12.5px] font-semibold text-ink">{h.label}</span>
                <span className="truncate text-[11px] text-mute">{h.sub}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-[12px] text-mute">“{q}” için sonuç yok</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const unread = useUnreadCount();
  const items = useIncidents()
    .filter((i) => i.unread)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "relative grid size-8.5 place-items-center rounded-lg border border-line bg-panel2 text-dim transition hover:text-ink",
          open && "border-accent/50 text-accent"
        )}
        aria-label="Bildirimler"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="num absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-bgsoft">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fade-up absolute right-0 top-11 z-40 flex max-h-[78vh] w-[min(94vw,480px)] flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <span className="text-[13px] font-bold text-ink">Bildirimler</span>
            <div className="flex items-center gap-2">
              <Badge tone="danger">{unread} okunmamış</Badge>
              <button onClick={() => incidentStore.markAllRead()} className="flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink">
                <Check size={12} /> Tümünü okundu say
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {items.map((inc) => (
              <AlertCard key={inc.id} inc={inc} compact />
            ))}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              nav("/notifications");
            }}
            className="block border-t border-line px-3 py-2.5 text-center text-[12px] font-semibold text-accent hover:bg-panel2"
          >
            Tüm bildirimleri gör
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CenterBox({ collapsed }: { collapsed: boolean }) {
  const nav = useNavigate();
  if (collapsed)
    return (
      <button onClick={() => nav("/cameras")} title={CITY.full} className="mx-auto grid size-9 place-items-center rounded-lg border border-line bg-panel2 text-accent">
        <Factory size={15} />
      </button>
    );

  return (
    <button onClick={() => nav("/cameras")} className="block w-full rounded-xl border border-line bg-panel2 p-2.5 text-left">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-mute">{CITY.center}</div>
      <div className="mt-0.5 truncate text-[12.5px] font-bold text-ink">{CITY.full}</div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center">
        <div className="rounded-md bg-panel3 py-1">
          <div className="num text-[12px] font-bold text-ink">{CAM_STATS.total}</div>
          <div className="text-[9px] text-mute">Kamera</div>
        </div>
        <div className="rounded-md bg-ok/10 py-1">
          <div className="num text-[12px] font-bold text-ok">{CAM_STATS.online}</div>
          <div className="text-[9px] text-mute">Online</div>
        </div>
        <div className="rounded-md bg-warn/10 py-1">
          <div className="num text-[12px] font-bold text-warn">{CAM_STATS.warning + CAM_STATS.offline}</div>
          <div className="text-[9px] text-mute">Uyarı</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-mute">
        <Clock size={11} />
        Son veri: <span className="num font-semibold text-dim">{CITY.lastData}</span>
        <span className="rec-dot ml-auto size-1.5 rounded-full bg-ok" />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */

export function Layout() {
  const { user, logout, can } = useAuth();
  const nav = useNavigate();
  const { mode, toggle: toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = useUnreadCount();
  const openProps = useOpenProposals();

  if (!user) return null;

  const sidebar = (
    <aside className={cx("flex h-full flex-col border-r border-line bg-bgsoft transition-all", collapsed ? "w-[68px]" : "w-[248px]")}>
      <div className={cx("flex h-[64px] shrink-0 items-center border-b border-line", collapsed ? "justify-center px-2" : "px-3.5")}>
        <Logo sub={!collapsed} height={24} />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {NAV.filter((i) => can(i.key)).map((item) => [
          item.group && !collapsed ? (
            <div key={item.group} className="px-2 pb-1 pt-3 text-[9.5px] font-bold uppercase tracking-[0.14em] text-mute">
              {item.group}
            </div>
          ) : null,
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-2.5 rounded-lg px-2 py-[6.5px] text-[12.5px] font-medium transition",
                collapsed && "justify-center px-0",
                isActive ? "bg-accent/12 text-accent ring-1 ring-accent/25" : "text-dim hover:bg-panel2 hover:text-ink"
              )
            }
          >
            {({ isActive }) => (
              <>
                {!collapsed && <span className={cx("num w-4 shrink-0 text-[10px] font-bold", isActive ? "text-accent" : "text-mute")}>{item.no}</span>}
                <item.icon size={15} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.key === "proposals" && openProps > 0 && !collapsed && (
                  <span className="num ml-auto grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-[#04161a]">{openProps}</span>
                )}
                {item.key === "notifications" && unread > 0 && (
                  <span className={cx("num grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white", collapsed ? "absolute ml-6 -mt-5" : "ml-auto")}>
                    {unread}
                  </span>
                )}
              </>
            )}
          </NavLink>,
        ])}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-2.5">
        <CenterBox collapsed={collapsed} />
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          className={cx("flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-panel2", collapsed && "justify-center")}
        >
          <span className="num grid size-7 shrink-0 place-items-center rounded-md bg-accent/15 text-[11px] font-bold text-accent">{user.initials}</span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{user.name}</span>
                <span className="block truncate text-[10.5px] text-mute">{user.title}</span>
              </span>
              <LogOut size={13} className="shrink-0 text-mute" />
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <IncidentProvider>
      <div className="flex h-full overflow-hidden bg-bg">
        <div className="hidden lg:flex">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="h-full">{sidebar}</div>
            <button className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} aria-label="kapat" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[64px] shrink-0 items-center gap-2 border-b border-line bg-bgsoft px-2 sm:gap-3 sm:px-4">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setCollapsed(false);
                  setMobileOpen(true);
                } else setCollapsed((v) => !v);
              }}
              className="grid size-8.5 shrink-0 place-items-center rounded-lg border border-line bg-panel2 text-dim transition hover:text-ink"
              aria-label="Menü"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <CityChip />
              <Badge tone="ok" className="px-2 py-1">
                {CITY.shift}
              </Badge>
            </div>

            <div className="min-w-0 flex-1 xl:flex xl:justify-center">
              <GlobalSearch />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => nav("/sunum")}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-bold text-[#04161a] shadow-[0_6px_18px_-8px_var(--c-accent)] transition hover:brightness-110"
              >
                <MonitorPlay size={15} /> Sunum
              </button>
              <Clock_ />
              <button
                onClick={toggleTheme}
                className="grid size-8.5 place-items-center rounded-lg border border-line bg-panel2 text-dim transition hover:text-ink"
                aria-label="Tema"
              >
                {mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              <NotificationBell />
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1760px] p-4 sm:p-5">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </IncidentProvider>
  );
}
