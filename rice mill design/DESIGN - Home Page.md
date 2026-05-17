# Heritage Mill — Home Page Design Document

A detailed walkthrough of every section on the Al-Noor Rice Mills shop page: what it is, why it exists, what it says, and how it behaves.

---

## Design philosophy

**Heritage Mill** is a 2026 e-commerce direction that treats Al-Noor like a serious heritage food brand — closer to Aesop, Graza, or Hermès than to a typical Pakistani rice supplier site. The platform sells to **two audiences simultaneously** (retail households + wholesale buyers / exporters), so the design has to feel premium enough to justify retail prices and substantial enough to convince a container-scale buyer.

Three principles drive every decision:

1. **Editorial, not promotional.** Big serif italic headlines, generous whitespace, mono labels, hairline dividers. Reads like a magazine, not a discount flyer.
2. **Slow craft is the product.** Every section reinforces the "twelve months in jute" story. Slowness is sold as a feature.
3. **No data slop.** No fake "★ 4.9 (12,548 reviews)", no stat counters tracking nothing. Every number on the page corresponds to something real about the mill.

---

## Visual system

### Color palette
```
--paddy       deep forest green   primary brand (logo, accents, italics)
--paddy-deep  near-black green    footer, dark surfaces
--saffron     warm gold           secondary accent, badges, CTAs
--cream       warm off-white      page background
--ink         near-black warm     body text
--mute        warm grey           captions, mono labels
--hairline    pale warm grey      rules, borders
```

Five alternate palettes are available (deeper paddy + gold, terracotta + burnt, slate + scarlet, olive + camel). The brand reads correctly in any of them — the system separates **role** from **hue**.

### Typography
- **Display:** Newsreader (variable serif). Used at large sizes, frequently italicized for emphasis words. Optical-size variants tighten as the type gets larger.
- **Body:** Geist (modern sans). Used for paragraphs, descriptions, UI controls.
- **Mono:** JetBrains Mono. Used **only** for technical labels — origin, grade, weight, dates, region codes. Mono signals "this is a fact about the product."

Three font weights total: 400, 500, 600. No bold-italic display type — italic alone carries enough emphasis in serif.

### Hierarchy rules
- Section eyebrows are **always** mono caps with `0.16em` letter-spacing
- Section titles are **always** serif with one italic phrase (usually green)
- Body copy is **always** sans, max-width ~520px for readability
- Prices and weights are **always** serif (not mono) — they're presented as values, not data

### Spacing
- Sections: `140px` top + bottom on desktop, `60px` on mobile
- Grid gaps: `28px` on desktop, `16px` on mobile
- Card padding: `22–32px`
- Border radii: `6px` (small), `12px` (cards), `22px` (large containers)
- Adjustable globally via the `--density` token (compact / comfortable / spacious)

### Motion
- All entrance animations use `cubic-bezier(.2,.8,.2,1)` — slightly overshoot, fast settle
- `<Reveal>` wrapper fades content up on scroll-into-view (24px translation, 800ms)
- Card hovers lift `-4px` over 350ms
- Wholesale tier rows slide right `12px` on hover
- The 3D rice bag floats in a 8s sine cycle and tilts toward the cursor
- Falling rice grains drift down the page in 6–14s loops at low opacity

---

## Section-by-section walkthrough

### 0. Navigation (`<Nav>`)
Frosted-blur backdrop, `78%` opacity bg, single hairline at the bottom. Logo on the left with a saffron-to-terracotta gradient seal. Five text links in the middle (Shop, Basmati Reserve, Heritage, Journal, Contact). Sign-in button + cart bubble on the right. The cart bubble shows a saffron counter badge when items are added.

**Why it works:** Frosted blur lets the hero's color bleed through; the hairline keeps it from feeling heavy.

---

### 1. Hero — Editorial split (`<HeroEditorial>`)

The default hero, also available in 3 alternate layouts via Tweaks.

**Layout:** 50/50 split. Left half is content, right half is the 3D rice bag.

**Left side, top to bottom:**
- Eyebrow: `ESTABLISHED MMX · BATKHELA, MALAKAND` (mono, muted, with hairline prefix)
- Headline (56–96px serif): "Rice, milled with the *patience* of foothills." — italic green word breaks the line
- Subhead (17px sans, ink-2): one paragraph explaining what the mill is and what it sells
- Two CTAs: "Shop the harvest" (primary paddy) and "Our story" (ghost)
- 4-column KPI strip with hairline top border: `15+ Years milling`, `3,200t Annual capacity`, `420+ Wholesale partners`, `99.4% Lab grade A` — numbers animate from 0 on page load via `<Counter>`

**Right side:**
- The 3D rice bag (`<RiceBag3D>`) — pure CSS 3D with fabric weave texture, paddy-green top band, italic "Basmati" label, saffron seal reading "Reserve · EST · MMX", weight "5 KG NET" at bottom
- Tilts toward cursor on mousemove (subtle, ~6° max)
- Floats up and down on a slow loop independent of the tilt
- Has a soft drop shadow rendered as a blurred radial gradient on the floor

**Background:** Two soft radial glows — saffron in the top-right, paddy in the bottom-left. Falling rice grain particles drift through.

**Why it works:** The split immediately tells the audience the product (visible bag) and the story (text). The bag does the work of a hero photograph without needing one. The KPIs prove the mill is serious before you scroll once.

---

### 2. Certification strip
A quiet horizontal band immediately below the hero. Soft paddy-tinted background, top and bottom hairlines.

`CERTIFIED BY · 2026` mono label on the left, followed by six certifications:
`PCSIR · ISO 22000 · HALAL · IFANCA · HACCP · PSQCA · GLOBAL G.A.P`

**Why it works:** Establishes credibility instantly. A wholesale or export buyer needs to see these *before* anything else. Retail buyers don't read it but absorb the signal — "this looks serious."

---

### 3. Catalogue (`#shop`)

**Section head:** Two columns. Left has "II · THE CATALOGUE" eyebrow + headline "Six varieties. *One standard.*" Right has a 16px paragraph explaining the harvest cycle and pricing.

**Filter row:** Hairline-bracketed horizontal bar with six filter chips (All, Basmati, Sella, Brown, Local, Broken) on the left, "6 VARIETIES · SORT: HARVEST DATE ↓" mono meta on the right.

**Product grid:** 3 columns desktop, 2 mobile, 1 small mobile. Each card (`.product-card-pro`):

- 4:5 aspect-ratio image area with striped placeholder labeled e.g. `BASMATI · 5KG`
- Top-left: badge if applicable (`Signature`, `New Harvest`, `Organic`, `Best Value`) — ink background, cream text, mono caps
- Top-right: 34px circular favourite button (saffron when active)
- Bottom of image: hidden "Add to basket →" bar slides up from below on hover, full-width, ink background, mono caps
- Card body: top row has `VARIETY · GRADE A` (mono mute) on left, `IN STOCK` (paddy with dot) on right
- Product name in serif, with the second word italic green
- 14px description, max 2 lines
- Dashed-rule footer: price in serif (`₨480/kg`) on left, mono `VIEW →` on right
- Whole card lifts `-4px` and border tints paddy on hover

**Why it works:** Magazine-grade product cards. Every card communicates variety, grade, stock, price, and one descriptive sentence — enough to decide. The hover reveal of "Add to basket" keeps the resting state clean.

---

### 4. Editor's Pick spotlight

**Layout:** 50/50 split on a soft paddy-tinted band, with top and bottom hairlines separating it from sections above and below.

**Left:** A large display of the 3D rice bag inside a cream-gradient card.

**Right:**
- Eyebrow: `III · THE EDITOR'S PICK`
- Headline: "Super Kernel *Basmati.*"
- Lead paragraph
- 6-cell spec grid: ORIGIN · GRAIN · MOISTURE · BROKEN · SHELF LIFE · MIN ORDER. Each cell has a mono caps label above a serif value. Dashed rules between columns and rows.
- Price row: `₨480/kilo` in 52px serif, with `FROM ₨420/KG AT 50KG+ · ₨380/KG AT 500KG+` in mono below — tiered pricing visible right on the spotlight
- Two CTAs: "View product" (primary) and "Quick add"

**Why it works:** Lets one product carry the narrative. The spec grid is the same vocabulary you'd see on a wine label — it elevates rice into the same category. Tier pricing on the spotlight quietly signals "we also sell wholesale" without breaking the retail aesthetic.

---

### 5. Wholesale & Export

The most important section for the **B2B audience**. Lives on the regular cream background.

**Layout:** 2-column. Wider left column has copy + tier table, narrower right column has visuals + a quote.

**Left:**
- Eyebrow: `IV · WHOLESALE & EXPORT`
- Headline: "Built for *restaurants, retailers,* and exporters."
- Lead paragraph explaining tier breaks and export documentation
- **Tier table:** four rows, each with TIER (mono paddy) · range (italic serif) · price detail (sans) · CTA (mono) on a single line. Hover slides the row right by 12px to invite interaction.
  - `RETAIL · 1–49 kg · Standard pricing · Shop catalogue →`
  - `TRADE · 50–499 kg · −12% across the catalogue · Request quote →`
  - `WHOLESALE · 500–4,999 kg · −18% · dedicated account manager · Request quote →`
  - `CONTAINER · 5,000 kg + · Bespoke pricing · FOB Karachi · export docs · Speak to founders →`

**Right:**
- Two stacked image placeholders (warehouse + freight loading), the second offset 60px down for asymmetry
- Below them, a quote card: "We've shipped twelve containers to UAE this year without a single rejection on grain length." — Bilal Khan, Export Director, Al-Noor

**Why it works:** Wholesale tier transparency is rare in this industry. Buyers don't have to email to find out if you're worth a conversation. The export-director quote signals the founder team handles export themselves — important for trust at this scale.

---

### 6. Process

A horizontal four-column timeline with top + bottom borders and dashed rules between columns.

`01 PROCUREMENT → 02 SUN-DRYING → 03 RESTING → 04 MILLING`

Each step has a large italic green numeral (60px serif), a serif step name (24px), and a 14px description. Hovering a column tints it faintly paddy.

**Why it works:** The process is the brand. Showing it as a horizontal timeline reinforces "this takes twelve months" without ever literally saying it. The numbers are bold; the descriptions are quiet.

---

### 7. Testimonials

**Layout:** Centered eyebrow + headline, then a 2×2 grid of quote cards below.

Each card has:
- Saffron stars
- A 22px serif italic quote
- Dashed-rule signature footer: customer name + role tag (`RETAIL · LAHORE`, `EXPORT · DUBAI`, `TRADE · ISLAMABAD`, `WHOLESALE · KARACHI`)

The role tag is critical — it shows the testimonials span both the retail and wholesale audiences the platform serves.

**Why it works:** Four quotes, four roles, four cities. Reads as both warm (real names, real stories) and structured (the four-card grid is intentional, not slapdash).

---

### 8. Heritage teaser

A different background tint (`color-mix(--paddy 8%, --bg)`) to break the rhythm. 2-column split with a 4:5 paddy-green gradient placeholder on the left ("MILL · COURTYARD · DAWN") and a story preview on the right that links to the full /about page.

**Why it works:** Mid-page palate cleanser. Tells the founding story in two paragraphs without forcing the user to click away. The full About page exists for users who want more.

---

### 9. FAQ accordion

Top hairline above ink (heavy) followed by hairline-divided rows. Each question is a serif 20–28px line with `+` icon on the right; clicking expands a 16px body answer with a 400ms cubic-bezier ease. The first question is open by default.

Six questions cover:
- Shipping speed
- What "aged basmati" means
- Wholesale tiers
- Freshness guarantee
- International shipping
- Halal + certifications

**Why it works:** Answers the questions buyers will actually email about, in plain language, before they email. The format (serif question, sans answer) keeps it editorial, not call-centre.

---

### 10. Newsletter

A single paddy-deep card with a saffron radial bloom in the top-right corner. Cream text. Two columns inside: left has the eyebrow + serif headline "Field notes, *first Saturday* of the month." Right has the explainer + email input pill + Subscribe button + small "UNSUBSCRIBE WITH ONE CLICK · 2,840 READERS" line.

**Why it works:** A specific cadence ("first Saturday of every month") is a soft promise that this is not a daily spam list. Subscriber count adds quiet credibility.

---

### 11. Footer

Paddy-deep background with cream type. Four columns: brand block with logo and address, Shop links, Company links, Visit (street address + hours). Below: thin hairline with `© 2026 AL-NOOR RICE MILLS · ESTD MMX` on the left and `BATKHELA — MALAKAND — KPK — PK` on the right.

**Why it works:** Restates the brand, the location, the year — every time the user scrolls to the bottom. Reinforces heritage without shouting it.

---

## Why this hero, not the others

Three alternates are available via Tweaks:

| Layout | Strength | Why it's not default |
|---|---|---|
| **Center (Apple-style)** | Cinematic, product is the hero | Reads as a product page, not a storefront — buries the catalogue |
| **Magazine cover** | Boldest typography, strong editorial voice | The paddy-deep right panel pushes the "premium" signal too hard for a dual-audience site |
| **Catalogue grid** | Fastest path to "show me what you sell" | No room for the brand story or the proof points — feels like a product list |
| **Editorial (default)** | Balances brand story + product visibility + proof in one screen | — |

The Editorial hero is the only one that gives the headline, the 3D bag, AND the four KPIs above the fold. For a dual-audience site, that combination is the right opening move.

---

## Cross-cutting interactions

- **Reveal on scroll:** Every section animates content in with a staggered upward fade as it enters the viewport, via `IntersectionObserver`
- **3D rice bag:** Reused across hero + spotlight + product detail. Tilts to cursor when interactive, just floats when not
- **Falling grains:** A passive ambient layer behind hero-like sections. Different per-grain rotation, duration, and warm hue for variety
- **Counters:** Animate from 0 → target when scrolled into view, never re-trigger
- **Cart drawer:** Slides in from the right (460px) with a dimmed backdrop. Empty state has its own warm message. Subtotal and "free delivery above ₨5,000" footer.

---

## What's deliberately absent

- ❌ Hero carousel (kills the headline)
- ❌ Stock photos of grain in wooden spoons
- ❌ Trust badges with cartoon icons
- ❌ "Limited time" countdown timers
- ❌ Pop-up newsletter capture
- ❌ Emojis or "📦 Free shipping!" banners
- ❌ Generic stock testimonials ("Great product! ⭐⭐⭐⭐⭐")
- ❌ Fake review counts
- ❌ Hover animations that move more than 6px
- ❌ Auto-playing video
- ❌ Sticky bottom-bar with "10% off — get the code!"

Restraint is the brand.
