# AGENTS Guide

## Project Snapshot
- Monorepo uses `npm workspaces` + `Turborepo`.
- Root workspace is `shop-pet-monorepo`; app code lives in `apps/*`.
- Backend app is `apps/api` (`Node.js + Express 5 + TypeScript + Mongoose`).
- Runtime entry is `apps/api/app.ts`; database bootstrap is `apps/api/database.ts` (`mongoConnect`).
- UI lives in `apps/frontend` and is built with Angular.
- `apps/api` is the backend/data API layer; UI work should not be added there.
- CI workflows are in `.github/workflows/build.yml` and `.github/workflows/test.yml`.

## Monorepo Layout
- Root config: `package.json`, `turbo.json`, `tsconfig*.json`, `jest*.js`.
- Workspaces:
  - `apps/api` - Express app and test suite.
  - `apps/frontend` - Angular frontend application.

## Request Flow (`apps/api/app.ts`)
1. Security middleware: `helmet()` + manual CORS headers.
2. Static files: `express.static('public')` and `/public` alias.
3. Body parsing: `express.urlencoded`, `express.json`, `multer.single('image')`.
4. Route mount order: `/admin` (with `isAuth`) -> `/auth` -> `/v1`.
5. Fallback `notFound` handler, `/500` route, and final redirect error handler.
6. App listens only when `require.main === module` (safe to import in tests).

## Route Surface
- Admin (`apps/api/routes/admin.routes.ts`):
  - `GET /admin/products`
  - `POST /admin/add-product`
  - `POST /admin/edit-product`
  - `DELETE /admin/delete-product/:id`
- Shop (`apps/api/routes/shop.routes.ts`):
  - `GET /v1`, `GET /v1/products`, `GET /v1/products/:id`
  - `GET /v1/cart`, `POST /v1/cart`, `GET /v1/cart-delete-item/:id`
  - `GET /v1/checkout`, `GET /v1/checkout/success`
  - `GET /v1/orders`, `POST /v1/order-delete-item`, `GET /v1/invoices/:orderId`
- Auth (`apps/api/routes/auth.routes.ts`):
  - `POST /auth/login`, `POST /auth/login-twofa`, `POST /auth/signup`
  - `GET /auth/status`, `GET /auth/profile`, `PUT /auth/profile`
  - `GET /auth/2fa`
  - `POST /auth/reset`
  - `GET /auth/reset-password`, `POST /auth/reset-password`

## Data Model Conventions (Mongoose)
- `apps/api/models/product.model.ts`: product document with `userId` ref to `User`.
- `apps/api/models/user.model.ts`: owns cart state under `cart.items[]` with `{ productId, quantity }` plus instance cart helpers.
- `apps/api/models/order.model.ts`: order document with `products[]` entries `{ product, quantity }` + `userId`.
- `apps/api/models/token.model.ts`: reset token record with `userId` and `token`.
- `apps/api/models/profile.model.ts`: user profile with display `name` and `twoFA` toggle.
- `apps/api/models/two-fa.model.ts`: persisted TOTP secret for MFA verification.
- Cart population pattern is nested populate from `User`: `cart.items.productId`.

## Controller Patterns
- Admin create/edit uses direct Mongoose document save (`new Product(...).save()`, `findById(...).save()`).
- Cart updates call model instance methods attached on `userSchema.methods` (`addToCart`, `deleteProductFromCart`, `clearCart`).
- Orders are created from current user cart in checkout success flow, then cart is cleared.
- Auth login can branch into MFA-required response (`status: "MFA_REQUIRED"` with short-lived `state_token`).
- Password reset flow uses `TokenModel` + `NodeMailModel` JWT helpers.

## Dev Workflows
- Install (all workspaces): `npm install` (run at repo root).
- Root turbo scripts:
  - `npm run build`
  - `npm run dev`
  - `npm run lint`
  - `npm test`
- API workspace scripts (from `apps/api`):
  - `npm run start`
  - `npm run start-dev`
  - `npm run typecheck`
  - `npm run build`
  - `npm test`, `npm run test:watch`, `npm run test:coverage`

## Guardrails For Agents
- Keep `req.user` augmentation in `apps/api/global.d.ts` aligned with `UserModel` usage in `apps/api/app.ts`.
- Preserve route mount order and path prefixes in `apps/api/app.ts` unless explicitly requested.
- Do not bypass `isAuth` for `/admin` route mount.
- Keep backend responses API-first (`res.status(...).json(...)`) in `apps/api`.
- Build UI in `apps/frontend`; treat `apps/api` as backend-only.
- Keep changes workspace-aware: root automation should use Turbo, app-specific behavior should be updated in the matching workspace.
