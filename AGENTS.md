# AGENTS Guide

## Project Snapshot
- Monorepo uses `npm workspaces` + `Turborepo`.
- Root workspace is `shop-pet-monorepo`; app code lives in `apps/*`.
- Backend app is `apps/api` (`Node.js + Express 5 + EJS + TypeScript + Mongoose`).
- Runtime entry is `apps/api/app.ts`; database bootstrap is `apps/api/database.ts` (`mongoConnect`).
- Sessions use `express-session` + `connect-mongo` (Mongo-backed session store).
- CSRF protection currently uses `csurf` (`req.csrfToken()`), with a TODO to remove deprecated package.
- Flash messages use `connect-flash` and are exposed via `res.locals.error` and `res.locals.success`.
- UI is server-rendered EJS with Bootstrap CDN + custom styles in `apps/api/public/css/*.css`.
- CI workflows are in `.github/workflows/build.yml` and `.github/workflows/test.yml`.

## Monorepo Layout
- Root config: `package.json`, `turbo.json`, `tsconfig*.json`, `jest*.js`.
- Workspaces:
  - `apps/api` - Express app and test suite.
  - `apps/frontend-ng` - Angular workspace placeholder/in progress.

## Request Flow (`apps/api/app.ts`)
1. Security middleware: `helmet()` + manual CORS headers.
2. Static files: `express.static('public')` and `/public` alias.
3. Body parsing: `express.urlencoded`, `express.json`, `multer.single('image')`.
4. Session middleware: `express-session` + `connect-mongo` (`collectionName: 'sessions'`).
5. Global CSRF middleware: `csurf()`.
6. Flash middleware: `connect-flash`.
7. User hydration middleware loads `req.session.user._id` and assigns `req.user`.
8. Locals middleware sets `res.locals.isLoggedIn`, `res.locals.userName`, `res.locals.csrfToken`, `res.locals.error`, `res.locals.success`.
9. CSRF error handler maps `EBADCSRFTOKEN` to HTTP 403.
10. Route mount order: `/admin` (with `isAuth`) -> `authRoutes` -> `shopRoutes`.
11. Fallback `notFound` handler renders `views/404.ejs`, then `/500` redirect error handler.
12. App listens only when `require.main === module` (safe to import in tests).

## Route Surface
- Admin (`apps/api/routes/admin.routes.ts`):
  - `GET /admin/products`
  - `GET/POST /admin/add-product`
  - `GET /admin/edit-product/:id`
  - `POST /admin/edit-product`
  - `DELETE /admin/delete-product/:id`
- Shop (`apps/api/routes/shop.routes.ts`):
  - `GET /`, `GET /products`, `GET /products/:id`
  - `GET /cart`, `POST /cart`, `GET /cart-delete-item/:id`
  - `GET /checkout`, `GET /checkout/success`, `GET /checkout/cancel`
  - `GET /orders`, `POST /order-delete-item`, `GET /invoices/:orderId`
- Auth (`apps/api/routes/auth.routes.ts`):
  - `GET /login`, `POST /login`
  - `GET /logout`
  - `GET /signup`, `POST /signup`
  - `GET /reset`, `POST /reset`
  - `GET /reset-password`, `POST /reset-password`

## Data Model Conventions (Mongoose)
- `apps/api/models/product.model.ts`: product document with `userId` ref to `User`.
- `apps/api/models/user.model.ts`: owns cart state under `cart.items[]` with `{ productId, quantity }` plus instance cart helpers.
- `apps/api/models/order.model.ts`: order document with `products[]` entries `{ product, quantity }` + `userId`.
- `apps/api/models/token.model.ts`: reset token record with `userId` and `token`.
- Cart population pattern is nested populate from `User`: `cart.items.productId`.

## Controller Patterns
- Admin create/edit uses direct Mongoose document save (`new Product(...).save()`, `findById(...).save()`).
- Cart updates call model instance methods attached on `userSchema.methods` (`addToCart`, `deleteProductFromCart`, `clearCart`).
- Orders are created from current user cart in checkout success flow, then cart is cleared.
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
- Preserve middleware order in `apps/api/app.ts` unless explicitly requested.
- Do not bypass `isAuth` for `/admin` route mount.
- Every POST form must include hidden `_csrf` from `res.locals.csrfToken`.
- Keep session writes followed by `req.session.save()` before redirects in auth flows.
- Use Bootstrap-compatible markup in EJS views; shared add-to-cart form is `apps/api/views/parts/add-to-cart.ejs` posting hidden `id` to `/cart`.
- Keep changes workspace-aware: root automation should use Turbo, app-specific behavior should be updated in `apps/api`.
