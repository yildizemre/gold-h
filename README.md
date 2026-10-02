# Hype Vision · Kuyum Üretim Zekâsı (altın üreticisi demo)

Altın / kuyum üreticilerine gönderilecek panel + sunum. Mevcut CCTV kameraları üzerinde 7 modül:
1 Tartı & Barkod İzlenebilirlik · 2 CNC Makine Denetimi · 3 Personel Verimliliği · 4 Takoz & Hurda ·
5 Çevre Çiti Güvenliği · 6 Mesai Dışı Giriş · 7 Paketleme Hattı & Klip.

Ek: **Öneri Modüller** (`/oneriler`) — yalnızca CCTV ile eklenebilecek 12 analiz (kasa çift kişi kuralı, gözetimsiz altın,
çıkış kontrolü, kamera sabotajı…). Müşteri her biri için "Evet, ekle" / "Şimdilik hayır" der; "Evet" yetki ekranını açar.
Genel Müdür rolü yetki verip ekler, diğer roller onaya gönderir. Kararlar tarayıcıda saklanır, "Geri al" ile sıfırlanır.

Demo günü: **2 Ekim 2026 Cuma 18:20** · 72 kamera · 23 görüntülü AI bildirimi (CNC 5, diğer modüller 3).

## Firmaya özel link

- `/?firma=Altınyıldız%20Kuyumculuk` → panel ve sunum o isimle açılır (tarayıcı hatırlar)
- `/sunum?firma=...` → sunum, giriş gerektirmez · `?firma=` boş → "Örnek Kuyumculuk"

## Çalıştırma

```
npm install
npm run dev
```

Giriş ekranında rol seçilir (Genel Müdür, İzleme Operatörü, Üretim, Kalite, Güvenlik, İK); şifre `demo`.

## Sunum

`/sunum` — 18 slayt, 1600×900, ekrana ölçeklenir (telefon dahil). ←/→, F tam ekran, Esc panele döner, `#n` ile slayta git.
"PDF indir" → yazdır penceresi → "PDF olarak kaydet" (`/sunum?pdf&yazdir`).

## Görseller

Bildirim görselleri `public/bildirimler/<dosya>.jpg`. Liste ve promptlar: `GORSEL-PROMPTLARI.md`.
Dosya yokken panel kamera slotu + dosya adını gösterir. Veri: `src/data/incidents.ts`, modüller: `src/data/modules.ts`,
öneri modüller: `src/data/proposals.ts`, firma adı / bölümler: `src/data/city.ts`.
