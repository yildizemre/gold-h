import { useNavigate } from "react-router-dom";
import { StateBox } from "../components/kit";
import { Btn, PageHead } from "../components/ui";

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div className="fade-up">
      <PageHead title="Sayfa bulunamadı" sub="Bu adres panelde yok." />
      <StateBox kind="error" text="İstenen ekran bulunamadı." />
      <div className="mt-3">
        <Btn variant="solid" onClick={() => nav("/")}>
          Dashboard'a dön
        </Btn>
      </div>
    </div>
  );
}
