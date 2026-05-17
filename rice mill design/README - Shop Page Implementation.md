# Al-Noor Rice Mills — Shop Page Implementation Guide

This package contains the **Heritage Mill** design for the Al-Noor storefront. The goal of this document is to help you implement it on **just the public shop page** of your existing platform.

---

## 1. What's in the bundle

| File | Purpose | Where it goes |
|---|---|---|
| `Al-Noor Rice Mills.html` | Entry point — only loads scripts/styles, can be deleted after porting | reference only |
| `styles.css` | Base design tokens, nav, footer, rice bag, particles, generic UI | global stylesheet |
| `styles-v2.css` | Shop-page specific styles (hero, product grid, spotlight, wholesale, testimonials, FAQ, newsletter) | global stylesheet |
| `components.jsx` | Reusable atoms: `<Nav>`, `<Footer>`, `<RiceBag3D>`, `<FallingGrains>`, `<Counter>`, `<Reveal>` | components folder |
| `page-hero.jsx` | Hero layouts — `<HeroEditorial>` (default), `<HeroCenter>`, `<HeroMagazine>`, `<HeroCatalogue>` | components/shop folder |
| `page-home.jsx` | The shop page itself (composes hero + sections below) | pages/shop folder |
| `page-product.jsx` | Product detail page — port later if you want | (skip for now) |
| `page-other.jsx` | About, Login, Blog, Contact — port later if you want | (skip for now) |
| `app.jsx` | Router + Tweaks panel — your platform already handles routing, so most of this is **discardable** | reference only |
| `tweaks-panel.jsx` | Live design controls — **do not ship**; this is for design review only | reference only |

---

## 2. The shop page, top to bottom

The shop page (`HomePage` in `page-home.jsx`) is composed of these sections in order. Port them one by one if you want — each is independent.

1. **Hero** (`<HeroEditorial>`) — split layout: headline + KPI strip on the left, 3D rice bag on the right
2. **Certification strip** — PCSIR / ISO 22000 / HALAL / HACCP / PSQCA / GLOBAL G.A.P. ribbon
3. **Catalogue** — filter chips + 3-column product grid (`<ProductCard>`)
4. **Editor's Pick spotlight** — feature card for one product with 6-cell spec grid
5. **Wholesale & Export** — 4-tier pricing table + photo grid + quote
6. **Process** — 4-column "Procurement → Drying → Resting → Milling" timeline
7. **Testimonials** — 4-card grid
8. **Heritage teaser** — story preview that links to /about
9. **FAQ accordion** — 6 questions
10. **Newsletter** — paddy-green card with email capture

---

## 3. Minimum viable port (recommended starting point)

Implement these in this order — each takes a few hours, and the shop will already look transformed after step 2.

### Step 1 — Add the design tokens (15 min)
Copy `styles.css` into your global stylesheet pipeline. **Do not** rename the CSS custom properties — many components reference them directly:
```
--paddy, --paddy-deep, --paddy-soft
--saffron, --saffron-deep
--cream, --cream-2, --paper, --ink, --ink-2
--mute, --hairline
--font-display ("Newsreader" serif), --font-sans ("Geist"), --font-mono
```
Load the same Google Fonts the bundle uses (`<link>` in `Al-Noor Rice Mills.html`). Without these fonts loaded the design will look wrong.

### Step 2 — Replace the existing shop hero (1–2 hours)
Drop in `<HeroEditorial>` from `page-hero.jsx`. It needs:
- `<FallingGrains>` and `<Counter>` and `<Reveal>` and `<RiceBag3D>` from `components.jsx`
- The hero-specific styles from `styles-v2.css` (search for `.hero-pro`)
- Two callbacks: `onShop` (scroll to or navigate to product grid) and `onAbout` (navigate to /about)

That alone is the biggest single visual win.

### Step 3 — Port the product grid (2–3 hours)
Replace your existing product list with `<ProductCard>` from `page-home.jsx`. Each card expects:
```jsx
{
  id, name, italic, variety, grade, price,
  badge, desc, stock, label   // label is the placeholder text shown
                              // until you have real product imagery
}
```
Wire `onOpen` → navigate to your product detail page (`/products/:id`), `onAdd` → your cart action, `onFav` → your favourites action. The CSS classes (`.product-card-pro`, `.pc-img`, `.pc-info`, etc.) are in `styles-v2.css`.

### Step 4 — Port the surrounding sections (3–6 hours)
Add the cert strip, spotlight, wholesale section, process, testimonials, FAQ, newsletter — in any order. They are all pure presentational HTML/CSS. Replace placeholder copy with your real content.

---

## 4. Things you'll need to swap with real data

| Placeholder | What to swap in |
|---|---|
| Striped placeholder boxes labeled `BASMATI · 5KG · PHOTO` etc. | Real product photography (4:5 aspect ratio recommended) |
| The CSS rice bag in the hero (`<RiceBag3D>`) | Either keep it (it's brand-able with paddy + saffron) **or** replace with a real photo |
| Hard-coded products array in `page-home.jsx` | Fetch from your product API |
| Testimonial quotes | Real customer quotes from your reviews table |
| FAQ entries | Your actual policies |
| Wholesale tier copy | Your actual wholesale pricing rules |
| Newsletter form | Wire to your existing subscriber list |

---

## 5. What to drop before going live

These are **design-review only** — do not ship:
- `tweaks-panel.jsx` (live design controls)
- The `<TweaksPanel>` wrapper in `app.jsx`
- The `useTweaks` hook and `TWEAK_DEFAULTS` block
- The `cursor: none` rules in `styles.css` if you're not also implementing the custom cursor (and you probably shouldn't on a real platform)

Also remove or replace:
- `data-screen-label` attributes (these are review-mode markers)

---

## 6. Theming knobs that should stay

These are the brand colors. Keep them adjustable through your existing theme system if you have one:

```css
:root {
  --paddy: oklch(0.32 0.06 145);     /* Brand green */
  --saffron: oklch(0.72 0.16 65);    /* Accent gold */
  --cream: oklch(0.97 0.012 85);     /* Background */
  --ink: oklch(0.18 0.012 60);       /* Text */
}
```

For dark mode, copy the `[data-theme="dark"]` block from the top of `styles.css`.

---

## 7. React / framework notes

The bundle uses **React 18 + Babel-in-browser**. For production you should:
- Compile JSX ahead of time with your build pipeline (Vite, Next.js, CRA, whatever you use)
- Replace the unpkg script tags with your normal React import
- Convert `components.jsx` exports from `Object.assign(window, ...)` to ES module exports

If your platform is not React — Vue, Next.js server components, Astro, a server-rendered template — the HTML markup and CSS still port over. Just rewrite the small bits of interactivity (the FAQ accordion, the favourites toggle, the filter chips, the cart drawer) in your framework's idioms.

---

## 8. What I held back

These were built but **not** in the final shop page because they made it feel less serious — keep them in mind only if you want them later:
- WebGL grain vortex (Three.js)
- Magnetic custom cursor
- Kinetic letter-reveal hero typography
- Cinematic page-wipe transitions
- Asymmetric magazine product grid
- Horizontal scroll-jacked varieties showcase

---

## Questions?

Send WhatsApp to the agency, or reopen the design and click any element to leave inline comments.
