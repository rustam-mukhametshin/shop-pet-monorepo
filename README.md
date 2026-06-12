# Shop Pet — Monorepo

[![Build](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml)
[![Tests](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo/branch/master/graph/badge.svg)](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo)

A full-stack pet-shop project managed as a **Turborepo** monorepo.

---

## Monorepo Structure

```
shop-pet-monorepo/
├── apps/
│   ├── api/          # Node.js + Express 5 + EJS backend (TypeScript)
│   └── frontend-ng/  # Angular frontend (in progress)
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace (npm workspaces)
```

> Commands run from the **root** use Turborepo to orchestrate tasks across all apps in parallel.

---

## Stack

### `apps/api`
- Node.js + Express 5
- EJS templates (server-rendered UI)
- TypeScript
- MongoDB (Mongoose)
- Sessions: `express-session` + `connect-mongo`
- CSRF protection: `csrf-sync`
- Bootstrap 5 (CDN)
- PDF generation: `pdfkit`
- File uploads: `multer`
- Email: `nodemailer`
- Payments: `stripe`

### Tooling
- **Turborepo** — build orchestration and task caching
- **npm workspaces** — package management across apps
- **Husky** — git hooks (in `apps/api`)
- **Jest + Supertest** — testing
- **ts-node / nodemon** — TypeScript dev runtime

---

## Prerequisites
- Node.js ≥ 20 and npm ≥ 11
- Network access to MongoDB Atlas (or your own Mongo URI)

---

## Environment Variables

Create a `.env` file inside `apps/api/` (or export variables in your shell):

| Variable    | Description                                      |
|-------------|--------------------------------------------------|
| `MONGO_URI` | MongoDB connection string (Atlas or local)       |

Notes:
- The session store (`connect-mongo`) also uses `MONGO_URI`.
- The session `secret` is currently hardcoded in `app.ts` and should be moved to env for production.

Example (zsh):
```zsh
export MONGO_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0"
```

---

## Install Dependencies

From the **repo root** (installs all workspaces):
```zsh
npm install
```

---

## Common Scripts

All of the following commands are run from the **repo root** and delegate to Turborepo:

| Command              | Description                                    |
|----------------------|------------------------------------------------|
| `npm run build`      | Build all apps (`turbo run build`)             |
| `npm run dev`        | Start all apps in dev mode (`turbo run dev`)   |
| `npm run lint`       | Lint all apps (`turbo run lint`)               |
| `npm test`           | Run all test suites (`turbo run test`)         |

### `apps/api`-specific scripts (run from `apps/api/`)

| Command                  | Description                        |
|--------------------------|------------------------------------|
| `npm run start`          | Run API with `ts-node`             |
| `npm run start-dev`      | Watch mode with `nodemon + ts-node`|
| `npm run typecheck`      | TypeScript type-check only         |
| `npm run build`          | Compile TypeScript → `dist/`       |
| `npm test`               | Run Jest test suite                |
| `npm run test:watch`     | Jest watch mode                    |
| `npm run test:coverage`  | Jest with coverage report          |

---

## CI

| Workflow        | File                              | Trigger                      | Steps                                                |
|-----------------|-----------------------------------|------------------------------|------------------------------------------------------|
| **Build**       | `.github/workflows/build.yml`     | Push / PR → `main`, `master` | `npm ci` → `npm run build`                           |
| **Tests**       | `.github/workflows/test.yml`      | Push / PR → `main`, `master` | `npm ci` → `npm run test:coverage` → upload Codecov  |

---

## Request Flow — `apps/api` (High Level)
1. Static files from `public/`
2. `express.urlencoded`
3. Session middleware (`express-session`) with Mongo-backed store (`connect-mongo`)
4. CSRF middleware (`csrfSynchronisedProtection`)
5. User middleware loads by `req.session.user._id` and attaches `req.user`
6. Locals middleware sets `res.locals.isLoggedIn` and `res.locals.csrfToken`
7. Routes mounted in order: `/admin` (guarded by `isAuth`) → auth routes → shop routes
8. Fallback `notFound` handler renders `views/404.ejs`
9. Error middleware returns `403` for `EBADCSRFTOKEN`

---

## Important Routes

### Admin
- `GET  /admin/products`
- `GET  /admin/add-product`
- `POST /admin/add-product`
- `GET  /admin/edit-product/:id`
- `POST /admin/edit-product`
- `GET  /admin/delete-product/:id`

### Shop
- `GET  /`
- `GET  /products`
- `GET  /products/:id`
- `GET  /cart`
- `POST /cart`
- `GET  /cart-delete-item/:id`
- `GET  /orders`
- `POST /create-order`
- `POST /order-delete-item`

### Auth
- `GET  /login`
- `POST /login`
- `POST /logout`
- `GET  /signup`
- `POST /signup`

---

## Common Pitfalls
- `ObjectId` throws on invalid IDs — validate/sanitize before `new ObjectId(...)`.
- Database calls fail if `mongoConnect` has not completed before the app starts handling requests.
- Navigation active-link checks depend on exact `url` strings in `views/parts/navigation.ejs`.
- `global.d.ts` request typing must stay aligned with `UserModel` usage in `app.ts`.
- Any `POST` form without the hidden `_csrf` token will return `403 Invalid CSRF token`.
- Missing `req.session.save()` before a redirect after login/logout can silently drop session updates.

---

## UI Notes
- Bootstrap 5 is globally included via CDN.
- Product list pages use Bootstrap card grids.
- Cart and orders pages use Bootstrap card/list-group layouts.
- Shared add-to-cart form lives in `views/parts/add-to-cart.ejs`.
