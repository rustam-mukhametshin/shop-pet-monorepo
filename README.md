# Shop Pet — Monorepo

[![Build](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/build.yml)
[![Tests](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml/badge.svg)](https://github.com/rustam-mukhametshin/shop-pet-monorepo/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo/branch/master/graph/badge.svg)](https://codecov.io/gh/rustam-mukhametshin/shop-pet-monorepo)

Full-stack pet-shop project managed with **npm workspaces** + **Turborepo**:
- `apps/api`: Express 5 + TypeScript + Mongoose backend API (port `3333`)
- `apps/frontend`: Angular 21 frontend (port `4200`)

## Monorepo Structure

```text
shop-pet-monorepo/
├── apps/
│   ├── api/          # Express backend
│   └── frontend/     # Angular frontend
├── turbo.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
└── package.json
```

## Stack

### `apps/api`
- Node.js + Express 5
- TypeScript + Mongoose (MongoDB)
- JWT auth (`Authorization: Bearer <token>`, 1 h expiry)
- Rate limiting via `express-rate-limit` (100 req / 15 min window)
- File uploads via `multer` (disk storage, `public/images/`, PNG/JPG/JPEG only)
- PDF invoices via `pdfkit`
- Email + password reset via `nodemailer` + JWT reset tokens
- Optional TOTP 2FA via `otplib` + QR code (`qrcode`)
- WebAuthn / Passkey registration & authentication via `@simplewebauthn/server`
- Realtime events via `socket.io`
- Payments via `stripe`
- Project constants in `apps/api/env.ts` (`projectName`, `projectLabel`)

### `apps/frontend`
- Angular 21 (standalone components)
- Angular Material + CDK (`@angular/material`, `@angular/cdk`)
- Angular Signals for reactive state (`AuthService`)
- `socket.io-client` for realtime updates
- Functional route guard (`canActivate`)
- `NotificationService` with toast-style notifications

### Tooling
- Turborepo
- npm workspaces
- Jest + Supertest (API)
- Angular unit-test runner with Vitest (`@angular/build:unit-test`)
- ts-node + nodemon
- ESLint + Prettier

## Prerequisites
- Node.js >= 20
- npm >= 11
- MongoDB connection string

## Environment Variables (`apps/api/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_STATE_SECRET` | MFA state-token secret (10 min expiry) |
| `DB_SESSION_SECRET` | Reset-token signing secret |
| `NODE_MAIL_SERVICE` | Mail transport service |
| `NODE_MAIL_USER` | Mail auth username |
| `NODE_MAIL_PASSWORD` | Mail auth password |
| `MAIN_URL` | Base app URL for reset links |
| `FRONTEND_URL` | Optional allowed CORS/socket origin |
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
| `npm run start-dev` | Run API in watch mode (`nodemon`) |
| `npm run typecheck` | Type-check TypeScript |
| `npm run build` | Build API TypeScript |
| `npm test` | Run API tests |
| `npm run test:watch` | Watch API tests |
| `npm run test:coverage` | API coverage report |

Frontend scripts (`apps/frontend`):

| Command | Description |
|---|---|
| `npm run dev` | Serve with `ng serve` (port 4200) |
| `npm run build` | Build with `ng build` |
| `npm test` | Run Angular unit tests (`ng test --watch=false`) |
| `npm run lint` | Lint with `ng lint` |

## Request Flow (`apps/api/app.ts`)
1. `express-rate-limit` (100 req / 15 min)
2. `helmet()`
3. CORS (allowlist: `http://localhost:3000`, `http://localhost:4200`, `process.env.FRONTEND_URL`)
4. Static serving (`public/` + `/public` alias)
5. Body parsers: `express.urlencoded`, `express.json`, `multer.diskStorage` (field `image`)
6. Route mounts: `/admin` (JWT `isAuth`) → `/auth` → `/v1`
7. Error route `/500`, `notFound` fallback, final redirect error handler
8. `socket.io` server attached on the same HTTP server (CORS-aware)

## API Surface

### Admin (`/admin`, protected by `isAuth`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/products` | List all products |
| `POST` | `/admin/add-product` | Create a product (with validation) |
| `POST` | `/admin/edit-product` | Edit a product (with validation) |
| `DELETE` | `/admin/delete-product/:id` | Delete a product |

### Shop (`/v1`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/` | — | Index / home |
| `GET` | `/v1/products` | — | List products (paginated) |
| `GET` | `/v1/products/:id` | — | Get single product |
| `POST` | `/v1/add-product` | — | Create product (public, with validation) |
| `DELETE` | `/v1/products/:id` | — | Delete product (public) |
| `GET` | `/v1/cart` | ✓ | View cart |
| `POST` | `/v1/cart` | ✓ | Add product to cart |
| `GET` | `/v1/cart-delete-item/:id` | ✓ | Remove item from cart |
| `GET` | `/v1/checkout` | ✓ | Checkout page |
| `GET` | `/v1/checkout/success` | ✓ | Checkout success (creates order) |
| `GET` | `/v1/orders` | ✓ | List orders |
| `POST` | `/v1/order-delete-item` | ✓ | Delete order item |
| `GET` | `/v1/invoices/:orderId` | ✓ | Download PDF invoice |

### Auth (`/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Login (returns JWT or MFA challenge) |
| `POST` | `/auth/login-twofa` | — | Complete TOTP 2FA login |
| `POST` | `/auth/signup` | — | Register new user |
| `GET` | `/auth/status` | ✓ | Get user status |
| `GET` | `/auth/profile` | ✓ | Get profile |
| `PUT` | `/auth/profile` | ✓ | Update profile (name, twoFA toggle) |
| `GET` | `/auth/2fa` | ✓ | Get TOTP secret + QR code |
| `POST` | `/auth/reset` | — | Request password reset email |
| `GET` | `/auth/reset-password` | — | Verify reset token |
| `POST` | `/auth/reset-password` | — | Set new password |
| `POST` | `/auth/webauthn/register/options` | ✓ | Get WebAuthn registration options |
| `POST` | `/auth/webauthn/register/verify` | ✓ | Verify WebAuthn registration |
| `POST` | `/auth/auth/webauthn/authenticate/options` | — | Get WebAuthn authentication options |

## Frontend Routes (`apps/frontend`)

| Path | Component | Auth Guard |
|---|---|---|
| `/` | → redirects to `/products` | — |
| `/login` | `LoginComponent` | — |
| `/signup` | `SignupComponent` | — |
| `/profile` | `ProfileComponent` | ✓ |
| `/products` | `ProductsComponent` | ✓ |
| `/products/create` | `CreateProductComponent` | ✓ |
| `/products/form` | `FormProductComponent` | ✓ |
| `/products/:id` | `ViewProductComponent` | — |
| `/products/:id/update` | `UpdateProductComponent` | ✓ |
| `**` | → redirects to `/products` | — |

## Notes
- Frontend API base URL is `http://localhost:3333/` (configured in `src/environments/environment.ts`).
- Frontend/UI work belongs in `apps/frontend`.
- `apps/api` should remain API/backend-focused (`res.status(...).json(...)`).
- JWT token stored in `localStorage` under key `shop-pet-auth-token`.
