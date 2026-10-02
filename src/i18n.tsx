import { createContext, useCallback, useContext, useMemo } from "react";

/** Panel is Turkish-only; LS stays so shared components can accept either shape. */
export type LS = { tr: string; en: string } | string;

type Ctx = { l: (v: LS | undefined) => string };

const LangCtx = createContext<Ctx>({ l: (v) => (v == null ? "" : typeof v === "string" ? v : v.tr) });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const l = useCallback((v: LS | undefined) => (v == null ? "" : typeof v === "string" ? v : v.tr), []);
  const value = useMemo(() => ({ l }), [l]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
