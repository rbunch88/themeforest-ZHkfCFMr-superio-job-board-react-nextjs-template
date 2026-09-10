-- ******** TABLES ********
create table company (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  org_id      text unique not null,
  created_at  timestamptz default now()
);

create table employer_profile (
  clerk_user_id text primary key,
  company_id    uuid references company(id) on delete cascade,
  title         text,
  phone         text,
  created_at    timestamptz default now()
);

create table candidate_profile (
  clerk_user_id text primary key,
  resume_url    text,
  headline      text,
  created_at    timestamptz default now()
);

create table job_post (
  id          uuid default gen_random_uuid() primary key,
  company_id  uuid references company(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'open',
  created_at  timestamptz default now()
);

create table application (
  id            uuid default gen_random_uuid() primary key,
  job_post_id   uuid references job_post(id) on delete cascade,
  clerk_user_id text not null,
  status        text default 'applied',
  created_at    timestamptz default now()
);

-- ******** RLS ********
alter table all in schema public enable row level security;

create or replace function public.current_uid() returns text
  language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), 'anon')
  $$;

create or replace function public.current_org() returns text
  language sql stable as $$
    select current_setting('request.jwt.claim.organization_metadata.org_id', true)
  $$;

create policy "candidate self-access"
  on candidate_profile for all
  using (clerk_user_id = current_uid());

create policy "employer self-access"
  on employer_profile for all
  using (clerk_user_id = current_uid());

create policy "company members read"
  on company for select
  using (org_id = current_org());

create policy "employer org job CRUD"
  on job_post for all
  using (company_id in (select id from company where org_id = current_org()));

create policy "candidates read open jobs"
  on job_post for select
  using (status = 'open');

create policy "candidate self applications"
  on application for all
  using (clerk_user_id = current_uid());
