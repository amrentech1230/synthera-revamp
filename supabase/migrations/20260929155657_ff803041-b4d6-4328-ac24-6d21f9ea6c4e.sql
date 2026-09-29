-- Lock products/categories to signed-in users
drop policy if exists "products public read" on public.products;
drop policy if exists "categories public read" on public.categories;
drop policy if exists "reviews public read" on public.reviews;
revoke select on public.products from anon;
revoke select on public.categories from anon;
revoke select on public.reviews from anon;
create policy "categories auth read" on public.categories for select to authenticated using (true);
create policy "reviews auth read" on public.reviews for select to authenticated using (approved = true);

alter table public.products
  add column if not exists sku text,
  add column if not exists product_type text not null default 'Research Compound',
  add column if not exists status text not null default 'active',
  add column if not exists availability text not null default 'Available',
  add column if not exists scientific_info text,
  add column if not exists therapeutic_info text;
create policy "products auth read" on public.products for select to authenticated using (status = 'active' or public.has_role(auth.uid(),'admin'));

alter table public.profiles
  add column if not exists company text,
  add column if not exists job_title text,
  add column if not exists country text,
  add column if not exists address text;
create policy "profiles admin read" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

alter table public.contact_submissions
  add column if not exists organization text,
  add column if not exists phone text,
  add column if not exists user_id uuid,
  add column if not exists status text not null default 'new';
create policy "contact admin update" on public.contact_submissions for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- Access requests
create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null, last_name text not null, company text not null,
  job_title text, email text not null, phone text, country text,
  reason text not null, message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant insert on public.access_requests to anon, authenticated;
grant select, update, delete on public.access_requests to authenticated;
grant all on public.access_requests to service_role;
alter table public.access_requests enable row level security;
create policy "access public insert" on public.access_requests for insert to anon, authenticated
  with check (status = 'pending' and length(email) between 3 and 255 and length(reason) <= 2000);
create policy "access admin all" on public.access_requests for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Product requests
create table public.product_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid references public.products(id) on delete set null,
  message text,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.product_requests to authenticated;
grant all on public.product_requests to service_role;
alter table public.product_requests enable row level security;
create policy "preq owner read" on public.product_requests for select to authenticated using (user_id = auth.uid());
create policy "preq owner insert" on public.product_requests for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "preq admin all" on public.product_requests for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Resources
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Insights',
  excerpt text,
  body text,
  image_url text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select on public.resources to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "resources public read" on public.resources for select to anon, authenticated using (published = true);
create policy "resources admin all" on public.resources for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Product documents
create table public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  doc_type text not null default 'Product Information',
  file_path text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.product_documents to authenticated;
grant all on public.product_documents to service_role;
alter table public.product_documents enable row level security;
create policy "docs auth read" on public.product_documents for select to authenticated using (true);
create policy "docs admin all" on public.product_documents for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "product docs auth read" on storage.objects for select to authenticated using (bucket_id = 'product-docs');
create policy "product docs admin write" on storage.objects for insert to authenticated with check (bucket_id = 'product-docs' and public.has_role(auth.uid(),'admin'));
create policy "product docs admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-docs' and public.has_role(auth.uid(),'admin'));

update public.products set sku = 'SYN-' || upper(substr(md5(slug),1,6)) where sku is null;

insert into public.resources (slug,title,category,excerpt,body) values
('peptide-research-foundations','Foundations of Peptide Research','Research','An overview of how peptide science is shaping modern therapeutic discovery.','Peptides occupy a unique space between small molecules and biologics. This article outlines the foundational principles guiding Synthera''s research approach, from sequence design to stability and characterization.\n\nPlaceholder content — replace with approved Synthera copy.'),
('quality-by-design','Quality by Design in Therapeutic Development','Scientific Articles','Why quality must be engineered into every stage rather than tested at the end.','Quality by Design (QbD) emphasises understanding processes and risks early. We describe how documentation, process integrity and analytical verification work together.\n\nPlaceholder content — replace with approved Synthera copy.'),
('synthera-portal-launch','Synthera Launches Secure Product Portal','Company News','Qualified partners can now access product information through a secure portal.','Our new portal gives authorised customers access to product information, documentation and request tracking in one secure place.\n\nPlaceholder content — replace with approved Synthera copy.'),
('translational-science-trends','Trends in Translational Science','Industry Insights','Key shifts connecting laboratory discovery to therapeutic impact.','From improved analytical tools to collaborative research models, translational science is evolving quickly. Here we summarise the trends we are watching.\n\nPlaceholder content — replace with approved Synthera copy.');