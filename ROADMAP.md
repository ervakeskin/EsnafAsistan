# EsnafAsistan — Kapsamlı Geliştirme Yol Haritası

> **Hedef Kullanıcı:** 45+ yaş esnaf, sınırlı teknoloji deneyimi, yüksek eğitim gerektirmeyen, sezgisel ve büyük butonlu arayüz.
> **Pazar:** Türkiye'de 2.1 milyon esnaf (2026 TÜİK), %58'i hâlâ kâğıt defter kullanıyor (TÜRKONFED). Dijital dönüşüm KOSGEB destekli ve e-Fatura zorunluluğu ile hızlanıyor.

---

## ✅ v1.0 — Tamamlanan Altyapı

- Next.js 16 + Supabase + auth (login/kayıt/çıkış)
- Stok yönetimi (ekle, sat, sil, depo değiştir, OCR ile fotoğraftan ürün tanıma)
- Kasa yönetimi (gelir/gider ekle, bakiye takibi)
- Teslimat yönetimi (ekle, durum güncelle, sil, takvim görünümü)
- Raporlar (kâr/zarar, stok durumu, satış raporu, teslimat durumu)
- Hatırlatıcılar (API + Dashboard)
- Responsive tasarım (mobil/tablet/desktop)
- SEO (sitemap, robots.txt, manifest, Open Graph)
- Erişilebilirlik (skip link, aria etiketleri, klavye navigasyonu)
- Test altyapısı (42 birim test)
- **Tüm throw → ActionResult dönüşümü:** Hiçbir sayfa crash yemez, hatalar kullanıcıya anlamlı mesaj olarak gösterilir
- **useActionState + useEffect + router.refresh() pattern:** Tüm butonlar ve dialog'lar bu standartla çalışır
- **Apple-inspired UI:** Glassmorphism kartlar, hover lift, gradient buton, koyu tema (next-themes), page-enter animasyonu, sidebar'da tema toggle
- **E-posta forwarding altyapısı:** Resend inbound webhook (`/api/webhooks/resend`) ile gelen mailleri `deliveries` tablosuna kaydetme, `service_role` admin client, webhook signing doğrulaması
- **Ayarlar sayfası:** Dükkan adı, yönlendirme adresi göster/kopyala, tanınan göndericiler, depo/raf yönetimi (ekle, sil, ad değiştir, pasifleştir)
- **Supabase migration:** Kapsamlı migration SQL + RLS politikaları (7 tablo için authenticated CRUD)

---

## 🛡️ Sprint GÜVENLİK — Siber Güvenlik & Veri Koruması

### Kullanıcı Hesap Güvenliği
- [ ] **İki faktörlü doğrulama (2FA/MFA)** — SMS veya authenticator uygulaması ile ek güvenlik katmanı
- [ ] **Güçlü şifre politikası** — minimum 8 karakter, büyük/küçük harf + rakam zorunluluğu
- [ ] **Oturum yönetimi** — "Tüm cihazlardan çıkış yap", oturum süresi dolunca otomatik çıkış
- [ ] **Başarısız giriş denemesi sınırı** — 5 başarısız denemeden sonra hesabı 15 dk kilitle

### Veri Güvenliği
- [ ] **Veritabanı şifrelemesi** — hassas kolonlar için PostgreSQL pgcrypto ile AES-256 şifreleme
- [ ] **Yedekleme otomasyonu** — günlük otomatik yedek + 30 günlük retention policy
- [ ] **Veri silme / KVKK uyumu** — kullanıcı hesap silme → tüm verileri anonimleştir
- [ ] **Denetim günlüğü (audit log)** — kim ne zaman hangi işlemi yaptı?

### Uygulama Güvenliği
- [ ] **Rate limiting** — API endpoint'lerde hız sınırı (örn. /api/auth/login için 10 istek/dk)
- [ ] **SQL injection koruması** — Supabase parametrik query'ler ile zaten korumalı, test ile doğrula
- [ ] **CSP başlıklarını güçlendirme** — mevcut CSP'ye script hash'leri ekle
- [ ] **Güvenlik header testleri** — `npm run test:security` ile OWASP ZAP veya Helmet benzeri kontroller
- [ ] **Düzenli bağımlılık güncelleme** — `npm audit` + Dependabot / Renovate bot entegrasyonu

---

## 🎨 Sprint UI/UX — 45+ Esnafa Göre Tasarım

### Görsel Tasarım (UI)
- [x] **Koyu tema (dark mode)** — next-themes ile Apple-style dark/light toggle, sidebar'da tema değiştirme butonu
- [x] **Glassmorphism kartlar** — `backdrop-filter: blur(12px)` ile modern cam efekti
- [x] **Hover lift animasyonu** — kartlarda hover'da `translateY(-2px)` + gölge artışı
- [x] **Gradient buton** — `Button variant="gradient"` ile mavi→mor gradyan
- [ ] **Büyük font sistemi** — varsayılan 18px body, en küçük 16px
- [ ] **Yüksek kontrast modu** — siyah/beyaz zıtlık oranı minimum 7:1
- [ ] **Buton / touch target standardı** — tüm tıklanabilir öğeler minimum 52×52px
- [ ] **Renk körü dostu palet** — mavi yerine koyu tonlar, kırmızı/yeşil yerine desen/ikon desteği
- [ ] **Okunabilir ikon seti** — tüm ikonlara etiket ekle (sembol + yazı birlikte)
- [ ] **Boşluk ve nefes** — kartlar arası minimum 24px, paragraf aralığı 1.5 satır yüksekliği

### Kullanıcı Deneyimi (UX)
- [ ] **Dev ekran buton** — telefonlarda bile parmakla rahat basılan alanlar (min 56px)
- [ ] **Adım adım sihirbaz (wizard)** — ilk kullanımda "Hoş geldiniz" rehberi, 5 adımda uygulamayı öğret
- [ ] **Sesli yönlendirme** — Türkçe sesli geri bildirim: "Ürün başarıyla eklendi" (Text-to-Speech)
- [ ] **Breadcrumb (ekmek kırıntısı)** — "Ana Sayfa > Stok > Ürün Detay" şeklinde konum göstergesi
- [ ] **Geri dönüş desteği** — her sayfada "Geri" butonu, yanlışlıkla silme durumunda "Geri al" bildirimi
- [ ] **Sadeleştirilmiş dil** — "Envanter" yerine "Stok", "Entegrasyon" yerine "Bağlantı"
- [ ] **Büyüteç özelliği** — metin üzerine tıklayınca büyüten ekran büyüteci
- [ ] **Hızlı erişim paneli** — en sık kullanılan 3 işlemi ana sayfada büyük kart olarak göster

### Erişilebilirlik (a11y)
- [ ] **WCAG 2.2 AA uyumu** — tüm sayfaları denetle ve düzelt
- [ ] **Klavyeyle tam gezinti** — Tab/Enter ile tüm işlemler yapılabilsin
- [ ] **Ekran okuyucu desteği** — aria etiketleri Türkçe, anlamlı alt metinler
- [ ] **Bozuk bağlantı / hata durumları** — "Bir hata oluştu" yerine anlamlı hata mesajları

---

## ⚡ Sprint ÖZELLİKLER — İşlevsel Geliştirmeler

### Stok & Envanter
- [ ] **Barkod / QR kod desteği** — kamera ile barkod okutarak ürün ekleme ve satış
- [ ] **Ürün fotoğraf galerisi** — her ürüne en az 1 fotoğraf, galeri görünümü
- [x] **Depo silme butonu** — Ayarlar sayfasında her depo/raf için sil butonu
- [ ] **Toplu işlemler** — seçili ürünleri toplu sil, fiyat güncelle, depo değiştir
- [ ] **Minimum stok uyarısı bildirimi** — eşik altı ürünler için WhatsApp bildirimi
- [ ] **Fiyat geçmişi** — alış fiyatı değişimlerini logla ve grafik olarak göster

### Satış & Kasa
- [ ] **Hızlı satış ekranı (POS)** — dokunmatik ekran için optimize edilmiş satış arayüzü
- [ ] **Nakit / Kart / Havale ayrımı** — ödeme türü seçeneği ile gün sonu mutabakatı
- [ ] **Müşteri cari hesabı** — veresiye takibi, müşteri bazlı borç/alacak listesi
- [ ] **Gün sonu raporu (Z Raporu)** — yazdırılabilir gün sonu özeti
- [ ] **Fatura / fiş yazdırma** — termal yazıcı desteği (80mm/58mm)

### Teslimat & Tedarikçi
- [x] **E-posta ile teslimat oluşturma (forwarding)** — Resend inbound webhook ile gelen mailler otomatik teslimata dönüşür
- [ ] **Tedarikçi yönetimi** — tedarikçi iletişim, performans puanı, geçmiş siparişler
- [ ] **Teslimat hatırlatıcı** — bekleyen teslimatlar için otomatik WhatsApp/SMS hatırlatma
- [ ] **Teslimat alındı → stok otomatik artış** — kritik özellik
- [ ] **Parti / son kullanma tarihi takibi** — özellikle gıda ve ilaç sektörü için

### Entegrasyonlar
- [ ] **e-Fatura / e-Arşiv / e-Defter entegrasyonu** — Gelir İdaresi uyumlu çıktı
- [ ] **WhatsApp Business API** — otomatik hatırlatma, sipariş teyidi, fatura paylaşımı
- [ ] **Banka entegrasyonu** — hesap hareketlerini otomatik çek, kasa ile mutabakat
- [ ] **Hızlı yazıcı desteği** — etiket yazıcısı (ürün etiketi), termal fiş yazıcısı

---

## 🤖 Sprint AI — Yapay Zeka Özellikleri

### Akıllı Esnaf Asistanı (Chatbot)
- [ ] **AI Chat Arayüzü:** Üst menüde "Yardım / AI Önerisi" butonuna basınca sağdan açılan (Drawer) sohbet penceresi
- [ ] **Hazır Soru Çipleri (Suggestion Chips):** Tek tıkla sorulabilen hazır butonlar
- [ ] **RAG (Veri Bağlamı) Altyapısı:** Supabase'den güncel stok/fiyat/teslimat verilerini AI'a sistem promptu olarak gönderme
- [ ] **Tedarik ve Fiyat Danışmanlığı:** Geçmiş alış fiyatlarına göre tavsiye

### Anlık AI Asistanı
- [ ] **Doğal dil sorgusu** — "Bu ay en çok ne sattım?" yaz → AI rapor hazırlasın
- [ ] **Akıllı stok uyarısı** — geçmiş satışa göre stok bitme tahmini
- [ ] **Otomatik kategorizasyon** — ürün adına göre kategori önerme
- [ ] **OCR akıllı düzeltme** — düşük güvenilirlikli OCR sonuçlarını AI ile düzeltme
- [ ] **Fiyat analizi** — "Bu ürünün alış fiyatı geçen aya göre %15 artmış" uyarısı

---

## 📊 Sprint RAPORLAMA

- [ ] **Grafikli dashboard** — revenue trend, ürün dağılımı, stok durumu
- [ ] **Excel / CSV dışa aktarma** — tüm tablolar için tek tıkla dışa aktar
- [ ] **PDF rapor** — yazdırılabilir/yollanabilir PDF (aylık kâr-zarar, stok durumu)
- [ ] **Özel tarih aralığı** — raporlar için başlangıç/bitiş tarihi seçme
- [ ] **Karşılaştırmalı rapor** — bu ay vs geçen ay, bu yıl vs geçen yıl

---

## 🧪 Sprint TEST & KALİTE

- [ ] **Supabase integration test** — mock supabase ile server action testleri
- [ ] **E2E test (Playwright)** — login → stok ekle → satış yap → teslimat oluştur akışı
- [ ] **Görsel regresyon test** — her UI değişikliğinde ekran görüntüsü karşılaştırma
- [ ] **Performans test (Lighthouse)** — 90+ puan hedefi
- [ ] **Güvenlik test (OWASP ZAP)** — otomatik tarama ile güvenlik açığı tespiti
- [ ] **TypeScript strict mode** — mevcut kodu strict mode'a taşı
- [ ] **Hata izleme (Sentry)** — canlı ortamda hataları yakala ve raporla
- [x] **Eski legacy kolonları temizleme** — `products.warehouse` text kolonu migration'a `drop column if exists` eklendi

---

## 📱 Sprint MOBİL & OFFLINE

- [ ] **PWA (Progressive Web App)** — mobil ana ekrana ekleme, offline çalışma
- [ ] **Service worker** — temel verileri (ürün listesi) offline cache'le
- [ ] **Background sync** — çevrimdışıyken yapılan satışları internet gelince senkronize et
- [ ] **Mobil navigasyon iyileştirmesi** — başparmakla erişilebilir alt menü (bottom navigation)
- [ ] **Push bildirim** — stok kritik, teslimat zamanı, ödeme hatırlatıcı bildirimleri

---

## ✅ Canlıya Çıkış — Yapılacaklar Kontrol Listesi

### 1. Ortam Değişkenleri (`.env.local` / Vercel Environment Variables)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard > Settings > API > service_role key (tablo: `service_role`)

### 2. DNS & Domain
- [ ] `mail.esnafasistan.com` domain'i için MX kaydını Resend inbound sunucularına yönlendir
- [ ] Resend'de domain doğrulamasını tamamla (DKIM, SPF, MX)
- **→ Manuel yapılacak (domain paneli + Resend Dashboard)**

### 3. Resend Webhook
- [ ] Resend Dashboard > Inbound > Webhook URL: `https://siten.com/api/webhooks/resend`
- [ ] Webhook signing secret oluştur → `.env.local`'da `INBOUND_WEBHOOK_SECRET`
- **→ Manuel yapılacak (Resend Dashboard)**

### 4. Vercel Deploy
- [ ] GitHub repo'ya push
- [ ] Vercel'de projeyi import et
- [ ] Tüm environment variables'ı Vercel Dashboard'a ekle
- [ ] Deploy et ve domain ayarla

### 5. Canlı Test
- [ ] Ana sayfa, login, kayıt çalışıyor mu?
- [ ] Stok ekleme/satış/düzenleme/silme çalışıyor mu?
- [ ] Kasa gelir/gider ekleme çalışıyor mu?
- [ ] Teslimat ekleme/durum güncelleme/silme çalışıyor mu?
- [ ] Raporlar sayfası veri gösteriyor mu?
- [ ] Hatırlatıcı ekleme/silme çalışıyor mu?
- [ ] Ayarlar (dükkan adı, depolar, yönlendirme adresi) çalışıyor mu?
- [ ] Webhook test: Resend'den test maili gönder, `/api/webhooks/resend` log'larını kontrol et
- [ ] Koyu tema / açık tema geçişi çalışıyor mu?

### 6. Monitör & Bakım
- [ ] Vercel Analytics kurulumu
- [ ] Sentry hata izleme kurulumu
- [ ] Supabase günlük yedekleme
- [ ] `npm audit` ile bağımlılık güvenlik taraması
