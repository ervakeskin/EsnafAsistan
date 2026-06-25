-- ===========================================
-- EsnafAsistan — RLS Politikaları
-- Tarih: 2026-06-25
-- Amaç: Tüm tablolarda authenticated kullanıcıların
--       CRUD işlemleri yapabilmesi için RLS politikaları
-- ===========================================

-- Eksik tablo varsa oluştur (shop_settings schema.sql'de tanımlı ama DB'de olmayabilir)
create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null default 'Dükkanım',
  updated_at timestamptz not null default now()
);

do $$
declare
  tbl text;
  pol text;
begin
  foreach tbl in array array['products', 'warehouses', 'sales', 'deliveries', 'linked_emails', 'reminders', 'shop_settings']
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = tbl) then
      execute format('alter table if exists public.%I enable row level security;', tbl);

      foreach pol in array array[
        format('drop policy if exists "%s_select" on public.%I; create policy "%s_select" on public.%I for select to authenticated using (true);', tbl, tbl, tbl, tbl),
        format('drop policy if exists "%s_insert" on public.%I; create policy "%s_insert" on public.%I for insert to authenticated with check (true);', tbl, tbl, tbl, tbl),
        format('drop policy if exists "%s_update" on public.%I; create policy "%s_update" on public.%I for update to authenticated using (true);', tbl, tbl, tbl, tbl),
        format('drop policy if exists "%s_delete" on public.%I; create policy "%s_delete" on public.%I for delete to authenticated using (true);', tbl, tbl, tbl, tbl)
      ]
      loop
        begin
          execute pol;
        exception when others then
          -- skip (e.g. try to create policy on table without RLS, or update/delete policy on table without PK)
        end;
      end loop;
    end if;
  end loop;
end $$;
