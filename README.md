# Shop Pet — Monorepo

[![Build](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml)
[![Tests](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo/branch/master/graph/badge.svg)](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo)

Full-stack pet-shop project managed with **npm workspaces** + **Turborepo**:
- `apps/api`: Express 5 + TypeScript + Mongoose backend API
- `apps/frontend`: Angular frontend

## Monorepo Structure

```text
shop-pet-monorepo/
├── apps/
│   ├── api/
│   └── frontend/
├── turbo.json
└── package.json
```

## Stack

### `apps/api`
- Node.js + Express 5
- TypeScript + Mongoose (MongoDB)
- JWT auth middleware (`Authorization: Bearer <token>`)
- Uploads via `multer`
- PDF invoices via `pdfkit`
- Email + password reset via `nodemailer` + JWT reset tokens
- Optional 2FA flow via `otplib` + QR (`qrcode`)
- Realtime transport via `socket.io`

### Tooling
- Turborepo
- npm workspaces
- Jest + Supertest
- ts-node + nodemon

## Prerequisites
- Node.js >= 20
- npm >= 11
- MongoDB connection string

## Environment Variables (`apps/api/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_STATE_SECRET` | MFA state-token secret |
| `DB_SESSION_SECRET` | Reset-token signing secret |
| `NODE_MAIL_SERVICE` | Mail transport service |
| `NODE_MAIL_USER` | Mail auth username |
| `NODE_MAIL_PASSWORD` | Mail auth password |
| `MAIN_URL` | Base app URL for reset links |
| `ENV` | Optional environment flag (`prod` for prod links) |

## Install

Run from repo root:

```zsh
npm install
```

## Scripts

Root scripts (run in repo root):

| Command | Description |
|---|---|
| `npm run build` | `turbo run build` |
| `npm run dev` | `turbo run dev` |
| `npm run start` | `turbo run start` |
| `npm run lint` | `turbo run lint` |
| `npm test` | `turbo run test` |

API scripts (`apps/api`):

| Command | Description |
|---|---|
| `npm run start` | Run API with `ts-node app.ts` |
| `npm run start-dev` | Run API in watch mode |
| `npm run typecheck` | Type-check TypeScript |
| `npm run build` | Build API TypeScript |
| `npm test` | Run API tests |
| `npm run test:watch` | Watch API tests |
| `npm run test:coverage` | API coverage |

## Request Flow (`apps/api/app.ts`)
1. `helmet()`
2. CORS middleware (allowlist: `http://localhost:3000`, `http://localhost:4200`)
3. Static serving (`public` + `/public`)
4. Parsers (`express.urlencoded`, `express.json`, `multer.single('image')`)
5. Route mounts: `/admin` (JWT `isAuth`) -> `/auth` -> `/v1`
6. Error route `/500`, then `notFound`, then final redirect error handler

## API Surface

### Admin (`/admin`, protected)
- `GET /products`
- `POST /add-product`
- `POST /edit-product`
- `DELETE /delete-product/:id`

### Shop (`/v1`)
- `GET /`
- `GET /products`
- `GET /products/:id`
- `GET /cart` (protected)
- `POST /cart` (protected)
- `GET /cart-delete-item/:id` (protected)
- `GET /checkout` (protected)
- `GET /checkout/success` (protected)
- `GET /orders` (protected)
- `POST /order-delete-item` (protected)
- `GET /invoices/:orderId` (protected)

### Auth (`/auth`)
- `POST /login`
- `POST /login-twofa`
- `POST /signup`
- `GET /status` (protected)
- `GET /profile` (protected)
- `PUT /profile` (protected)
- `GET /2fa` (protected)
- `POST /reset`
- `GET /reset-password`
- `POST /reset-password`

## Notes
- Frontend/UI work belongs in `apps/frontend` (Angular).
- `apps/api` should remain API/backend-focused.
