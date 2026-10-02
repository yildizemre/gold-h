# Bildirim görselleri — slotlar ve promptlar

Her bildirimin bir görsel slotu var: `public/bildirimler/<dosya>.jpg`. Dosyayı bu isimle klasöre atınca panel ve sunum
kendiliğinden gösterir (o zamana kadar kamera slotu + dosya adı görünür). Önerilen oran **16:10** (ör. 1600×1000).

Tüm promptlara eklenecek ortak stil:

> Photorealistic CCTV security camera still, high ceiling-mounted top-down angle, gold jewellery manufacturing workshop
> (CNC machines, stainless steel tables, precision scales, trays of small gold parts / rings), workers in navy work uniforms
> with white gloves and safety glasses. AI video analytics overlay in the same style as the reference images:
> top-left black OSD box "CAM-XX | <AREA>" and time "HH:MM:SS", thin green / blue / yellow / red bounding boxes with
> small label tags (OPERATOR-03, TRAY-07…), small dark info panels with counts and a coloured STATUS line.
> Natural industrial lighting, 16:9, no readable faces, no logos.

Hazır görsellerin (3, 4, 6) stilini referans al: ChatGPT'ye bu görsellerden birini yükleyip "aynı kamera stili ve overlay ile" diyerek
aşağıdaki sahneyi isteyin. Dosya `.jpg` veya `.png` olabilir, adı tablodaki gibi olmalı.

| # | Dosya | Kamera (OSD) | Saat | Sahne |
|---|-------|--------------|------|-------|
| 1 | `tarti-barkod-okutma.jpg` | TRT-01 · Kalite tartı masası | 08:42:10 | Hassas tartı üzerinde tepside 14 ayar altın yüzükler, tartı ekranında "412,36 g", el barkod okuyucuyla tepsi etiketini okutuyor. Etiket: "PRT-24817 · 412,36 g · Döküm → CNC". |
| 2 | `qr-kabul-gram-farki.jpg` | PKT-QR · Paketleme kabul noktası | 11:18:44 | Paketleme girişinde tartı + QR okuyucu, tepside alyanslar; ekranda "286,12 g". Kırmızı/sarı etiket: "Fark −0,28 g · tolerans ±0,15 g". |
| 3 | `transfer-sayim-farki.jpg` | CAM-06 · Transfer istasyonu | 14:41:27 | ✅ HAZIR (kullanıcı görseli) — TRAY-11 18 → TRAY-12 17. |
| 4 | `cnc-makine-takibi.jpg` | CAM-03 · CNC alanı | 15:12:26 | ✅ HAZIR — CNC-03 kapak kapalı, çevrim aktif, bugün 14/14/13. |
| 5 | `cnc-kapak-acildi.jpg` | CAM-03 · CNC alanı | 14:42:18 | ✅ HAZIR — kapak açıldı, operatör ürün koyuyor. |
| 6 | `cnc-tepsi-eksik.jpg` | CAM-04 · CNC çıkışı | 14:36:42 | ✅ HAZIR — TRAY-07 23/24 COUNT MISMATCH. |
| 7 | `personel-tezgah-doluluk.jpg` | TZG-02 · Tezgâh hattı A | 12:30:00 | Kuyumcu tezgâhları sırası, ustalar çalışıyor (yüzler görünmez); her istasyonda yeşil kutu ve yüzde, bir istasyon sarı "T-09 %61". |
| 8 | `personel-makine-basi-bos.jpg` | CNC-05 · Yüzük tornalama | 14:12:40 | Çalışır durumda CNC, önünde kimse yok; sarı bölge kutusu "Operatör yok · 23 dk". |
| 9 | `personel-mola-asimi.jpg` | CLA-01 · Cila bölümü | 13:08:00 | Cila motorları olan bölüm, 6 istasyonun 3'ü boş; boş istasyonlarda sarı kutu "Boş · 38 dk". |
| 10 | `takoz-tartim.jpg` | DKM-02 · Döküm sonrası tartı | 09:55:12 | Döküm ağacından kesilmiş altın takoz/yolluk parçaları tartıda, ekranda "1.248,6 g". Etiket "Takoz 22K · geri eritme". |
| 11 | `hurda-oran-esik.jpg` | CNC-HRD · CNC hurda tartısı | 13:40:30 | Küçük kap içinde altın talaşı/hurda tartıda "46,2 g"; sarı etiket "Hurda %3,8 · hedef %2,5". |
| 12 | `hurda-tartisiz-cikis.jpg` | TZG-08 · Tezgâh hurda kovası | 17:12:48 | Personel küçük metal hurda kovasını taşıyıp bölümden çıkıyor, tartı yanında boş; kırmızı etiket "Tartılmadan çıktı". |
| 13 | `cevre-cit-ihlali.jpg` | CVR-11 · Kuzey çit hattı | 02:14:36 | Gece IR (siyah-beyaz) görüntü, fabrika çevre çiti, bir kişi çite tırmanıyor; kırmızı kutu "Çit ihlali · Z-3". |
| 14 | `cevre-cit-bekleme.jpg` | CVR-04 · Doğu çit · servis yolu | 04:37:02 | Gece IR, çitin dışında farları kapalı beyaz hafif ticari araç; sarı kutu "Bekleme 6 dk". |
| 15 | `cevre-devriye-dogrulama.jpg` | CVR-01 · Ana giriş | 06:05:00 | Şafak, üniformalı güvenlik görevlisi fener ile kontrol noktasında; yeşil etiket "Devriye 12/12 ✓". |
| 16 | `mesai-disi-kasa-koridoru.jpg` | KSA-02 · Kasa koridoru | 00:48:20 | Gece, loş koridor, çelik kasa odası kapısı, üniformasız bir kişi; kırmızı kutu "Mesai dışı · güvenlik dışı". |
| 17 | `mesai-disi-erken-giris.jpg` | DKM-01 · Döküm bölümü girişi | 06:12:09 | Sabah erken, boş döküm bölümü, bir kişi eritme fırınını hazırlıyor; sarı etiket "Mesai öncesi giriş". |
| 18 | `mesai-sonrasi-tezgah.jpg` | TZG-04 · Tezgâh hattı B | 17:58:40 | Akşam, ışıkların yarısı kapalı tezgâh bölümünde 2 kişi çalışıyor; sarı kutular "Mesai sonrası · onay yok". |
| 19 | `paketleme-klip.jpg` | PKT-03 · Paketleme masası 3 | 10:44:03 | Paketleme masası, kadife yüzük kutuları, eller yüzükleri kutulara yerleştiriyor; sayaç "48 / 48 · SİP-55120 · klip". |
| 20 | `paketleme-sayim-farki.jpg` | PKT-01 · Paketleme masası 1 | 14:51:27 | Tepside yüzükler ve kutular, sayaç "Tepsi 60 · Kutu 59"; masa kenarında tek yüzük sarı kutuyla işaretli. |
| 21 | `paketleme-urun-masadan-ayrildi.jpg` | PKT-02 · Paketleme masası 2 | 16:20:15 | Paketleme masasında el bir yüzüğü tepsiden alıp yan tepsiye (kalite iade) bırakıyor; kırmızı kutu "Kutuya girmedi". |
| 23 | `cnc-kapak-uzun-acik.jpg` | CAM-03 · CNC alanı | 14:48:26 | ✅ HAZIR — DOOR OPEN TOO LONG 02:46 / eşik 01:00. |
| 22 | `cnc-tepsi-sayim-eslesti.jpg` | CAM-04 · CNC çıkışı | 14:32:18 | ✅ HAZIR — TRAY-07 24/24 MATCH. |

Dosya adlarını değiştirmeyin; farklı isimle gelirse `src/data/incidents.ts` içindeki `img("...")` değerini güncelleyin.
Görselde yazan sayılar paneldeki verilerle aynı olmalı (gerekirse veriyi görsele göre hizalayın).
