# PRD: [जेनwin.] E-Commerce Platform
### Three-Application System — User Store | Admin Console | Employee Portal
**Version 1.0 | For Antigravity Generation**

---

## 0. How to Use This PRD

This is a **master build specification**, not a narrative doc. It is written to be fed into Antigravity in the **build order given in Section 10**. Each platform is a **separate codebase/repo** that talks to a **shared backend API + shared SQLite database**. Do not build them as one monolith with shared frontend code — only the backend and DB are shared.

Replace `[जेनwin.]`, `[PRIMARY_COLOR]`, `[LOGO]` placeholders with your actual values before generation, or tell Antigravity to use the defaults given in Section 6 (Design System).

---

## 1. Executive Summary

| | |
|---|---|
| **What** | A full e-commerce platform selling clothing with live graphic/print customization, split into 3 apps: Customer Store, Admin Console, Employee Ops Portal |
| **Who** | Solo/small-team operated store, India-first but currency-agnostic |
| **Constraint** | Must run entirely on **free-tier infrastructure** and survive traffic spikes without crashing or costing money |
| **Devices** | Mobile-first, must run smoothly on **low-end Android devices** (2-3GB RAM, budget SoCs) and desktop |
| **Tooling** | Generated via **Antigravity**, so every spec below is written as literal, unambiguous build instructions |

### 1.1 The Three Applications

```
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│   1. USER WEBSITE    │      │   2. ADMIN WEBSITE    │      │  3. EMPLOYEE WEBSITE │
│  (Public Storefront) │      │  (Backend-only, no    │      │  (Order fulfillment, │
│                       │      │   public storefront)  │      │   payments, delivery)│
│  React + Vite (PWA)  │      │  React + Vite         │      │  React + Vite        │
└──────────┬───────────┘      └───────────┬───────────┘      └───────────┬──────────┘
           │                              │                              │
           └──────────────┬───────────────┴──────────────┬───────────────┘
                           │                              │
                  ┌────────▼──────────────────────────────▼────────┐
                  │         SHARED BACKEND (Node.js + Express)      │
                  │   REST API · Auth (JWT) · WebSocket (orders)    │
                  │   Rate limiter · Caching layer · Job queue      │
                  └────────────────────┬─────────────────────────┘
                                       │
                              ┌────────▼─────────┐
                              │  SQLite Database  │
                              │  (WAL mode, one    │
                              │   file, no server) │
                              └────────────────────┘
```

**Why one shared backend, three frontends:** Admin and Employee apps must NEVER be reachable by customers — they are separate deployed origins (different subdomains, e.g. `store.yoursite.com`, `admin.yoursite.com`, `staff.yoursite.com`), each with its own login and role-gated JWT. The backend is the single source of truth and enforces role permissions on every route, so even if someone finds the admin URL, they cannot act without the correct role token.

---

## 2. Tech Stack (Free-Tier Optimized)

| Layer | Choice | Why |
|---|---|---|
| Frontend (all 3 apps) | React 18 + Vite | Fast builds, small bundles, Antigravity-friendly |
| Styling | Tailwind CSS + CSS variables for theming | No runtime cost, purges unused CSS, tiny prod bundle |
| State | Zustand (not Redux) | ~1KB, no boilerplate, easy for Antigravity to scaffold |
| Backend | Node.js + Express | Lightweight, huge free-tier hosting support |
| Database | SQLite (via `better-sqlite3`, WAL mode) | Zero server cost, file-based, fast reads — matches your existing pattern |
| Auth | JWT (access + refresh tokens), bcrypt for passwords | No external auth service cost |
| Image storage | Local filesystem + on-the-fly compression (`sharp`), OR free-tier Cloudinary (25GB free) | Avoid paid S3; Cloudinary free tier is generous for a small store |
| Realtime (order status, admin dashboard) | Socket.IO (fallback to polling on low-end devices) | Works over free-tier hosting |
| Hosting — Frontend (x3) | Vercel / Netlify free tier | Global CDN, free SSL, generous bandwidth |
| Hosting — Backend | Render.com free tier / Railway free tier / Fly.io free tier | Free Node hosting; use cron-ping to prevent cold-sleep (see §8.3) |
| Payments | Razorpay (India) test+live, or Stripe — both have no monthly fee, only per-transaction cut | No upfront cost |
| Caching | In-memory LRU cache (`lru-cache` npm) for product listing/search | Cuts DB reads under load, free |
| CDN/Images | `sharp` to auto-generate WebP + 3 responsive sizes on upload | Keeps payload small for low-end devices |
| Animation | CSS transforms/opacity only + Framer Motion with `will-change` and reduced-motion checks | GPU-cheap, 60fps on low-end phones |
| PWA | Vite PWA plugin | Installable app, offline shell, push notification ready |

**No paid APIs. No paid DB. No paid hosting required to launch.**

---

## 3. High-Traffic-on-Free-Tier Strategy

This is the hardest constraint, so it gets its own section. Free tiers fail under load via: cold starts, connection limits, CPU throttling, and DB write contention. Mitigations:

1. **SQLite WAL mode** — allows concurrent reads while writing; set `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;` on DB init.
2. **Read-through cache** — product catalog, category lists, and homepage banners are cached in-memory for 60–120 seconds; cache is invalidated on admin write. This means 95% of storefront traffic (browsing) never touches SQLite.
3. **Static asset offload** — all images/CSS/JS served from the frontend host's CDN (Vercel/Netlify), not from the Node backend. The backend only serves JSON.
4. **Rate limiting** — `express-rate-limit` on all public endpoints (100 req/min per IP default, stricter on auth/checkout endpoints) to blunt bot traffic and scraping.
5. **Pagination everywhere** — no endpoint ever returns more than 24 items unpaginated. Infinite scroll on frontend, `LIMIT/OFFSET` on backend.
6. **Debounced search** — search-as-you-type on frontend waits 300ms after last keystroke before hitting the API.
7. **Queue heavy work** — image processing, email/SMS notifications, and analytics aggregation run in an in-process job queue (`p-queue`) so they never block the request thread.
8. **Keep-warm ping** — free-tier backends sleep after inactivity (e.g., Render free tier). Use a free cron service (cron-job.org, GitHub Actions scheduled workflow) to `GET /health` every 10 minutes.
9. **Graceful degradation** — if the DB is under heavy write load (flash sale), reads still succeed from cache; only checkout writes queue with a "Processing your order…" state instead of failing.
10. **Horizontal ceiling awareness** — document in README that beyond ~3,000–5,000 daily active users, migrate SQLite → PostgreSQL (Supabase free tier is the natural next step, same relational shape).

---

## 4. Database Schema (SQLite)

```sql
-- USERS (customers, admin, employees share one table, differentiated by role)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer', -- customer | admin | employee
  employee_department TEXT,              -- fulfillment | delivery | support (employee only)
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ADDRESSES
CREATE TABLE addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  label TEXT, line1 TEXT, line2 TEXT, city TEXT, state TEXT, pincode TEXT,
  country TEXT DEFAULT 'India', is_default INTEGER DEFAULT 0
);

-- CATEGORIES
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, parent_id INTEGER, image_url TEXT
);

-- PRODUCTS
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT, category_id INTEGER REFERENCES categories(id),
  base_price REAL NOT NULL, discount_price REAL,
  is_customizable INTEGER DEFAULT 0,      -- allows graphic customization
  status TEXT DEFAULT 'active',           -- active | draft | archived
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- PRODUCT VARIANTS (size/color/stock)
CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id),
  size TEXT, color TEXT, sku TEXT UNIQUE,
  stock_qty INTEGER DEFAULT 0, price_override REAL
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id),
  url TEXT, url_webp TEXT, is_primary INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0
);

-- CUSTOMIZATIONS (user-designed graphics on clothing)
CREATE TABLE customizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  design_json TEXT,          -- canvas layer data: text, images, position, rotation, scale, color
  preview_url TEXT,          -- rendered PNG preview
  created_at TEXT DEFAULT (datetime('now'))
);

-- CARTS
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  variant_id INTEGER REFERENCES product_variants(id),
  customization_id INTEGER REFERENCES customizations(id),
  quantity INTEGER DEFAULT 1
);

-- WISHLIST
CREATE TABLE wishlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id), product_id INTEGER REFERENCES products(id)
);

-- ORDERS
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE,
  user_id INTEGER REFERENCES users(id),
  address_id INTEGER REFERENCES addresses(id),
  subtotal REAL, discount REAL DEFAULT 0, shipping_fee REAL DEFAULT 0, tax REAL DEFAULT 0, total REAL,
  status TEXT DEFAULT 'placed', -- placed | confirmed | packed | shipped | out_for_delivery | delivered | cancelled | returned
  payment_status TEXT DEFAULT 'pending', -- pending | paid | failed | refunded
  payment_method TEXT, payment_ref TEXT,
  assigned_employee_id INTEGER REFERENCES users(id),
  coupon_code TEXT,
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id),
  variant_id INTEGER REFERENCES product_variants(id),
  customization_id INTEGER REFERENCES customizations(id),
  quantity INTEGER, unit_price REAL
);

CREATE TABLE order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id), status TEXT, note TEXT,
  changed_by INTEGER REFERENCES users(id), changed_at TEXT DEFAULT (datetime('now'))
);

-- REVIEWS
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id), user_id INTEGER REFERENCES users(id),
  rating INTEGER, comment TEXT, image_url TEXT, created_at TEXT DEFAULT (datetime('now'))
);

-- COUPONS
CREATE TABLE coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE, type TEXT, -- percent | flat
  value REAL, min_order_value REAL, max_uses INTEGER, used_count INTEGER DEFAULT 0,
  expires_at TEXT, is_active INTEGER DEFAULT 1
);

-- ADS / BANNERS (admin-managed homepage promos)
CREATE TABLE ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, image_url TEXT, link_url TEXT, placement TEXT, -- homepage_hero | category_banner | popup
  starts_at TEXT, ends_at TEXT, is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id), title TEXT, body TEXT, is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- EMPLOYEE TASKS (assigned work items)
CREATE TABLE employee_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id), employee_id INTEGER REFERENCES users(id),
  task_type TEXT, -- pack | ship | deliver | payment_verify
  status TEXT DEFAULT 'pending', completed_at TEXT
);

-- ANALYTICS SNAPSHOTS (pre-aggregated, cheap to query for admin charts)
CREATE TABLE daily_sales_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE, orders_count INTEGER, revenue REAL, new_customers INTEGER
);

-- INDEXES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_variants_product ON product_variants(product_id);
```

---

## 5. Platform 1 — User Website (Customer Storefront)

### 5.1 Design Philosophy
Minimalistic UI. Lots of white/neutral space, one accent color, no visual clutter, no more than 2 fonts. Ads are present but tasteful — never pop-ups that block navigation on load; never more than one promotional banner in view at a time.

### 5.2 Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Home — hero banner (ad-managed), featured categories, bestsellers, new arrivals, testimonials |
| `/shop` | Product grid with filters (category, size, color, price range, customizable-only toggle) + sort |
| `/product/:slug` | Product detail — gallery, variant picker, size guide, reviews, "Customize This" CTA |
| `/customize/:productId` | Graphic customization studio (canvas editor) |
| `/cart` | Cart with quantity edit, coupon field, order summary |
| `/checkout` | Address select/add → shipping method → payment |
| `/order-success/:orderId` | Confirmation + order tracking link |
| `/account` | Profile, saved addresses, wishlist, order history |
| `/account/orders/:id` | Order detail + live status tracker + reorder button |
| `/wishlist` | Saved items |
| `/search` | Search results (debounced live search) |
| `/login`, `/register`, `/forgot-password` | Auth flows |
| `/about`, `/contact`, `/policy/*` | Static/trust pages |

### 5.3 Core Feature List

**Shopping**
- Product grid with lazy-loaded images (skeleton loaders, not spinners)
- Filter/sort with URL query sync (shareable filtered links)
- Infinite scroll (24 items/page) with "back to top" FAB
- Quick-view modal (peek at product without full page load)
- Recently viewed products (localStorage, no login required)
- Related/"you may also like" products (same category, rule-based — no ML needed)

**Graphic Customization Studio** (the standout feature)
- Canvas-based editor (use `fabric.js` — free, lightweight, mobile-touch-friendly)
- Upload your own image/graphic (auto-compressed client-side before upload)
- Add text with font/color/size/curve controls
- Drag, resize, rotate, layer-order (bring to front/send to back)
- Pre-loaded clipart library (a small free SVG icon set, categorized)
- Live garment preview (front/back toggle) with the design mapped onto a product mockup image
- Undo/redo stack
- "Save design" (stored as JSON in `customizations.design_json`, so it's re-editable, not just a flattened image)
- Price updates live if customization adds a surcharge
- Mobile: touch-optimized handles (min 44px tap targets), pinch-to-zoom on canvas

**Cart & Checkout**
- Persistent cart (server-synced if logged in, localStorage if guest, merges on login)
- Coupon code apply/remove with live total recalculation
- Guest checkout allowed
- Address autocomplete-lite (pincode → auto-fill city/state via free India Post pincode API)
- Multiple payment methods (Razorpay/Stripe: UPI, card, netbanking, COD toggle admin-controlled)
- Order summary sticky on scroll (desktop), collapsible drawer (mobile)

**Account**
- Order history with status badges and live tracker (stepper: Placed → Packed → Shipped → Out for Delivery → Delivered)
- Reorder button (re-adds items + saved customization to cart)
- Wishlist with "move to cart"
- Editable profile + multiple saved addresses
- Review submission (post-delivery only, with photo upload)

**Engagement / Retention**
- Ads: homepage hero carousel + one mid-scroll banner, both admin-managed with schedule (starts_at/ends_at)
- Newsletter signup (email capture, stored, exportable by admin — no paid ESP required, can integrate free-tier one later)
- Push notifications (PWA, opt-in) for order status + abandoned cart reminder (queued job, sent after 2hrs of inactivity with items in cart)
- Referral-ready schema (not required for v1, but `coupons` table supports it later)

**Trust & Conversion**
- Reviews with star rating + verified-purchase badge
- Size guide modal per product
- Stock urgency indicator ("Only 3 left") when `stock_qty < 5`
- Recently sold ticker (optional, subtle, not fake — pulled from real `order_items`)

### 5.4 Genuine (Non-Dark-Pattern) Feature Note
Per your ask for "all genuine features" — explicitly avoid: fake countdown timers, fake stock scarcity, pre-ticked upsells, hidden fees at checkout, forced account creation. Every urgency/social-proof element pulls from real data only.

---

## 6. Design System (Applies to All 3 Apps, Themed Per-App)

### 6.1 Palette (CSS variables — swap per app)
```css
:root {
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6B6B;
  --color-accent: #1F6F5C;      /* deep teal — swap to your brand color */
  --color-accent-hover: #175545;
  --color-border: #E8E6E3;
  --color-success: #2E7D32;
  --color-warning: #ED6C02;
  --color-error: #D32F2F;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-soft: 0 2px 12px rgba(0,0,0,0.06);
}
```
Admin and Employee apps reuse the same variable names but shift `--color-accent` to a distinct hue (e.g., navy for Admin, amber for Employee) purely so staff can tell apps apart in browser tabs/screenshots — the design language stays otherwise consistent.

### 6.2 Typography
- Headings: `Inter` or `Poppins` (variable font, single file, self-hosted — no Google Fonts runtime request needed if you want zero external calls)
- Body: `Inter`
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 40px, line-height 1.5 body / 1.2 headings

### 6.3 Animation Rules (Low-End Device Safe)
- **Only animate `transform` and `opacity`** — never `width`, `height`, `top/left`, `box-shadow` directly (forces layout/paint, kills frame rate on budget SoCs)
- Max animation duration 250ms for micro-interactions, 400ms for page transitions
- All animated elements get `will-change: transform` only while animating, removed after (prevents memory bloat)
- Respect `prefers-reduced-motion` — disable non-essential motion entirely for users who set it
- Use CSS transitions over JS animation libraries wherever possible; reserve Framer Motion for the customization studio and page transitions only
- Skeleton loaders (pulsing gray blocks), not spinners, for perceived performance
- Images: `loading="lazy"`, explicit `width`/`height` to prevent layout shift, served as WebP with JPEG fallback
- Test target: smooth on a 2GB RAM Android device — no more than ~15-20 simultaneously animated DOM nodes on screen at once

### 6.4 Mobile-First Breakpoints
```
Base styles: 320px–599px (mobile)
sm: 600px   (large phone / small tablet)
md: 768px   (tablet)
lg: 1024px  (small desktop)
xl: 1280px+ (desktop)
```
Design every screen mobile-first, then enhance upward — never the reverse.

---

## 7. Platform 2 — Admin Website (Backend Management, No Public Storefront)

Separate app, separate subdomain, login-gated at the router level (redirect to `/login` if no valid admin JWT — nothing renders behind auth, not even a flashed layout).

### 7.1 Pages / Routes

| Route | Purpose |
|---|---|
| `/login` | Admin auth (email + password, optional 2FA-ready field in schema) |
| `/dashboard` | KPI overview: today's revenue, orders, pending shipments, low stock alerts |
| `/products` | Product list (table), bulk actions, filters |
| `/products/new`, `/products/:id/edit` | Product form incl. variants, images, customization toggle |
| `/categories` | Category CRUD, drag-to-reorder |
| `/orders` | Order table with status filter, search by order#/customer |
| `/orders/:id` | Order detail, manual status override, assign to employee, refund action |
| `/ads` | Banner/ad manager — create, schedule, reorder, preview |
| `/coupons` | Coupon CRUD |
| `/employees` | Employee list, add/deactivate, assign department |
| `/customers` | Customer list, view order history per customer, deactivate account |
| `/reviews` | Moderate reviews (approve/hide) |
| `/analytics` | Sales graphs, top products, revenue by category, conversion funnel |
| `/settings` | Store info, shipping fee rules, tax rules, payment gateway keys (encrypted at rest) |

### 7.2 Core Feature List

**Dashboard**
- Revenue today/week/month (line chart)
- Orders by status (donut chart)
- Low stock alerts list (variants with `stock_qty < threshold`)
- Recent orders feed (live via WebSocket)

**Product & Catalog Management**
- Full CRUD on products, variants, categories, images (drag-drop upload, auto WebP conversion)
- Bulk CSV import/export for products (for large catalogs)
- Toggle `is_customizable` per product, set customization surcharge
- Draft/Active/Archived status workflow

**Order Management**
- Full order table: search, filter by status/date/payment method
- Manual status transitions with mandatory note (logged to `order_status_history`)
- Assign order to a specific employee (dropdown of active employees)
- Refund/cancel with reason capture
- Print packing slip / invoice (PDF generation)

**Ads & Marketing**
- Banner manager with image upload, link URL, placement selector, start/end date scheduling
- Coupon manager: percent/flat, min order value, usage cap, expiry
- Newsletter subscriber export (CSV)

**Payments & Financials**
- Payment status dashboard (paid/pending/failed/refunded counts)
- **Sales graphs**: daily/weekly/monthly revenue trend, revenue by category, average order value, top 10 products by revenue — all charts via `recharts`, fed by the `daily_sales_snapshot` table (pre-aggregated nightly via a scheduled job, so charts stay fast even with years of order history)
- Payout/settlement log (if using Razorpay/Stripe connected accounts later)

**Employee Management**
- Add/deactivate employee accounts, assign department (fulfillment/delivery/support)
- View employee task completion stats (orders packed/delivered per employee, useful for accountability)

**Customer Management**
- Customer list with lifetime value, order count, last order date
- View/impersonate-view (read-only) a customer's order history for support purposes
- Deactivate/ban account

**Reviews Moderation**
- Approve/hide reviews, flag for spam

**Settings**
- Store name/logo/contact info
- Shipping fee rules (flat, free-above-X, per-zone)
- Tax rate config
- Payment gateway key management (masked input, encrypted before DB storage)

### 7.3 Admin Role Permissions
Since it's "backend connects to user and employee," define two admin sub-roles for future-proofing even if you start with one super-admin:
- `admin` (full access)
- `admin_readonly` (analytics + orders view only — useful if you ever bring on a co-founder/investor who needs visibility without edit rights)

---

## 8. Platform 3 — Employee Website (Fulfillment & Delivery Ops)

Separate app, separate subdomain, login-gated. Employees see **only their assigned tasks** — never the full customer database or financial dashboards (enforced by backend role check, not just hidden UI).

### 8.1 Pages / Routes

| Route | Purpose |
|---|---|
| `/login` | Employee auth |
| `/dashboard` | Today's assigned tasks summary |
| `/tasks` | Task list (pack / ship / deliver / verify-payment), filterable by status |
| `/tasks/:id` | Task detail — order items, customization preview (so they know exactly what to print/pack), customer address, mark complete |
| `/orders/:id/pack` | Packing checklist flow (check off each item, attach packed photo optional) |
| `/orders/:id/deliver` | Delivery flow — mark out-for-delivery, capture delivery confirmation (OTP or photo), COD payment collection confirmation |
| `/scanner` | Barcode/QR scan view (order number QR on packing slip) to fast-pull an order — uses device camera via `react-qr-scanner`, no paid scanner SDK needed |
| `/history` | Completed tasks log |
| `/profile` | Own profile, shift info |

### 8.2 Core Feature List

**Task Queue**
- Auto-populated from admin-assigned orders (`employee_tasks` table)
- Sorted by priority: overdue first, then oldest first
- Status pipeline per task: Pending → In Progress → Completed
- Push notification when a new task is assigned (WebSocket + PWA push)

**Packing Flow**
- Shows exact order items including **customization preview images** (critical — employee needs to see the actual custom design to pack the right printed item)
- Checklist UI (tap each item as packed)
- Auto-generates/prints packing slip (PDF)
- On complete → order status auto-advances to "Packed", customer gets notified

**Delivery Flow**
- Mark "Out for Delivery" → "Delivered"
- Delivery confirmation via OTP (auto-generated, sent to customer, employee enters it) OR photo-proof upload — configurable per store settings
- COD orders: employee marks "Payment Collected" which flips `orders.payment_status` to `paid`
- Failed delivery flow: reason capture (customer unavailable/wrong address/refused) → auto-notifies admin

**Payment Verification** (for non-COD manual/edge cases)
- Task type for verifying bank transfer or gateway-flagged payments if store supports manual payment methods

**Barcode/QR Scanning**
- Each order gets a QR code (generated server-side with `qrcode` npm lib) printed on the packing slip
- Employee scans it to jump straight to that order's task screen — fast on the floor, no manual search

**Performance Tracking (self-view only)**
- Employee sees their own completed-task count/day — gamified light (streaks), not exposed to other employees

### 8.3 Free-Tier Note for Employee App
Since this app is used actively during work hours with real-time task pushes, ensure the WebSocket connection has a polling fallback (Socket.IO does this automatically) in case the free-tier host's WebSocket support is flaky — never let a dropped socket mean a missed task; always also poll `/tasks` every 30s as a safety net.

---

## 9. Shared Backend API Structure

```
/api/auth
  POST   /register              (customer only — admin/employee created by admin)
  POST   /login
  POST   /refresh-token
  POST   /logout

/api/products
  GET    /products               ?category&minPrice&maxPrice&size&color&customizable&page
  GET    /products/:slug
  POST   /products                [admin]
  PUT    /products/:id            [admin]
  DELETE /products/:id            [admin]

/api/categories        [GET public, POST/PUT/DELETE admin]

/api/customizations
  POST   /customizations          save a design
  GET    /customizations/:id

/api/cart               [GET/POST/PUT/DELETE, user-scoped]

/api/orders
  POST   /orders                  create order (checkout)
  GET    /orders                  [user: own orders | admin: all | employee: assigned only]
  GET    /orders/:id
  PATCH  /orders/:id/status       [admin, employee-scoped-to-assigned]

/api/payments
  POST   /payments/create-intent
  POST   /payments/webhook        (gateway callback, signature-verified)

/api/coupons             [GET validate public, CRUD admin]
/api/ads                 [GET public active ads, CRUD admin]
/api/reviews              [GET public, POST user, PATCH moderate admin]
/api/employees            [CRUD admin only]
/api/tasks                [employee: own tasks, admin: all/assign]
/api/analytics             [admin only — dashboard aggregates]
/api/health                (uptime ping target)
```

**Every route validates JWT role.** Example middleware pattern to give Antigravity:
```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
// usage: router.post('/products', requireRole('admin'), createProduct);
```

---

## 10. Step-by-Step Build Order (For Antigravity)

Build in this exact sequence — each phase produces something testable before moving on.

**Phase 0 — Foundation**
1. Init monorepo structure: `/backend`, `/frontend-user`, `/frontend-admin`, `/frontend-employee`
2. Backend: Express server skeleton, SQLite connection (WAL mode), run schema from Section 4
3. Backend: JWT auth (register/login/refresh) + `requireRole` middleware
4. Deploy backend skeleton to Render/Railway free tier, confirm `/api/health` responds

**Phase 1 — Admin Core (build admin before storefront so you can seed data through the UI, not raw SQL)**
5. Admin app: login page, dashboard shell, protected routing
6. Admin: Category CRUD → Product CRUD (with variants + image upload/compression)
7. Admin: Ads/banner manager
8. Admin: Coupon manager
9. Seed 15–20 real products through this UI

**Phase 2 — User Storefront**
10. User app: design system setup (Tailwind config, CSS variables from Section 6)
11. Home page (hero from ads API, category tiles, product grid)
12. Shop page with filters/sort/infinite scroll
13. Product detail page + reviews display
14. Cart (local + synced) → Checkout → Payment gateway integration → Order success
15. Account pages: profile, addresses, order history + tracking
16. **Customization studio** (fabric.js canvas) — build last among storefront features since it's the most complex; integrate into product detail page's "Customize" CTA and into cart

**Phase 3 — Order Fulfillment Loop**
17. Admin: Orders table + detail + status override + employee assignment
18. Employee app: login, dashboard, task queue
19. Employee: packing flow (with customization preview), delivery flow, QR scanner
20. Wire WebSocket events: new order → admin dashboard live update; task assigned → employee push; status change → customer notification

**Phase 4 — Analytics & Polish**
21. Nightly job: aggregate `daily_sales_snapshot`
22. Admin analytics page with `recharts` graphs
23. Reviews moderation
24. PWA setup (manifest, service worker, offline shell) on all 3 apps
25. Performance pass: Lighthouse audit on low-end device emulation (throttled CPU 4x, slow 4G) for all 3 apps — target 90+ performance score
26. Animation audit — verify no layout-thrashing properties are animated (Section 6.3)
27. Security pass: rate limiting live on all public routes, helmet.js headers, SQL injection check (parameterized queries only — `better-sqlite3` does this by default with `?` placeholders)

**Phase 5 — Launch Prep**
28. Set up free-tier keep-warm cron ping (Section 3.8)
29. Configure custom subdomains for all 3 apps + backend
30. Load-test with a free tool (k6 free tier or Artillery) simulating a moderate spike, verify cache + rate limiter hold

---

## 11. Success Metrics (What "Done" Looks Like)
- All 3 apps deployed on separate free-tier origins, fully functional end-to-end (browse → customize → buy → pack → deliver)
- Lighthouse mobile performance score ≥ 90 on all 3 apps
- Checkout completes in < 3 clicks after cart
- Admin can add a new product live in < 2 minutes
- Employee can complete a pack-and-ship flow in < 1 minute per order
- Zero paid infrastructure required to operate at low-to-moderate scale

---

## 12. Open Decisions (Fill In Before Generation)
- [ ] Brand name, logo, primary accent color
- [ ] Payment gateway: Razorpay vs Stripe (Razorpay recommended if India-only)
- [ ] Delivery confirmation method: OTP vs photo-proof (or both, store-configurable)
- [ ] Whether COD is enabled at launch
- [ ] Image hosting: local filesystem vs Cloudinary free tier (Cloudinary recommended for reliability across redeploys)
