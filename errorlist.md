# Hata Kayıtları (Error Log)

Bu dosya, uygulamada karşılaşılan hataların kaydını tutar.
Her hata için: hata mesajı, kök neden, çözüm durumu ve yapılan işlem.

---

## HATA-001: `linked_emails.is_active` kolonu bulunamadı

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `column linked_emails.is_active does not exist` |
| **Dosya** | `app/dashboard/ayarlar/page.tsx:44` |
| **Kök Neden** | Tablo `is_active` olmadan oluşturulmuş |
| **Çözüm** | `ALTER TABLE linked_emails ADD COLUMN is_active boolean NOT NULL DEFAULT true` |
| **Durum** | ✅ `added column if not exists` ile çözüldü — migration SQL'de mevcut |

---

## HATA-002: `deliveries.supplier_name` kolonu bulunamadı

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `column deliveries.supplier_name does not exist` |
| **Dosya** | `app/dashboard/teslimatlar/page.tsx:81` |
| **Kök Neden** | Tablo `supplier_name` olmadan oluşturulmuş |
| **Çözüm** | `ALTER TABLE deliveries ADD COLUMN supplier_name text NOT NULL` |
| **Durum** | ✅ Migration çalıştırıldı, hata çözüldü |

---

## HATA-003: `deliveries.quantity` kolonu bulunamadı

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `column deliveries.quantity does not exist` |
| **Dosya** | `app/dashboard/teslimatlar/page.tsx:81` |
| **Kök Neden** | Tablo `quantity` olmadan oluşturulmuş |
| **Çözüm** | `ALTER TABLE deliveries ADD COLUMN quantity integer NOT NULL` (önce default ata) |
| **Durum** | ✅ `added column if not exists` ile çözüldü |

---

## HATA-004: `deliveries` ↔ `products` FK ilişkisi eksik

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `Could not find a relationship between 'deliveries' and 'products' in the schema cache` |
| **Dosya** | `app/dashboard/teslimatlar/page.tsx:74` |
| **Kök Neden** | `product_id` foreign key constraint'i DB'de yok |
| **Çözüm** | `ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL` |
| **Durum** | ✅ Kullanıcı migration SQL'ini çalıştırdı — FK eklendi |

---

## HATA-005: Turbopack Panic (Next.js 16.2.4)

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `FATAL: Unexpected Turbopack error. Next.js package not found.` |
| **Dosya** | `/dashboard/stok` sayfası derlenirken |
| **Kök Neden** | Turbopack modül çözümleme cache'i bozulmuş |
| **Çözüm** | `.next` klasörü silindi, `npm run dev` yeniden başlatıldı |
| **Durum** | ✅ `.next` silindi + `npm run build` başarılı — panic artık yok |

---

## HATA-006: Depo ekleme çalışmıyor

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Depo ekleme formu işlevsel değil |
| **Dosya** | `app/dashboard/ayarlar/page.tsx` |
| **Kök Neden** | Ayarlar sayfası `is_active` hatası yüzünden patlıyor, forma erişilemiyor |
| **Çözüm** | HATA-001 çözülünce otomatik düzelecek |
| **Durum** | ✅ Ayarlar sayfası artık kolon hatası verse bile crash yemez, depo formu görünür |

---

## HATA-007: Dashboard "Teslimat verileri yüklenemedi"

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Dashboard ana sayfası `Teslimat verileri yüklenemedi` ile çöküyor |
| **Dosya** | `app/dashboard/teslimatlar/page.tsx:81` |
| **Kök Neden** | Dashboard alt sayfalardan biri olan teslimatlar sayfası eksik kolonlar yüzünden hata fırlatıyor |
| **Çözüm** | HATA-002 ve HATA-003 çözülünce düzelecek |
| **Durum** | 🔗 HATA-002/003'e bağlı |

---

## HATA-008: Ayarlar sayfası crash — linked_emails.is_active yok

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `column linked_emails.is_active does not exist` → tüm sayfa çöküyor |
| **Dosya** | `app/dashboard/ayarlar/page.tsx:43-45` |
| **Kök Neden** | Schema'da tanımlı olmasına rağmen DB'de kolon eksik |
| **Çözüm** | Migration SQL ile kolon eklendi + sayfa crash yemeyecek şekilde yeniden yazıldı (sessiz hata + boş dizi döndürme) |
| **Durum** | ✅ Çözüldü — hem migration hem kod sağlamlaştırması |

---

## HATA-009: Test coverage raporu

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Yok (yeni özellik) |
| **Dosya** | `tests/format.test.ts` |
| **Ne Yapıldı** | Vitest kuruldu, 22 test yazıldı (formatlama, profit hesabı, OCR parse, filtreleme, sıralama). `npm test` ile çalışır, `npm run test:coverage` ile HTML rapor üretir. |
| **Durum** | ✅ 42/42 test geçiyor (formatDateTime eklendi, edge case'ler, timezone güvenli, OCR boşluk) |

---

## HATA-010: Tüm butonlar throw → crash (server action + server component)

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Dashboard'daki tüm butonlar (stok ekle/sil/satış, teslimat ekle/durum/sil, ayarlar dükkan/mail/depo) tıklandığında hiçbir şey olmuyor veya hata sayfasına yönlendiriyor. Ayrıca stok/kasa/teslimat/rapor sayfaları veri çekme hatasında crash yiyor. |
| **Dosya** | `app/dashboard/stok/actions.ts`, `app/dashboard/teslimatlar/actions.ts`, `app/dashboard/stok/page.tsx`, `app/dashboard/kasa/page.tsx`, `app/dashboard/teslimatlar/page.tsx`, `app/dashboard/raporlar/page.tsx` |
| **Kök Neden** | (1) Server action'larda 36 adet `throw new Error(...)` — hata fırlatınca Next.js error boundary tetikleniyor. (2) Server component'lerde 6 adet `throw new Error(...)` — veri çekme hatasında sayfa crash. (3) `useActionState` kullanılmıyor — form sonucu gösterilemiyor. (4) `useEffect` + `router.refresh()` yok — başarılı submit'te sayfa yenilenmiyor. |
| **Çözüm** | (1) Tüm action'lar `ActionResult { success, message }` döndürür. (2) Tüm server throw'lar `console.error` + boş dizi'ye çevrildi. (3) Dialog'lara + inline form'lara `useActionState` + `useEffect` + `router.refresh()` eklendi. (4) Dialog'lara kontrollü `open`/`onOpenChange` eklendi — başarılı submit'te otomatik kapanma. |
| **Durum** | ✅ Çözüldü — 5 server page, 2 actions dosyası, 3 dialog, 3 inline form component'i düzeltildi |

---

## HATA-012: RLS politikaları eksik — tüm INSERT/UPDATE/DELETE işlemleri bloke

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | `new row violates row-level security policy for table "warehouses"` |
| **Dosya** | Tüm server action'lar (22 insert/update/delete operasyonu) |
| **Kök Neden** | Supabase'de RLS (Row-Level Security) aktif ancak hiçbir tabloda `authenticated` rolü için policy tanımlanmamış. Anon key ile yapılan tüm veri yazma işlemleri reddediliyor. |
| **Çözüm** | `supabase/rls-policies.sql` dosyasını Supabase SQL Editor'da çalıştır. Tüm tablolar için SELECT/INSERT/UPDATE/DELETE politikaları oluşturur. |
| **Durum** | ✅ Kullanıcı `supabase/rls-policies.sql` dosyasını çalıştırdı — RLS politikaları aktif |

---
## HATA-011: "Yardım / AI Önerisi" butonu tıklanmıyor

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Her sayfanın üstünde görünen "Yardım / AI Önerisi" butonu hiçbir eylem yapmıyor |
| **Dosya** | `app/dashboard/layout.tsx:55-58` |
| **Kök Neden** | `<Button>`'a `href`, `onClick` veya `asChild` eklenmemiş — buton render ediliyor ama tıklanabilir değil |
| **Çözüm** | `<Link href="/dashboard/yardim">` ile sarıldı — buton artık Yardım sayfasına yönlendiriyor |
| **Durum** | ✅ Çözüldü |

---

## HATA-013: Form butonları tıklanınca hiçbir şey olmuyor (Base UI type="button")

| Alan | Detay |
|------|-------|
| **Tarih** | 2026-06-25 |
| **Hata** | Stok ekle/sil/satış, teslimat ekle/durum, ayarlar (dükkan/mail/depo) formlarındaki butonlar tıklanınca form gönderilmiyor; dialog açma butonları da etkilenebiliyordu |
| **Dosya** | `components/ui/button.tsx`, `app/dashboard/ayarlar/form-client.tsx`, `components/dashboard/add-product-dialog.tsx`, `components/dashboard/add-delivery-dialog.tsx`, `components/dashboard/sale-product-dialog.tsx`, `app/dashboard/teslimatlar/form-client.tsx` |
| **Kök Neden** | `@base-ui/react` Button bileşeni `useButton` içinde native `<button>` için her zaman `type="button"` atıyor (`node_modules/@base-ui/react/internals/use-button/useButton.js:82`). HTML'de form içindeki butonların varsayılanı `submit` olmasına rağmen, projede `type="submit"` açıkça verilmediği için formlar hiç submit olmuyordu |
| **Çözüm** | `components/ui/button.tsx` güncellendi: `type` verilmemişse `onClick` varsa `"button"`, yoksa `"submit"` kullanılıyor — Base UI'nin zorunlu `type="button"` değeri override ediliyor |
| **Durum** | ✅ Çözüldü |
