import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR pointing at the public lead form (/iletisim) on the current host. */
export function LeadQR({ size = 168, className = "" }: { size?: number; className?: string }) {
  const [src, setSrc] = useState("");
  const url = `${window.location.origin}/iletisim`;
  useEffect(() => {
    QRCode.toDataURL(url, { width: size * 2, margin: 1, color: { dark: "#06172A", light: "#FFFFFF" } }).then(setSrc).catch(() => {});
  }, [url, size]);
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl border border-line bg-panel p-3 ${className}`}>
      {src && <img src={src} alt="İletişim QR" style={{ width: size, height: size }} className="rounded-lg bg-white" />}
      <div className="max-w-[170px]">
        <div className="text-[13px] font-bold text-ink">Bilgi bırakın 📲</div>
        <div className="mt-1 text-[11.5px] leading-snug text-mute">Telefonunuzla okutun, bilgilerinizi bırakın; sizinle iletişime geçelim.</div>
      </div>
    </div>
  );
}
