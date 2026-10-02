import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, type NavKey } from "./auth";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import Cameras from "./pages/Cameras";
import Notifications from "./pages/Notifications";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Presentation from "./pages/Presentation";
import Proposals from "./pages/Proposals";
import { CAT_META, CATS } from "./data/incidents";

function Guard({ k, children }: { k: NavKey; children: React.ReactNode }) {
  const { can } = useAuth();
  return can(k) ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* the deck is shareable without logging in */}
        <Route path="/sunum" element={<Presentation />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const page = (k: NavKey, el: React.ReactNode) => <Guard k={k}>{el}</Guard>;

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/sunum" element={<Presentation />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        {CATS.map((c) => (
          <Route key={c} path={CAT_META[c].to} element={page(c, <ModulePage key={c} cat={c} />)} />
        ))}
        <Route path="/oneriler" element={page("proposals", <Proposals />)} />
        <Route path="/cameras" element={page("cameras", <Cameras />)} />
        <Route path="/notifications" element={page("notifications", <Notifications />)} />
        <Route path="/incidents" element={page("incidents", <Incidents />)} />
        <Route path="/reports" element={page("reports", <Reports />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
