-- Fix 1: linked_emails.is_active sütunu eksik
alter table if exists public.linked_emails
  add column if not exists is_active boolean not null default true;

-- Fix 2: deliveries tablosunda products FK eksik olabilir
-- Önce mevcut FK'yi kontrol et, yoksa ekle
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints tc
    join information_schema.constraint_column_usage ccu on tc.constraint_name = ccu.constraint_name
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_name = 'deliveries'
      and ccu.table_name = 'products'
      and ccu.column_name = 'id'
  ) then
    alter table public.deliveries
      add constraint fk_deliveries_products
      foreign key (product_id) references public.products(id) on delete set null;
  end if;
end $$;
