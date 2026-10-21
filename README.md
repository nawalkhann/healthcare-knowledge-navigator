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

Apply the database schema from `supabase/migrations/` to your Supabase project.

## Roadmap

1. Spec and setup
2. Ingestion and retrieval: source scripts, chunking, embeddings, hybrid search, evaluation set
3. Answer engine: cited answers, citation checks, confidence scoring, refusal on weak evidence
4. App and deploy: Ask page, topic pages, legal pages, Vercel deploy
5. Launch: custom domain, Search Console and sitemap, SEO, performance, mobile, broken-link checks

## Disclaimer

This tool provides information for healthcare professionals. It is not medical advice and does not replace clinical judgment.
