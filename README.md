# 🌾 Al-Noor Rice Mills — Management System & E-Commerce Platform

A full-stack, AI-powered business management platform and public e-commerce storefront for **Al-Noor Rice Mills**, Batkhela, Malakand, KPK, Pakistan. Covers everything from paddy procurement and milling to online retail with autonomous AI agents, WhatsApp notifications, and SMTP email.

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
11. [Admin Dashboard Pages](#admin-dashboard-pages)
12. [API Endpoints Reference](#api-endpoints-reference)
13. [Database Schema](#database-schema)
14. [Business Workflow](#business-workflow)
15. [AI Features](#ai-features)
16. [WhatsApp Notification System](#whatsapp-notification-system)
17. [Email System](#email-system)
18. [E-Commerce Features](#e-commerce-features)
19. [Review System](#review-system)
20. [Demo Login Credentials](#demo-login-credentials)
21. [Key Design Decisions](#key-design-decisions)

---

## Business Identity

| Field | Value |
|---|---|
| **Business Name** | Al-Noor Rice Mills |
| **Address** | Main GT Road, Near Batkhela Bus Stand, Batkhela, Malakand, KPK 23200, Pakistan |
| **Phone** | +92-946-123456 |
| **WhatsApp** | +92-300-1234567 |
| **Email** | info@alnoorice.pk |
| **Established** | 2010 |
| **Business Hours** | Mon–Sat, 8:00 AM – 6:00 PM PKT |

---

## Tech Stack

### Frontend (`/client`)
| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.6 | Type safety |
| **Vite** | **5.4** | Build tool (Node 22.11 compatible — do NOT upgrade) |
| Tailwind CSS | 3 | Styling (`darkMode: 'class'`) |
| React Router | v6 | Client-side routing |
| Axios | — | HTTP client (from `src/api.ts`) |
| Framer Motion | — | Animations |
| Recharts | — | All charts and graphs |
| react-i18next | — | English / Urdu bilingual |
| react-hot-toast | — | Toast notifications |
| lucide-react | 0.454 | Icon library |

### Backend (`/server`)
| Package | Purpose |
|---|---|
| Express | REST API server |
| Prisma 5.22 | ORM with SQLite |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| nodemailer | SMTP email |
| @anthropic-ai/sdk | Claude AI (agents, chat, insights) |
| express-rate-limit | Rate limiting for AI endpoints |

---

## Prerequisites & Installation

**Requirements:** Node.js 22.11.0 (exact — Vite 5.4 is locked to this version)

### Step 1 — Install backend dependencies
```bash
cd server
npm install
```

### Step 2 — Set up the database
```bash
cd server
npx prisma db push       # creates dev.db with all tables
node prisma/seed.js      # seeds 4 demo users
```

### Step 3 — Install frontend dependencies
```bash
cd client
npm install
```

### Step 4 — Configure environment variables
Edit `server/.env` — see [Environment Variables](#environment-variables) below.

---

## Running the Project

```bash
# Terminal 1 — Backend
cd server && npm run dev      # starts with nodemon on http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev      # starts Vite on http://localhost:3000
```

| URL | What it is |
|---|---|
| `http://localhost:3000` | Public storefront (Al-Noor Rice Mills shop) |
| `http://localhost:3000/login` | Staff / admin login |
| `http://localhost:3000/dashboard` | Management dashboard |
| `http://localhost:5000/api/health` | Backend health check |

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

# SMTP Email — optional; emails silently skip if not configured
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Al-Noor Rice Mills <info@alnoorice.pk>"
```

**Gmail setup:** Enable 2FA → Generate an App Password → use that as `SMTP_PASS`.

---

## System Architecture

```
Browser (Port 3000)
├── PUBLIC STOREFRONT  /           (no auth — any visitor)
│   Product grid, cart, checkout, order tracking, blog, careers...
│
└── ADMIN DASHBOARD    /dashboard  (JWT required)
    Mill ops, inventory, orders, finance, AI agents, e-commerce...

        │ Axios HTTP (api.ts)
        ▼

Express Server (Port 5000)
├── /api/shop/*         Public shop endpoints (no auth)
├── /api/auth/*         Login, register, change-password
├── /api/reviews/*      Public reviews + customer own + admin moderation
├── /api/contact        Contact form (public)
├── /api/newsletter/*   Subscribe / unsubscribe (public)
├── /api/blog/*         Published posts (public) + admin CRUD
├── /api/careers/*      Open positions (public) + admin CRUD
└── /api/*              All protected endpoints (JWT required)

        │ Prisma ORM
        ▼

SQLite (server/prisma/dev.db)
```

---

## User Roles & Permissions

| Role | Who | Access |
|---|---|---|
| **admin** | Business owner | Everything — finance, analytics, AI agents, e-commerce, users, blog, careers, reviews, messages |
| **staff** | Mill workers / managers | Inventory, mill, orders, customers, suppliers, reviews moderation, contact messages |
| **customer** | Buyers | Own orders + public storefront + `/account` (5-tab personal dashboard) |
| **supplier** | Paddy farmers | Managed by staff — no dedicated portal |

### Frontend Guards
- `ProtectedRoute` in `App.tsx` — redirects to `/login` if no JWT
- Role-based redirects inline in each page

---

## URL Structure

### Public Routes (no login needed)

| URL | Page | Description |
|---|---|---|
| `/` | Store | Product grid with advanced filters |
| `/products/:id` | ProductDetail | 4-tab product page (Description, Specs, Nutrition, Reviews) |
| `/checkout` | Checkout | Guest checkout with discount code |
| `/order-success/:orderNumber` | OrderSuccess | Confirmation + WhatsApp share |
| `/track` | TrackOrder | Order status timeline by order number |
| `/login` | Login | Email + password login |
| `/register` | RegisterPage | Create customer account |
| `/about` | AboutPage | Al-Noor story, team, process, varieties |
| `/contact` | ContactPage | Contact form + address + business hours |
| `/policy` | PolicyPage | Privacy, Terms, Refund, Shipping |
| `/careers` | CareersPage | Open positions with application form |
| `/blog` | BlogPage | Post listings + newsletter sidebar |
| `/blog/:slug` | BlogPostPage | Full post + newsletter CTA |

### Customer Protected Route

| URL | Page | Requirement |
|---|---|---|
| `/account` | AccountPage | Logged in as `customer` |

### Admin Dashboard Routes

| URL | Component | Roles |
|---|---|---|
| `/dashboard` | Dashboard | All |
| `/dashboard/inventory` | Inventory | Admin, Staff |
| `/dashboard/mill` | MillOperations | Admin, Staff |
| `/dashboard/orders` | Orders | All (customers see own only) |
| `/dashboard/customers` | Customers | Admin, Staff |
| `/dashboard/suppliers` | Suppliers | Admin, Staff |
| `/dashboard/finance` | Finance | Admin only |
| `/dashboard/analytics` | Analytics | Admin only |
| `/dashboard/ecommerce` | Ecommerce | Admin only |
| `/dashboard/agents` | Agents | Admin only |
| `/dashboard/blog` | DashboardBlog | Admin only |
| `/dashboard/careers` | DashboardCareers | Admin only |
| `/dashboard/newsletter` | DashboardNewsletter | Admin only |
| `/dashboard/reviews` | DashboardReviews | Admin + Staff |
| `/dashboard/messages` | DashboardMessages | Admin + Staff |
| `/dashboard/users` | Users | Admin only |

---

## Public Storefront Pages

### Store (`/`) — Homepage
- **Hero banner** with custom title/subtitle (editable in E-Commerce → Settings)
- **Trust badges** — Quality Guarantee, Fast Delivery, Premium Grade, COD
- **Advanced filter bar** — all filters sync to URL params (shareable links):
  - Text search, Grade (A/B/C), Variety dropdown (fetched live), Sort by
  - "More Filters" expander: Price range (min/max PKR), Min order, In Stock Only
  - Active filter chips with × to remove each
- **Product grid** — 12 per page with pagination
- **WhatsApp CTA** — shown if WhatsApp number is configured
- **Newsletter section** — email subscribe at bottom

### ProductDetail (`/products/:id`)
- Large product image with SKU badge, grade badge, out-of-stock overlay
- Price per kg, min/max order, live stock availability
- Quantity selector (5kg increments)
- **Add to Cart** (green) + **Add to Favorites** (heart toggle)
- **4-tab content area:**
  - **Description** — full text + storage instructions
  - **Specifications** — clean 2-column table: variety, grade, origin, processing type, grain length, moisture content, cooking time, aroma, broken grain %, packaging, shelf life, certifications, SKU
  - **Nutrition** — parsed from `nutritionInfo` JSON (nutrient / per 100g / unit)
  - **Reviews (N)** — rating breakdown bars (Amazon-style), approved reviews, Helpful + Report buttons, leave-a-review form (signed-in customers only)

### Checkout (`/checkout`)
- Contact info (name, phone, optional email)
- Delivery address + city
- Payment method: Cash on Delivery / Bank Transfer
- **Discount code** — shows type label ("10% off"), expiry, saves amount, shows minimum order requirement if not met
- Order summary with items, shipping (free above threshold), discount, total
- Auto-creates customer account on submit (email optional)

### OrderSuccess (`/order-success/:orderNumber`)
- Animated confirmation with order number (copy button)
- Order summary (items, total, address)
- **WhatsApp Confirm** button — pre-filled message with full order details
- Track Order + Continue Shopping buttons

### TrackOrder (`/track`)
- Enter order number to check status
- Status timeline: Placed → Confirmed → Processing → Shipped → **Delivered**
- Payment status (Unpaid / Partial / Paid)
- Full items list

---

## Customer Account Dashboard

**Route:** `/account` — logged-in customers only

**5 Tabs:**

| Tab | What it shows / does |
|---|---|
| **My Orders** | Filter bar (All / Pending / Confirmed / Processing / Shipped / Delivered). Each order: order number, status badge, payment badge, total. Expand to see all items. **Reorder** button — adds in-stock items back to cart. **Track** button |
| **Favorites** | Product cards (image, name, grade, price). **Add to Cart** button. **Remove** (trash icon) |
| **Reviews** | Own submitted reviews. Status badge: Pending Review / Published / Rejected. Admin rejection note shown. Delete button (pending only) |
| **Profile** | Edit name, phone, address, business name. Language toggle (English / اردو). Read-only email. Member since date + account type badge |
| **Security** | Change password — validates current password via `POST /api/auth/change-password`, sends security email |

---

## Admin Dashboard Pages

### Dashboard (`/dashboard`)
- Welcome banner (name, date, time-of-day greeting)
- Low stock alert banner if any item ≤ 500kg
- 4 stat cards: Paddy Stock (tonnes), Rice Stock (tonnes), Orders, Revenue
- Mill Operations widget (Pending / Active / Done counts + avg yield)
- Finance summary (Revenue, Expenses, Profit, Outstanding)
- Quick Actions panel (6 shortcut buttons)
- 6-month Area+Bar chart
- Recent orders table

### Inventory (`/dashboard/inventory`)
- Tabs: Paddy Stock | Rice Stock
- Search, grade filter, pagination (15/page), CSV export
- Low-stock row highlighting (orange ≤ 500kg)
- Add modal with variety, quantity, grade, price, supplier link, notes

### Mill Operations (`/dashboard/mill`)
- Stats: Pending / In Progress / Completed / Avg Yield %
- Search + status filter + pagination
- Batch lifecycle: Create → Start → Complete (auto-creates rice stock, yields color-coded)

### Orders (`/dashboard/orders`)
- Search, status filter, payment filter, CSV export, paginated
- Outstanding amount column (red if unpaid)
- **Print Invoice** — opens printable invoice in new tab
- View Order modal: items table, status update pills, payment recording
- Source badge distinguishes internal vs online orders

### Customers / Suppliers
- Search, pagination, outstanding balance column
- Detail modal: revenue summary, order/purchase history, credit limit editor (customers)

### Finance (`/dashboard/finance`)
- Date range filter (all stats update to period)
- 6-month area + bar chart + expense category donut chart
- Expense CRUD with category, search, pagination

### Analytics (`/dashboard/analytics`)
- KPI cards with growth % vs last month
- 14-day order trend + revenue chart
- Orders by status horizontal bar chart
- Top 6 customers with revenue bar
- Top varieties sold + mill yield trend vs 65% target

### E-Commerce (`/dashboard/ecommerce`)
**4 tabs:**
1. **Overview** — Online order count, revenue, top products, recent online orders
2. **Products** — Create/edit products with 5-field-group modal (Basic Info, Description, Specifications, Nutrition, SEO). Auto-SKU generation. Published/InStock toggle switches
3. **Discounts** — Promo code CRUD + **Generate Codes** (bulk: prefix + count, e.g. EID-K8M2P). Color coded: active/expired/used-up
4. **Settings** — Store name, WhatsApp number, phone, shipping fees, open/closed toggle, notification flags (4 WhatsApp toggles), test email button, WhatsApp log table

### AI Agents (`/dashboard/agents`)
- Create agents from 7 presets or custom
- Run Now → real agentic loop (up to 12 tool-use iterations)
- View Results — full markdown report + actions taken + tool call count
- Agent Alerts panel — alerts created by agents during runs

### Blog / Careers / Newsletter
- Blog: Create/edit/delete posts, publish toggle
- Careers: Post jobs, toggle open/closed, view + triage applications
- Newsletter: Subscriber list, active/inactive toggle, CSV export

### Reviews (`/dashboard/reviews`)
- Stats row: Pending / Approved / Rejected / Total
- Filter tabs (Pending / Approved / Rejected / All)
- Bulk approve selected pending reviews
- Approve → sends email to customer
- Reject → modal with admin note (shown to customer in their account)

### Messages (`/dashboard/messages`)
- Contact form submissions from website
- Unread count badge
- Mark as read on click
- Reply by email or WhatsApp directly from the modal

---

## API Endpoints Reference

### Auth
```
POST /api/auth/login              → { token, user }
POST /api/auth/register           creates User + Customer → welcome email
GET  /api/auth/me                 → current user
POST /api/auth/change-password    validates current pw → security email
```

### Shop (public)
```
GET  /api/shop/settings
GET  /api/shop/varieties           distinct variety list
GET  /api/shop/products            ?q=&grade=&variety=&minPrice=&maxPrice=
                                   &inStock=&minOrder=&sortBy=&page=&limit=
GET  /api/shop/products/:id
POST /api/shop/discount/validate
POST /api/shop/checkout
GET  /api/shop/track/:orderNumber
```

### Reviews
```
GET    /api/reviews/mine              own reviews (JWT customer)
DELETE /api/reviews/:id/mine          delete own pending review
GET    /api/reviews/:productId        approved only + avgRating + breakdown (public)
POST   /api/reviews/:productId        create review (JWT customer) → pending status
POST   /api/reviews/:reviewId/helpful increment helpfulCount
POST   /api/reviews/:reviewId/report  increment reportCount
GET    /api/reviews/admin/all         all reviews + stats (admin/staff)
PATCH  /api/reviews/admin/:id/approve → email to customer
PATCH  /api/reviews/admin/:id/reject  body: { adminNote }
DELETE /api/reviews/admin/:id
```

### Ecommerce Admin
```
GET/POST/PUT/DELETE /api/ecommerce/products
PATCH /api/ecommerce/products/:id/toggle     isPublished | inStock
GET/PUT /api/ecommerce/settings
GET/POST/PUT/DELETE /api/ecommerce/discounts
POST /api/ecommerce/discounts/generate       bulk code generation
GET  /api/ecommerce/stats
GET  /api/ecommerce/whatsapp-log             last 50 entries
POST /api/ecommerce/test-email               sends test to admin email
```

### Contact
```
POST  /api/contact                creates ContactMessage → confirmation email (public)
GET   /api/contact/admin          paginated + unreadCount (admin/staff)
PATCH /api/contact/admin/:id/read mark as read
```

---

## Database Schema

### All key models (simplified)

| Model | Key Fields |
|---|---|
| User | id, name, email, password, role, phone, address, preferredLang, isActive |
| Customer | id, userId, businessName, phone, creditLimit |
| Supplier | id, userId, businessName, phone |
| PaddyStock | id, variety, quantityKg, qualityGrade, supplierId, purchasePrice |
| RiceStock | id, variety, grade, quantityKg, pricePerKg |
| MillBatch | id, batchNumber, paddyStockId, inputQty, outputQty, yieldPercent, status |
| Order | id, orderNumber, customerId, status, totalAmount, paidAmount, paymentStatus, source, discountCode, discountAmount |
| OrderItem | id, orderId, riceStockId, variety, grade, quantityKg, pricePerKg, totalPrice |
| Product | id, name, variety, grade, sku, shortDescription, description, pricePerKg, minOrderKg, isPublished, inStock, + 15 spec/SEO fields |
| StoreSettings | id, storeName, whatsappNumber, shippingFee, freeShippingAbove, isOpen, notify* flags |
| Discount | id, code, type, value, minOrderAmt, usageLimit, usedCount, expiresAt |
| Review | id, userId, productId, rating, status, adminNote, verifiedPurchase, helpfulCount |
| WhatsAppLog | id, orderId, type, phone, message, status |
| ContactMessage | id, name, email, subject, message, isRead |
| Agent | id, name, type, instructions, autoActions |
| BlogPost | id, title, slug, content, isPublished |
| Career | id, title, department, location, type, description, isOpen |
| Newsletter | id, email, isActive |

---

## Business Workflow

### Complete Paddy-to-Sale Cycle

```
1. SUPPLIER BRINGS PADDY
   └─ Suppliers → select supplier → Record Purchase
      ├─ Creates: Purchase record + PaddyStock entry (transaction)
      └─ Optionally: partial payment tracking

2. MILL THE PADDY
   └─ Mill Operations → New Batch
      ├─ Select paddy stock, enter input quantity
      ├─ Paddy stock decremented immediately (transaction)
      ├─ Click Start → status: in_progress
      └─ Click Complete → enter output qty + grade + price
         └─ Rice stock entry created automatically (variety from paddy)

3. INTERNAL ORDER (wholesale/retail customer)
   └─ Orders → New Order
      ├─ Select customer, add items from rice stock
      ├─ Rice stock decremented (transaction with stock validation)
      ├─ Update status as order progresses
      ├─ Record payments
      └─ Print invoice anytime

4. ONLINE ORDER (customer visits website)
   └─ Customer browses / = storefront
      ├─ Filter by variety, grade, price range, availability
      ├─ Add to cart (localStorage, 5kg increments)
      ├─ Apply discount code at checkout
      ├─ Guest checkout (name, phone, city, address)
      ├─ Customer account auto-created (email → real account; phone-only → fake email)
      ├─ Rice stock decremented (transaction)
      ├─ WhatsApp URL generated (if configured)
      ├─ Confirmation email sent
      └─ Order appears in /dashboard/orders tagged as "online"
```

### Finance Tracking
```
Revenue = collected payments on orders (paidAmount sum)
Expenses = manual expense entries (electricity, labour, transport, etc.)
Purchase Costs = paddy supplier purchases
Net Profit = Revenue − Expenses − Purchase Costs
Outstanding = total billed − total collected (across all unpaid/partial orders)
```

---

## AI Features

### AI Business Assistant (floating button)
- Green floating button (bottom-right) on all dashboard pages
- Powered by **claude-sonnet-4-6**
- Every message injects live business context (stock, orders, finance, mill stats)
- Quick prompts: stock situation, best customers, reorder timing, profit summary
- Responds in the language you write in (English or Urdu)
- **Setup:** Add `ANTHROPIC_API_KEY` to `server/.env`

### AI Insights (notification bell)
- Bell icon → "Load AI insights" button
- Uses Claude Haiku (fast, low cost)
- Returns 4 structured insights: `info | warning | success | tip`

### AI Agents (`/dashboard/agents`)
Each agent runs a **real agentic loop** — not a single prompt. Claude calls tools, fetches data, reasons, takes actions, and produces a full report.

**7 Agent Types:**

| Agent | Reads | Can Do |
|---|---|---|
| 📦 Inventory Monitor | Paddy + rice stock, sales trends | Create critical stock alerts |
| 🛒 Order Processor | Pending orders, stock, customer history | Update order status (if auto-actions on), flag customers |
| 💰 Finance Analyst | All financial data | Create financial risk alerts |
| 🤝 Customer Relations | All customers + outstanding balances | Flag overdue customers |
| ⚙️ Mill Optimizer | All batches + paddy stock | Alert on idle batches, low yield |
| 📈 Demand Forecaster | 6 months sales trends, inventory | Alert on predicted stockouts |
| 🤖 Custom | Admin-defined | Depends on auto-actions setting |

**Auto-Actions** (enable per agent): `create_alert`, `update_order_status`, `flag_customer`

**Execution loop:** max 12 iterations, polls every 3s in frontend while running

---

## WhatsApp Notification System

File: `server/src/lib/whatsapp.js`

No paid API needed — uses `wa.me` URL format (opens WhatsApp web/app). Can swap to Twilio or 360dialog by replacing the `send` function.

**6 Message Types:**

| Trigger | Message contains |
|---|---|
| Order placed (checkout) | Order number, customer name, items list, totals, delivery address, track link |
| Status updated | Order number, new status, tracking link |
| Payment recorded | Amount received, outstanding balance |
| Low stock | Item name, current quantity, threshold |
| Review approved | Product name, star rating |
| Newsletter subscribe | Subscription confirmation |

**Settings:** Enable/disable each type individually via E-Commerce → Settings → WhatsApp Notifications toggles (stored in `StoreSettings.notify*` fields)

**Log:** Every notification attempt is saved to `WhatsAppLog`. View last 50 at E-Commerce → Settings → WhatsApp Log.

---

## Email System

File: `server/src/lib/mailer.js`

Branded HTML emails with green header, PKR-formatted amounts, footer with address.

**8 Email Types:**

| Trigger | Email sent to |
|---|---|
| `POST /api/auth/register` | New customer — welcome + account info |
| `POST /api/shop/checkout` | Customer — order confirmation with items table |
| `POST /api/newsletter/subscribe` | Subscriber — newsletter welcome |
| `POST /api/auth/change-password` | User — security alert |
| `PATCH /api/orders/:id/status` | Customer — status update |
| `PATCH /api/reviews/admin/:id/approve` | Customer — review is live |
| `POST /api/contact` | Contact form sender — message received confirmation |
| `POST /api/ecommerce/test-email` | Admin — SMTP configuration test |

**Setup:** Add SMTP credentials to `server/.env`. Gmail App Password recommended.

**Safe failure:** If SMTP is not configured, emails silently skip — no errors, no downtime.

---

## E-Commerce Features

### For Customers
- Browse products with image, grade badge, short description, live stock count
- **Advanced filters** (URL-synced, shareable): search, grade, variety, price range, availability, min order, sort order
- Active filter chips with X to remove
- Product detail with 4 tabs: Description, Specifications, Nutrition, Reviews
- Shopping cart (persistent via localStorage, 5kg increments)
- Guest checkout — no account required
- **Discount codes** — validates in real time, shows type label, expiry, and "you need PKR X more" if minimum not met
- Free shipping threshold
- WhatsApp confirmation after order
- Order tracking by order number (no login needed)
- Add to Favorites (heart button, requires login)
- Leave Reviews (requires login as customer)

### For Admin
- Create products with 5-tab modal (Basic Info / Description / Specifications / Nutrition / SEO)
- Auto-generated SKU (`RM-BSM-A-4821` format)
- Link products to rice stock entries (live stock tracking)
- Published / In Stock toggle switches
- Sort order for product grid
- Discount codes: manual or bulk generate (prefix + count, e.g. 50 × EID-XXXXX codes)
- Store settings with all WhatsApp notification toggles
- View online orders in Overview tab and main Orders page (tagged "Online")
- WhatsApp log of last 50 notification attempts

---

## Review System

**Flow:** Customer submits → `status: pending` → Admin reviews → Approve or Reject (with note)

**Verified Purchase:** Automatically set to `true` if the customer has a delivered order that included this product.

**Features:**
- Rating breakdown bars (1★–5★ counts)
- Helpful + Report buttons on each review
- Customer can see their review status in `/account → Reviews` tab
- Admin can bulk-approve pending reviews
- Reject with `adminNote` — customer sees the reason in their account

---

## Demo Login Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | admin@ricemill.pk | admin123 | Everything |
| **Staff** | staff@ricemill.pk | password123 | Operations (no finance/analytics/agents) |
| **Customer** | buyer@example.pk | password123 | Own orders + storefront |
| **Supplier** | farmer@example.pk | password123 | (managed by staff) |

---

## Key Design Decisions

### Why SQLite?
Zero-configuration local development. Prisma schema is provider-agnostic — swap to PostgreSQL for production by changing `provider = "postgresql"` and `DATABASE_URL`.

### Why Vite 5.4?
The development machine runs Node.js 22.11.0. Vite 8 requires Node.js 22.12+. Vite 5.4 is the highest stable version compatible with Node 22.11.

### Why are stock decrements in `$transaction`?
If the `Order.create` or `MillBatch.create` fails, the stock decrement is also rolled back. No partial writes — inventory is always consistent.

### Why auto-create customer accounts on checkout?
The `Order` model requires a `customerId`. For online orders, the system finds an existing user by email/phone or creates a new `User + Customer` pair. This keeps the schema clean, prevents nulls, and lets customers log in later to see their history. The temporary password is the last 6 digits of their phone.

### Why wa.me links instead of a WhatsApp API?
No paid subscription needed. The wa.me format opens WhatsApp on any device. When the business is ready to scale, the `send` implementation in `lib/whatsapp.js` can be swapped for Twilio or 360dialog without touching any callers.

### Why fire-and-forget for emails and WhatsApp?
Notifications are supplementary — they must never block the main HTTP response. All triggers use `.catch(() => {})` so a misconfigured SMTP or missing phone number never causes a 500 error on checkout or order creation.

### How does the AI agent loop work?
`server/src/agents/engine.js` runs a `while` loop. Each iteration calls Claude with `tool_use` enabled. Claude chooses which tools to call (get inventory, get orders, etc.), the server executes them, returns results, and Claude continues until it produces an `end_turn` response (max 12 iterations). All tool calls are logged with the run.

---

*Built for Al-Noor Rice Mills · Batkhela, Malakand, KPK, Pakistan · Est. 2010*
