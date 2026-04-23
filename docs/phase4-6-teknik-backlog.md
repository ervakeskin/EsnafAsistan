# EsnafAsistan Aşama 4-6 Teknik Backlog

Bu backlog, 3. asama bittikten sonra otomasyon, AI ve yayina alma adimlarini kucuk ve olculebilir is paketlerine bolmek icin hazirlandi.

## Asama 4 - Akilli Giris (Mail + OCR/Parser)

### Sprint 4.1 - Mail Toplama Altyapisi
- Ayarlardaki aktif mailleri okuyacak bir `mail_source` servis katmani olustur.
- Gelen kutusundan sadece yeni fatura/irsaliye adayi mailleri cek.
- Islenen mail kimliklerini kaydederek cift islemeyi engelle.

### Sprint 4.2 - Dosya Cozumleme
- PDF/Gorsel ekleri tek formatta islemek icin parser giris katmani yaz.
- OCR cikisini standart alana cevir (`urun_adi`, `alis_fiyati`, `miktar`, `birim`).
- Dusuk guvenli satirlari `manuel onay gerekli` olarak isaretle.

### Sprint 4.3 - Stoga Onayli Isleme
- Esnaf dostu bir "onay ekrani" ile bulunan satirlari goster.
- Tek tikla secili satirlari stok girisine cevir.
- Kayit sonucu raporu ver (`kac satir eklendi`, `kac satir atlandi`).

## Asama 5 - AI Tahmin ve Dis Veri

### Sprint 5.1 - Google Maps Yogunluk
- `KESKIN YAPI` icin lokasyon bazli yogunluk verisini cek.
- Teslimat icin "en sakin saat araligi" onerisi uret.
- Son 7 gun bazli basit guven puani ekle.

### Sprint 5.2 - Mevsimsel Risk Motoru
- Hava durumu + sezon verisini gunluk topla.
- Don riski ve talep artisi durumlari icin stok uyarisi uret.
- Uyarilari "Bugun Onerim" kartinda sade dilde sun.

### Sprint 5.3 - Oneri Kalite Takibi
- Onerilerin kabul/red durumunu kaydet.
- En cok ise yarayan tavsiyeleri onceliklendirmek icin puanlama ekle.
- Yanlis alarm oranini haftalik takip et.

## Asama 6 - Final ve Yayina Alma

### Sprint 6.1 - Ortaam ve Guvenli Dagitim
- Vercel `preview` ve `production` ortamlarini ayir.
- Ortam degiskenlerini profile gore dogrula.
- Kritik akislarda hata yakalama ve merkezi loglama ac.

### Sprint 6.2 - PWA ve Cihaz Kurulumu
- Android ve Windows icin PWA kurulum test listesi hazirla.
- Zayif baglantida acilis davranisini test et (offline fallback).
- Ana ekran kisayolu ve tek tik acilis akisini sabitle.

### Sprint 6.3 - Pilot ve Geri Donus
- 7 gunluk pilot modda sadece `stok + satis + kasa` acik kalsin.
- Kritik durumda guvenli moda alacak ozellik bayragi tanimla.
- Gunluk kontrol listesi ile sahada sorun toplama ritmi kur.

### Sprint 6.4 - Tam Gecis
- Pilot kabul kriterleri saglanirsa production tam gecis yap.
- AI/OCR modullerini kademeli olarak ac.
- Canli takip panosunda hata ve performans hedeflerini kontrol et.

## Kabul Kriteri (3 Gun Saha Dogrulamasi)
- Satis kaydi hatasiz olusuyor.
- Satis sonrasi stok miktari dogru dusuyor.
- Gunluk kasa ve cepte kalan toplamlari manuel hesapla tutuyor.
