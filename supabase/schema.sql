create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  brand_name text not null,
  website_url text not null,
  industry text,
  target_market text,
  buyer_type text,
  main_products text[],
  status text default 'created',
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  website_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.audit_queries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  query text not null,
  intent text,
  buyer_stage text,
  created_at timestamp with time zone default now()
);

create table if not exists public.ai_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  query_id uuid references public.audit_queries(id) on delete cascade,
  source text not null,
  answer text,
  target_brand_mentioned boolean default false,
  mentioned_brands text[],
  competitors_mentioned text[],
  citations jsonb,
  sentiment text,
  issues jsonb,
  raw_response jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.crawled_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  url text not null,
  title text,
  meta_description text,
  h1 text,
  h2 text[],
  text_content text,
  schema_json jsonb,
  word_count integer,
  crawled_at timestamp with time zone default now()
);

create table if not exists public.audit_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  visibility_score integer,
  mention_rate numeric,
  competitor_avg_mention_rate numeric,
  content_score integer,
  trust_score integer,
  technical_score integer,
  report_json jsonb,
  public_share_id text unique,
  created_at timestamp with time zone default now()
);

alter table public.projects enable row level security;
alter table public.competitors enable row level security;
alter table public.audit_queries enable row level security;
alter table public.ai_results enable row level security;
alter table public.crawled_pages enable row level security;
alter table public.audit_reports enable row level security;

drop policy if exists "Users can manage own projects" on public.projects;
create policy "Users can manage own projects"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own competitors" on public.competitors;
create policy "Users can manage own competitors"
on public.competitors
for all
using (
  exists (
    select 1 from public.projects
    where projects.id = competitors.project_id
    and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = competitors.project_id
    and projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own audit queries" on public.audit_queries;
create policy "Users can manage own audit queries"
on public.audit_queries
for all
using (
  exists (
    select 1 from public.projects
    where projects.id = audit_queries.project_id
    and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = audit_queries.project_id
    and projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own ai results" on public.ai_results;
create policy "Users can manage own ai results"
on public.ai_results
for all
using (
  exists (
    select 1 from public.projects
    where projects.id = ai_results.project_id
    and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = ai_results.project_id
    and projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own crawled pages" on public.crawled_pages;
create policy "Users can manage own crawled pages"
on public.crawled_pages
for all
using (
  exists (
    select 1 from public.projects
    where projects.id = crawled_pages.project_id
    and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = crawled_pages.project_id
    and projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own audit reports" on public.audit_reports;
create policy "Users can manage own audit reports"
on public.audit_reports
for all
using (
  exists (
    select 1 from public.projects
    where projects.id = audit_reports.project_id
    and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = audit_reports.project_id
    and projects.user_id = auth.uid()
  )
);

drop policy if exists "Public can read shared reports" on public.audit_reports;
create policy "Public can read shared reports"
on public.audit_reports
for select
using (public_share_id is not null);
