# EsnafAsistan — Agile Yol Haritası

Bu dosya projenin çevik (Agile) geliştirme planıdır. Her görev tamamlandığında ilgili madde `[x]` ile işaretlenir. Görevler küçük, test edilebilir ve iteratif parçalara bölünmüştür.

---

## ✅ Sprint 0 — Temel Altyapı (Tamamlandı)

Projenin mevcut kod tabanında çalışır durumda olan temel modüller:

- [x] Next.js 16 + React 19 + TypeScript + Tailwind v4 kurulumu
- [x] Supabase entegrasyonu (client / server / env doğrulama)
- [x] Veritabanı şeması (`supabase/schema.sql`): products, warehouses, sales, deliveries, reminders, linked_emails
- [x] Kimlik doğrulama: kayıt ol, giriş, çıkış + kalıcı oturum
- [x] Stok modülü: ürün ekleme, satış, silme, arama, depoya göre filtreleme
- [x] Kasa modülü: günlük ciro ve kâr ("cepte kalan") hesabı
- [x] Dashboard özeti + takvim widget'ı
- [x] Fotoğraflı ürün girişi + Tesseract.js OCR ile liste okuma
- [x] Realtime listener (canlı veri güncelleme)
- [x] Hatırlatıcı API'si (GET/POST/PATCH/DELETE)

---

## 🚚 Sprint 1 — Teslimat Modülü (AKTİF)

Teslimatlar sayfası şu an yalnızca istatistik gösteriyor; gerçek liste ve CRUD eksik.

- [x] **1.1** Teslimat listesini tablo olarak ekranda göster (tedarikçi, ürün, tarih, miktar, durum)
- [x] **1.2** Yeni teslimat ekleme formu (dialog) + server action
- [x] **1.3** Teslimat durumu güncelleme (bekliyor → teslim alındı / iptal)
- [x] **1.4** Teslimat silme + boş liste durumu
- [x] **1.5** Teslimat ekranına realtime güncelleme bağlama

## ⏰ Sprint 2 — Hatırlatıcı & Takvim Yönetimi

API mevcut; kullanıcı arayüzü tamamlanacak.

- [x] **2.1** Hatırlatıcı ekleme formu (başlık, tarih, kategori, öncelik)
- [x] **2.2** Hatırlatıcıyı tamamlama / tekrar aktifleştirme (PATCH)
- [x] **2.3** Hatırlatıcı silme
- [x] **2.4** Takvim görünümünde önceliğe göre renklendirme

## 📊 Sprint 3 — Raporlama & Analiz


- [x] **3.1** Haftalık/aylık kâr özeti
- [x] **3.2** En çok satan ürünler listesi
- [x] **3.3** Kritik stok raporu (eşik altı ürünler)
- [x] **3.4** Tedarikçi bazlı teslimat performansı

## ⚙️ Sprint 4 — Ayarlar & Yönetim

- [x] **4.1** İşletme bilgileri ayarları
- [x] **4.2** Depo yönetimi (ekle / düzenle / pasifleştir)
- [x] **4.3** Bağlı e-posta yönetimi (`linked_emails`)
- [x] **4.4** Boş ekran ve hata durumları iyileştirmesi

## 🎨 Sprint 6 — Özelleştirme & Ayarlar

- [x] **6.1** Dükkan ismini girme ve özelleştirme alanları
- [x] **6.2** Depo ekleme ve isimlendirme modülü
- [x] **6.3** Mevcut takvim bileşeninin hatalarının düzeltilmesi
- [x] **6.4** Ayarlar ve Yardım/AI önerisi sayfalarının oluşturulması

## 🚀 Sprint 5 — Üretim Hazırlığı

- [ ] **5.1** Mobil uyum (responsive) kontrolü
- [ ] **5.2** Performans & SEO iyileştirmeleri
- [ ] **5.3** Erişilebilirlik (a11y) gözden geçirme
- [ ] **5.4** Vercel deploy + ortam değişkeni doğrulama
