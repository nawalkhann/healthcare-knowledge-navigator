-- Source library schema: documents, their chunks, and query logs.
create extension if not exists vector with schema extensions;

create table documents (
  id bigint generated always as identity primary key,
  title text not null,
  issuer text not null,               -- e.g. WHO, CDC, journal name
  source_url text not null unique,
  published_year int,
  evidence_type text not null check (evidence_type in ('guideline', 'systematic_review', 'rct', 'observational', 'other')),
  licence text not null,
  created_at timestamptz not null default now()
);

create table chunks (
  id bigint generated always as identity primary key,
  document_id bigint not null references documents (id) on delete cascade,
  section_path text not null,         -- e.g. "Hypertension > Treatment > First-line"
  content text not null,
  token_count int not null,
  embedding extensions.vector(384) not null,     -- gte-small
  fts tsvector generated always as (to_tsvector('english', section_path || ' ' || content)) stored
);

create index chunks_embedding_idx on chunks using hnsw (embedding extensions.vector_cosine_ops);
create index chunks_fts_idx on chunks using gin (fts);
create index chunks_document_idx on chunks (document_id);

create table query_logs (
  id bigint generated always as identity primary key,
  question text not null,             -- identifiers stripped before insert
  answer text,
  confidence text check (confidence in ('high', 'moderate', 'low', 'declined')),
  chunk_ids bigint[] not null default '{}',
  latency_ms int,
  created_at timestamptz not null default now()
);

-- Hybrid search: vector similarity and full-text rank merged by reciprocal rank fusion.
create or replace function hybrid_search(
  query_text text,
  query_embedding extensions.vector(384),
  match_count int default 20,
  rrf_k int default 50
)
returns table (chunk_id bigint, score double precision)
language sql stable
set search_path = public, extensions
as $$
  with semantic as (
    select id, row_number() over (order by embedding <=> query_embedding) as rank
    from chunks
    order by embedding <=> query_embedding
    limit match_count * 2
  ),
  keyword as (
    select id, row_number() over (order by ts_rank_cd(fts, q) desc) as rank
    from chunks, websearch_to_tsquery('english', query_text) q
    where fts @@ q
    order by ts_rank_cd(fts, q) desc
    limit match_count * 2
  )
  select coalesce(s.id, k.id) as chunk_id,
         coalesce(1.0 / (rrf_k + s.rank), 0) + coalesce(1.0 / (rrf_k + k.rank), 0) as score
  from semantic s
  full outer join keyword k on s.id = k.id
  order by score desc
  limit match_count;
$$;

-- All access goes through the server with the service role; no public table access.
alter table documents enable row level security;
alter table chunks enable row level security;
alter table query_logs enable row level security;
revoke execute on function hybrid_search(text, extensions.vector, int, int) from anon, authenticated, public;
