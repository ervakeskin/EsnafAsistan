# EsnafAsistan — Dükkan Yönetim Paneli

> 🌐 **Canlı Demo:** [esnafhelp.dev](https://www.esnafhelp.dev)

Türkiye'deki küçük işletme sahipleri (esnaf) için geliştirilmiş, yapay zeka destekli modern dükkan yönetim uygulaması. Stok, kasa, teslimat, müşteri cari ve raporlama işlemlerini tek ekrandan yönetin.

---

## 🚀 Özellikler

### 📦 Stok & Depo Yönetimi
- Ürün ekleme, düzenleme, silme ve depo değiştirme
- OCR ile fotoğraftan ürün tanıma (Tesseract.js)
- Barkod / QR kod desteği
- Ürün fotoğraf galerisi
- Minimum stok uyarısı ve kritik stok takibi
- Fiyat geçmişi (otomatik trigger ile)
- Parti / son kullanma tarihi takibi

### 💰 Kasa & Muhasebe
- Gelir / gider ekleme (Nakit, Kart, Havale ayrımı)
- Hızlı satış ekranı (dokunmatik POS)
- Gün sonu raporu (Z Raporu)
- Toplam depo değeri hesaplama

### 🚚 Teslimat Takvimi
- Teslimat ekleme, durum güncelleme, silme
- Takvim görünümü
- Teslimat hatırlatıcı entegrasyonu

### 👥 Müşteri & Tedarikçi
- Müşteri cari hesabı (borç/alacak takibi)
- Tedarikçi yönetimi ve performans puanı
- WhatsApp Business API entegrasyonu

### 🤖 AI Asistan (Gemini 2.0 Flash)
- Doğal dil ile soru sorma: *"Bu ay en çok ne sattım?"*
- Gerçek zamanlı Supabase verisi ile RAG (Retrieval-Augmented Generation)
- Kritik stok, kasa durumu ve teslimat özetleri
- Hazır soru çipleri ile hızlı sorgulama
- Sidebar ve Yardım butonu üzerinden erişim

### 📊 Raporlar & Analitik
- Kâr/zarar raporu
- Satış raporu
- Teslimat durum raporu
- Denetim günlüğü (son 200 işlem)

### 🔒 Güvenlik & Erişilebilirlik
- Supabase Auth (e-posta/şifre)
- Rate limiting (giriş: 5 deneme/15dk)
- Güçlü şifre politikası
- Hesap kilitleme (5 başarısız denemeden sonra 15dk)
- Tüm cihazlardan çıkış
- KVKK uyumlu hesap silme
- WCAG 2.2 AA erişilebilirlik standardı
- Yüksek kontrast modu & renk körü dostu palet

### 📱 PWA & Offline
- Progressive Web App (ana ekrana eklenebilir)
- Service Worker ile offline cache
- Background sync (internet gelince senkronize)
- Push bildirim desteği

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (Turbopack, App Router) |
| Dil | TypeScript (strict mode) |
| Veritabanı | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Stil | Tailwind CSS v4 + Geist Font |
| AI | Google Gemini 2.0 Flash |
| E-posta | Resend (inbound webhook) |
| İkonlar | Lucide React |
| Animasyon | Framer Motion |
| Test | Vitest (62 birim test) + Playwright (E2E) |
| Deploy | Vercel |

---

## ⚙️ Kurulum

### Gereksinimler
- Node.js 20+
- Supabase hesabı
- Google AI Studio hesabı (AI özelliği için)

### 1. Depoyu Klonla

```bash
git clone https://github.com/kullanici-adi/esnaf-asistan.git
cd esnaf-asistan
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env.local` dosyası oluştur:

```env
# Supabase (zorunlu)
NEXT_PUBLIC_SUPABASE_URL="https://proje-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Gemini AI (AI Asistan için)
GEMINI_API_KEY="AIzaSy..."  # aistudio.google.com/app/apikey

# Resend E-posta (opsiyonel)
INBOUND_WEBHOOK_SECRET="your-webhook-secret"
INBOUND_EMAIL_DOMAIN="mail.esnafhelp.dev"
```

### 3. Geliştirme Sunucusu

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000) adresini aç.

---

## 🧪 Testler

```bash
# Birim testler (62 test)
npm test

# Tüm testler (birim + güvenlik + entegrasyon)
npm run test:coverage

# E2E testler (Playwright)
npm run test:e2e
```

---

## 📁 Proje Yapısı

```
EsnafAsistan/
├── app/
│   ├── api/              # API route'ları (auth, ai, stok, kasa...)
│   ├── dashboard/        # Dashboard sayfaları
│   └── globals.css       # Global stiller (Apple tasarım sistemi)
├── components/
│   ├── dashboard/        # Dashboard bileşenleri
│   │   ├── ai-chat.tsx           # AI sohbet drawer'ı
│   │   ├── ai-chat-provider.tsx  # Global AI chat context
│   │   ├── sidebar.tsx           # Kenar çubuğu
│   │   └── ...
│   └── ui/               # Temel UI bileşenleri (Card, Button, Input...)
├── lib/
│   ├── ai.ts             # Gemini AI altyapısı (RAG)
│   ├── integrations/     # e-Fatura, WhatsApp, Yazıcı, Banka
│   └── supabase/         # Supabase client (server/client)
├── supabase/             # Migration SQL dosyaları
└── tests/                # Birim, E2E ve güvenlik testleri
```

---

## 🌐 Canlı Uygulama

Uygulama **[esnafhelp.dev](https://www.esnafhelp.dev)** adresinde Vercel üzerinde yayınlanmaktadır.

---

## 📄 Lisans

MIT © 2026 EsnafAsistan
