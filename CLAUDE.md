@AGENTS.md

# EsnafAsistan

Küçük işletmeler/esnaf için stok, kasa, teslimat ve hatırlatıcı yönetimi sağlayan web uygulaması. Fotoğraflı ürün girişi ve OCR ile liste okuma özellikleri içerir.

## Teknoloji Yığını (Tech Stack)

- **Framework:** Next.js 16.2.4 (App Router) — `app/` dizini tabanlı
- **UI Kütüphanesi:** React 19.2.4
- **Dil:** TypeScript 5 (strict mode açık, `@/*` path alias → proje kökü)
- **Stil:** Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`
- **Bileşenler:** shadcn/ui + Base UI (`@base-ui/react`), `lucide-react` ikonlar, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Backend / Veritabanı:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — auth + PostgreSQL + realtime
- **OCR:** `tesseract.js` (fotoğraftan liste/ürün okuma)
- **Deploy:** Vercel

## Mimari / Klasör Yapısı

- `app/` — Next.js App Router sayfaları ve API route'ları
  - `app/page.tsx`, `app/kayit-ol/` — giriş / kayıt
  - `app/dashboard/` — ana panel; alt sayfalar: `stok/`, `kasa/`, `teslimatlar/`, `ayarlar/`
  - `app/api/` — server route'lar: `auth/` (login, signup, logout), `products/` (manual, ocr-import), `reminders/`
  - Server Actions: `app/dashboard/stok/actions.ts`, `app/dashboard/ayarlar/actions.ts`
- `components/ui/` — shadcn tabanlı temel bileşenler (button, card, dialog, table, vb.)
- `components/dashboard/` — uygulamaya özel bileşenler (sidebar, takvim widget, realtime listener, ürün diyalogları, OCR girişi)
- `lib/supabase/` — Supabase client (`client.ts`), server (`server.ts`), env doğrulama (`env.ts`)
- `lib/auth/messages.ts` — auth mesajları; `lib/utils.ts` — yardımcı fonksiyonlar
- `public/` — statik dosyalar

## Temel Komutlar

```bash
npm install        # bağımlılıkları kur
npm run dev        # geliştirme sunucusu (http://localhost:3000)
npm run build      # production derlemesi
npm start          # production sunucusu (build sonrası)
npm run lint       # ESLint kontrolü
```

> **Ortam değişkenleri:** Supabase için `.env.local` gereklidir (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` vb.). Doğrulama `lib/supabase/env.ts` içinde yapılır.

## AI Guidelines / Token Savings

API maliyetlerini minimumda tutmak için aşağıdaki kurallara KESİNLİKLE uy:

- **Tüm dosyayı ASLA baştan sona yazdırma.**
- **Yalnızca değişen, eklenen veya düzeltilen kod bloklarını ver.**
- **Gereksiz uzun açıklamalardan kaçın, doğrudan çözüme odaklan.**
- **Açıklama (comment) satırlarını Türkçe yaz.**

## Geliştirme Metodolojisi (Agile Approach)

- **Agile (Çevik) prensiplerle çalış.** Özellikleri devasa, karmaşık bloklar halinde değil; küçük, test edilebilir ve iteratif (adım adım) parçalar halinde geliştir.
- **Bir özelliği, bileşeni veya fonksiyonu yazdıktan sonra, hemen diğerine geçmeden önce test edilmesi ve onaylanması için dur.**
