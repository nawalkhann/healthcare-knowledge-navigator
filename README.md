# Healthcare Knowledge Navigator

A medical retrieval assistant that answers clinical questions from current guidelines and research, with numbered citations and a confidence score. Built for healthcare professionals and students.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS, deployed on Vercel
- Supabase Postgres with pgvector and full-text search for hybrid retrieval
- gte-small embeddings (384 dimensions)
- A `navigator` Supabase Edge Function that holds all database access and embeds text
- Optional: an OpenAI-compatible LLM API for reranking and written answers. Without one, answers quote the best-matching source sentences

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Apply the database schema from `supabase/migrations/` to your Supabase project and deploy the `navigator` Edge Function from `supabase/functions/navigator`. Generate a random token, set it as `NAVIGATOR_TOKEN` in the app's environment, and store its SHA-256 hash in the `app_tokens` table (see `0003_app_tokens.sql`).

## Source library

The [`literature/`](literature/) folder lists every source in the library by topic, with links and licences.

`data/sources.json` lists the sources: PubMed Central open-access searches per topic (only CC BY and CC0 articles are kept) and CDC guidance pages.

```bash
npm run ingest                    # all topics
npm run ingest -- --topic asthma  # one topic
npm run ingest -- --dry-run       # parse and chunk only, no database writes
npm run eval:retrieval            # hit rate and MRR on data/eval/questions.json
```

The **Ingest sources** GitHub Actions workflow runs both weekly and on demand. It needs no secrets: it signs in to the `navigator` function with the workflow's GitHub OIDC token, which the function only accepts from this repository's main branch.

## Answer engine

`POST /api/ask` with `{"question": "..."}`:

1. Strips obvious patient identifiers from the question.
   Without `LLM_API_KEY`, steps 2-3 are replaced by quoting up to four source sentences that share the most terms with the question, and the answer is declined when none share at least a third.
2. Runs hybrid search for the top 20 passages, then has the LLM rerank them (0-3) and keeps up to 8 that score 2 or more.
3. Has the LLM write 2-6 sentences, each citing passage numbers. Sentences with missing or invalid citations are removed.
4. Scores confidence (`src/lib/answer/confidence.ts`): relevance 40%, number of independent sources 20%, evidence type 25%, recency 15%. High is 0.75 or more, Moderate 0.55 or more, otherwise Low.
5. Declines and shows the closest sources when no passage is relevant or no cited sentence survives.

Every query is logged to `query_logs` without IP addresses. Requests are limited to 10 per minute per IP.

## Roadmap

1. Spec and setup
2. Ingestion and retrieval: source scripts, chunking, embeddings, hybrid search, evaluation set
3. Answer engine: cited answers, citation checks, confidence scoring, refusal on weak evidence
4. App and deploy: Ask page, topic pages, legal pages, Vercel deploy
5. Launch: custom domain, Search Console and sitemap, SEO, performance, mobile, broken-link checks

## Disclaimer

This tool provides information for healthcare professionals. It is not medical advice and does not replace clinical judgment.
