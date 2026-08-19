# ZAZA Perfumes — Full-Stack E-Commerce

<p align="center">
  <img src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80" alt="ZAZA Perfumes" width="400" style="border-radius: 4px"/>
</p>

**ZAZA Perfumes** is a luxury single-brand perfume e-commerce platform built with the MERN stack. It features a complete customer storefront, Stripe payments, JWT authentication, Google OAuth, Cloudinary image storage, a full admin dashboard, and Three.js-powered 3D animations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router v6, Zustand, Tailwind CSS 3 |
| Animations | Framer Motion, GSAP + ScrollTrigger, Three.js (@react-three/fiber + drei) |
| Backend | Node.js + Express, REST API, MVC structure |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens), Google OAuth, bcrypt |
| Payments | Stripe Checkout Sessions + Webhook |
| Images | Cloudinary + multer |
| Email | Nodemailer |
| Analytics | Recharts |

---

## Project Structure

```
zazzperfumes/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── animations/     # Three.js HeroBottle
│       ├── components/     # layout/, product/, ui/
│       ├── lib/            # axios API client
│       ├── pages/          # All pages + admin/
│       ├── store/          # Zustand stores
│       └── router.jsx
└── server/                 # Express backend
    ├── config/             # DB + Cloudinary
    ├── controllers/        # auth, products, orders, reviews, coupons, payments
    ├── middleware/         # auth, rateLimiter, validate, errorHandler
    ├── models/             # User, Product, Order, Review, Coupon
    ├── routes/             # REST API routes
    ├── scripts/            # seed.js
    ├── utils/              # jwt, email
    └── index.js
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

---

## Environment Variables

### Server (`server/.env`)

```env
# App
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/zaza-perfumes
# or: mongodb+srv://<user>:<pass>@cluster.mongodb.net/zaza-perfumes

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Client
CLIENT_URL=http://localhost:5173

# Admin seed credentials
ADMIN_EMAIL=admin@zazaperfumes.com
ADMIN_PASSWORD=Admin@1234
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Setup & Running

### 1. Install All Dependencies

```bash
# From project root
npm run install:all
```

### 2. Configure Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Client
# Edit client/.env with your credentials
```

### 3. Seed the Database

```bash
npm run seed
# Seeds 18 luxury perfumes, admin user, test customer, 3 coupons
```

**Seed credentials:**
- Admin: `admin@zazaperfumes.com` / `Admin@1234`
- Customer: `customer@test.com` / `Test@1234`
- Coupons: `WELCOME20` (20% off), `ZAZA500` (₹500 off), `LUXURY10` (10% off)

### 4. Start Development Servers

```bash
npm run dev
# Starts both server (port 5000) and client (port 5173) concurrently
```

Or separately:
```bash
npm run server   # Express on :5000
npm run client   # Vite on :5173
```

---

## Stripe Local Webhook Testing

The Stripe webhook endpoint (`/api/payments/webhook`) requires a Stripe CLI for local testing:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
# Copy the whsec_... secret into STRIPE_WEBHOOK_SECRET in server/.env
```

**Test cards:**
- `4242 4242 4242 4242` — Always succeeds
- `4000 0000 0000 9995` — Insufficient funds
- Expiry: any future date, CVC: any 3 digits

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/google` | Public | Google OAuth |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| GET | `/api/products` | Public | List products (filter/sort/paginate) |
| GET | `/api/products/:slug` | Public | Single product |
| GET | `/api/products/search/suggestions?q=` | Public | Search autocomplete |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | Optional | Create order |
| GET | `/api/orders/my` | Auth | Customer orders |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/orders/admin/analytics` | Admin | Sales analytics |
| POST | `/api/reviews` | Auth | Submit review |
| GET | `/api/reviews/product/:id` | Public | Product reviews |
| POST | `/api/coupons/validate` | Public | Validate coupon |
| GET | `/api/coupons/admin` | Admin | List coupons |
| POST | `/api/payments/create-session` | Optional | Stripe checkout |
| POST | `/api/payments/webhook` | Stripe | Payment webhook |
| GET | `/api/health` | Public | Server health check |

---

## Features Implemented

### Customer Storefront
- ✅ Home — 3D hero bottle (Three.js), GSAP text reveal, bestsellers carousel, brand story
- ✅ Shop — filters (edition, gender, family, price), sort, pagination
- ✅ Product Detail — image gallery/zoom, variant selector (size/price/stock), fragrance pyramid (top/heart/base notes), reviews, related products, wishlist
- ✅ Cart — Framer Motion slide-in drawer, quantity controls, remove items
- ✅ Checkout — shipping form, coupon validation, Stripe redirect
- ✅ Order Confirmation — fetches order by session ID, clears cart
- ✅ Account — profile, order history, wishlist, addresses (tabbed)
- ✅ Auth — email/password register/login, Google OAuth, forgot/reset password
- ✅ Search — autocomplete + results page
- ✅ About / Contact / FAQ

### Admin Dashboard (`/admin`)
- ✅ Sales Dashboard — Recharts revenue chart, stat cards, top products
- ✅ Products — table, create/edit modal with variants & fragrance notes, delete
- ✅ Orders — table with status filter, inline status update
- ✅ Customers — aggregated from orders
- ✅ Coupons — create/delete/toggle active

### Backend
- ✅ JWT access + refresh token rotation, secure httpOnly cookies
- ✅ Google OAuth token verification
- ✅ Stripe Checkout Session + webhook-driven order confirmation
- ✅ Cloudinary image upload via multer
- ✅ Nodemailer order confirmation + password reset emails
- ✅ Rate limiting on auth routes
- ✅ Input validation (express-validator)
- ✅ Global error handler
- ✅ CORS configured

---

## Verification Checklist

| Phase | Status | Notes |
|---|---|---|
| Backend foundation | ✅ | Server runs, MongoDB connected, auth + products API verified |
| Database seeded | ✅ | 18 products, admin/customer users, 3 coupons |
| Frontend build | ✅ | `npm run build` completes with 0 errors |
| Auth API | ✅ | Register/login return JWT, refresh tokens rotate |
| Products API | ✅ | 18 products returned with filter/sort support |
| Stripe webhook | ⚠️ | Requires Stripe CLI for local testing (see above) |
| Google OAuth | ⚠️ | Requires Google Cloud Console credentials |
| Email | ⚠️ | Requires SMTP credentials |
| Cloudinary upload | ⚠️ | Requires Cloudinary account |

> Items marked ⚠️ are fully wired — they just need real credentials in `.env`.

---

## Design System

**Color palette:**
- `#0a0a0a` — Jet Black (background)
- `#1a1a1a` — Charcoal (surface)
- `#C0C0C0` — Chrome Silver (primary accent)
- `#B8962E` — Gold (edition accent)
- `#7B2D8B` — Purple (edition accent)
- `#1E3A8A` — Blue (edition accent)

**Typography:**
- Display: Cormorant Garamond (Google Fonts)
- Body: Inter (Google Fonts)

---

## License

MIT — ZAZA Perfumes, 2024
