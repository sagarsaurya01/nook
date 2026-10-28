# Sorti clone — Component specs

Built once in isolation (a `/design` route) before any screen. Icons: Lucide
(MIT). Base: shadcn/ui + Radix for accessible primitives. All colours via
tokens; never raw hex.

---

**Button**
- variants: primary (bg accent / text on-accent), secondary (bg surface / text),
  ghost (transparent / text), danger (bg danger / white)
- sizes: sm 32px, md 40px, lg 48px
- states: default, hover (darken 6%), active, focus-visible (2px accent ring,
  2px offset), disabled (50% + no pointer), loading (spinner, label kept)
- tokens: radius md, font sm/600
- a11y: real `<button>`, visible focus, loading announces to SR
- used on: S01, S02, S05, S06, S07, S09

**Collection card** (the hero component)
- image cover (object-cover, 4:3), name, item count, optional member avatars
- radius lg, shadow card, hover lift (translateY -2px, shadow pop)
- states: default, hover, empty (placeholder cover), loading (skeleton)
- a11y: whole card is one link; name is the accessible label
- used on: S02, S08

**Item tile** (masonry grid)
- image, type badge (reel/recipe/product/place…), title on 2 lines, source favicon
- product tile shows price badge; place tile shows a pin
- states: default, hover (overlay actions: open source, move, delete),
  processing (shimmer + "Sorting…"), failed (retry)
- grid: 2 cols mobile, 4 desktop, 16px gap
- used on: S03, S04, S07

**Chip** (category / sub-collection)
- pill radius, surface bg, text; selected = accent bg / on-accent
- states: default, selected, hover, focus-visible
- used on: S03, S07

**Search bar + voice**
- input with leading search icon, trailing mic button
- states: idle, focused (accent border), typing, listening (pulsing mic),
  results, no-results, error (mic denied)
- a11y: `role=search`, mic is a labelled toggle button
- used on: S02, S07

**Save sheet / capture (web)**
- paste-URL field OR drop/upload screenshot, "Save" primary
- states: idle, fetching source (progress), classified ("→ Recipes", editable),
  error (couldn't read link — keep raw URL, let user pick category)
- used on: S06

**Item detail sheet**
- large image, title, source-link button, category chip, type-specific block
  (price+Track / map+Book / ingredients+steps), notes, delete
- states per type: product, recipe, place, link, screenshot
- used on: S05, S09

**Tab bar** (mobile) / top nav (desktop)
- Home · Search · Add (center, accent) · Shared · Profile
- states: active (accent icon+label), inactive (muted)
- a11y: `role=navigation`, current = aria-current

**Toast**
- variants: success ("Organized into Recipes"), error, info
- auto-dismiss 4s, swipe/close, polite live region
- used on: after S06

**Modal / share dialog**
- Radix Dialog, focus trap, Esc closes, overlay click closes
- share: copy-link, WhatsApp/email buttons, "shared folder" toggle + invite
- used on: S04 share, S08

**Empty states** (write fresh copy — never Sorti's)
- Home: "Nothing saved yet. Paste a link or drop a screenshot to begin."
- Search no-results: "No matches. Try fewer words, or the brand/place name."
- Collection empty, Shared empty — each its own line.

**Skeletons**: card, tile, detail — shown while `status=processing`.

---

Contrast: all token pairs pass WCAG AA (see `contrast.py` report — 0 failing).
Focus rings and input borders meet 3:1 UI minimum.
