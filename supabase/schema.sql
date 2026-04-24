-- EsnafAsistan basic schema for Supabase (PostgreSQL)

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  warehouse text not null default 'Ana Depo' check (warehouse in ('Dukkan', 'Ana Depo', 'Arac')),
  quantity integer not null default 0,
  unit text not null default 'Adet',
  purchase_price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.warehouses (name)
values
  ('Dükkan'),
  ('Ana Depo'),
  ('Araç')
on conflict (name) do nothing;

alter table public.products add column if not exists warehouse_id uuid references public.warehouses(id);
alter table public.products drop constraint if exists products_warehouse_check;

update public.products p
set warehouse_id = w.id
from public.warehouses w
where p.warehouse_id is null
  and (
    (p.warehouse = 'Dukkan' and w.name = 'Dükkan')
    or (p.warehouse = 'Araç' and w.name = 'Araç')
    or (p.warehouse = 'Arac' and w.name = 'Araç')
    or (p.warehouse = 'Ana Depo' and w.name = 'Ana Depo')
  );

update public.products p
set warehouse_id = w.id
from public.warehouses w
where p.warehouse_id is null
  and w.name = 'Ana Depo';

create index if not exists idx_products_warehouse_id on public.products(warehouse_id);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  sale_price numeric(12,2) not null,
  purchase_price numeric(12,2) not null,
  customer_name text,
  sold_at timestamptz not null default now(),
  note text
);

alter table public.sales add column if not exists purchase_price numeric(12,2);
alter table public.sales add column if not exists customer_name text;
update public.sales set purchase_price = 0 where purchase_price is null;
alter table public.sales alter column purchase_price set not null;

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  supplier_name text not null,
  expected_date date not null,
  quantity integer not null check (quantity > 0),
  status text not null default 'bekliyor' check (status in ('bekliyor', 'teslim-alindi', 'iptal')),
  linked_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.linked_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  reminder_date date not null,
  category text not null default 'Genel',
  is_done boolean not null default false,
  priority text not null default 'normal' check (priority in ('dusuk', 'normal', 'yuksek')),
  remind_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_name on public.products(name);
create index if not exists idx_sales_product_id on public.sales(product_id);
create index if not exists idx_sales_sold_at on public.sales(sold_at);
create index if not exists idx_deliveries_expected_date on public.deliveries(expected_date);
create index if not exists idx_reminders_date on public.reminders(reminder_date);
create index if not exists idx_reminders_done on public.reminders(is_done);
