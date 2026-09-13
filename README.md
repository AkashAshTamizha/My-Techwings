# My Tech Wings — E-commerce Platform

Full-stack laptop store: React (Vite) frontend + Node/Express API, MongoDB, Redis.
Replicates the original My Tech Wings design (home, products listing with filters, product detail).

## Monorepo layout

```
.
├── frontend/               # React + Vite + Tailwind (deploy: Vercel)
│   └── src/
│       ├── components/
│       │   ├── layout/     # Header, Footer, Layout
│       │   ├── product/    # ProductCard, ProductGrid, Filters, Pagination, InquiryModal
│       │   └── common/     # StarRating, Loader
│       ├── pages/          # Home, Products, ProductDetail, About, Service, Contact, NotFound
│       ├── services/       # api.js (axios client, CSRF handling)
│       ├── utils/          # format.js
│       └── __tests__/      # Vitest + Testing Library
├── backend/                # Node + Express (deploy: Render)
│   └── src/
│       ├── config/         # db.js (Mongo), redis.js (cache + rate-limit store)
│       ├── controllers/    # product, inquiry, auth
│       ├── models/         # Product, User, Inquiry (Mongoose, with indexes)
│       ├── middleware/     # auth (JWT), csrf, rateLimiter, errorHandler, validate
│       ├── routes/
│       ├── utils/          # whatsapp.js (wa.me link builder), logger, seed.js
│       └── app.js / server.js
└── .github/workflows/      # backend-ci-cd.yml, frontend-ci-cd.yml
```

## Functional requirements → implementation

| Requirement | Where |
|---|---|
| Browse products | `GET /api/v1/products` (filters, sort, pagination) → `pages/Products.jsx` |
| Product details | `GET /api/v1/products/:slug` → `pages/ProductDetail.jsx` |
| User details form | `components/product/InquiryModal.jsx` → `POST /api/v1/inquiries` |
| WhatsApp message, no Business API | `backend/src/utils/whatsapp.js` builds a `https://wa.me/<number>?text=...` deep link; the frontend opens it in a new tab, handing the chat to the customer's own WhatsApp app/web — no API, approval, or per-message cost |
| Admin: product create/edit/delete | `pages/admin/AdminProducts.jsx` (list), `AdminProductForm.jsx` (create/edit) → `POST/PATCH/DELETE /api/v1/products` |
| Admin: service add/edit/delete | `pages/admin/AdminServices.jsx` (list), `AdminServiceForm.jsx` (create/edit) → `POST/PATCH/DELETE /api/v1/services`; public `Service.jsx` page renders whatever is active, in `order` |

## Admin screen

- **URL**: `/admin/login` → sign in with the seeded admin (`npm run seed` creates `admin@mytechwings.com` / `ChangeMe123!`, override via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`).
- **Access control**: `context/AuthContext.jsx` holds the session (backed by the httpOnly JWT cookie); `components/admin/ProtectedRoute.jsx` redirects unauthenticated visitors to the login page. On the API side every mutating admin route is behind `protect` (JWT) + `restrictTo('admin', 'staff')` + CSRF.
- **Products**: `/admin/products` lists all products with edit/delete; `/admin/products/new` and `/admin/products/:id/edit` share one form component (`AdminProductForm.jsx`). Delete soft-deletes (`isActive: false`) so historical orders/inquiries still resolve correctly.
- **Services**: `/admin/services` lists every service (including hidden ones); `/admin/services/new` / `/admin/services/:id/edit` share `AdminServiceForm.jsx`. Delete here is a hard delete (services have no order history to preserve). Toggle "Visible on the Service page" to hide without deleting.
- Both list pages invalidate the relevant Redis cache keys on every write (`invalidateByPrefix`), so the public site reflects admin changes within the same request — no stale cache window.

## Local development

**Prerequisites:** Node 18+, MongoDB (Atlas or local). Redis is optional for local dev — the app auto-detects it and degrades gracefully (skips caching, falls back to a no-op for the rate-limit store) if it isn't running, so you don't need to install it just to get the app up.

```bash
# Backend
cd backend
cp .env.example .env        # fill in MONGO_URI at minimum; REDIS_URL only if you have Redis running
npm install
npm run seed                # loads sample products, services, and admin user
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

> **Note on Redis in production:** always run Redis in production/staging — that's what makes caching and cross-instance rate limiting actually work. Locally it's optional purely for convenience.

## Deployment

### Backend → Render
`backend/render.yaml` is a Render Blueprint: push it and Render provisions the web service (2 instances behind Render's load balancer) plus a managed Redis instance. Set the secret env vars (`MONGO_URI`, `JWT_SECRET`, etc.) in the Render dashboard — they're marked `sync: false` so they aren't committed to git.

### Frontend → Vercel
Import the `frontend/` directory as the project root in Vercel, or let the GitHub Action deploy it (see below). `vercel.json` adds SPA rewrites and security headers.

### CI/CD — GitHub Actions

- **`.github/workflows/backend-ci-cd.yml`**: on push to `main` touching `backend/**` → spins up a Redis service container, runs `npm run lint` + `npm test` (Jest + Supertest + an in-memory MongoDB), then on success POSTs to a Render **deploy hook** URL (`secrets.RENDER_DEPLOY_HOOK_URL`).
- **`.github/workflows/frontend-ci-cd.yml`**: on push to `main` touching `frontend/**` → `npm run lint` + `npm test` (Vitest) + `npm run build`, uploads the build as an artifact, then deploys with the Vercel CLI (`secrets.VERCEL_TOKEN`, plus `vercel pull`/`vercel build`/`vercel deploy --prebuilt`).

Required repo secrets: `RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VITE_API_URL` (production API URL, injected at build time).

Pull requests run lint + test only (no deploy), so broken code never reaches `main` unreviewed.

## Performance & scalability

- **Horizontal scaling / load balancing**: the API is stateless (JWT in an httpOnly cookie, no in-memory sessions), so Render can run multiple instances behind its built-in load balancer (`numInstances: 2` in `render.yaml`, bump as needed). Nothing in the app assumes a single process.
- **Redis cache**: `config/redis.js` implements a cache-aside helper. Product list queries (`GET /products`) and product detail (`GET /products/:slug`) are cached for 60s/300s respectively, keyed by the exact query, and invalidated on admin writes (`invalidateByPrefix`). This is what lets the API absorb repeated identical requests from 1,000+ concurrent users without hammering MongoDB every time.
- **MongoDB indexing**: `models/Product.js` defines compound indexes on `{category, price}`, `{brand, price}`, `{isActive, createdAt}`, a text index on `name/brand/description`, plus unique index on `slug`. These match the actual query shapes the Products page issues (filter + sort), so queries stay index-covered instead of collection-scanning as the catalog grows.
- **Connection pooling**: `maxPoolSize`/`minPoolSize` tuned in `config/db.js` per instance, so `instances × poolSize` stays under the Atlas cluster's connection ceiling as you scale out.
- **Compression + payload limits**: `compression()` gzips responses; `express.json({ limit: '10kb' })` caps request body size.
- **Rate limiting is Redis-backed** (`rate-limit-redis`), so limits are enforced correctly *across* all horizontally-scaled instances rather than reset per-process.

## Security

- **JWT auth**: httpOnly, `sameSite: strict`, `secure` (prod) cookie — not readable by JS, so an XSS payload can't exfiltrate the token.
- **Helmet**: sets CSP, disables `X-Powered-By`, and other standard hardening headers.
- **CORS**: locked to the exact `CLIENT_URL` origin with `credentials: true` — no wildcard.
- **Rate limiting**: global API limiter + stricter limiters on `/auth/*` (brute force) and `/inquiries` (spam).
- **Input validation**: `express-validator` chains on every mutating route (`validate.js` middleware), including `.escape()` on free-text fields.
- **XSS**: `xss-clean` sanitizes `req.body/query/params`; React itself escapes all rendered output by default.
- **NoSQL injection**: `express-mongo-sanitize` strips `$`/`.` operators from user input before it reaches Mongoose.
- **CSRF**: double-submit-cookie pattern (`csrf-csrf`) — the frontend fetches a token from `GET /csrf-token` and echoes it in the `x-csrf-token` header on every POST/PATCH/DELETE; the backend validates it against the accompanying httpOnly cookie.
- **HPP**: `hpp` blocks HTTP parameter pollution (duplicate query keys).
- **Passwords**: bcrypt, 12 rounds, never returned in API responses (`select: false` + manual strip).

## Additional tech suggestions for maintainability & scalability

- **CDN for product images**: move image storage/serving to Cloudinary or an S3 + CloudFront setup instead of storing binaries in the repo/DB — cheaper bandwidth, automatic resizing, faster global delivery.
- **API documentation**: add OpenAPI/Swagger (`swagger-jsdoc` + `swagger-ui-express`) so the contract between frontend and backend is versioned and browsable.
- **Observability**: Sentry (or similar) for both frontend and backend error tracking, plus a structured logs sink (e.g. Better Stack, Datadog) reading the existing Winston JSON output.
- **Feature flags / A-B testing**: something like Unleash if you plan to test pricing banners or layout variants.
- **Search**: if the catalog grows large, swap the Mongo `$text` index for a dedicated search service (Algolia, Meilisearch, or Atlas Search) — much better relevance and typo tolerance than native Mongo text search.
- **Queueing**: if WhatsApp/email notifications or order-processing grow more complex, introduce BullMQ (Redis-backed) so slow, third-party calls happen off the request path.
- **TypeScript**: migrating both frontend and backend to TypeScript over time would catch a large class of bugs the current PropTypes-free React and plain-JS Express code can't.
- **E2E tests**: Playwright covering the "browse → product detail → submit inquiry → WhatsApp opens" flow, run in CI on a preview deployment before promoting to production.
- **Infra as code**: if you outgrow the Render/Vercel blueprints, Terraform modules for Mongo Atlas + Redis + any additional infra keep environments reproducible.
