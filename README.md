# Healthcare Knowledge Navigator

A medical retrieval assistant that answers clinical questions from current guidelines and research, with numbered citations and a confidence score. Built for healthcare professionals and students.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, deployed on Vercel
- Supabase Postgres with pgvector and full-text search for hybrid retrieval
- gte-small embeddings (384 dimensions)
- An LLM API for reranking and cited answer generation

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Apply the database schema from `supabase/migrations/` to your Supabase project and deploy the `embed` Edge Function from `supabase/functions/embed`.

## Source library

`data/sources.json` lists the sources: PubMed Central open-access searches per topic (only CC BY and CC0 articles are kept) and CDC guidance pages.

```bash
npm run ingest                    # all topics
npm run ingest -- --topic asthma  # one topic
npm run ingest -- --dry-run       # parse and chunk only, no database writes
npm run eval:retrieval            # hit rate and MRR on data/eval/questions.json
```

The **Ingest sources** GitHub Actions workflow runs both weekly and on demand. It needs the repository secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Roadmap

1. Spec and setup
2. Ingestion and retrieval: source scripts, chunking, embeddings, hybrid search, evaluation set
3. Answer engine: cited answers, citation checks, confidence scoring, refusal on weak evidence
4. App and deploy: Ask page, topic pages, legal pages, Vercel deploy
5. Launch: custom domain, Search Console and sitemap, SEO, performance, mobile, broken-link checks

## Disclaimer

This tool provides information for healthcare professionals. It is not medical advice and does not replace clinical judgment.
