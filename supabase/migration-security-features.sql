-- Sprint GÜVENLİK + TEST + MOBİL + ENTEGRASYON — Tüm Migration
-- Her çalıştırmada güvenle tekrarlanabilir (idempotent)

-- 1. audit_log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
drop policy if exists "Audit log sadece admin okuyabilir" on public.audit_log;
create policy "Audit log sadece admin okuyabilir" on public.audit_log for select to authenticated using (false);

-- 2. user_activity_log
create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  action_type text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.user_activity_log enable row level security;
drop policy if exists "Kullanici kendi aktivitelerini gorebilir" on public.user_activity_log;
create policy "Kullanici kendi aktivitelerini gorebilir" on public.user_activity_log for select to authenticated using (user_id = auth.uid());

-- 3. product_photos
create table if not exists public.product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  photo_url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_photos enable row level security;
drop policy if exists "Urun fotograflari authenticated" on public.product_photos;
create policy "Urun fotograflari authenticated" on public.product_photos for all to authenticated using (true) with check (true);

-- 4. price_history
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  old_price numeric(12,2),
  new_price numeric(12,2) not null,
  changed_by uuid references auth.users(id),
  change_reason text,
  created_at timestamptz not null default now()
);
alter table public.price_history enable row level security;
drop policy if exists "Fiyat gecmisi authenticated" on public.price_history;
create policy "Fiyat gecmisi authenticated" on public.price_history for all to authenticated using (true) with check (true);

-- 5. batch_tracking
create table if not exists public.batch_tracking (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  batch_code text,
  quantity integer not null default 0,
  expiry_date date,
  purchase_price numeric(12,2),
  warehouse_id uuid references public.warehouses(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.batch_tracking enable row level security;
drop policy if exists "Parti takibi authenticated" on public.batch_tracking;
create policy "Parti takibi authenticated" on public.batch_tracking for all to authenticated using (true) with check (true);

-- 6. customer_ledger
create table if not exists public.customer_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  total_debt numeric(12,2) not null default 0,
  total_credit numeric(12,2) not null default 0,
  balance numeric(12,2) generated always as (total_debt - total_credit) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_ledger enable row level security;
drop policy if exists "Cari hesap authenticated" on public.customer_ledger;
create policy "Cari hesap authenticated" on public.customer_ledger for all to authenticated using (true) with check (true);
alter table public.customer_ledger add column if not exists user_id uuid references auth.users(id);

-- 7. customer_transactions
create table if not exists public.customer_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customer_ledger(id) on delete cascade not null,
  transaction_type text not null check (transaction_type in ('debt', 'payment', 'sale')),
  amount numeric(12,2) not null,
  description text,
  sale_id uuid references public.sales(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.customer_transactions enable row level security;
drop policy if exists "Cari hareket authenticated" on public.customer_transactions;
create policy "Cari hareket authenticated" on public.customer_transactions for all to authenticated using (true) with check (true);

-- 8. suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  performance_score integer check (performance_score >= 0 and performance_score <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.suppliers enable row level security;
drop policy if exists "Tedarikci authenticated" on public.suppliers;
create policy "Tedarikci authenticated" on public.suppliers for all to authenticated using (true) with check (true);
alter table public.suppliers add column if not exists user_id uuid references auth.users(id);

-- 9. stock_alerts
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  threshold_quantity integer not null default 5,
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.stock_alerts enable row level security;
drop policy if exists "Stok uyarilari authenticated" on public.stock_alerts;
create policy "Stok uyarilari authenticated" on public.stock_alerts for all to authenticated using (true) with check (true);

-- 10. push_subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "Push abonelikleri authenticated" on public.push_subscriptions;
create policy "Push abonelikleri authenticated" on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 11. Products — yeni kolonlar
alter table if exists public.products add column if not exists user_id uuid references auth.users(id);
alter table if exists public.products add column if not exists barcode text;
alter table if exists public.products add column if not exists min_stock integer not null default 5;

-- 12. Sales — payment_type
alter table if exists public.sales add column if not exists payment_type text not null default 'nakit';
alter table if exists public.sales add column if not exists user_id uuid references auth.users(id);

-- 13. Deliveries — yeni kolonlar
alter table if exists public.deliveries add column if not exists user_id uuid references auth.users(id);
alter table if exists public.deliveries add column if not exists notes text;
alter table if exists public.deliveries add column if not exists reminder_sent boolean not null default false;

-- 14. Reminders — user_id
alter table if exists public.reminders add column if not exists user_id uuid references auth.users(id);

-- 15. Warehouses — user_id
alter table if exists public.warehouses add column if not exists user_id uuid references auth.users(id);

-- 16. Linked emails — user_id
alter table if exists public.linked_emails add column if not exists user_id uuid references auth.users(id);

-- 17. Indexes
create index if not exists idx_product_photos_product on public.product_photos(product_id);
create index if not exists idx_customer_transactions_customer on public.customer_transactions(customer_id);
create index if not exists idx_price_history_product on public.price_history(product_id);
create index if not exists idx_batch_tracking_product on public.batch_tracking(product_id);
create index if not exists idx_stock_alerts_product on public.stock_alerts(product_id);

-- 18. Fonksiyon: fiyat değişikliğini otomatik logla
create or replace function public.log_price_change()
returns trigger as $$
begin
  if old.purchase_price is distinct from new.purchase_price then
    insert into public.price_history (product_id, old_price, new_price, changed_by, change_reason)
    values (new.id, old.purchase_price, new.purchase_price, auth.uid(), 'Alış fiyatı güncellemesi');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_price_change on public.products;
create trigger trg_log_price_change
  after update of purchase_price on public.products
  for each row
  execute function public.log_price_change();

-- 19. Fonksiyon: stok kritik seviye kontrolü
create or replace function public.check_critical_stock()
returns trigger as $$
begin
  if new.quantity <= new.min_stock then
    insert into public.stock_alerts (product_id, threshold_quantity, is_active)
    values (new.id, new.min_stock, true)
    on conflict (product_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_critical_stock on public.products;
create trigger trg_check_critical_stock
  after insert or update of quantity on public.products
  for each row
  execute function public.check_critical_stock();
