# 🌾 Al-Noor Rice Mills — Management System & E-Commerce Platform

A full-stack, AI-powered business management platform and public e-commerce storefront for **Al-Noor Rice Mills**, Batkhela, Malakand, KPK, Pakistan. Covers everything from paddy procurement and milling to online retail, real-time chat, autonomous AI agents, WhatsApp notifications, and SMTP email.

---

## Table of Contents

1. [Business Identity](#business-identity)
2. [Tech Stack](#tech-stack)
3. [Prerequisites & Installation](#prerequisites--installation)
4. [Running the Project](#running-the-project)
5. [Environment Variables](#environment-variables)
6. [System Architecture](#system-architecture)
7. [User Roles & Permissions](#user-roles--permissions)
8. [URL Structure](#url-structure)
9. [Public Storefront Pages](#public-storefront-pages)
10. [Customer Account Dashboard](#customer-account-dashboard)
11. [Supplier Portal](#supplier-portal)
12. [Admin Dashboard Pages](#admin-dashboard-pages)
13. [Real-Time Chat System](#real-time-chat-system)
14. [Authentication & Security](#authentication--security)
15. [API Endpoints Reference](#api-endpoints-reference)
16. [Database Schema](#database-schema)
17. [Business Workflow](#business-workflow)
18. [AI Features](#ai-features)
19. [WhatsApp Notification System](#whatsapp-notification-system)
20. [Email System](#email-system)
21. [E-Commerce Features](#e-commerce-features)
22. [Loyalty & Referral System](#loyalty--referral-system)
23. [Wholesale System](#wholesale-system)
24. [Careers & Hiring Pipeline](#careers--hiring-pipeline)
25. [Review System](#review-system)
26. [Image Upload & Product Gallery](#image-upload--product-gallery)
27. [SEO & Sitemap](#seo--sitemap)
28. [Navigation UX](#navigation-ux)
29. [Demo Login Credentials](#demo-login-credentials)
30. [Key Design Decisions](#key-design-decisions)

---

## Business Identity

| Field | Value |
|---|---|
| **Business Name** | Al-Noor Rice Mills |
| **Address** | Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan |
| **Phone** | +92-946-123456 |
| **WhatsApp** | +92-300-1234567 |
| **Email** | ricemill@sameergul.com |
| **Established** | 2010 |
| **Business Hours** | Mon–Sat, 8:00 AM – 6:00 PM PKT |

---

## Tech Stack

### Frontend (`/client`)

| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.6 | Type safety |
| **Vite** | **5.4** | Build tool (**Node 22.11 locked — do NOT upgrade**) |
| Tailwind CSS | 3 | Utility styling (`darkMode: 'class'`) |
| React Router | v6 | Client-side routing with `useNavigationType` |
| Axios | — | HTTP client — always import from `src/api.ts` |
| Framer Motion | — | Page transitions, animations, spring physics |
| Recharts | — | All charts and graphs |
| react-i18next | — | English / Urdu bilingual (`en.json` + `ur.json`) |
| react-hot-toast | — | Toast notifications |
| lucide-react | 0.454 | Icon library |
| react-helmet-async | ^3 | Per-page SEO meta tags |
| Socket.IO client | — | Real-time chat |
| @lottiefiles/react-lottie-player | — | Lottie animation player |

### Backend (`/server`)

| Package | Purpose |
|---|---|
| Express | REST API server |
| Prisma 5.22 | ORM (SQLite in dev, swap to Postgres for prod) |
| jsonwebtoken | JWT access tokens (7d) + short-lived 2FA temp tokens (5min) |
| bcryptjs | Password hashing + backup code hashing |
| cookie-parser | httpOnly refresh token cookies |
| nodemailer | SMTP email (Hostinger SSL port 465) |
| @anthropic-ai/sdk | Claude AI — agents, floating assistant, insights |
| express-rate-limit | Rate limiting for `/api/ai/*` (20 req/min) |
| speakeasy | TOTP two-factor authentication |
| qrcode | QR code generation for 2FA setup |
| multer | File uploads — images (5MB) and documents/resumes (10MB) |
| stripe | Payment processing |
| socket.io | Real-time bidirectional chat |

---

## Prerequisites & Installation

**Node.js 22.11.0 required** (Vite 5.4 is locked to this exact version).

```bash
# 1. Backend
cd server
npm install
npx prisma db push        # creates dev.db with all tables
node prisma/seed.js       # seeds 4 demo users

# 2. Frontend
cd client
npm install
```

---

## Running the Project

```bash
# Terminal 1 — Backend (nodemon, port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (Vite, port 3000)
cd client && npm run dev
```

| URL | What it is |
|---|---|
| `http://localhost:3000` | Public storefront |
| `http://localhost:3000/dashboard` | Admin/staff/customer dashboard |
| `http://localhost:3000/supplier` | Supplier-only portal |
| `http://localhost:5000/api/health` | Backend health check |

**Useful Prisma commands:**
```bash
cd server
npx prisma db push        # sync schema → dev.db
npx prisma studio         # GUI database explorer
node prisma/seed.js       # re-seed demo users (after force reset)
```

---

## Environment Variables

File: `server/.env`

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=ricemill_super_secret_key_2024_pakistan
PORT=5000
NODE_ENV=development

# Claude AI — required for AI chat, agents, and insights
ANTHROPIC_API_KEY=sk-ant-api03-...

# SMTP — Hostinger SSL (emails silently skip if not configured)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ricemill@sameergul.com
SMTP_PASS=your_smtp_password
SMTP_FROM=Al-Noor Rice Mills <ricemill@sameergul.com>
SMTP_REPLY_TO=ricemill@sameergul.com

# Stripe payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# WhatsApp — set ENABLED=true + Twilio vars to send real messages
# WHATSAPP_ENABLED=false means mock mode (logs only, no sends)
WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## System Architecture

```
Browser (Port 3000)
├── PUBLIC STOREFRONT  /                (no auth)
│   Store, product detail, checkout, order tracking,
│   blog, careers, wholesale, about, contact, policies
│
├── CUSTOMER DASHBOARD /dashboard       (role: customer)
│   8-tab personal dashboard: orders, favourites, reviews,
│   addresses, payment methods, loyalty/rewards, profile, security
│
├── SUPPLIER PORTAL    /supplier        (role: supplier)
│   Own dashboard: deliveries, payments, profile, messages
│
└── ADMIN DASHBOARD    /dashboard       (role: admin/staff)
    Mill ops, inventory, orders, finance, AI agents,
    e-commerce, careers pipeline, live chat, analytics...

        │ Axios (api.ts) — relative /api, Vite proxy to :5000
        │ Socket.IO — real-time chat events
        ▼

Express Server (Port 5000)
├── /api/auth/*         Login, register, 2FA, sessions, password reset
├── /api/upload         Image upload (admin/staff)
├── /api/upload/document  Resume/CV upload (public — careers)
├── /api/shop/*         Public shop (no auth)
├── /api/reviews/*      Public reviews + customer + admin
├── /api/chat/*         Chat (authenticated + guest)
├── /api/supplier-portal/* Supplier-only portal API
├── /api/loyalty/*      Loyalty points (customer + admin)
├── /api/wholesale/*    Wholesale inquiry (public + admin)
├── /api/careers/*      Job listings (public) + hiring pipeline (admin)
├── /api/faq/*          FAQ (public) + admin CRUD
├── /api/ecommerce/*    Products, discounts, pricing tiers, settings
└── /api/*              All other protected endpoints (JWT required)

        │ Prisma ORM + $transaction for all multi-table writes
        ▼

SQLite (server/prisma/dev.db)
server/uploads/           ← all uploaded files (images + documents)
server/logs/              ← structured JSON logs (logger.js)
```

---

## User Roles & Permissions

| Role | Access |
|---|---|
| **admin** | Everything — finance, analytics, AI agents, e-commerce, users, blog, careers pipeline, newsletter, loyalty admin, wholesale management |
| **staff** | Inventory, mill, orders, customers, suppliers, reviews moderation, contact messages, wholesale inquiries, delivery notices |
| **customer** | Own orders + public storefront + 8-tab personal dashboard |
| **supplier** | Own dedicated portal (`/supplier`) — own deliveries, payments, profile, messages. Blocked from `/api/orders`, `/api/inventory/*` via `denySupplier` middleware |

### Access Control Details
- `ProtectedRoute` in `App.tsx` checks JWT + role before rendering any dashboard page
- `denySupplier` middleware in `server/src/middleware/auth.js` blocks supplier from admin data endpoints
- Suppliers navigating to `/dashboard` are redirected to `/supplier` at the route level (not inside Dashboard.tsx — avoids React hook violations)
- `mustChangePassword` flag on `User` model — set to `true` for auto-created staff accounts from accepted job applications

---

## URL Structure

### Public Routes (no login required)

| URL | Page |
|---|---|
| `/` | Store — product grid, filters, wholesale tiers, FAQ, testimonials |
| `/products/:id` | Product detail — gallery, 4 tabs, reviews, stock alert |
| `/compare?ids=...` | Side-by-side product comparison (up to 4) |
| `/checkout` | Checkout — guest or logged-in, saved address prefill |
| `/order-success/:orderNumber` | Order confirmation |
| `/track` | Track order by order number |
| `/login` | Login (email/password + 2FA step + lockout message) |
| `/register` | Create customer account |
| `/forgot-password` | Send password reset email |
| `/reset-password?token=...` | Set new password via reset link |
| `/about` | Al-Noor story, team, mill process |
| `/contact` | Contact form + map + business hours |
| `/careers` | Job listings + animated empty state + multi-step application form |
| `/wholesale` | Wholesale pricing tiers + inquiry form + FAQ |
| `/blog` | Blog post listings |
| `/blog/:slug` | Full blog post |
| `/policies` | Policy hub (4 cards) |
| `/policies/privacy` | Privacy policy |
| `/policies/terms` | Terms of service |
| `/policies/refund` | Refund policy |
| `/policies/shipping` | Shipping policy (dynamic fee from settings) |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Auto-generated robots.txt |
| `/*` (any unknown) | Custom 404 page — animated rice grain particle scene |

### Protected Routes

| URL | Roles |
|---|---|
| `/dashboard` | All (customer gets 8-tab personal dashboard inline) |
| `/dashboard/inventory` | Admin, Staff |
| `/dashboard/mill` | Admin, Staff |
| `/dashboard/orders` | All |
| `/dashboard/customers` | Admin, Staff |
| `/dashboard/suppliers` | Admin, Staff |
| `/dashboard/finance` | Admin |
| `/dashboard/analytics` | Admin |
| `/dashboard/ecommerce` | Admin |
| `/dashboard/agents` | Admin |
| `/dashboard/blog` | Admin |
| `/dashboard/careers` | Admin |
| `/dashboard/newsletter` | Admin |
| `/dashboard/reviews` | Admin, Staff |
| `/dashboard/messages` | Admin, Staff |
| `/dashboard/wholesale` | Admin, Staff |
| `/dashboard/loyalty` | Admin |
| `/dashboard/users` | Admin |
| `/dashboard/chat` | Admin, Staff |
| `/supplier` | Supplier only |

---

## Public Storefront Pages

### Store (`/`) — Heritage Mill Editorial Homepage

The store uses a Heritage Mill design aesthetic — CSS custom properties (`--paddy`, `--cream`, `--saffron`, `--ink`), Newsreader serif font, JetBrains Mono for labels.

**Sections (in order):**
1. **Hero** — editorial split layout, animated `RiceBag3D` component (pure CSS 3D with mouse tilt), `FallingGrains` particle animation, KPI counters (60+ farms, 15 years, 4 grades, certifications)
2. **Certification Strip** — PCSIR, ISO 22000, HALAL · IFANCA, HACCP, PSQCA, GLOBAL G.A.P scrolling badges
3. **Product Catalogue** (`id="products"`) — filter bar (variety, grade, price range, sort, in-stock toggle), product grid (12/page, pagination), `Reveal` scroll animations
4. **Built For** — dual photo editorial panel (real mill/warehouse photos), client type chips (Restaurants, Hotels, Retailers, Exporters, NGOs, Institutions)
5. **Editor's Pick Spotlight** — featured product full-bleed panel with purchase CTA
6. **Wholesale Pricing Tiers** — API-driven table (admin-configurable), dual photo cards, testimonial quote (live from reviews API)
7. **Mill Process** — 4-step editorial (Procurement → Sun-Drying → Resting → Milling)
8. **Testimonials** — live approved reviews from `/api/reviews/featured`
9. **Heritage Teaser** — brand story + process timeline
10. **FAQ** — accordion, admin-configurable via `/api/faq`
11. **Newsletter** — email subscribe

### ProductDetail (`/products/:id`)

- **Image Gallery** — main image with left/right arrows, fade transition, thumbnail strip, image counter badge. Supports up to 8 images per product
- Price per kg, min/max order, live stock (from linked RiceStock entry)
- Quantity selector (5 kg increments), Add to Cart, Add to Favourites (heart), Compare checkbox
- **Stock Alert** — email sign-up when product is back in stock (deduplicates by email+product)
- **4-tab content:**
  - Description + storage instructions
  - Specifications — 2-column table (variety, grade, origin, processing, grain length, moisture, cooking time, aroma, broken grain %, packaging, shelf life, certifications, SKU)
  - Nutrition — parsed from JSON (nutrient / per 100g / unit)
  - Reviews — rating breakdown bars, approved reviews, Helpful / Report buttons, leave-a-review form (signed-in customers)
- **Ask Us** card → opens real-time chat modal pre-loaded with product context
- **Related products** strip at bottom

### Checkout (`/checkout`)

- Contact info + delivery address + city
- Saved address prefill for logged-in customers (dropdown picker)
- Saved payment method prefill for logged-in customers
- Payment: Cash on Delivery / Bank Transfer / Easypaisa / JazzCash
- **Discount code** — live validation, shows type ("10% off"), expiry, "you need PKR X more" if minimum not met
- Loyalty points redemption (100 pts = PKR 10) for logged-in customers
- Free shipping threshold (admin-configurable)
- On success: auto-creates customer account if `createAccount: true` + password provided → calls `loginDirect()` so user is immediately logged in

### ComparePage (`/compare`)

- URL: `/compare?ids=id1,id2,id3,id4` (up to 4 products)
- Side-by-side table: all specification fields, price, grade, stock, certifications
- Highlighted differences

### Careers Page (`/careers`)

- Hero with company stats (15+ years, 50+ team, 2010, 5★)
- "Why Work With Us" perks grid (6 cards)
- Job listings — department/type filter, expandable cards showing requirements, responsibilities, nice-to-have, benefits
- **Animated empty state** — 5 SVG wheat stalks with real wind-sway physics (sine-wave, independent phase per stalk), floating grain particles, notice board illustration
- 2-step application form: Step 1 (personal info, salary expectation, notice period, LinkedIn, portfolio), Step 2 (resume/CV upload via `/api/upload/document`, cover letter)
- Success state with animated checkmark

### Wholesale Page (`/wholesale`)

- Hero with 3 benefits (direct pricing, export docs, account manager)
- Pricing tiers table (API-driven, admin-configurable in E-Commerce → Pricing Tiers)
- Wholesale inquiry form (company name, contact, variety, quantity, frequency, budget)
- FAQ accordion (admin-configurable)
- WhatsApp CTA footer

---

## Customer Account Dashboard

**Route:** `/dashboard` — 8 tabs for customers

| Tab | Features |
|---|---|
| **My Orders** | Filter by status. Expand to see items. Reorder button (adds in-stock items to cart). Track button. Chat button (opens chat modal pre-loaded with order context) |
| **Favourites** | Product cards with Add to Cart. Remove button. Heart icon count shown in navbar |
| **Reviews** | Own reviews with status badge (Pending / Published / Rejected). Rejection note shown. Delete button (pending only) |
| **Addresses** | Add / edit / delete delivery addresses. Set default. Location autocomplete via Nominatim proxy |
| **Payment Methods** | Saved payment methods (COD, Bank Transfer, Easypaisa, JazzCash). Set default |
| **Rewards** | Loyalty points balance, tier (Bronze / Silver / Gold), PKR value, point history, referral code + link, total referrals, points earned from referrals |
| **Profile** | Edit name, phone, address, business name. Language toggle EN/UR. Read-only email. Member since |
| **Security** | Change password. Two-factor authentication (TOTP setup with QR code, backup codes, disable). Active sessions list with revoke buttons |

---

## Supplier Portal

**Route:** `/supplier` — supplier role only. Completely separate from admin dashboard — no shared `Layout.tsx` sidebar.

**5 Tabs:**

| Tab | Features |
|---|---|
| **Dashboard** | Stats: total kg supplied, total earned, total paid, outstanding, this month's kg and amount |
| **My Deliveries** | List of purchases with payment status. Submit delivery notice (variety, estimated kg, date, quality grade, notes) |
| **Payments** | Paginated purchase history filterable by payment status. Outstanding balance |
| **Profile** | Edit phone, address, contact person, bank name (masked `****last4`), bank title |
| **Messages** | Real-time chat with admin/staff — same chat system used across the platform |

**Delivery Notices:** Suppliers submit upcoming delivery notices. Admin/staff confirm, cancel, or complete them via the Supplier detail modal in the Suppliers dashboard page.

---

## Admin Dashboard Pages

### Dashboard (`/dashboard` — admin/staff view)
- Welcome banner, low-stock alert banner
- 4 stat cards: Paddy Stock (tonnes), Rice Stock (tonnes), Orders, Revenue
- Mill Operations widget, Finance summary, Quick Actions
- 6-month area + bar chart, recent orders table

### Inventory, Mill Operations, Orders, Customers, Suppliers
*(unchanged from original — see feature descriptions below)*

### E-Commerce (`/dashboard/ecommerce`) — 7 Tabs

| Tab | What it does |
|---|---|
| **Overview** | Online revenue, order count, top products, recent online orders |
| **Products** | Full product CRUD. 3-tab modal: Basic Info + Specs + Nutrition. Multi-image upload (up to 8 photos, drag to reorder, set cover). Auto-SKU (`RM-BSM-A-4821`). Link to RiceStock |
| **Discounts** | Promo code CRUD. Bulk generate (prefix + count). Active/expired/used-up colour coding |
| **Email** | Send newsletter blast to all active subscribers. Subject + rich HTML body |
| **Settings** | Store name, WhatsApp number, phone, shipping fees, open/closed toggle, 4 WhatsApp notification toggles, test email button, WhatsApp log (last 50 entries) |
| **Pricing Tiers** | Admin-configurable wholesale tiers shown on Store homepage and `/wholesale`. Drag to reorder |
| **FAQs** | Admin-configurable FAQ shown on Store homepage and `/wholesale`. Drag to reorder |

### Careers (`/dashboard/careers`) — Hiring Pipeline

- **Job Postings tab** — create/edit jobs: title, department, location, type, experience level, salary range (show/hide toggle), description, responsibilities, requirements, nice-to-have, benefits, deadline, featured toggle
- **Hiring Pipeline tab** — Kanban board with 6 stages: Applied → Reviewing → Interview Scheduled → Offered → Accepted → Rejected
- Each application card shows name, position, applied date, interview date (if scheduled)
- Click card → Application modal with two sub-tabs:
  - **Candidate Profile** — contact details, LinkedIn, portfolio, expected salary, notice period, resume download, cover letter, interview details if scheduled
  - **Pipeline Actions** — context-sensitive actions:
    - Move to Reviewing
    - Schedule interview (date/time, mode, notes) → sends invitation email
    - Extend offer (salary amount, expiry date) → sends offer letter email
    - Accept + Onboard (when status = offered) → auto-creates staff `User` account with temp password → sends credentials email → sets `mustChangePassword: true`
    - Reject (with optional reason) → sends rejection email to candidate
- Filter pipeline by job posting

### Wholesale (`/dashboard/wholesale`)
- List of wholesale inquiries from `/wholesale` page
- New count badge
- Update status (new → reviewing → quoted → accepted → rejected)
- Set quoted price per kg and admin note

### Loyalty (`/dashboard/loyalty`)
- Paginated member list with tier (Bronze/Silver/Gold), balance, PKR value
- Manual award form: select user, enter points + description
- Tier stats summary

### Messages (`/dashboard/messages`) — 2 Tabs
1. **Contact Forms** — submissions from `/contact` page. Mark as read. Reply by email/WhatsApp
2. **Live Chats** — embeds full `DashboardChat` component (see Chat System below)

### Blog, Newsletter, Reviews, Users, Finance, Analytics, AI Agents
*(full feature descriptions in respective sections below)*

---

## Real-Time Chat System

**Transport:** Socket.IO (`server/src/socket.js`)

**Entry points by user type:**

| Location | Who | Context |
|---|---|---|
| Floating widget (bottom-right, all store pages) | Customers / guests | General enquiry |
| Product detail "Ask Us" card | Customers / guests | Pre-loaded with product name |
| My Orders → Chat button | Logged-in customers | Pre-loaded with order number |
| `/supplier` → Messages tab | Suppliers | General |
| `/dashboard/messages` → Live Chats tab | Admin / Staff | Admin 2-panel view |
| `/dashboard/chat` | Admin / Staff | Dedicated full-screen chat |

**Guest flow:** Guest types name → system creates conversation with `guestName` + `guestId` (random UUID stored in sessionStorage) → messages flow in real time.

**Admin 2-panel view (`DashboardChat`):**
- Left panel: conversation list with unread badge, last message, customer/guest name
- Right panel: full message thread with send box
- Red unread count badge in sidebar nav (`adminUnreadCount` from `ChatContext`)

**Message bubble colors:**
- Customer / Guest → left, gray bubble
- Admin / Staff → right, green bubble
- Supplier → left, blue bubble (in admin view)

**Socket events:** `join_conversation`, `send_message`, `new_message`, `typing_start`, `typing_stop`, `admin_room` (admins join this room to receive all incoming messages)

---

## Authentication & Security

### JWT Flow
- Login → `POST /api/auth/login` → `{ token, user }` (7-day access token) + httpOnly refresh cookie (7 days)
- Refresh → `POST /api/auth/refresh` → validates httpOnly cookie → returns new access token + rotates refresh token
- Logout → `POST /api/auth/logout` → revokes refresh token cookie
- Token stored in `localStorage` as `token`, sent as `Authorization: Bearer <token>` on every request
- Axios 401 interceptor: on expired token → calls `/auth/refresh` → retries original request (queues concurrent requests)

### Two-Factor Authentication (TOTP)
1. `POST /api/auth/2fa/setup` → returns QR code data URL + manual entry key
2. `POST /api/auth/2fa/verify-setup` `{ token }` → enables 2FA, returns 10 bcrypt-hashed backup codes
3. Login with 2FA: `POST /api/auth/login` → `{ requiresTwoFactor: true, tempToken }` (5-min token) → frontend shows 6-digit input → `POST /api/auth/2fa/login` `{ tempToken, token }` → real JWT
4. `POST /api/auth/2fa/disable` `{ password, code }` → disables

### Account Lockout
- 5 failed login attempts → `lockedUntil = now + 15 minutes` → HTTP 423 with `{ lockedUntil }`
- `loginAttempts` reset to 0 on successful login

### Password Reset
```
POST /api/auth/forgot-password { email }
→ sha256(randomBytes(32)) stored as passwordResetToken (expires 1 hour)
→ raw token emailed as link: /reset-password?token=<rawToken>

POST /api/auth/reset-password { token, password }
→ sha256(token) compared against stored hash
→ password updated, token cleared
```

### Session Management
- `LoginSession` model tracks every login: device, IP, last seen
- `GET /api/auth/sessions` → list active sessions
- `DELETE /api/auth/sessions/:id` → revoke one
- `DELETE /api/auth/sessions` → revoke all except current

### Referral Codes
Auto-generated on register: `RM-{INITIAL}{RANDOM5}` (e.g. `RM-A8K2P`)

### Structured Logging
`server/src/lib/logger.js` writes JSON log entries to `server/logs/LEVEL-YYYY-MM-DD.log`.

---

## API Endpoints Reference

### Auth
```
POST   /api/auth/login                 → { token, user } OR { requiresTwoFactor, tempToken }
POST   /api/auth/register              → { token, user } + welcome email + referral code
GET    /api/auth/me                    → current user + customer/supplier relations
POST   /api/auth/change-password       [JWT]
POST   /api/auth/forgot-password       [public] → sends reset email (always 200)
POST   /api/auth/reset-password        [public] { token, password }
POST   /api/auth/2fa/setup             [JWT] → { qrCode, manualEntryKey }
POST   /api/auth/2fa/verify-setup      [JWT] { token } → backup codes
POST   /api/auth/2fa/disable           [JWT] { password, code }
POST   /api/auth/2fa/login             [public] { tempToken, token } → { token, user }
POST   /api/auth/refresh               [cookie] → new access token (refresh token rotation)
POST   /api/auth/logout                [cookie] → revoke refresh token
GET    /api/auth/sessions              [JWT] → active sessions
DELETE /api/auth/sessions/:id          [JWT]
DELETE /api/auth/sessions              [JWT] → revoke all except current
```

### Upload
```
POST   /api/upload                     [JWT admin/staff] multipart image → { url: "/uploads/..." }
POST   /api/upload/document            [public] multipart PDF/Word → { url, originalName }
```

### Shop (public)
```
GET    /api/shop/settings
GET    /api/shop/varieties
GET    /api/shop/products              ?q=&grade=&variety=&minPrice=&maxPrice=&inStock=&minOrder=&sortBy=&page=&limit=
GET    /api/shop/products/:id          → product with parsed images[] array
POST   /api/shop/discount/validate     { code, orderAmount }
POST   /api/shop/checkout              { ...formFields, createAccount?, password? }
GET    /api/shop/track/:orderNumber
GET    /api/reviews/featured           paginated approved reviews with product + user
```

### Ecommerce Admin
```
GET/POST       /api/ecommerce/products
PUT/DELETE     /api/ecommerce/products/:id
PATCH          /api/ecommerce/products/:id/toggle        isPublished | inStock
GET/PUT        /api/ecommerce/settings
GET/POST/PUT/DELETE /api/ecommerce/discounts
POST           /api/ecommerce/discounts/generate         { prefix, count }
GET            /api/ecommerce/stats
GET            /api/ecommerce/whatsapp-log
POST           /api/ecommerce/test-email
GET            /api/ecommerce/pricing-tiers              [public] active tiers
GET            /api/ecommerce/pricing-tiers/all          [admin/staff]
POST/PUT/DELETE /api/ecommerce/pricing-tiers/:id         [admin]
PATCH          /api/ecommerce/pricing-tiers/reorder      [admin] { ids: [] }
GET            /api/ecommerce/wholesale-content          [public]
PUT            /api/ecommerce/wholesale-content          [admin]
```

### FAQ
```
GET    /api/faq                        [public] active FAQs
GET    /api/faq/all                    [admin/staff]
POST   /api/faq                        [admin]
PUT    /api/faq/:id                    [admin]
DELETE /api/faq/:id                    [admin]
PATCH  /api/faq/reorder               [admin] { ids: [] }
```

### Careers
```
GET    /api/careers                    [public] open jobs ?department=&type=&featured=
GET    /api/careers/departments        [public] distinct departments
GET    /api/careers/:id                [public] single job
POST   /api/careers/:id/apply         [public] submit application (with resumeUrl from /upload/document)
GET    /api/careers/admin/all         [admin/staff] all jobs + application counts
GET    /api/careers/admin/applications [admin/staff] all applications ?status=&careerId=&search=
POST   /api/careers/admin             [admin] create job
PUT    /api/careers/admin/:id         [admin] update job
DELETE /api/careers/admin/:id         [admin]
GET    /api/careers/:id/applications  [admin/staff] applications for a job
GET    /api/careers/applications/:id  [admin/staff] single application
PATCH  /api/careers/applications/:id/status     [admin/staff] { status, adminNote }
PATCH  /api/careers/applications/:id/interview  [admin/staff] { interviewDate, interviewMode, interviewNotes }
PATCH  /api/careers/applications/:id/offer      [admin] { offerAmount, offerExpiry }
POST   /api/careers/applications/:id/accept     [admin] → creates staff User account
PATCH  /api/careers/applications/:id/reject     [admin/staff] { rejectionReason }
```

### Loyalty
```
GET    /api/loyalty/balance            [JWT customer] → { balance, pkrValue, tier, history }
POST   /api/loyalty/redeem             [JWT customer] { points }
GET    /api/loyalty/referral           [JWT customer] → { myCode, referralUrl, totalReferrals, pointsEarned }
GET    /api/loyalty/members            [admin] paginated member list with tier stats
POST   /api/loyalty/award             [admin] { userId, points, description }
```

### Wholesale
```
POST   /api/wholesale/inquiry          [public] min 500kg validation
GET    /api/wholesale/admin            [admin/staff] list + newCount
PATCH  /api/wholesale/admin/:id        [admin/staff] { status, quotedPricePerKg, adminNote }
```

### Stock Alerts
```
POST   /api/stock-alerts               [public] { productId, email } — deduplicates
GET    /api/stock-alerts/admin         [admin/staff]
```

### Supplier Portal
```
GET    /api/supplier-portal/profile    [supplier]
PUT    /api/supplier-portal/profile    [supplier] { phone, address, contactPerson, bankName, bankAccount, bankTitle }
GET    /api/supplier-portal/stats      [supplier]
GET    /api/supplier-portal/purchases  [supplier] paginated ?status=
GET    /api/supplier-portal/purchases/:id [supplier]
GET    /api/supplier-portal/varieties  [supplier]
POST   /api/supplier-portal/delivery-notice  [supplier]
GET    /api/supplier-portal/delivery-notices [supplier]
GET    /api/supplier-portal/admin/delivery-notices  [admin/staff]
PATCH  /api/supplier-portal/admin/delivery-notices/:id [admin/staff] { status, adminNote }
```

### Chat
```
GET    /api/chat/conversations         [JWT] own conversations or all (admin)
POST   /api/chat/start                 [public/JWT] { contextType, contextRef, contextLabel, guestName }
GET    /api/chat/:id/messages          [public/JWT]
PATCH  /api/chat/:id/resolve           [admin/staff]
GET    /api/chat/admin/conversations   [admin/staff] all open conversations
```

### Addresses & Payment Methods
```
GET/POST       /api/addresses
PUT/DELETE     /api/addresses/:id
PATCH          /api/addresses/:id/default
GET/POST       /api/payment-methods
DELETE         /api/payment-methods/:id
PATCH          /api/payment-methods/:id/default
```

### Recently Viewed / Location / Other
```
POST   /api/products/:id/view          [public] X-Session-ID header or userId
GET    /api/products/recently-viewed   [public] last 10
GET    /api/location/suggest           ?q= (text) or ?lat=&lng= (reverse)
GET    /sitemap.xml                    auto-generated
GET    /robots.txt                     auto-generated
```

---

## Database Schema

### Core Models

| Model | Key Fields |
|---|---|
| **User** | id, name, email, password (hashed), role, phone, twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes, loginAttempts, lockedUntil, lastLoginAt, referralCode, referredBy, loyaltyBalance, mustChangePassword, passwordResetToken, passwordResetExpires |
| **RefreshToken** | id, userId, token, expiresAt, isRevoked, userAgent, ipAddress |
| **LoginSession** | id, userId, token, device, ip, location, isActive, expiresAt |
| **Customer** | id, userId, businessName, phone, creditLimit |
| **Supplier** | id, userId, businessName, phone, bankName, bankAccount (masked ****last4), bankTitle |
| **DeliveryNotice** | id, supplierId, variety, estimatedKg, estimatedDate, qualityGrade, status (pending/confirmed/cancelled/completed), adminNote |
| **PaddyStock** | id, variety, quantityKg, qualityGrade, supplierId, purchasePrice |
| **RiceStock** | id, variety, grade, quantityKg, pricePerKg |
| **MillBatch** | id, batchNumber, paddyStockId, inputQuantityKg, outputQuantityKg, yieldPercent, status (pending/in_progress/completed) |
| **Order** | id, orderNumber, customerId, status, totalAmount, paidAmount, paymentStatus, source, discountCode, discountAmount, courierName, trackingNumber, estimatedDelivery, loyaltyPointsEarned |
| **OrderItem** | id, orderId, riceStockId, variety, grade, quantityKg, pricePerKg, totalPrice |
| **Product** | id, name, variety, grade, sku, description, imageUrl, **images** (JSON array), pricePerKg, minOrderKg, isPublished, inStock, sortOrder, + 14 spec fields (weight, packaging, origin, processingType, moistureContent, grainLength, cookingTime, aroma, brokenGrain, certifications, shelfLife, storageInstructions, nutritionInfo), metaTitle, metaDescription |
| **StoreSettings** | id, storeName, whatsappNumber, shippingFee, freeShippingAbove, isOpen, notify* flags (4) |
| **Discount** | id, code, type (percentage/fixed), value, minOrderAmt, usageLimit, usedCount, expiresAt |
| **Review** | id, userId, productId, rating, status (pending/approved/rejected), adminNote, verifiedPurchase, helpfulCount |
| **Favorite** | id, userId, productId |
| **Address** | id, userId, label, fullName, phone, addressLine1, city, state, postalCode, country, latitude, longitude, isDefault |
| **SavedPaymentMethod** | id, userId, type, label, accountTitle, accountNumber (masked), bankName, isDefault |
| **LoyaltyPoint** | id, userId, points, type (order_earned/referral/redeemed/manual), description, orderId |
| **RecentlyViewed** | id, userId?, sessionId?, productId, viewedAt |
| **StockAlert** | id, productId, email, isSent |
| **WholesaleInquiry** | id, name, email, phone, quantityKg, status, quotedPricePerKg, adminNote |
| **PricingTier** | id, label, rangeLabel, discount, description, ctaText, ctaType, sortOrder, isActive |
| **WholesalePageContent** | id, heroTitle, heroSubtitle, testimonialText, warehouseImage, loadingImage |
| **FAQ** | id, question, answer, sortOrder, isActive |
| **Career** | id, title, department, location, type, experienceLevel, salaryMin, salaryMax, showSalary, description, responsibilities (JSON), requirements (JSON), niceToHave (JSON), benefits (JSON), deadline, isOpen, isFeatured, totalApplications |
| **CareerApplication** | id, careerId, name, email, phone, resumeUrl, resumeName, coverLetter, linkedInUrl, portfolioUrl, expectedSalary, noticePeriod, source, status (applied/reviewing/interview_scheduled/offered/accepted/rejected), interviewDate, interviewMode, interviewNotes, offerAmount, offerExpiry, rejectionReason, adminNote, reviewedBy, reviewedAt |
| **ChatConversation** | id, customerId?, guestName?, guestId?, status (open/resolved), subject, lastMessageAt, unreadAdmin, unreadUser, assignedTo |
| **ChatMessage** | id, conversationId, senderId?, senderName, senderRole, message, isRead |
| **WhatsAppLog** | id, orderId?, customerId?, type, phone, message, status (sent/failed/mock), error, externalId |
| **ContactMessage** | id, name, email, phone, subject, message, isRead |
| **Agent** | id, name, type, instructions, schedule, isActive, autoActions, lastRunAt |
| **AgentRun** | id, agentId, status, task, result (JSON), actions (JSON), toolCalls |
| **AgentAlert** | id, agentId, title, message, priority, category, isRead |
| **BlogPost** | id, title, slug, content, coverImage, isPublished, publishedAt |
| **Newsletter** | id, email, isActive |
| **Purchase** | id, supplierId, variety, quantityKg, pricePerKg, totalAmount, paymentStatus, paidAmount |
| **Expense** | id, category, amount, description, date |

---

## Business Workflow

### Paddy-to-Sale Cycle

```
1. SUPPLIER DELIVERS PADDY
   └─ Suppliers → Record Purchase (transaction: Purchase + PaddyStock)
   └─ Supplier submits DeliveryNotice ahead of time → admin confirms

2. MILL THE PADDY
   └─ Mill Operations → New Batch → select paddy stock
      ├─ PaddyStock decremented immediately (transaction)
      ├─ Start → status: in_progress
      └─ Complete → enter output qty + grade → RiceStock created

3. INTERNAL ORDER
   └─ Orders → New Order → select customer + items from RiceStock
      ├─ RiceStock decremented (transaction with stock validation)
      ├─ Status updates: pending → confirmed → processing → shipped → delivered
      ├─ Record payments → payment status auto-calculated
      └─ Print invoice from modal

4. ONLINE ORDER
   └─ Customer visits storefront
      ├─ Filters products, compares, adds to cart (localStorage, 5kg increments)
      ├─ Applies discount code at checkout
      ├─ Redeems loyalty points
      ├─ Guest checkout (name, phone, address) OR logged-in with saved address
      ├─ createAccount: true → auto-creates User + Customer + referralCode + welcome email
      ├─ RiceStock decremented (transaction)
      ├─ LoyaltyPoint awarded (1 pt per PKR 100 spent)
      ├─ WhatsApp URL generated (if enabled) + confirmation email sent
      └─ Order appears in /dashboard/orders tagged "online"
```

### Payment Status Logic
```
paidAmount = 0                → "unpaid"
0 < paidAmount < totalAmount  → "partial"
paidAmount >= totalAmount     → "paid"
```

### Loyalty Points
- **Earn:** 1 point per PKR 100 spent on each order
- **Redeem:** 100 points = PKR 10 discount at checkout
- **Tiers:** Bronze (0–999 pts) / Silver (1,000–4,999 pts) / Gold (5,000+ pts)
- **Referrals:** New user registers with your code → referrer earns bonus points
- `awardPoints(userId, points, description, orderId?)` exported from `loyaltyRoutes.js` for use anywhere in the codebase

---

## AI Features

### Floating AI Assistant
- Green floating button on all dashboard pages
- Powered by **claude-sonnet-4-6** via `@anthropic-ai/sdk`
- Every message injects live business context (stock levels, orders, finance, mill batches)
- Quick prompt buttons: stock situation, best customers, reorder timing, profit summary
- Responds in the language you write in (English or Urdu)

### AI Insights
- Notification bell → "Load AI insights"
- Uses Claude Haiku (fast, low cost)
- Returns 4 structured insights: `info | warning | success | tip`

### AI Agents (`/dashboard/agents`)
Real agentic loop — not a single prompt. Claude calls tools, fetches data, reasons, takes actions, and produces a full markdown report.

**7 Agent Types:**

| Agent | Reads | Can Do |
|---|---|---|
| 📦 Inventory Monitor | Paddy + rice stock, sales trends | Create critical stock alerts |
| 🛒 Order Processor | Pending orders, stock, customer history | Update order status (auto-actions), flag customers |
| 💰 Finance Analyst | All financial data | Create financial risk alerts |
| 🤝 Customer Relations | All customers + outstanding balances | Flag overdue customers |
| ⚙️ Mill Optimizer | All batches + paddy stock | Alert on idle batches, low yield |
| 📈 Demand Forecaster | 6 months sales + inventory | Alert on predicted stockouts |
| 🤖 Custom | Admin-defined | Depends on auto-actions setting |

**Auto-Actions** (per agent): `create_alert`, `update_order_status`, `flag_customer`
**Execution:** max 12 tool-call iterations, polls every 3s in frontend while running

---

## WhatsApp Notification System

File: `server/src/lib/whatsapp.js`

**Two modes:**
- `WHATSAPP_ENABLED=false` (default) — mock mode: logs to `WhatsAppLog` with `status: 'mock'`, prints to console, never sends
- `WHATSAPP_ENABLED=true` + Twilio credentials — sends real WhatsApp messages via Twilio API

All send functions are fire-and-forget (never throw). `WhatsAppLog` records every attempt with `error` + `externalId` (Twilio message SID).

**8 Message Types:**

| Function | Trigger |
|---|---|
| `sendOrderConfirmationWA` | Checkout success |
| `sendOrderStatusWA` | Order status change |
| `sendPaymentWA` | Payment recorded |
| `sendLowStockWA` | Stock drops below 500kg threshold |
| `sendReviewApprovedWA` | Review approved by admin |
| `sendWholesaleInquiryWA` | New wholesale inquiry submitted |
| `sendNewApplicationWA` | New job application received |
| `sendInterviewScheduledWA` | Interview scheduled for applicant |

**Settings:** Enable/disable each of the first 4 via E-Commerce → Settings notification toggles.

---

## Email System

File: `server/src/lib/mailer.js`

Branded HTML emails — inline CSS (email clients strip `<style>`), Al-Noor green header, PKR-formatted amounts, business footer.

**15 Email Functions:**

| Function | Trigger |
|---|---|
| `sendWelcomeEmail` | Register + checkout account creation |
| `sendOrderConfirmation` | Checkout |
| `sendOrderStatusUpdate` | Order status change |
| `sendPaymentConfirmation` | Payment recorded |
| `sendPasswordResetEmail` | Forgot password |
| `sendPasswordChangedEmail` | Password changed |
| `sendReviewApprovedEmail` | Review approved |
| `sendReviewRejectedEmail` | Review rejected (with admin note) |
| `sendNewsletterWelcomeEmail` | Newsletter subscribe |
| `sendContactConfirmationEmail` | Contact form submitted |
| `sendLowStockAlertEmail` | Internal alert to admin email |
| `sendStockAvailableEmail` | Stock alert triggered (product back in stock) |
| `sendWholesaleInquiryEmail` | Internal notification of new wholesale inquiry |
| `send2FAEnabledEmail` | 2FA activated |
| `sendNewsletterBlast` | Bulk send to all active subscribers (100ms delay between) |
| `sendApplicationReceivedEmail` | Job application received confirmation to candidate |
| `sendApplicationUnderReviewEmail` | Application moved to reviewing stage |
| `sendInterviewInvitationEmail` | Interview scheduled |
| `sendOfferLetterEmail` | Job offer extended |
| `sendApplicationAcceptedEmail` | Offer accepted — includes staff login credentials |
| `sendApplicationRejectedEmail` | Application rejected (with optional reason) |
| `sendNewApplicationNotificationEmail` | Internal admin notification of new application |

**Safe failure:** `SMTP_USER`/`SMTP_PASS` not set → emails silently skip. All triggers use `.catch(() => {})`.

---

## E-Commerce Features

### Product Gallery (Multi-Image)
- Admin can upload up to 8 images per product in the product modal
- Thumbnails show in a grid — drag to reorder, click ★ to set cover, × to remove
- First image = `imageUrl` (cover, shown on product cards and search results)
- All images stored as JSON array in `Product.images`
- Product detail page shows: main image with left/right arrows, animated fade transition, thumbnail strip, image counter

### SKU Auto-Generation
Format: `RM-{VARIETY_CODE}-{GRADE}-{LAST4_TS}{2RAND}`

| Variety | Code |
|---|---|
| Basmati | BSM |
| Super Kernel | SK |
| IRRI-6 | IR6 |
| IRRI-9 | IR9 |
| PK-386 | PK3 |
| Other | OTH |

Example: `RM-BSM-A-4821`

### Compare Feature
Users can select up to 4 products (checkboxes on product cards in grid) and view side-by-side at `/compare?ids=...`

---

## Loyalty & Referral System

- **Points:** 1 pt per PKR 100 spent. All earned/redeemed/manual entries in `LoyaltyPoint` model
- **Redemption:** 100 pts = PKR 10. Applied at checkout as discount
- **Tiers:** Bronze (0–999) / Silver (1,000–4,999) / Gold (5,000+)
- **Referral codes:** `RM-{INITIAL}{RANDOM5}` (e.g. `RM-A8K2P`), auto-generated on register
- **Admin:** Manual award via Loyalty dashboard (`POST /api/loyalty/award`)

---

## Wholesale System

- **Public page** (`/wholesale`): Pricing tiers (admin-configurable), inquiry form (min 500 kg validation), FAQ accordion
- **Pricing tiers** on Store homepage and `/wholesale` — managed in E-Commerce → Pricing Tiers tab. Drag to reorder. Types: link (scrolls to products), quote (opens `/wholesale`), contact (opens `/contact`)
- **Inquiry pipeline** in admin (`/dashboard/wholesale`): new → reviewing → quoted (with price per kg) → accepted / rejected

---

## Careers & Hiring Pipeline

### Application Status Workflow
```
applied → reviewing → interview_scheduled → offered → accepted | rejected
```

### Auto-Create Staff Account (on Accept)
When admin clicks "Accept & Onboard" (status = offered):
1. Creates `User` with role = `staff`, hashed temp password, `mustChangePassword: true`
2. Sends `sendApplicationAcceptedEmail` with login credentials
3. Returns `userId` in response

### Resume Upload
`POST /api/upload/document` — accepts PDF and Word docs up to 10MB. Public endpoint (no auth required — applicants aren't logged in). Returns `{ url, originalName }`.

---

## Review System

**Flow:** Customer submits → `status: pending` → Admin approves/rejects

**Verified Purchase:** Auto-set `verifiedPurchase: true` if customer has a delivered order containing this product.

**Features:**
- Rating breakdown bars (1★–5★)
- Helpful + Report buttons
- Customer sees status + rejection note in account Rewards tab
- Admin bulk-approve via checkbox in DashboardReviews
- Approve → email sent to customer
- Reject → modal with `adminNote` → rejection email sent

---

## Image Upload & Product Gallery

### Upload Endpoints
| Endpoint | Auth | Size | Formats | Returns |
|---|---|---|---|---|
| `POST /api/upload` | Admin/Staff JWT | 5 MB | JPG, PNG, WebP, GIF | `{ url: "/uploads/uuid.jpg" }` |
| `POST /api/upload/document` | Public | 10 MB | PDF, DOC, DOCX | `{ url, originalName }` |

Files saved to `server/uploads/` with UUID filenames. Served at `/uploads/*` with 7-day cache, CORS headers (`Access-Control-Allow-Origin: *`, `Cross-Origin-Resource-Policy: cross-origin`).

**Dev vs prod display:** `ImageUpload.tsx` and `MultiImageUpload.tsx` prepend `http://localhost:5000` in dev (since Vite runs on :3000) and use relative path in production (same origin). Vite proxy also forwards `/uploads/*` to `:5000` in dev.

---

## SEO & Sitemap

- `react-helmet-async` — per-page `<title>` and `<meta description>`. `HelmetProvider` wraps entire app in `App.tsx`
- `GET /sitemap.xml` — auto-generated: static pages + all published products + all blog posts + all open career postings
- `GET /robots.txt` — `Allow: /` + `Disallow: /dashboard /api`
- OG tags on ProductDetail for social sharing

---

## Navigation UX

### Scroll to Top
`ScrollToTop` component (inside `AppRoutes`):
- **PUSH navigation** (clicking a link) to a page without hash → instant `scrollTo(0, 0)`
- **PUSH navigation with hash** (e.g. `/#products`, `/?grade=A#products`) → smooth `scrollIntoView` on the target element (retries up to 10× every 80ms for post-transition mount)
- **POP navigation** (browser back/forward) → skipped entirely → browser restores scroll position naturally

All "Shop" nav links in the navbar dropdown and mobile menu use `/#products` (not `/`) so clicking "Shop" from any page scrolls directly to the product grid, bypassing the hero.

### Top Progress Bar
Amber (`#fbbf24`) fixed 3px bar at `z-9999`:
- Sprints to 70% in 60ms, cruises to 90% at 400ms, completes to 100% at 650ms, fades out at 900ms
- Resets and restarts cleanly on rapid navigation

---

## Demo Login Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | admin@ricemill.pk | admin123 | Everything |
| **Staff** | staff@ricemill.pk | password123 | Operations (no finance/analytics/agents) |
| **Customer** | buyer@example.pk | password123 | Own orders + storefront + 8-tab dashboard |
| **Supplier** | farmer@example.pk | password123 | Supplier portal only |

---

## Key Design Decisions

### Why SQLite?
Zero-configuration local development. The Prisma schema is provider-agnostic — swap `provider = "sqlite"` to `provider = "postgresql"` and update `DATABASE_URL` for production.

### Why Vite 5.4 (not 8)?
The development machine runs **Node.js 22.11.0**. Vite 6+ requires Node 22.12+. Vite 5.4 is the highest version compatible with Node 22.11.

### Why are stock decrements in `$transaction`?
If any part of `Order.create` or `MillBatch.create` fails, the stock decrement is rolled back atomically. Inventory is always consistent — no partial writes.

### Why auto-create customer accounts at checkout?
The `Order` model requires a `customerId`. Rather than allowing null (which would break analytics, loyalty points, and order history), the system always finds or creates a `User + Customer`. This lets guest customers log in later to see their full history. Temporary password = last 6 digits of phone.

### Why wa.me links + optional Twilio instead of WhatsApp Business API directly?
The wa.me approach requires zero paid subscription and works on any device. `WHATSAPP_ENABLED=false` (default) runs in mock mode so development never accidentally sends real messages. Setting `WHATSAPP_ENABLED=true` + Twilio credentials upgrades to programmatic sends without touching any callers.

### Why fire-and-forget for emails and WhatsApp?
Notifications are supplementary — they must never block the main HTTP response. A misconfigured SMTP server or missing phone number should never cause a 500 on checkout. All triggers use `.catch(() => {})`.

### Why is the Supplier redirect in App.tsx routing, not inside Dashboard.tsx?
Putting `if (user.role === 'supplier') return <Navigate>` inside `Dashboard.tsx` between hook calls violates React's Rules of Hooks (conditional returns before all hooks run). The route-level redirect in `App.tsx` ensures the `Dashboard` component never mounts at all for suppliers.

### How does the AI agent loop work?
`server/src/agents/engine.js` runs a `while` loop. Each iteration calls Claude with `tool_use` enabled. Claude picks a tool (get inventory, get orders, get finances, etc.), the server executes it, returns the result, and Claude continues until it produces an `end_turn` response or hits the 12-iteration limit. All tool calls are counted and stored with the `AgentRun` record.

### Why refresh tokens alongside 7-day access tokens?
The refresh token (httpOnly cookie, 7 days) handles silent re-authentication after access token expiry. The Axios 401 interceptor automatically calls `/auth/refresh`, rotates the token, and retries the original request — users are never unexpectedly logged out. The `RefreshToken` model in the database enables server-side revocation (logout from all devices).

### Why `mustChangePassword` on auto-created staff accounts?
Staff accounts created when a job application is accepted use a randomly generated temp password. The `mustChangePassword` flag signals the frontend to prompt a password change on first login, ensuring no staff member permanently uses a system-generated credential.

---

*Built for Al-Noor Rice Mills · Batkhela, Malakand, KPK, Pakistan · Est. 2010*
