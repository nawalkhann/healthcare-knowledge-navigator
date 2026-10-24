-- Access tokens for the navigator Edge Function, stored as SHA-256 hashes.
-- Rows are added by hand (insert into app_tokens values ('vercel', encode(sha256('<token>'), 'hex')));
-- RLS with no policies keeps the table invisible to the anon and authenticated roles.
create table if not exists public.app_tokens (
  name text primary key,
  token_hash text not null unique,
  created_at timestamptz not null default now()
);
alter table public.app_tokens enable row level security;
