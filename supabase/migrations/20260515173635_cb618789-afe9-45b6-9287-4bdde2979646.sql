
-- Roles
create type public.app_role as enum ('admin','customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Auto-create profile + assign customer role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  short_desc text,
  long_desc text,
  benefits text[] not null default '{}',
  usage_info text,
  specs jsonb not null default '{}'::jsonb,
  price_cents int not null check (price_cents >= 0),
  compare_at_cents int,
  images text[] not null default '{}',
  stock int not null default 100,
  featured boolean not null default false,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create index products_category_idx on public.products(category_id);
create index products_featured_idx on public.products(featured);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select using (approved = true);
create policy "reviews user insert" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "reviews user update own" on public.reviews for update to authenticated using (user_id = auth.uid());
create policy "reviews admin all" on public.reviews for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text not null,
  postal text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.addresses enable row level security;
create policy "addresses owner all" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Wishlists
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.wishlists enable row level security;
create policy "wishlists owner all" on public.wishlists for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders
create type public.order_status as enum ('pending','paid','shipped','delivered','cancelled','refunded');
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique default ('SYN-' || upper(substr(md5(random()::text),1,8))),
  email text not null,
  status order_status not null default 'pending',
  subtotal_cents int not null default 0,
  shipping_cents int not null default 0,
  tax_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  shipping_method text,
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "orders owner read" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "orders admin all" on public.orders for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price_cents int not null,
  quantity int not null check (quantity > 0),
  image_url text
);
alter table public.order_items enable row level security;
create policy "order items via owner order" on public.order_items for select to authenticated using (
  exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order items admin all" on public.order_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Newsletter
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter public insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter admin read" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Contact submissions
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  category text,
  created_at timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;
create policy "contact public insert" on public.contact_submissions for insert with check (true);
create policy "contact admin read" on public.contact_submissions for select to authenticated using (public.has_role(auth.uid(),'admin'));
