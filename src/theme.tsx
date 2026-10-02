import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Mode = "dark" | "light";
type Ctx = { mode: Mode; toggle: () => void };

const ThemeCtx = createContext<Ctx>(null as unknown as Ctx);

function readMode(): Mode {
  try {
    return (localStorage.getItem("hvg.theme") as Mode) || "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(readMode);

  useEffect(() => {
    document.documentElement.classList.toggle("light", mode === "light");
    try {
      localStorage.setItem("hvg.theme", mode);
    } catch {
      /* private mode */
    }
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")) }),
    [mode]
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
