# 🌾 Al-Noor Rice Mills — Claude Context File

> **Token optimization file.** Claude reads this instead of exploring the codebase.
> Never explore files blindly. Always reference this file first.

---

## Business Identity

- **Name:** Al-Noor Rice Mills
- **Address:** Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan
- **Phone:** +92-946-123456
- **Mobile / WhatsApp:** +92-300-1234567
- **Email:** ricemill@sameergul.com
- **Established:** 2010
- **Business Hours:** Mon–Sat, 8:00 AM – 6:00 PM PKT

---

## Project Identity

- **Type:** Full-stack monorepo — React (client) + Express (server)
- **Purpose:** AI-powered business management + public e-commerce storefront for a Pakistani rice mill
- **Languages:** TypeScript (frontend), JavaScript (backend)
- **Styling:** Tailwind CSS 3 (`darkMode: 'class'`)
- **Node version:** 22.11.0 (locked — Vite **5.4** required, do **NOT** upgrade)

---

## Actual Monorepo Structure

```
rice mill/
├── CLAUDE.md
├── README.md
├── client/                              ← React frontend (Vite 5.4, port 3000)
│   ├── index.html                       ← PWA meta + service worker registration
│   ├── public/manifest.json + sw.js     ← PWA
│   ├── tailwind.config.js               ← darkMode: 'class', custom keyframes
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── src/
│       ├── api.ts                       ← Axios instance, baseURL :5000/api, JWT interceptor
│       ├── App.tsx                      ← ALL routes, ProtectedRoute, HelmetProvider + all providers
│       ├── main.tsx
│       ├── index.css                    ← Tailwind directives + dark mode CSS vars
│       ├── i18n.ts
│       ├── locales/en.json + ur.json
│       ├── contexts/
│       │   ├── AuthContext.tsx          ← JWT token, login/logout/loginDirect, 2FA error handling
│       │   ├── CartContext.tsx          ← cart state (localStorage, 5kg increments)
│       │   ├── LangContext.tsx          ← EN/UR toggle, RTL
│       │   └── ThemeContext.tsx         ← dark/light, system preference
│       ├── utils/export.ts              ← exportToCSV, formatPKR, formatDate
│       ├── components/
│       │   ├── Layout.tsx               ← admin sidebar (collapsible, dark) — includes Visit Store, Wholesale, Loyalty links
│       │   ├── AIAssistant.tsx          ← floating Claude chat (all dashboard pages)
│       │   ├── CommandPalette.tsx       ← Ctrl+K global search
│       │   ├── NotificationCenter.tsx   ← bell icon, polling alerts + agent alerts
│       │   └── ui/
│       │       ├── AccountTabs.tsx      ← AddressesTab | PaymentTab | RewardsTab | TwoFASection
│       │       ├── Badge.tsx            ← OrderStatusBadge, PaymentBadge, GradeBadge, MillStatusBadge, RoleBadge
│       │       ├── Modal.tsx            ← animated, Escape, click-outside, sizes sm/md/lg/xl
│       │       ├── PageHeader.tsx       ← PageHeader, ActionButton, FormField, inputCls, selectCls
│       │       ├── Pagination.tsx
│       │       ├── SearchBar.tsx        ← SearchBar + FilterSelect
│       │       ├── Skeleton.tsx         ← TableSkeleton, CardSkeleton, StatsSkeleton
│       │       └── StatCard.tsx
│       └── pages/
│           ├── Login.tsx                ← /login — email/pw + 2FA code step + account lockout UI
│           ├── Dashboard.tsx            ← /dashboard — CustomerDashboard (8 tabs) for customers
│           ├── Inventory.tsx            ← /dashboard/inventory
│           ├── MillOperations.tsx       ← /dashboard/mill
│           ├── Orders.tsx               ← /dashboard/orders (+ shipping info section)
│           ├── Customers.tsx            ← /dashboard/customers
│           ├── Suppliers.tsx            ← /dashboard/suppliers
│           ├── Finance.tsx              ← /dashboard/finance (admin)
│           ├── Analytics.tsx            ← /dashboard/analytics (admin)
│           ├── Ecommerce.tsx            ← /dashboard/ecommerce (admin) — 4 tabs
│           ├── Agents.tsx               ← /dashboard/agents (admin)
│           ├── Users.tsx                ← /dashboard/users (admin)
│           ├── DashboardBlog.tsx        ← /dashboard/blog (admin)
│           ├── DashboardCareers.tsx     ← /dashboard/careers (admin)
│           ├── DashboardNewsletter.tsx  ← /dashboard/newsletter (admin)
│           ├── DashboardReviews.tsx     ← /dashboard/reviews (admin + staff)
│           ├── DashboardMessages.tsx    ← /dashboard/messages (admin + staff)
│           ├── DashboardWholesale.tsx   ← /dashboard/wholesale (admin + staff) — inquiry management
│           ├── DashboardLoyalty.tsx     ← /dashboard/loyalty (admin) — members + manual award
│           └── shop/                   ← public storefront (no auth required)
│               ├── ShopLayout.tsx       ← navbar (auth-aware) + footer + cart drawer
│               ├── Store.tsx            ← / homepage — filters + compare checkboxes + recently viewed + SEO
│               ├── Checkout.tsx         ← /checkout — saved addresses + payment prefill + discount
│               ├── ComparePage.tsx      ← /compare?ids=id1,id2,id3 — side-by-side product table
│               ├── OrderSuccess.tsx     ← /order-success/:orderNumber
│               ├── TrackOrder.tsx       ← /track
│               ├── RegisterPage.tsx     ← /register
│               ├── ProductDetail.tsx    ← /products/:id — 4 tabs + stock alert + recently viewed + SEO
│               ├── AboutPage.tsx        ← /about
│               ├── ContactPage.tsx      ← /contact
│               ├── ForgotPasswordPage.tsx ← /forgot-password — email input → sends reset link
│               ├── ResetPasswordPage.tsx  ← /reset-password?token=xxx — set new password
│               ├── PoliciesIndex.tsx    ← /policies — 4-card hub page
│               ├── PolicyLayout.tsx     ← shared sidebar layout for all policy pages
│               ├── PrivacyPolicyPage.tsx ← /policies/privacy
│               ├── TermsPage.tsx        ← /policies/terms
│               ├── RefundPolicyPage.tsx  ← /policies/refund
│               ├── ShippingPolicyPage.tsx ← /policies/shipping (fetches settings for dynamic fee)
│               ├── CareersPage.tsx      ← /careers
│               ├── BlogPage.tsx         ← /blog
│               └── BlogPostPage.tsx     ← /blog/:slug
│
└── server/
    ├── .env
    ├── src/
    │   ├── index.js                     ← entry + all routes registered (v3.0)
    │   ├── middleware/auth.js           ← auth (verifyToken), requireRole
    │   ├── lib/
    │   │   ├── whatsapp.js              ← wa.me URL generator (6 message types, log helper)
    │   │   └── mailer.js                ← nodemailer + branded HTML templates (8 email types)
    │   └── routes/
    │       ├── authRoutes.js            ← /api/auth/* + 2FA setup/verify/disable/login + sessions + account lockout
    │       ├── userRoutes.js            ← /api/users/*
    │       ├── inventoryRoutes.js       ← /api/inventory/*
    │       ├── millRoutes.js            ← /api/mill/*
    │       ├── orderRoutes.js           ← /api/orders/* + /:id/shipping (courier/tracking/ETA)
    │       ├── customerRoutes.js        ← /api/customers/*
    │       ├── supplierRoutes.js        ← /api/suppliers/*
    │       ├── financeRoutes.js         ← /api/finance/*
    │       ├── analyticsRoutes.js       ← /api/analytics/*
    │       ├── aiRoutes.js              ← /api/ai/*
    │       ├── agentRoutes.js           ← /api/agents/*
    │       ├── notificationRoutes.js    ← /api/notifications/*
    │       ├── shopRoutes.js            ← /api/shop/* (public, no auth)
    │       ├── ecommerceRoutes.js       ← /api/ecommerce/*
    │       ├── reviewRoutes.js          ← /api/reviews/*
    │       ├── favoriteRoutes.js        ← /api/favorites/* (+ /count + /check/:productId)
    │       ├── newsletterRoutes.js      ← /api/newsletter/*
    │       ├── blogRoutes.js            ← /api/blog/*
    │       ├── careerRoutes.js          ← /api/careers/*
    │       ├── contactRoutes.js         ← /api/contact + /api/contact/admin
    │       ├── addressRoutes.js         ← /api/addresses/* + /api/payment-methods/*
    │       ├── locationRoutes.js        ← /api/location/suggest (Nominatim proxy)
    │       ├── loyaltyRoutes.js         ← /api/loyalty/* (exports: router + awardPoints helper)
    │       ├── wholesaleRoutes.js       ← /api/wholesale/*
    │       ├── stockAlertRoutes.js      ← /api/stock-alerts/*
    │       ├── recentlyViewedRoutes.js  ← /api/products/:id/view + /api/products/recently-viewed
    │       └── sitemapRoutes.js         ← /sitemap.xml + /robots.txt (at root level)
    └── prisma/
        ├── schema.prisma
        ├── dev.db
        └── seed.js
```

---

## Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5.6 | Type safety |
| Vite | **5.4** | Build (**Node 22.11 compatible — do NOT upgrade**) |
| Tailwind CSS | 3 | Styling |
| React Router | v6 | Routing |
| Axios | — | HTTP — **always import from `src/api.ts`** |
| Framer Motion | — | Animations |
| Recharts | — | All charts |
| react-i18next | — | Bilingual EN/UR |
| react-hot-toast | — | Toasts |
| lucide-react | 0.454 | Icons |
| react-helmet-async | ^3.0.0 | SEO meta tags (wrapped in `<HelmetProvider>` in App.tsx) |

### Backend
| Package | Purpose |
|---|---|
| Express | REST API |
| Prisma 5.22 | ORM (SQLite) |
| jsonwebtoken | JWT |
| bcryptjs | Password hashing |
| nodemailer | SMTP emails (Hostinger smtp.hostinger.com:465 SSL) |
| @anthropic-ai/sdk | Claude AI |
| express-rate-limit | AI rate limiting |
| speakeasy | TOTP 2FA |
| qrcode | QR code generation for 2FA setup |

---

## Environment Variables (`server/.env`)

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=ricemill_super_secret_key_2024_pakistan
PORT=5000
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-api03-...       # Claude AI features
SMTP_HOST=smtp.hostinger.com             # Hostinger SSL
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ricemill@sameergul.com
SMTP_PASS=Silent12.321?
SMTP_FROM=Al-Noor Rice Mills <ricemill@sameergul.com>
SMTP_REPLY_TO=ricemill@sameergul.com
```

> **Without ANTHROPIC_API_KEY:** AI chat, agents, and insights are disabled — rest of app works.
> **Without SMTP vars:** Emails silently skip — no errors thrown.

---

## Authentication & Roles

### JWT Flow
- Login: `POST /api/auth/login` → `{ token, user }` OR `{ requiresTwoFactor: true, tempToken }` (5min, signed with `JWT_SECRET + '_2fa'`)
- Token stored in `localStorage` as key `token`
- All requests: `Authorization: Bearer <token>`
- Middleware: `auth` → attaches `req.user`; `requireRole('admin')` → 403
- **Account lockout:** 5 failed attempts → locked 15 minutes. Returns `{ lockedUntil }` in 423 response.
- **Referral codes:** auto-generated on register: `RM-{INITIAL}{RANDOM5}` (e.g., `RM-A8K2P`)

### 2FA Flow
1. `POST /api/auth/2fa/setup` [JWT] → `{ qrCode (dataURL), manualEntryKey }`
2. `POST /api/auth/2fa/verify-setup` [JWT] `{ token }` → enables 2FA, returns 10 bcrypt-hashed backup codes
3. `POST /api/auth/2fa/disable` [JWT] `{ password, code }` → disables
4. `POST /api/auth/2fa/login` `{ tempToken, token }` → returns real `{ token, user }`
5. `GET  /api/auth/sessions` [JWT] → active sessions
6. `DELETE /api/auth/sessions/:id` and `DELETE /api/auth/sessions` [JWT] → revoke

### AuthContext Methods
- `login(email, password)` → throws error with `.code === 'REQUIRES_2FA'` and `.tempToken` when 2FA needed
- `loginDirect(token, user)` → sets localStorage token + user state directly (used after 2FA login)
- `logout()` → clears token + user

### 4 Roles
| Role | Access |
|---|---|
| `admin` | Everything |
| `staff` | Inventory, mill, orders, customers, suppliers, reviews, messages, wholesale |
| `customer` | Own orders + storefront + `/dashboard` (8-tab customer dashboard) |
| `supplier` | Managed by staff — no portal |

### Demo Credentials
```
admin@ricemill.pk  / admin123
staff@ricemill.pk  / password123
buyer@example.pk   / password123
farmer@example.pk  / password123
```

---

## All Routes

### Public (no auth)
| URL | Component |
|---|---|
| `/` | `shop/Store.tsx` — product grid, filters, compare bar, recently viewed |
| `/products/:id` | `shop/ProductDetail.tsx` — 4 tabs, stock alert, recently viewed |
| `/compare` | `shop/ComparePage.tsx` — `?ids=id1,id2,id3,id4` |
| `/checkout` | `shop/Checkout.tsx` — saved address prefill for logged-in customers |
| `/order-success/:orderNumber` | `shop/OrderSuccess.tsx` |
| `/track` | `shop/TrackOrder.tsx` |
| `/login` | `Login.tsx` — includes 2FA step + lockout message |
| `/register` | `shop/RegisterPage.tsx` |
| `/about` | `shop/AboutPage.tsx` |
| `/contact` | `shop/ContactPage.tsx` |
| `/forgot-password` | `shop/ForgotPasswordPage.tsx` — email input → sends reset link |
| `/reset-password` | `shop/ResetPasswordPage.tsx` — `?token=xxx` → set new password |
| `/policies` | `shop/PoliciesIndex.tsx` — 4-card hub |
| `/policies/privacy` | `shop/PrivacyPolicyPage.tsx` |
| `/policies/terms` | `shop/TermsPage.tsx` |
| `/policies/refund` | `shop/RefundPolicyPage.tsx` |
| `/policies/shipping` | `shop/ShippingPolicyPage.tsx` |
| `/policy` | redirects → `/policies` |
| `/careers` | `shop/CareersPage.tsx` |
| `/blog` | `shop/BlogPage.tsx` |
| `/blog/:slug` | `shop/BlogPostPage.tsx` |
| `/sitemap.xml` | generated by `sitemapRoutes.js` |
| `/robots.txt` | generated by `sitemapRoutes.js` |
| `/account` | redirects → `/dashboard` |

### Dashboard (JWT required)
| URL | Component | Roles |
|---|---|---|
| `/dashboard` | `Dashboard.tsx` | All (customers get 8-tab UI inline) |
| `/dashboard/inventory` | `Inventory.tsx` | Admin, Staff |
| `/dashboard/mill` | `MillOperations.tsx` | Admin, Staff |
| `/dashboard/orders` | `Orders.tsx` | All |
| `/dashboard/customers` | `Customers.tsx` | Admin, Staff |
| `/dashboard/suppliers` | `Suppliers.tsx` | Admin, Staff |
| `/dashboard/finance` | `Finance.tsx` | Admin |
| `/dashboard/analytics` | `Analytics.tsx` | Admin |
| `/dashboard/ecommerce` | `Ecommerce.tsx` | Admin |
| `/dashboard/agents` | `Agents.tsx` | Admin |
| `/dashboard/blog` | `DashboardBlog.tsx` | Admin |
| `/dashboard/careers` | `DashboardCareers.tsx` | Admin |
| `/dashboard/newsletter` | `DashboardNewsletter.tsx` | Admin |
| `/dashboard/reviews` | `DashboardReviews.tsx` | Admin, Staff |
| `/dashboard/messages` | `DashboardMessages.tsx` | Admin, Staff |
| `/dashboard/wholesale` | `DashboardWholesale.tsx` | Admin, Staff |
| `/dashboard/loyalty` | `DashboardLoyalty.tsx` | Admin |
| `/dashboard/users` | `Users.tsx` | Admin |

### Customer Dashboard Tabs (inside `/dashboard`)
Order: My Orders → Favorites → Reviews → Addresses → Payment → Rewards → Profile → Security

---

## API Endpoints (Complete)

### Auth
```
POST   /api/auth/login               [public]       → { token, user } OR { requiresTwoFactor, tempToken }
POST   /api/auth/register            [public]       → auto-generates referralCode RM-{INITIAL}{RANDOM5}
GET    /api/auth/me                  [JWT]          → current user + relations
POST   /api/auth/change-password     [JWT]
POST   /api/auth/forgot-password     [public]       → sends reset email (always 200, no email leak)
POST   /api/auth/reset-password      [public]       { token, password } — verifies sha256 hash, 1h expiry
POST   /api/auth/2fa/setup           [JWT]          → { qrCode, manualEntryKey }
POST   /api/auth/2fa/verify-setup    [JWT]          { token } → enables 2FA + 10 backup codes
POST   /api/auth/2fa/disable         [JWT]          { password, code }
POST   /api/auth/2fa/login           [public]       { tempToken, token } → { token, user }
GET    /api/auth/sessions            [JWT]          active sessions
DELETE /api/auth/sessions/:id        [JWT]          revoke one
DELETE /api/auth/sessions            [JWT]          revoke all except current
```

### Addresses & Payment Methods
```
GET    /api/addresses                [JWT]          list user's addresses
POST   /api/addresses                [JWT]          create
PUT    /api/addresses/:id            [JWT]          update
DELETE /api/addresses/:id            [JWT]
PATCH  /api/addresses/:id/default    [JWT]          unsets all others first

GET    /api/payment-methods          [JWT]          list user's saved payment methods
POST   /api/payment-methods          [JWT]          types: cod|bank_transfer|easypaisa|jazzcash
DELETE /api/payment-methods/:id      [JWT]
PATCH  /api/payment-methods/:id/default [JWT]
```

### Location (Nominatim proxy)
```
GET    /api/location/suggest?q=...       [public]   text search → [{ displayName, city, state, country, postalCode, latitude, longitude }]
GET    /api/location/suggest?lat=&lng=   [public]   reverse geocode
```

### Loyalty
```
GET    /api/loyalty/balance          [JWT customer] { balance, pkrValue, tier, nextTierPoints, history }
POST   /api/loyalty/redeem           [JWT customer] { points } → creates negative LoyaltyPoint
GET    /api/loyalty/referral         [JWT customer] { myCode, referralUrl, totalReferrals, pointsEarned }
GET    /api/loyalty/members          [admin]        paginated member list with tier stats
POST   /api/loyalty/award            [admin]        { userId, points, description } → manual award
```
Points: 1 pt per PKR 100 spent. Tiers: Bronze(0-999)/Silver(1000-4999)/Gold(5000+). 100pts = PKR 10.

### Wholesale
```
POST   /api/wholesale/inquiry        [public]       min 500kg validation
GET    /api/wholesale/admin          [admin/staff]  list + newCount
PATCH  /api/wholesale/admin/:id      [admin/staff]  { status, quotedPricePerKg, adminNote }
```

### Stock Alerts
```
POST   /api/stock-alerts             [public]       { productId, email } — deduplicates
GET    /api/stock-alerts/admin       [admin/staff]  list all
```

### Recently Viewed
```
POST   /api/products/:id/view        [public, auth optional]   X-Session-ID header or userId; keeps max 20
GET    /api/products/recently-viewed [public, auth optional]   returns last 10 published products
```

### Orders (updated)
```
PATCH  /api/orders/:id/shipping      [staff]        { courierName, trackingNumber, estimatedDelivery }
```

### Favorites (updated)
```
GET    /api/favorites/count          [JWT customer] → { count }
GET    /api/favorites/check/:productId [JWT customer] → { isFavorited }
```

### Sitemap / SEO
```
GET    /sitemap.xml                  [public]       static pages + products + blog + careers
GET    /robots.txt                   [public]       allow all; disallow /dashboard /api
```

### Users / Inventory / Mill / Customers / Suppliers / Finance / Analytics / AI / Shop / Ecommerce / Reviews / Newsletter / Blog / Careers / Contact
(unchanged — see existing patterns in code)

---

## Animation System

```
Central file:  client/src/utils/animations.ts  — ALL variants defined here, never inline
Page wrapper:  client/src/components/PageTransition.tsx  — wraps every page's outermost element
AnimatePresence: client/src/App.tsx wraps all Routes with mode="wait", key=location.pathname

Variants exported from animations.ts:
  pageVariants, fadeVariants, slideRightVariants, slideLeftVariants,
  dropdownVariants, bottomSheetVariants,
  staggerContainer, staggerFast, staggerItem, staggerItemX,
  scrollReveal, scrollRevealLeft, scrollRevealRight, scrollRevealScale,
  cardHover, buttonTap, buttonPress, iconSpin, shimmerVariants,
  viewportOnce (viewport config for whileInView)

Key layoutId values:
  "tabUnderline"           → pages/shop/ProductDetail.tsx tabs
  "ecommerceTabUnderline"  → pages/Ecommerce.tsx tabs (if added)
  "accountTabUnderline"    → customer dashboard tabs (if added)
  "activePill"             → category filter pills (if added)

AnimatedNumber: components/ui/StatCard.tsx — animates numeric values on mount
Toaster: moved to bottom-right in App.tsx (success=green, error=red, 5s for errors)

CSS additions (client/src/index.css):
  .ticker-track       — CSS animation for announcement bar (hover pauses)
  .animate-float      — 3s ease-in-out float for hero card
  .skeleton           — shimmer background for loading states
  .framer-animate     — will-change hint for frequently animated elements
  @media (prefers-reduced-motion) — disables ticker + float

Performance rules:
  will-change only on: navbar (ShopLayout), cart drawer (ShopLayout), sidebar (Layout)
  layout prop only on: product grid cards (Store.tsx) + cart items (ShopLayout)
  stagger max 12 items — use staggerFast (0.04s) for longer lists
  useReducedMotion() hook checked in Store.tsx — disables stagger when preferred
  viewport={{ once: true }} on all whileInView (scroll reveals don't re-fire)
  AnimatePresence key must be stable + unique on every child
```

---

## Design System (2026)

```
Primary:  #16a34a (green-600)
Dark:     #14532d (green-900)  — hero backgrounds, footer
Accent:   #fbbf24 (amber-400)  — CTA buttons, checkout button
Animations: Framer Motion throughout store pages
Ticker:   CSS keyframes auto-scroll announcement bar in ShopLayout
Hero:     85vh+, radial-gradient mesh, floating particle animation
Cards:    whileHover y:-4, shadow increase 200ms
Buttons:  whileTap scale 0.97
Scroll:   whileInView opacity/y reveal, once:true
Cart:     Amber "Proceed to Checkout" button (not green), shows promo field
Footer:   Amber newsletter bar + dark green 4-col footer + dark bottom bar
Admin:    Mobile drawer sidebar (Framer Motion), tables → cards on mobile (<sm)
```

---

## Database Models (Prisma)

> Schema: `server/prisma/schema.prisma` — all IDs: `String @id @default(cuid())`

### Core (User model additions)
```
User            ... (original fields) +
                twoFactorEnabled Boolean @default(false)
                twoFactorSecret String?
                twoFactorBackupCodes String?   (JSON array of 10 bcrypt-hashed codes)
                lastLoginAt DateTime?
                lastLoginIp String?
                loginAttempts Int @default(0)
                lockedUntil DateTime?
                referralCode String? @unique   (RM-{INITIAL}{RANDOM5})
                referredBy String?
                loyaltyBalance Int @default(0)
                → addresses Address[]
                → paymentMethods SavedPaymentMethod[]
                → sessions LoginSession[]
                → loyaltyPoints LoyaltyPoint[]
```

### New Models
```
Address         id, userId, label(Home|Office|Farm|Other), fullName, phone,
                addressLine1, addressLine2?, city, state, postalCode?, country,
                latitude?, longitude?, isDefault, createdAt

SavedPaymentMethod  id, userId, type(cod|bank_transfer|easypaisa|jazzcash),
                    label, accountTitle?, accountNumber?(masked ****{last4}),
                    bankName?, isDefault, createdAt

LoginSession    id, userId, token(unique), userAgent?, ipAddress?, lastActive, createdAt

RecentlyViewed  id, userId?, sessionId?, productId, viewedAt  @@unique([userId, productId]) / @@unique([sessionId, productId])

StockAlert      id, productId, email(unique with productId), createdAt  @@unique([email, productId])

WholesaleInquiry  id, companyName?, contactName, email, phone?,
                  riceVariety?, quantityKg, frequency?, budgetPerKg?,
                  message?, status(pending|reviewing|quoted|accepted|rejected),
                  quotedPricePerKg?, adminNote?, createdAt

LoyaltyPoint    id, userId, points(+earn/-redeem), description, orderId?, createdAt
```

### Order model additions
```
Order + courierName String?, trackingNumber String?, estimatedDelivery DateTime?, loyaltyPointsEarned Int @default(0)
```

### Product model additions
```
Product + recentlyViewed RecentlyViewed[], stockAlerts StockAlert[]
```

### Existing Models (unchanged)
```
Customer, Supplier, PaddyStock, RiceStock, MillBatch, OrderItem, Purchase, Expense,
Agent, AgentRun, AgentAlert, Product, StoreSettings, Discount, Favorite, Review,
Newsletter, BlogPost, Career, CareerApplication, WhatsAppLog, ContactMessage
```

---

## Critical Business Logic

### Stock Decrements — always `$transaction`
```
Order creation    → decrements RiceStock.quantityKg for each linked OrderItem
Mill batch create → decrements PaddyStock.quantityKg immediately
Mill complete     → creates new RiceStock entry with output quantity
Supplier purchase → creates Purchase + PaddyStock simultaneously
Guest checkout    → decrements RiceStock + creates Customer if new email
```
**Never modify stock outside a `$transaction`.**

### Loyalty Points
- Earned: 1 point per PKR 100 spent on order
- Redeemed: 100 points = PKR 10 discount
- Tiers: Bronze (0–999) / Silver (1,000–4,999) / Gold (5,000+)
- Exported: `awardPoints(userId, points, description, orderId?)` from `loyaltyRoutes.js`

### Payment Status
```
paidAmount = 0                → unpaid
0 < paidAmount < totalAmount  → partial
paidAmount >= totalAmount     → paid
```

### Account Lockout
```
5 failed login attempts → lockedUntil = now + 15 minutes → HTTP 423
loginAttempts reset to 0 on successful login
```

### Password Reset Flow
```
POST /api/auth/forgot-password { email }
→ sha256(randomBytes(32)) stored as passwordResetToken (expires 1h)
→ raw token sent in email link: /reset-password?token=<rawToken>

POST /api/auth/reset-password { token, password }
→ sha256(token) compared to stored hash
→ password updated, token cleared
```

### Checkout Create Account
```
POST /api/shop/checkout { ...formFields, createAccount: true, password: "..." }
→ If email not existing + createAccount=true + password provided:
   Creates User with hashed password (not phone-based temp)
   Generates referralCode RM-{INITIAL}{RANDOM5}
   Sends sendWelcomeEmail
   Returns { order, token, user } for auto-login
→ Checkout.tsx calls loginDirect(token, user) on success
```

### Cart
- `localStorage` via `CartContext`, 5kg increments, cleared after successful checkout

### Auto-Created Customer Accounts (guest checkout)
- Phone provided, no email → creates `User` with fake email `{digits}@shop.ricemill.pk`
- Email provided → finds/creates User + Customer
- Temporary password: last 6 digits of phone

### SKU Auto-Generation (ecommerceRoutes.js)
```
Format:  RM-{VARIETY_CODE}-{GRADE}-{LAST4_TIMESTAMP}
Codes:   BSM=Basmati  SK=SuperKernel  IR6=IRRI-6  IR9=IRRI-9  PK3=PK-386  OTH=Other
Example: RM-BSM-A-4821
```

### Review Status Flow
```
Customer submits → status: "pending"
Admin approves   → status: "approved" → email sent to customer
Admin rejects    → status: "rejected" + adminNote
verifiedPurchase → auto-set true if customer has a delivered order with this product
```

### WhatsApp Notifications (`lib/whatsapp.js`)
All return `{ phone, message, url }`. Logged to `WhatsAppLog`. Respect `StoreSettings.notify*` flags.

### Email Triggers (`lib/mailer.js`)
Silent fail if `SMTP_USER` / `SMTP_PASS` not set. All fire-and-forget (`catch(() => {})`).
SMTP: Hostinger `smtp.hostinger.com:465` SSL. From: `ricemill@sameergul.com`.

15 email functions (all use inline CSS — email clients require it):
1. `sendWelcomeEmail(to, name, referralCode?)` — register + checkout account creation
2. `sendOrderConfirmation(to, order, items)` — checkout
3. `sendOrderStatusUpdate(to, order, newStatus)` — order status change
4. `sendPaymentConfirmation(to, order, amountPaid)` — payment recorded
5. `sendPasswordResetEmail(to, name, resetToken)` — forgot password
6. `sendPasswordChangedEmail(to, name)` — password changed
7. `sendReviewApprovedEmail(to, name, productName, rating)` — review approved
8. `sendReviewRejectedEmail(to, name, productName, adminNote)` — review rejected
9. `sendNewsletterWelcomeEmail(to)` — newsletter subscribe
10. `sendContactConfirmationEmail(to, name, subject)` — contact form
11. `sendLowStockAlertEmail(items[])` — internal, to ricemill@sameergul.com
12. `sendStockAvailableEmail(to, productName, productUrl)` — stock alert triggered
13. `sendWholesaleInquiryEmail(inquiry)` — internal, to ricemill@sameergul.com
14. `send2FAEnabledEmail(to, name)` — 2FA activated
15. `sendNewsletterBlast(recipients[], subject, html)` — bulk send, 100ms delay

Legacy aliases exported for backward compat: `sendRegistrationWelcome`, `sendNewsletterWelcome`, `sendPasswordChanged`, `sendReviewApproved`, `sendContactConfirmation`.

---

## Component Conventions

### Shared UI (`components/ui/`)
- `AccountTabs.tsx` exports: `AddressesTab`, `PaymentTab`, `RewardsTab`, `TwoFASection`
- `Modal` — animated, Escape key, click-outside, sizes: sm/md/lg/xl
- `Badge` exports: `OrderStatusBadge`, `PaymentBadge`, `GradeBadge`, `MillStatusBadge`, `RoleBadge`
- `StatCard` — trend arrows + alert pulse
- `PageHeader` exports: `ActionButton`, `FormField`, `inputCls`, `selectCls`
- `SearchBar` + `FilterSelect`
- `Pagination` — smart ellipsis
- `Skeleton` exports: `TableSkeleton`, `CardSkeleton`, `StatsSkeleton`

### HTTP Client
```ts
import api from '../api';   // always — never fetch, never new Axios
api.get('/shop/products')
api.post('/auth/login', { email, password })
```

### Form Input Classes
```ts
import { inputCls, selectCls } from '../components/ui/PageHeader';
```

### SEO
```tsx
import { Helmet } from 'react-helmet-async';
// HelmetProvider wraps entire App in App.tsx
<Helmet>
  <title>Page Title — Al-Noor Rice Mills</title>
  <meta name="description" content="..." />
</Helmet>
```

---

## Admin Sidebar Links (Layout.tsx)

```
Dashboard         /dashboard           (all)
Inventory         /dashboard/inventory  (staff+)
Mill Operations   /dashboard/mill       (staff+)
Orders            /dashboard/orders     (all)
Customers         /dashboard/customers  (staff+)
Suppliers         /dashboard/suppliers  (staff+)
Finance           /dashboard/finance    (admin)
Analytics         /dashboard/analytics  (admin)
E-Commerce        /dashboard/ecommerce  (admin)
AI Agents         /dashboard/agents     (admin)
Blog              /dashboard/blog       (admin)
Careers           /dashboard/careers    (admin)
Newsletter        /dashboard/newsletter (admin)
Reviews           /dashboard/reviews    (admin + staff)
Messages          /dashboard/messages   (admin + staff)
Wholesale         /dashboard/wholesale  (admin + staff)
Loyalty           /dashboard/loyalty    (admin)
Users             /dashboard/users      (admin)
─────────────────────────────────────────────
Visit Store       /  (opens new tab)    (all)
```

---

## Conventions & Rules

### Never Do
- Never explore the whole codebase — use this file
- Never modify `schema.prisma` without running `npx prisma db push` after
- Never modify stock outside `$transaction`
- Never touch `dev.db` directly
- Never upgrade Vite past **5.4**
- Never use inline styles — Tailwind only
- Never use `fetch` — always import `api` from `src/api.ts`
- Never create a new Axios instance

### Always Do
- Tailwind CSS utility classes
- lucide-react for icons
- react-hot-toast for toasts
- `api` from `src/api.ts`
- `$transaction` for multi-table writes
- `shop/Store.tsx` style for public pages
- `Inventory.tsx` style for admin/dashboard pages
- `.tsx/.ts` frontend | `.js` backend
- `String @id @default(cuid())` for all new Prisma models
- `{ success: true/false, data, message/error }` for new API endpoints
- `{ message: 'reason' }` + proper HTTP status for API errors
- Email + WhatsApp triggers: always **fire-and-forget** with `.catch(() => {})`
- SEO: use `<Helmet>` from `react-helmet-async` on public pages

### File Naming
- React components: `PascalCase.tsx`
- Route files: `camelCaseRoutes.js`

---

## Dev Commands

```bash
cd server && npm run dev          # nodemon, port 5000
cd client && npm run dev          # Vite, port 3000
cd server && npx prisma db push   # sync schema → dev.db
cd server && node prisma/seed.js  # seed 4 demo users
cd server && npx prisma studio    # GUI database explorer
```

---

### User model (additional fields added May 2026)
```
passwordResetToken   String?     — sha256 hash of raw token
passwordResetExpires DateTime?   — 1 hour TTL
```

---

## Supplier Portal

```
Route:    /supplier  (role=supplier ONLY — redirected from /dashboard)
Layout:   Own standalone layout — NO admin sidebar, NO Layout.tsx
File:     client/src/pages/supplier/SupplierPortal.tsx
Tabs:     Dashboard | My Deliveries | Payments | Profile | Messages
```

### Access Control
- `denySupplier` middleware in `server/src/middleware/auth.js`
- Applied to: `GET /api/orders`, `GET /api/inventory/paddy|rice|summary`
- Finance, analytics, customers, ecommerce, agents already block via `requireRole('admin','staff')`
- Dashboard.tsx: `if (user.role === 'supplier') return <Navigate to="/supplier" />`
- Layout.tsx: `if (user?.role === 'supplier') return null` (no admin sidebar)
- Suppliers ARE allowed: `/api/auth/*`, `/api/supplier-portal/*`, `/api/chat/*`

### Supplier Portal API — `/api/supplier-portal/*`
```
GET  /profile              Supplier's own profile + stats summary
PUT  /profile              Update phone, address, contactPerson, bankName, bankAccount, bankTitle
GET  /stats                totalKgSupplied, totalEarned, totalPaid, outstanding, thisMonthKg/Amount
GET  /purchases            Paginated list, ?status=all|paid|partial|unpaid
GET  /purchases/:id        Single purchase (403 if not owned)
GET  /varieties            Distinct varieties with totalKg/avgPrice
POST /delivery-notice      Submit upcoming delivery notice
GET  /delivery-notices     Own submitted notices list
GET  /admin/delivery-notices      admin/staff — list notices, ?supplierId
PATCH /admin/delivery-notices/:id admin/staff — { status, adminNote }
```

### New Models
```prisma
model DeliveryNotice {
  id supplierId variety estimatedKg estimatedDate qualityGrade(A/B/C)
  notes status(pending|confirmed|cancelled|completed) adminNote
}
// Supplier model additions: bankName bankAccount(masked ****last4) bankTitle
// deliveryNotices DeliveryNotice[] relation added
```

### Admin — Supplier Detail Modal (Suppliers.tsx)
Shows delivery notices section with Confirm/Cancel buttons.
Calls PATCH `/api/supplier-portal/admin/delivery-notices/:id`

---

## Chat System

### Architecture
- **Transport:** Socket.IO (server/src/socket.js)
- **Schema:** `ChatConversation` + `ChatMessage` models in schema.prisma
- **Server routes:** server/src/routes/chatRoutes.js (`/api/chat/*`)
- **Client context:** client/src/contexts/ChatContext.tsx (wraps entire app via ChatWrapper in App.tsx)
- **Admin unread badge:** `adminUnreadCount` + `clearAdminUnread` in ChatContext

### Customer / Public Entry Points
| Location | Trigger | Context |
|---|---|---|
| ShopLayout.tsx | Floating widget bottom-right | general |
| Dashboard.tsx My Orders | Chat button per order | order + orderNumber |
| ProductDetail.tsx | "Ask Us" card below Add to Cart | product + productName |
| OrderSuccess.tsx | Secondary link (if added) | order |
| TrackOrder.tsx | Conditional prompt (if added) | order |

### Admin Entry Points
| Location | Trigger |
|---|---|
| DashboardMessages.tsx | "Live Chats" tab — embeds DashboardChat |
| /dashboard/chat | Direct route (admin/staff only) |
| Layout.tsx sidebar | "Live Chat" link with red unread badge |

### Supplier Entry Point
`SupplierPortal.tsx` → Messages tab → sends via existing chatRoutes.js `/chat/start`

### Reusable Components
```
client/src/components/ChatWidget.tsx      Floating widget (ShopLayout only)
client/src/components/chat/ChatModal.tsx  Modal for order/product chat
client/src/pages/DashboardChat.tsx        Full admin 2-panel chat UI
```

### ChatModal Props
```tsx
interface ChatModalProps {
  conversationId?: string;   // existing conv
  contextType?: string;      // 'order'|'product'|'general'
  contextRef?: string;       // orderId or productId
  contextLabel?: string;     // "ORD-202505-001" or product name
  initialMessage?: string;   // pre-fills message input
  isOpen: boolean;
  onClose: () => void;
}
```
Polls GET /chat/:id/messages every 3s. Sends via ChatContext.sendMessage (socket).
Guest identify step shown if not logged in.

### Chat Message Color Convention
- Customer/Guest: left-aligned, gray bubble
- Admin/Staff: right-aligned, green bubble
- Supplier: left-aligned, blue bubble (in admin view)

### DashboardMessages.tsx
Two tabs:
- "Contact Forms" — existing ContactMessage list from /api/contact/admin
- "Live Chats" — embeds `<DashboardChat />` (DashboardChat no longer wraps itself in PageTransition)

---

---

## Image Upload

```
POST /api/upload                         [JWT admin/staff]
→ multipart/form-data, field: "image"
→ Saves to server/uploads/ with UUID filename
→ Returns: { success: true, url: "/uploads/uuid.jpg" }  ← RELATIVE path only

Static serving:
app.use('/uploads', express.static(..., { setHeaders: CORS * }))
Registered BEFORE all /api routes in index.js

Frontend helpers:
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
function toDisplayUrl(url): full URL for display, relative for storage
ImageUpload.tsx: useEffect syncs preview from value prop (for edit forms)
client/.env: VITE_API_URL=http://localhost:5000
```

## New Routes

| URL | Access |
|---|---|
| `/wholesale` | Public (ShopLayout) |

## New Models

```prisma
PricingTier        id, label, rangeLabel, discount?, description?, ctaText, ctaType, sortOrder, isActive
WholesalePageContent id="main", heroTitle, heroSubtitle, exportNote, testimonialText/Name/Role, warehouseImage, loadingImage
FAQ                id, question, answer, sortOrder, isActive
```

## New API Endpoints

```
GET    /api/ecommerce/pricing-tiers         [public]   active tiers by sortOrder
GET    /api/ecommerce/pricing-tiers/all     [admin/staff] all tiers
POST   /api/ecommerce/pricing-tiers         [admin]
PUT    /api/ecommerce/pricing-tiers/:id     [admin]
DELETE /api/ecommerce/pricing-tiers/:id     [admin]
PATCH  /api/ecommerce/pricing-tiers/reorder [admin]    { ids: [] }
GET    /api/ecommerce/wholesale-content     [public]
PUT    /api/ecommerce/wholesale-content     [admin]
GET    /api/faq                             [public]
GET    /api/faq/all                         [admin/staff]
POST   /api/faq                             [admin]
PUT    /api/faq/:id                         [admin]
DELETE /api/faq/:id                         [admin]
PATCH  /api/faq/reorder                     [admin]    { ids: [] }
```

## SKU Auto-Generation

Format: `RM-{VARIETY_CODE}-{GRADE}-{LAST4_TS}{2RAND}`
Codes: BSM=Basmati, SK=SuperKernel, IR6=IRRI-6, IR9=IRRI-9, PK3=PK-386, OTH=Other
Generated in ecommerceRoutes.js `generateSKU(variety, grade)` if not provided.

## Product Form (Ecommerce.tsx)

3-tab modal: Basic Info | Specifications | Nutrition
Spec fields: weight, packaging, origin, processingType, moistureContent, grainLength,
             cookingTime, aroma, brokenGrain, certifications, shelfLife, storageInstructions
Nutrition: dynamic row editor → stored as JSON in nutritionInfo field

## Ecommerce.tsx Tabs (now 7)

1. Overview  2. Products  3. Discounts  4. Email  5. Settings  6. Pricing Tiers  7. FAQs

## Store.tsx Changes

- Removed: recently viewed section (backend routes kept)
- FAQ section: fetched from /api/faq (admin-configurable)
- Wholesale tiers: fetched from /api/ecommerce/pricing-tiers (admin-configurable)
- All product images: toDisplayUrl() applied so /uploads/ paths display correctly

## WholesalePage.tsx (/wholesale)

Public page under ShopLayout:
- Hero with benefits (direct pricing, export docs, account manager)
- Pricing tiers table (from API)
- Wholesale inquiry form (tier selector + POST /api/wholesale/inquiry)
- FAQ accordion (from API)
- WhatsApp CTA footer

*Last updated: May 2026 · Al-Noor Rice Mills · Batkhela, Malakand, KPK, Pakistan*
