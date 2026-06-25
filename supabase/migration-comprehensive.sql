-- ===========================================
-- EsnafAsistan — Kapsamlı Schema Migration
-- Tarih: 2026-06-25
-- ===========================================

-- 1. linked_emails — is_active kolonunu ekle
alter table if exists public.linked_emails
  add column if not exists is_active boolean not null default true;

-- 2. deliveries — eksik kolonları ekle
alter table if exists public.deliveries
  add column if not exists quantity integer;
update public.deliveries set quantity = 1 where quantity is null;
alter table public.deliveries alter column quantity set not null;

alter table if exists public.deliveries
  add column if not exists supplier_name text;
update public.deliveries set supplier_name = 'Bilinmeyen' where supplier_name is null;
alter table public.deliveries alter column supplier_name set not null;

alter table if exists public.deliveries
  add column if not exists status text not null default 'bekliyor';

alter table if exists public.deliveries
  add column if not exists linked_email text;

alter table if exists public.deliveries
  add column if not exists created_at timestamptz not null default now();

-- 3. warehouses — location_type ekle (depo / raf)
alter table if exists public.warehouses
  add column if not exists location_type text not null default 'depo'
  check (location_type in ('depo', 'raf'));

-- Mevcut 'Dükkan' kaydını raf olarak işaretle
update public.warehouses
set location_type = 'raf'
where name = 'Dükkan' and location_type = 'depo';

-- 4. products — photo_url ve category ekle
alter table if exists public.products
  add column if not exists photo_url text;

alter table if exists public.products
  add column if not exists category text;

-- 5. deliveries → products FK ekle (yoksa)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints tc
    join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_name = 'deliveries'
      and ccu.table_name = 'products'
  ) then
    alter table public.deliveries
      add constraint fk_deliveries_products
      foreign key (product_id) references public.products(id) on delete set null;
  end if;
end $$;

-- 6. linked_emails — e-posta okuma izni (IMAP/doğrulama kaldırıldı, forwarding yaklaşımına geçildi)
alter table if exists public.linked_emails
  add column if not exists can_read boolean not null default false;

alter table if exists public.linked_emails
  drop column if exists verified_at;

alter table if exists public.linked_emails
  drop column if exists verification_token;

alter table if exists public.linked_emails
  drop column if exists imap_host;

alter table if exists public.linked_emails
  drop column if exists imap_port;

alter table if exists public.linked_emails
  drop column if exists imap_user;

alter table if exists public.linked_emails
  drop column if exists imap_pass;

-- 7. shop_settings — yönlendirme (forwarding) adresi
alter table if exists public.shop_settings
  add column if not exists forwarding_address text;

-- 8. products — legacy text kolonunu temizle (yerine warehouse_id FK kullanılıyor)
alter table if exists public.products
  drop column if exists warehouse;

-- 9. deliveries — status check constraint'ine yeni değer ekle
alter table if exists public.deliveries
  drop constraint if exists deliveries_status_check;

alter table if exists public.deliveries
  add constraint deliveries_status_check
  check (status in ('bekliyor', 'teslim-alindi', 'iptal', 'işlenmeyi bekliyor'));

-- 10. products — warehouse_id için ON DELETE SET NULL
alter table if exists public.products
  drop constraint if exists products_warehouse_id_fkey,
  add constraint products_warehouse_id_fkey
  foreign key (warehouse_id) references public.warehouses(id) on delete set null;