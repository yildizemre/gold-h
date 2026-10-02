import { createContext, useContext, useEffect, useMemo, useState } from "react";

/** Route keys used both by the sidebar and by role based access. */
export type NavKey =
  | "dashboard"
  | "notifications"
  | "trace"
  | "cnc"
  | "staff"
  | "scrap"
  | "perimeter"
  | "afterhours"
  | "packing"
  | "proposals"
  | "leads"
  | "incidents"
  | "cameras"
  | "reports";

export type DemoRole = {
  id: string;
  name: string;
  title: string;
  scope: string;
  email: string;
  initials: string;
  /** "*" means every page */
  allowed: NavKey[] | "*";
  /** may grant permission for new CCTV modules (Öneri Modüller) */
  approve?: boolean;
};

const BASE: NavKey[] = ["dashboard", "notifications", "incidents", "proposals"];

export const DEMO_ROLES: DemoRole[] = [
  {
    id: "owner",
    name: "Genel Müdür",
    title: "Firma Sahibi / Genel Müdür",
    scope: "Tüm modüller · raporlar · yeni modül onayı",
    email: "yonetim@hypevision.demo",
    initials: "GM",
    allowed: "*",
    approve: true,
  },
  {
    id: "center",
    name: "Selin Arslan",
    title: "Üretim İzleme Merkezi Operatörü",
    scope: "7 modül · bildirim · kanıt · kamera altyapısı",
    email: "izleme@hypevision.demo",
    initials: "SA",
    allowed: "*",
  },
  {
    id: "production",
    name: "Murat Yıldız",
    title: "Üretim Müdürü",
    scope: "CNC · personel · takoz & hurda · paketleme",
    email: "uretim@hypevision.demo",
    initials: "MY",
    allowed: [...BASE, "trace", "cnc", "staff", "scrap", "packing", "reports"],
  },
  {
    id: "quality",
    name: "Elif Koç",
    title: "Kalite & İzlenebilirlik Sorumlusu",
    scope: "Tartı · barkod · QR · takoz & hurda · paketleme klibi",
    email: "kalite@hypevision.demo",
    initials: "EK",
    allowed: [...BASE, "trace", "scrap", "packing"],
  },
  {
    id: "security",
    name: "Hakan Demir",
    title: "Güvenlik Amiri",
    scope: "Çevre çiti · mesai dışı giriş · kameralar",
    email: "guvenlik@hypevision.demo",
    initials: "HD",
    allowed: [...BASE, "perimeter", "afterhours", "cameras"],
  },
  {
    id: "hr",
    name: "Zeynep Aksoy",
    title: "İnsan Kaynakları",
    scope: "Personel verimliliği · mesai dışı · raporlar",
    email: "ik@hypevision.demo",
    initials: "ZA",
    allowed: [...BASE, "staff", "afterhours", "reports"],
  },
];

type Ctx = {
  user: DemoRole | null;
  login: (roleId: string) => void;
  logout: () => void;
  can: (k: NavKey) => boolean;
};

const AuthCtx = createContext<Ctx>(null as unknown as Ctx);

function readRole() {
  try {
    return localStorage.getItem("hvg.role");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [roleId, setRoleId] = useState<string | null>(readRole);

  useEffect(() => {
    try {
      if (roleId) localStorage.setItem("hvg.role", roleId);
      else localStorage.removeItem("hvg.role");
    } catch {
      /* private mode */
    }
  }, [roleId]);

  const user = useMemo(() => DEMO_ROLES.find((r) => r.id === roleId) ?? null, [roleId]);

  const value = useMemo<Ctx>(
    () => ({
      user,
      login: setRoleId,
      logout: () => setRoleId(null),
      can: (k) => (!user ? false : user.allowed === "*" || user.allowed.includes(k)),
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
