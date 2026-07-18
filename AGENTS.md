# AGENTS Guide

## Project Snapshot
- Monorepo uses `npm workspaces` + `Turborepo`.
- Root workspace is `shop-pet-monorepo`; app code lives in `apps/*`.
- Backend app is `apps/api` (`Node.js + Express 5 + TypeScript + Mongoose`), listens on port `3333`.
- Runtime entry is `apps/api/app.ts`; database bootstrap is `apps/api/database.ts` (`mongoConnect`).
- Project constants (name, label) are in `apps/api/env.ts`.
- UI lives in `apps/frontend` and is built with Angular 19 (standalone components), serves on port `4200`.
- `apps/api` is the backend/data API layer; UI work should not be added there.
- CI workflows are in `.github/workflows/build.yml` and `.github/workflows/test.yml`.

## Monorepo Layout
- Root config: `package.json`, `turbo.json`, `tsconfig*.json`, `tsconfig.build.json`, `jest*.js`, `eslint.config.mts`.
- Workspaces:
  - `apps/api` — Express app and test suite.
  - `apps/frontend` — Angular 19 frontend application.

## Request Flow (`apps/api/app.ts`)
1. Rate limiting: `express-rate-limit` (100 req / 15 min window, `draft-8` standard headers).
2. Security middleware: `helmet()` + manual CORS headers (allowlist: `http://localhost:3000`, `http://localhost:4200`).
3. Static files: `express.static('public')` and `/public` alias.
4. Body parsing: `express.urlencoded`, `express.json`, `multer.diskStorage` (field `image`, PNG/JPG/JPEG, stored in `public/images/`).
5. Route mount order: `/admin` (with `isAuth`) → `/auth` → `/v1`.
6. Error route `/500`, fallback `notFound` handler, final redirect error handler.
7. `socket.io` server attached to the same HTTP server (CORS-aware) — initialised via `initSocket` from `apps/api/socket.ts`.
8. App listens only when `require.main === module` (safe to import in tests).

## Route Surface

### Admin (`apps/api/routes/admin.routes.ts`, protected by `isAuth`)
- `GET /admin/products`
- `POST /admin/add-product` — validates `title`, `price`, `description`
- `POST /admin/edit-product` — validates `title`, `price`, `description`
- `DELETE /admin/delete-product/:id`

### Shop (`apps/api/routes/shop.routes.ts`)
- `GET /v1/` — index
- `GET /v1/products` — list products (paginated)
- `GET /v1/products/:id` — single product
- `POST /v1/add-product` — create product (public, with validation)
- `DELETE /v1/products/:id` — delete product (public)
- `GET /v1/cart` (protected), `POST /v1/cart` (protected)
- `GET /v1/cart-delete-item/:id` (protected)
- `GET /v1/checkout` (protected), `GET /v1/checkout/success` (protected)
- `GET /v1/orders` (protected), `POST /v1/order-delete-item` (protected)
- `GET /v1/invoices/:orderId` (protected)

### Auth (`apps/api/routes/auth.routes.ts`)
- `POST /auth/login`, `POST /auth/login-twofa`, `POST /auth/signup`
- `GET /auth/status` (protected), `GET /auth/profile` (protected), `PUT /auth/profile` (protected)
- `GET /auth/2fa` (protected)
- `POST /auth/reset`, `GET /auth/reset-password`, `POST /auth/reset-password`
- `POST /auth/webauthn/register/options` (protected)
- `POST /auth/webauthn/register/verify` (protected)
- `POST /auth/webauthn/authenticate/options`

## Data Model Conventions (Mongoose)
- `apps/api/models/product.model.ts`: product document with `userId` ref to `User`.
- `apps/api/models/user.model.ts`: owns cart state under `cart.items[]` with `{ productId, quantity }` plus instance methods (`addToCart`, `deleteProductFromCart`, `clearCart`) and static helpers (`isValidEmail`, `isPasswordLengthIsOk`, `getUserByEmail`, `isUserExistByEmail`).
- `apps/api/models/order.model.ts`: order document with `products[]` entries `{ product, quantity }` + `userId`.
- `apps/api/models/profile.model.ts`: user profile with display `name` and `twoFA` boolean toggle.
- `apps/api/models/two-fa.model.ts`: persisted TOTP secret (and optional `qrCodeDataURL`) for MFA verification.
- `apps/api/models/node-mail.model.ts`: `NodeMailModel` — email sending helpers + JWT-based reset token creation/verification.
- `token.model.ts` is currently unused (password reset runs JWT-only via `NodeMailModel`).
- Cart population pattern is nested populate from `User`: `cart.items.productId`.

## Controller Patterns
- Admin create/edit uses direct Mongoose document save (`new Product(...).save()`, `findById(...).save()`).
- Cart updates call model instance methods on `userSchema.methods` (`addToCart`, `deleteProductFromCart`, `clearCart`).
- Orders are created from current user cart in checkout success flow, then cart is cleared.
- Auth login branches into MFA-required response (`status: "MFA_REQUIRED"`, short-lived `state_token`, 10 min expiry) when `profile.twoFA` is true.
- TOTP 2FA: secret stored in `TwoFAModel`; verified via `otplib`'s `verify()`; QR code generated with `qrcode`.
- WebAuthn: registration and authentication options/verification via `@simplewebauthn/server` (`generateRegistrationOptions`, `verifyRegistrationResponse`, `generateAuthenticationOptions`). RP ID is `env.projectName` (`shop-pet-monorepo`).
- Password reset flow uses `NodeMailModel` JWT helpers (no `TokenModel` DB record currently).
- Profile update (`PUT /auth/profile`) also handles disabling 2FA: deletes `TwoFAModel` records when `twoFA` toggled off.

## Frontend Architecture (`apps/frontend`)
- Angular 19 standalone components; no NgModules.
- API base URL configured in `src/environments/environment.ts` (`http://localhost:3333/`).
- **AuthService** (`src/app/auth.service.ts`): Angular Signal-based auth state (`isAuth` signal); token persisted to `localStorage` under key `shop-pet-auth-token`; exposes `login`, `loginWithTwoFA`, `signup`, `logout`.
- **ProductsService** (`src/app/products/products.service.ts`): fetches products from `GET /v1/products` (paginated), `GET /v1/products/:id`; creates via `POST /v1/add-product`; deletes via `DELETE /v1/products/:id`.
- **NotificationService** (`src/app/services/notification.service.ts`): `BehaviorSubject`-backed toast notifications with `success`, `error`, `warning`, `info` helpers and auto-dismiss.
- **Auth guard** (`src/app/guards/auth.guard.ts`): functional guard `canActivate`; redirects to `/login` with `returnUrl` query param when unauthenticated.
- **Routes** (`src/app/app.routes.ts`): `/` → `/products`, `/login`, `/signup`, `/profile` (guarded), `/products` (guarded), `/products/create` (guarded), `/products/form` (guarded), `/products/:id`, `/products/:id/update` (guarded), `**` → `/products`.
- **Socket.io client** (`socket.io-client ~4.8.3`) included as a dependency for realtime features.

## Dev Workflows
- Install (all workspaces): `npm install` (run at repo root).
- Root turbo scripts:
  - `npm run build`
  - `npm run dev`
  - `npm run lint`
  - `npm test`
- API workspace scripts (from `apps/api`):
  - `npm run start` — `ts-node app.ts`
  - `npm run start-dev` — `nodemon --exec ts-node app.ts`
  - `npm run typecheck` — `tsc --noEmit`
  - `npm run build` — `tsc -p ../../tsconfig.build.json`
  - `npm test`, `npm run test:watch`, `npm run test:coverage`
- Frontend workspace scripts (from `apps/frontend`):
  - `npm run dev` — `ng serve`
  - `npm run build` — `ng build`
  - `npm test` — `ng test --watch=false --browsers=ChromeHeadless`
  - `npm run lint` — `ng lint`

## Guardrails For Agents
- Keep `req.user` augmentation in `apps/api/global.d.ts` aligned with `UserModel` usage in `apps/api/app.ts`.
- Preserve route mount order and path prefixes in `apps/api/app.ts` unless explicitly requested.
- Do not bypass `isAuth` for `/admin` route mount.
- Keep backend responses API-first (`res.status(...).json(...)`) in `apps/api`.
- Build UI in `apps/frontend`; treat `apps/api` as backend-only.
- Keep changes workspace-aware: root automation should use Turbo, app-specific behavior should be updated in the matching workspace.
- WebAuthn endpoints use `env.projectName` as RP ID; do not hardcode `localhost` in new WebAuthn code.
- `token.model.ts` is currently unused — do not add new references to it without refactoring the password-reset flow.
- Angular components are standalone — do not introduce NgModules.
