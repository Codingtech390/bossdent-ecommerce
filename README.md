# DentalKart E-Commerce Clone

A high-performance, full-stack dental supply e-commerce application modeled on [DentalKart](https://www.dentalkart.com/), engineered with Next.js 14 App Router, TypeScript, Tailwind CSS, MongoDB with Mongoose, and Zod validation.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js (v18+ or v20+)
- MongoDB instance (Local mongod or MongoDB Atlas)

### Step 1: Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default configuration (`.env.local`):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/dentalkart_clone
JWT_SECRET=dentalkart_super_secret_jwt_key_9283748291
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_PROVIDER=demo
PAYMENT_KEY_ID=demo_key_dentalkart
PAYMENT_KEY_SECRET=demo_secret_dentalkart
SHIPMENT_PROVIDER=demo
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Seed Database
Seed verified brands, hierarchical categories, multi-variant products, promotional freebies, coupons, banners, and sample accounts:
```bash
npm run seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Default Test Credentials

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Verified Dentist** | `dr.sharma@dentalcare.com` | `Doctor@123` | DentalKart Plus Club member, 450 Dentacoins, orders, tracking, addresses |
| **SuperAdmin** | `admin@dentalkart.com` | `Admin@123` | Admin Portal (`/admin`), inventory management, order fulfillment, clinic leads |

---

## 3. Core Architecture & Feature Highlights

### Storefront Experience
- **Top Trust Bar:** 100% genuine guaranteed badge, 19,000+ PIN code delivery coverage, toll-free doctor support hotline.
- **Location Selector (Pincode):** Live PIN code lookup with delivery timelines and COD eligibility stored persistently.
- **Search Autocomplete:** Debounced real-time search across titles, brands, SKUs, and specifications with keyboard navigation.
- **Category Mega Menu:** Multi-level dental specialties hierarchy (Restoratives, Endodontics, Handpieces, Orthodontics, Surgical, Impression, Turnkey Clinic Setup).
- **Reusable Product Card:** Dual image support, discount badges, option counters, Dentacoins reward indicators, verified stock badges, and quick-add actions.
- **Dynamic Product Detail Page (PDP):** Interactive variant selector (shades, lengths, connections) updating price, SKU, stock, and gallery images dynamically.
- **Cart & Slide-Over Drawer:** Real-time totals recalculation, free-shipping threshold progress bar, coupon redemption, and Dentacoins redemption with server-enforced ceilings.
- **Secure Checkout Journey:** Guest & authenticated checkout, clinic shipping address selection, online sandbox demo payment & Cash on Delivery (COD) options.
- **Dentalkart Plus Membership:** Exclusive club offering 2x Dentacoins on all supplies, lower free-shipping threshold (₹499 vs ₹999), and priority dispatch.
- **Freebies Zone:** Promotional dental instruments and materials claimable at ₹1 on eligible orders.
- **Turnkey New Clinic Setup:** Interactive consultation and equipment quotation system for dental chairs, compressors, and autoclaves.

### Admin Dashboard (`/admin`)
- **Real-Time KPIs:** Live database metrics for Total Revenue, Total Orders, Catalogued SKUs, and Consultation Leads.
- **Products & Inventory:** Live stock adjustments, price overrides, and SKU creation.
- **Orders & Logistics:** Order status transitions (`confirmed` → `processing` → `shipped` → `delivered`), courier tracking number assignment (`Delhivery Medical Express`), and customer timeline logs.
- **Clinic Setup Leads:** Review inbound doctor requests and update status from `new` to `contacted` or `quotation_sent`.
- **Server-Side Authorization:** Every mutation API endpoint enforces admin JWT verification.

---

## 4. Catalogue Import Pipeline

A resilient, deduplicated import pipeline capable of expanding the catalogue from authorized JSON or CSV datasets:
```bash
# Dry run validation mode (reports valid/invalid records without writing to DB)
npm run import-data -- scripts/data/catalogue-data.json --dry-run

# Live catalogue import
npm run import-data -- scripts/data/catalogue-data.json
```

---

## 5. Verification & Testing

Run the full end-to-end verification test suite:
```bash
npm run test:e2e
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```
