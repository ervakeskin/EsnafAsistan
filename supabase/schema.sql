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

create index if not exists idx_products_name on public.products(name);
create index if not exists idx_sales_product_id on public.sales(product_id);
create index if not exists idx_sales_sold_at on public.sales(sold_at);
create index if not exists idx_deliveries_expected_date on public.deliveries(expected_date);
