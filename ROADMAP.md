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
- **Rate limiting:** API endpoint'lerde hız sınırı (`/api/auth/login` için 5 deneme/15dk, `/api/auth/signup` için 3 deneme/1dk)
- **Güçlü şifre politikası:** minimum 8 karakter, büyük/küçük harf + rakam zorunluluğu (`lib/password-policy.ts`)
- **Başarısız giriş denemesi sınırı:** 5 başarısız denemeden sonra hesap 15 dk kilitlenir
- **Oturum yönetimi:** "Tüm cihazlardan çıkış yap" API (`/api/auth/logout-all`), şifre değiştirme API (`/api/auth/change-password`)
- **Veri silme / KVKK uyumu:** Hesap silme API (`/api/auth/delete-account`), tüm verileri anonimleştirir
- **Denetim günlüğü (audit log):** `audit_log` tablosu + `lib/audit-log.ts` utility + otomatik fiyat değişikliği trigger'ı
- **CSP başlıklarını güçlendirme:** frame-src, worker-src, manifest-src, media-src eklendi; Resend connect-src izni
- **Büyük font sistemi:** varsayılan 18px body, en küçük 16px, tüm input/button boyutları büyütüldü
- **Yüksek kontrast modu:** `.high-contrast` CSS sınıfı, 7:1 zıtlık oranı
- **Buton / touch target standardı:** minimum 44px, buton/input height 48px, `touch-target`/`touch-target-lg` sınıfları
- **Renk körü dostu palet:** `.colorblind-safe` CSS sınıfı, kırmızı/yeşil yerine mavi/turuncu tonları
- **Okunabilir ikon seti:** Tüm ikonlarda `aria-label` ve/metin etiketi
- **Boşluk ve nefes:** Kartlar arası 24px (`.gap-section`), paragraf aralığı 1.5 satır yüksekliği
- **Dev ekran buton:** `touch-target-lg` (56px), POS ekranında dev butonlar
- **Adım adım sihirbaz (wizard):** Hoş geldiniz rehberi (`components/dashboard/welcome-wizard.tsx`), 5 adımda uygulamayı öğretir
- **Sesli yönlendirme:** `lib/tts.ts` ile Text-to-Speech, `FeedbackToast` ile sesli bildirim
- **Sadeleştirilmiş dil:** "Envanter" yerine "Stok", "Müşteri Cari" vb.
- **Büyüteç özelliği:** `components/dashboard/magnifier.tsx` ekran büyüteci
- **WCAG 2.2 AA uyumu:** Skip link, aria etiketleri, klavye navigasyonu, fokus stilleri
- **Klavyeyle tam gezinti:** Tab/Enter ile tüm işlemler yapılabilsin
- **Ekran okuyucu desteği:** aria etiketleri Türkçe, `sr-only` sınıfları
- **Bozuk bağlantı / hata durumları:** Anlamlı Türkçe hata mesajları, error boundary'ler
- **Barkod / QR kod desteği:** `lib/barcode.ts` + `components/dashboard/barcode-scanner.tsx`
- **Ürün fotoğraf galerisi:** `components/dashboard/product-photo-gallery.tsx` + `product_photos` tablosu
- **Toplu işlemler:** POS ekranında sepet bazlı toplu satış
- **Minimum stok uyarısı:** Otomatik trigger (`check_critical_stock`), `stock_alerts` tablosu, `stok-uyarilari` sayfası
- **Fiyat geçmişi:** Otomatik trigger (`log_price_change`), `price_history` tablosu, `fiyat-gecmisi` sayfası
- **Hızlı satış ekranı (POS):** Dokunmatik ekran için optimize edilmiş POS arayüzü (`/dashboard/kasa/pos`)
- **Nakit / Kart / Havale ayrımı:** `payment_type` kolonu, ödeme türü seçeneği + gün sonu mutabakatı
- **Müşteri cari hesabı:** `customer_ledger` + `customer_transactions` tabloları, `musteri-cari` sayfası
- **Gün sonu raporu (Z Raporu):** `gun-sonu-raporu` sayfası, yazdırılabilir
- **Tedarikçi yönetimi:** `suppliers` tablosu, `tedarikciler` sayfası, performans puanı
- **Teslimat hatırlatıcı:** `reminder_sent` kolonu, hatırlatıcı entegrasyon hazır
- **Parti / son kullanma tarihi takibi:** `batch_tracking` tablosu, `parti-takibi` sayfası
- **Hesap ayarları:** Şifre değiştirme, tüm cihazlardan çıkış, hesap silme (`hesap-ayarlari` sayfası)
- **Denetim günlüğü sayfası:** `audit-log` sayfası, son 200 işlem
- **Supabase integration test:** 8 adet mock test (`tests/integration.test.ts`)
- **E2E test (Playwright):** Ana akış testleri (`tests/e2e/esnaf-akisi.spec.ts`)
- **Güvenlik testleri:** 12 adet güvenlik testi (`tests/security.test.ts`)
- **Hata izleme (Sentry):** `lib/sentry.ts` — canlı ortamda hata yakalama ve raporlama
- **PWA (Progressive Web App):** Tam manifest (192/512 ikon, maskable, portrait, tr-TR), service worker (`public/sw.js`), offline cache
- **Service worker:** Cache-first (statik) + network-first (API) stratejisi, IndexedDB offline depolama
- **Background sync:** `sync-sales` etiketi ile çevrimdışı satışları internet gelince senkronize etme (`lib/offline-sync.ts`)
- **Mobil navigasyon:** Bottom navigation (`components/dashboard/bottom-navigation.tsx`) — 6 ana sayfa, safe-area, lg:gizle
- **Push bildirim:** `lib/push-notifications.ts` + `/api/push/subscribe` + `push_subscriptions` tablosu
- **e-Fatura / e-Arşiv / e-Defter:** XML çıktı üretici (`lib/integrations/efatura.ts`) + `/api/efatura/create`
- **WhatsApp Business API:** Mesaj gönderme (`lib/integrations/whatsapp.ts`) + `/api/whatsapp/send` + Türkçe şablonlar
- **Banka entegrasyonu:** Hesap hareketleri çekme + mutabakat (`lib/integrations/banka.ts`)
- **Hızlı yazıcı desteği:** Termal 80/58mm + etiket yazıcısı ESC/POS çıktısı (`lib/integrations/yazici.ts`) + `/api/printer/print`
- **Toplam test:** 62 birim test (3 test dosyası, hepsi geçiyor)
- **TypeScript strict mode:** Zaten aktif (`tsconfig.json` → `strict: true`)
- **Lighthouse config:** Mobil performans test yapılandırması (`lib/lighthouse.config.ts`)
- **Görsel regresyon:** Playwright + HTML reporter yapılandırması

---

## ✅ Sprint AI — Yapay Zeka Özellikleri (Tamamlandı)

### Akıllı Esnaf Asistanı (Chatbot)
- [x] **AI Chat Arayüzü:** Sidebar altında "AI Asistan" butonuna basınca sağdan açılan sohbet drawer'ı (`components/dashboard/ai-chat.tsx`)
- [x] **Hazır Soru Çipleri (Suggestion Chips):** İlk açılışta 6 adet hazır soru butonu (stok, kasa, teslimat odaklı)
- [x] **RAG (Veri Bağlamı) Altyapısı:** Supabase'den stok/kasa/teslimat verileri paralel çekilerek Gemini'ye sistem promptu olarak gönderiliyor (`app/api/ai/chat/route.ts`)
- [x] **Tedarik ve Fiyat Danışmanlığı:** Gemini 2.0 Flash, depo değeri ve kritik stok verilerine göre öneri yapıyor
- [x] **Gemini AI altyapısı:** `lib/ai.ts` — RAG context builder, Gemini 2.0 Flash entegrasyonu
- [x] **Otomatik kategorizasyon:** `suggestCategory()` fonksiyonu — ürün adından kategori önerisi
- [x] **Auth koruması:** AI endpoint'i sadece oturum açmış kullanıcılara açık
- [x] **GEMINI_API_KEY** ortam değişkeni `.env.local` ve `.env.example`'a eklendi

### Anlık AI Asistanı
- [x] **Doğal dil sorgusu** — "Bu ay en çok ne sattım?" yaz → AI stok/satış verisine bakarak cevap üretiyor
- [x] **Akıllı stok uyarısı** — Sistem promptunda kritik stok ürünleri AI'a iletiliyor, doğal dil uyarısı yapabiliyor
- [x] **Otomatik kategorizasyon** — `lib/ai.ts:suggestCategory()` hazır, OCR akışına entegre edilebilir
- [ ] **OCR akıllı düzeltme** — düşük güvenilirlikli OCR sonuçlarını AI ile düzeltme *(sonraki sprint)*
- [ ] **Fiyat analizi push bildirimi** — "Bu ürünün alış fiyatı geçen aya göre %15 artmış" otomatik uyarı *(sonraki sprint)*

---

## 🚀 Sprint v2 — Keşfedilen Geliştirme Alanları

> Mevcut kod tabanı analiz edilerek tespit edilmiş, uygulanmamış veya eksik özellikler.

### 🎨 UI/UX İyileştirmeleri
- [ ] **Mobil AI Chat:** Bottom navigation'a AI butonu ekle (mobilde sidebar görünmüyor)
- [ ] **Dashboard boş durum ekranları:** Hiç veri yokken yönlendirici "Başlangıç" kartları
- [ ] **Skeleton loading:** Sayfa yüklenirken iskelet animasyonu (şu an `loading.tsx` çok basit)
- [ ] **Inline hata mesajları:** Form doğrulama hatalarını alan altında göster
- [ ] **Konfeti/animasyon:** İlk satış, ilk teslimat tamamlama gibi milestone kutlamaları
- [ ] **Onboarding flow geliştirme:** `welcome-wizard.tsx` mevcut ama daha interaktif yapılabilir

### 📊 Raporlama & Analitik
- [ ] **Grafik/Chart bileşeni:** Kasa ve stok verisi için görsel grafik (Chart.js veya Recharts)
- [ ] **Haftalık özet e-postası:** Her Pazartesi Resend ile otomatik haftalık rapor gönderimi
- [ ] **CSV/Excel dışa aktarım:** Stok, kasa ve raporlar sayfasından veri indirme
- [ ] **Kar marjı takibi:** Alış-satış farkı otomatik hesabı ve trend gösterimi
- [ ] **Müşteri bazlı satış raporu:** Hangi müşteri ne kadar harcadı?

### 🔔 Bildirimler & Otomasyon
- [ ] **Stok bitince otomatik WhatsApp:** Kritik stoğa düşünce tedarikçiye WhatsApp mesajı
- [ ] **Doğum günü hatırlatıcı:** Müşteri doğum günlerinde otomatik mesaj
- [ ] **Vadesi gelen borç bildirimi:** Müşteri cari'de vadesi geçen borçlar için push bildirim
- [ ] **Günlük kasa özeti push bildirimi:** Her gece 20:00'de günlük kasa özeti bildirimi

### 🏗️ Teknik Altyapı
- [ ] **API rate limiting geliştirme:** AI endpoint için ayrı rate limiting (şu an sadece auth'da var)
- [ ] **OCR + AI pipeline:** Tesseract.js sonucunu doğrudan Gemini'ye düzeltme için gönder
- [ ] **Offline AI önbellekleme:** Son AI yanıtlarını IndexedDB'ye kaydet, internet olmadığında göster
- [ ] **Supabase Realtime AI tetikleyici:** Kritik stok oluşunca otomatik AI analizi çalıştır
- [ ] **Çoklu dil desteği (i18n):** Kürtçe, Arapça arayüz seçeneği (göçmen esnaf için)
- [ ] **Vercel Analytics entegrasyonu:** Kullanıcı davranışı takibi (`@vercel/analytics` hazır ama aktif değil)

### 🔐 Güvenlik & Uyumluluk
- [ ] **2FA (İki faktörlü doğrulama):** TOTP veya SMS ile ekstra güvenlik katmanı
- [ ] **KVKK veri dışa aktarım:** Kullanıcının tüm verisini JSON olarak indirme (GDPR portability)
- [ ] **IP bazlı oturum takibi:** Farklı şehirden giriş uyarısı
- [ ] **Supabase Row Level Security testi:** Otomatik RLS politika testi
- [ ] **API güvenlik başlıkları auditi:** OWASP top 10 kontrol listesi

### 💼 İş Geliştirme
- [ ] **Çoklu şube desteği:** Birden fazla dükkan/şube yönetimi
- [ ] **Tedarikçi sipariş formu:** Tedarikçiye PDF/WhatsApp ile sipariş formu gönderme
- [ ] **Sadakat programı:** Müşteri puan sistemi entegrasyonu
- [ ] **Fatura şablonları:** Özelleştirilebilir e-fatura/fiş tasarımı

---

## ✅ Canlıya Çıkış — Yapılacaklar Kontrol Listesi

### 1. Ortam Değişkenleri (`.env.local` / Vercel Environment Variables)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard > Settings > API > service_role key
- [ ] `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/app/apikey) ücretsiz API key

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
- [ ] Tüm environment variables'ı Vercel Dashboard'a ekle (`SUPABASE_*`, `GEMINI_API_KEY`, `INBOUND_*`)
- [ ] Deploy et ve domain ayarla

### 5. Canlı Test
- [ ] Ana sayfa, login, kayıt çalışıyor mu?
- [ ] Stok ekleme/satış/düzenleme/silme çalışıyor mu?
- [ ] Kasa gelir/gider ekleme çalışıyor mu?
- [ ] Teslimat ekleme/durum güncelleme/silme çalışıyor mu?
- [ ] Raporlar sayfası veri gösteriyor mu?
- [ ] Hatırlatıcı ekleme/silme çalışıyor mu?
- [ ] Ayarlar (dükkan adı, depolar, yönlendirme adresi) çalışıyor mu?
- [ ] **AI Asistan açılıyor ve yanıt veriyor mu? (GEMINI_API_KEY ayarlandıktan sonra)**
- [ ] Webhook test: Resend'den test maili gönder, `/api/webhooks/resend` log'larını kontrol et
- [ ] Koyu tema / açık tema geçişi çalışıyor mu?

### 6. Monitör & Bakım
- [ ] Vercel Analytics kurulumu
- [ ] Sentry hata izleme kurulumu
- [ ] Supabase günlük yedekleme
- [ ] `npm audit` ile bağımlılık güvenlik taraması



---

