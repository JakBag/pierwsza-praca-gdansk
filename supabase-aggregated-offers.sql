alter table public.job_submissions
  add column if not exists is_aggregated boolean not null default false,
  add column if not exists external_apply_url text,
  add column if not exists hide_expiration_date boolean not null default false;

alter table public.jobs
  add column if not exists is_aggregated boolean not null default false,
  add column if not exists external_apply_url text,
  add column if not exists hide_expiration_date boolean not null default false;
