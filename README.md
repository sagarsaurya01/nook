# Nook

Your AI second brain for everything you save — paste a link, screenshot or reel,
and Nook files it into the right visual collection automatically, with the
original source kept. Clean-room build (our own name, design and code; inspired
by the Sorti category, nothing copied).

> Working name "Nook" — swappable. Accent colour is a placeholder.

## Status

- [x] Recon, architecture, design system — in [`replica/`](replica/)
- [x] Clickable prototype — [`prototype.html`](prototype.html)
- [ ] **Web MVP (2-hour sprint):** real auth + AI sorting + collections + search, deployed

## Stack

Next.js (App Router) + TypeScript + Tailwind · Supabase (Auth + Postgres + Storage) ·
Claude API for categorization/enrichment · Vercel hosting.

## The core loop

Sign in → paste a link / upload a screenshot → server fetches title + image →
Claude classifies it into one of the collections → saved with source link →
browse by collection, open detail, search.

## Build plan (2-hour sprint)

| Phase | What |
|---|---|
| 0 | Next.js scaffold from the prototype UI |
| 1 | Supabase auth + run `replica/schema.sql` |
| 2 | **Core loop**: save link → Claude sorts → store |
| 3 | Home grid, collection view, item detail |
| 4 | Text search + screenshot (vision) |
| 5 | Deploy to Vercel, smoke test, hand over URL |

Not in this sprint: native share-sheet (iOS/Android), price tracking, maps/booking,
real-time shared folders.

## Layout (planned)

```
web/            Next.js app
replica/        recon, architecture, design system, schema
prototype.html  the clickable design reference
```
