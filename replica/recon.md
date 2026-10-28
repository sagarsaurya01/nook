# Sorti — Recon Map

> Clean-room recon. Rebuilds what Sorti *does* and how a user moves through it.
> No source code, no assets, no copy taken. Public sources only.
> Date: 2026-10-28 · Source of truth: letitsorti.com + public app-store listings.

## 1. Scope

- **App / platform:** Sorti — native **mobile app, iOS + Android**. (Web is marketing only.)
- **Slice to clone (core loop):** *Share → AI auto-organize → find & act.*
  Save any content from the phone's share sheet; AI files it into a visual
  collection with the original source link; find it later by search/voice and
  act (open source, buy, cook, book, visit).
- **Who it's for:** people who hoard saves (Reels, TikToks, screenshots, links,
  recipes, products, places) and never act on them. Lifestyle, not knowledge-work.

**One-line pitch (their words, paraphrased):** "Pinterest meets Notion, but fully
automatic — your AI second brain for the saved-content era."

## 2. Sources

| source | URL | what it gives |
| --- | --- | --- |
| marketing site | https://letitsorti.com/ | full feature list, use cases, how-it-works, FAQ |
| FAQ (on site) | https://letitsorti.com/ (FAQ section) | detailed feature claims: price tracking, recipe extraction, semantic/voice search, maps, Face ID |
| App Store listing | search "Sorti" on iOS App Store | screens, screenshots, ratings |
| Google Play listing | search "Sorti" on Play Store | screens, Android states |
| guides/comparisons | letitsorti.com journal/guides | positioning vs Pinterest, Notion, Raindrop, Captr, Sortd |

> TODO (if going deep): grab real screenshots into `replica/screens/` from the
> two app-store listings. Not done in this quick pass per Ajay's "don't spend
> too much time".

## 3. Screen inventory (inferred from flows + listing copy)

IDs are stable. `*` = inferred, not yet confirmed against a real screenshot.

| ID | screen | how you get there | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| S01 | Onboarding / sign-in | first launch | account + permissions | logo, sign-in (Apple/Google/email), value slides | empty, error |
| S02 | Home / Library* | after login | all collections, visual grid | collection cards (cover images), search bar, voice-search mic, +add | empty (no saves), filled, loading |
| S03 | Collection view* | tap a collection | items in one category | masonry/visual grid of saved items, sub-collection chips, share btn | empty, filled |
| S04 | Sub-collection view* | tap a sub-collection chip | narrower slice | same grid, breadcrumb | filled |
| S05 | Item detail* | tap a saved item | act on one save | cover image, title, source link btn, category, price/promo (if product), map (if place), notes, delete | product, recipe, place, link, screenshot variants |
| S06 | Share-sheet capture (extension) | Share → Sorti from any app | the actual save moment | "Saving…"/"Organized into X" toast, pick/confirm collection | loading, success, error (couldn't fetch source) |
| S07 | Search / results* | tap search or mic | find a save | query input, voice input, result grid, filters by type | empty, no-results, results |
| S08 | Shared collection / shared folder* | open a share link | collaborate | item grid, member avatars, "join"/"add" | viewer, member, link-only |
| S09 | Price-tracking view* | item detail → Track Price | watch for drops | price history, alert toggle | tracking on/off |
| S10 | Settings / My Account* | profile menu | account, privacy, Face ID lock | sign-out, privacy toggles, biometric lock | — |

## 4. User flows

```
F01  Save something (THE core loop)
     (any app) Share -> S06 capture -> "AI organized into Recipes" -> done
     edge: source link unreachable, offline, unknown category, duplicate save
     happy-path taps to beat: 2 (Share, Sorti)

F02  Find & act on a save
     S02 home -> S07 search (type or voice) -> S05 item detail -> open source / buy / book
     edge: nothing matches, remembered wrong words, source page dead

F03  Browse by collection
     S02 home -> S03 collection -> S04 sub-collection -> S05 item
     edge: empty collection, very large collection (perf)

F04  Share a collection
     S03 collection -> Share -> link (WhatsApp/text/email) -> recipient opens in S08
     edge: recipient has no app, revoke access

F05  Shared folder (real-time collab)
     S03 -> create shared folder -> invite -> members add items -> all see live
     edge: conflict, member leaves, privacy

F06  Track a product price
     S05 product item -> Track Price -> S09 -> alert on drop -> buy
     edge: price can't be scraped, store blocks it

F07  Places / recipes specials
     place item -> map + Book a table / Directions / Order delivery
     recipe item -> extracted ingredients/steps
```

## 5. Components

Buttons (primary/ghost/icon), search bar + voice mic, collection card (image
cover + count), item tile (masonry), category/sub-collection chip, item-detail
sheet, source-link button, price badge + track toggle, map embed, share sheet,
member avatar stack, toast ("Organized into …"), empty-state illustrations,
biometric-lock prompt, tab bar (Home / Search / Add / Shared / Profile).

## 6. Inferred data model

```
User       id, name, email, auth_provider, biometric_lock(bool)
            confidence: high

Collection id, user_id, name, cover_item_id, is_shared(bool), kind(category)
            evidence: S02/S03, "visual collections"; confidence: high
SubCollection id, collection_id, name
            evidence: "collections and sub-collections"; confidence: high

Item       id, user_id, collection_id, sub_collection_id,
           type(reel|post|story|tiktok|screenshot|link|recipe|product|place|pdf|photo),
           title, source_url, image_url, created_at,
           ai_category, ai_tags(json), notes
            evidence: S05, FAQ "original source preserved", "auto-categorize"; confidence: high

ProductMeta item_id, price, currency, brand, promo_code, store_url, track_price(bool)
            evidence: FAQ gift-list + price tracking; confidence: med

PlaceMeta  item_id, lat, lng, address, creator_handle, booking_url
            evidence: FAQ places (Resy/OpenTable/Directions); confidence: med

RecipeMeta item_id, ingredients(json), steps(json)
            evidence: FAQ "recipe extraction"; confidence: med

Share      id, collection_id, type(link|folder), token, created_by
Membership id, collection_id, user_id, role(owner|member|viewer)
           PriceAlert id, item_id, target_price, active
```

## 7. Feature matrix

See `replica/features.csv`.

## 8. What cannot be cloned

| area | why — `skip` |
| --- | --- |
| The AI categorization *quality* | their models/prompts are private; we build our own classifier (vision + text LLM). Parity on behavior, not weights. |
| Instagram/TikTok content itself | platform content; we store user's own saved link + a user-supplied screenshot, never rehost their media |
| Scraping product prices / recipes reliably at scale | sites block scrapers, ToS limits; our version is best-effort + manual fallback |
| Native share-extension polish | iOS/Android share extensions are real native work, not web — the single hardest native piece |
| Their user base / shared-folder network | that's the network, not a feature |
| Booking partners (Resy, OpenTable) | partner integrations / deep links only, no deal |

## 9. Size

- Screens ~10, flows 7, entities ~10.
- Hard parts: (1) **native share extensions** on both iOS + Android, (2) **AI
  auto-categorization** (vision + LLM on image/link), (3) **source enrichment**
  (fetch title/image/price/recipe from a shared URL reliably).
- **Size: L (a quarter)** for a real cross-platform app. **M** for a web-first
  MVP (paste/upload instead of native share extension) to prove the core loop.

## 10. Next step

`/replica-architect` — pick stack + schema. Recommendation for a fast first
pass: **web MVP** (Next.js + Supabase, paste-a-link / upload-screenshot instead
of native share) to validate "save → AI sorts → find", then decide on native
(Expo / React Native) for the real share-sheet magic.
