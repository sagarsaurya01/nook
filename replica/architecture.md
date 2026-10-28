# Sorti clone — Architecture

> Built from `recon.md` + `features.csv`. Clean-room: our own stack and model.
> Date: 2026-10-28.

## Decision up front: web-first MVP, native later

Sorti's magic is the **native share sheet**. That's real iOS + Android work and
the slowest thing to build. To "see what comes out" fast, **Phase 1 is a web
app** that proves the core loop with *paste a link / upload a screenshot*
instead of the share sheet. If the loop feels good, Phase N adds an **Expo
(React Native)** app that reuses the same Supabase backend and adds the real
share extension. Backend never changes.

## 1. Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js (App Router) + TypeScript | same pattern as your other clones; SSR for share-link pages |
| styling | Tailwind + tokens from replica-design | consistent, fast |
| database | Postgres on Supabase | one DB, RLS gives per-user isolation for free |
| data access | server actions + Supabase client; Supabase-shaped signatures | swaps to real backend without touching screens |
| auth | Supabase Auth (Apple, Google, email) | matches Sorti's sign-in options |
| AI classify | LLM vision+text call (categorize a link/screenshot) | our own prompt; this is the product's brain |
| enrichment | server fetch of shared URL → title, og:image, price, recipe | best-effort; manual fallback |
| search | Postgres full-text + **pgvector** for semantic/voice search | one DB, no extra service |
| files | Supabase Storage | screenshots/thumbnails |
| jobs | Supabase cron / a small worker | price-check sweep, embedding backfill |
| payments | none in v1 (Sorti is free); Razorpay if ever monetized | India default |
| hosting | Railway (web + worker) + Supabase | your existing setup |

One database. No microservices. We rebuild the **features**, not Sorti's infra.

## 2. Schema

Full SQL in `replica/schema.sql`. **10 tables:** profiles, collections,
sub_collections, items, product_meta, place_meta, recipe_meta, price_alerts,
shares, memberships. Highlights:

- `items` carries `type`, `source_url` (always preserved), `image_url`,
  `ai_category`, `ai_tags`, `embedding vector(1536)`, `status`.
- Type-specific detail split into `*_meta` 1:1 tables (clean, nullable-free).
- Money = `bigint` minor units + `currency`.
- Dedup: unique `(user_id, source_url)` so the same save doesn't double.
- **RLS everywhere**: you see your rows, plus collections you're a member of.

## 3. API / server actions (one per flow)

| method/action | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `saveItem()` | create item, kick off classify+enrich | owner | url or uploaded image | item (status=processing) | F01 |
| `classifyItem()` (job) | LLM decides category + tags, routes to collection | system | item_id | updated item | F01 |
| `enrichItem()` (job) | fetch source → title/image/price/recipe/place | system | item_id | *_meta rows | F01 |
| `listCollections()` | home grid | owner/member | — | collections[] | F03 |
| `getCollection(id)` | items in a collection | owner/member | id | items[] | F03 |
| `getItem(id)` | item detail | owner/member | id | item + meta | F02 |
| `searchItems(q)` | text + semantic search | owner | query | items[] | F02 |
| `createShare(colId,type)` | make link or folder | owner | collection, type | token | F04/F05 |
| `joinShare(token)` | open/join shared collection | any user | token | membership or read view | F05 |
| `trackPrice(itemId,target)` | set a price alert | owner | item, target | alert | F06 |
| `priceSweep()` (cron) | re-check tracked prices, notify | system | — | — | F06 |

AI + enrichment use **our own API keys** (LLM provider, maps geocoder). No
Sorti private endpoints — ever.

## 4. The parts that bite

- **Classifier accuracy** is the product. Wrong category = broken trust. Needs
  a good prompt + a cheap "move item" correction UI, and that correction should
  feed future accuracy.
- **URL enrichment is unreliable** — IG/TikTok block scrapers, product sites
  vary. Treat every fetch as best-effort; always keep the raw link; let the user
  fill gaps manually.
- **Don't rehost platform media.** Store the user's own screenshot + the link,
  never re-download someone's reel. Legal + ToS line.
- **Dedup / idempotency** — same link shared twice, job retries twice.
- **Semantic search cost** — only embed on save; backfill in a job.
- **Share tokens** must be opaque and revocable.
- **Price scraping** at scale gets blocked/rate-limited — keep it modest.

## 5. Build order

**Milestone 0 — vertical slice (ugly, end-to-end).** Sign in → paste a link →
AI sorts it into a collection → see it on the home grid → open source.
Screens S01, S02, S06(web), S05. Tables: profiles, collections, items.
Actions: saveItem, classifyItem, listCollections, getItem. *Proves the stack.*

**Milestone 1 — must-haves.** Screenshot upload + vision classify, sub-collections,
text search, item detail actions, private-by-default RLS. Adds S03, S04, S07.
Tables: sub_collections, storage. 

**Milestone 2 — should-haves.** Recipe extraction, product price capture,
places + map, voice search, semantic search, share-via-link. S08, S09,
product_meta/place_meta/recipe_meta, shares.

**Milestone 3 — could-haves.** Price-drop alerts + cron, shared folders
(realtime + memberships), Face ID lock. price_alerts, memberships.

**Milestone N — native.** Expo app + real iOS/Android share extensions on the
same backend. (The big one.)

## 6. Summary

- **Stack (one line):** Next.js + TypeScript + Tailwind on Supabase (Postgres +
  Auth + Storage + pgvector), LLM for classify/enrich, Railway hosting — web
  MVP first, Expo native later.
- **Tables:** 10. **Routes/actions:** ~11 + 2 jobs.
- **Riskiest:** (1) AI categorization accuracy, (2) reliable URL enrichment,
  (3) native share extensions (deferred to Milestone N).
- **Next step:** `/replica-design`.
