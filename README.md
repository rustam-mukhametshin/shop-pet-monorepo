# Shop Pet — Monorepo

[![Build](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml)
[![Tests](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo/branch/master/graph/badge.svg)](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo)

A full-stack pet-shop project managed as a **Turborepo** monorepo.

> Frontend note: `apps/frontend` is the Angular UI. `apps/api` is the backend/data API and should be treated as API-only going forward.

---

## Monorepo Structure

```
shop-pet-monorepo/
├── apps/
│   ├── api/          # Node.js + Express 5 backend/data API (TypeScript)
│   └── frontend/     # Angular frontend
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace (npm workspaces)
```

> Commands run from the **root** use Turborepo to orchestrate tasks across all apps in parallel.

---

## Stack

### `apps/api`
- Node.js + Express 5
- Backend/data API only
- TypeScript
- MongoDB (Mongoose)
- Sessions: `express-session` + `connect-mongo`
- CSRF protection: `csurf` (deprecated package, planned replacement)
- PDF generation: `pdfkit`
- File uploads: `multer`
- Email: `nodemailer`
- Payments: `stripe`
- Socket transport: `socket.io`

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
- Set `DB_SESSION_SECRET` in `apps/api/.env` for session encryption.
- Set `JWT_SECRET` in `apps/api/.env` for auth token generation/verification.

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
| `npm run start`     | Start all apps in start mode (`turbo run start`) |
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
1. Security middleware (`helmet`) + manual CORS headers
2. Static files from `public/`
3. Body parsing (`express.urlencoded`, `express.json`, `multer.single('image')`)
4. Session middleware (`express-session`) with Mongo-backed store (`connect-mongo`)
5. CSRF middleware (`csurf`)
6. Flash middleware (`connect-flash`)
7. User middleware loads by `req.session.user._id` and attaches `req.user`
8. Locals middleware sets `res.locals.isLoggedIn`, `res.locals.userName`, `res.locals.csrfToken`, `res.locals.error`, `res.locals.success`
9. Routes mounted in order: `/admin` (guarded by `isAuth`) → auth routes → shop routes
10. Fallback handlers (`404`, `/500`) and CSRF error handler (`EBADCSRFTOKEN` -> 403)

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
- `POST /login`
- `GET  /logout`
- `POST /signup`
- `GET  /status` (protected by JWT `Authorization: Bearer <token>`)

Auth JSON examples:

```json
// POST /login -> 200
{
  "userId": "<user-id>",
  "message": "Login successfully",
  "token": "<jwt-token>"
}
```

```json
// POST /signup -> 201
{
  "message": "User created successfully"
}
```

```json
// GET /status -> 200
{
  "status": "success"
}
```

---

## Common Pitfalls
- `ObjectId` throws on invalid IDs — validate/sanitize before `new ObjectId(...)`.
- Database calls fail if `mongoConnect` has not completed before the app starts handling requests.
- `global.d.ts` request typing must stay aligned with `UserModel` usage in `app.ts`.
- Any `POST` form without the hidden `_csrf` token will return `403 Invalid CSRF token`.
- Missing `req.session.save()` before a redirect after login/logout can silently drop session updates.

---

## UI Notes
- Bootstrap is used in the Angular frontend.
- UI work belongs in `apps/frontend`.
- Backend responses in `apps/api` should stay API-first.
