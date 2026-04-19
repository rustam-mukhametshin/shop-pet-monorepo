# AGENTS Guide

## Project Snapshot
- Current stack is `Node.js + Express 5 + EJS + TypeScript + Mongoose`.
- Runtime entry is `app.ts`; database bootstrap is `database.ts` (`mongoConnect`).
- Sessions use `express-session` + `connect-mongo` (Mongo-backed session store).
- CSRF protection uses `csrf-sync` (`csrfSynchronisedProtection` + `generateToken`).
- UI is server-rendered EJS with Bootstrap CDN + custom styles in `public/css/*.css`.
- CI uses GitHub Actions: `.github/workflows/build.yml` and `.github/workflows/test.yml`.

## Request Flow (`app.ts`)
1. `express.static('public')`
2. `express.urlencoded({ extended: true })`
3. `express-session` with `connect-mongo` store (`collectionName: 'sessions'`)
4. Global CSRF middleware: `csrfSynchronisedProtection`
5. Middleware loads user from `req.session.user._id` and assigns `req.user`
6. Locals middleware sets `res.locals.isLoggedIn` and `res.locals.csrfToken`
7. Mount routes in this order: `/admin` (with `isAuth`) -> `authRoutes` -> `shopRoutes`
8. Fallback `notFound` handler renders `views/404.ejs`
9. Error handler maps `EBADCSRFTOKEN` to HTTP 403 response
10. App listens only when `require.main === module` (safe to import in tests)

## Route Surface
- Admin (`routes/admin.routes.ts`):
  - `GET /admin/products`
  - `GET/POST /admin/add-product`
  - `GET /admin/edit-product/:id`
  - `POST /admin/edit-product`
  - `GET /admin/delete-product/:id`
- Shop (`routes/shop.routes.ts`):
  - `GET /`, `GET /products`, `GET /products/:id`
  - `GET /cart`, `POST /cart`, `GET /cart-delete-item/:id`
  - `GET /orders`, `POST /create-order`, `POST /order-delete-item`
- Auth (`routes/auth.routes.ts`):
  - `GET /login`, `POST /login`, `POST /logout`
  - `GET /signup`, `POST /signup`

## Data Model Conventions (Mongoose)
- `models/product.model.ts`: product document with `userId` ref to `User`.
- `models/user.model.ts`: owns cart state under `cart.items[]` with `{ productId, quantity }`.
- `models/order.model.ts`: order document with `products[]` entries `{ product, quantity }` + `userId`.
- Cart population pattern is nested populate from `User`: `cart.items.productId` (see `controllers/shop.controller.ts#getCart`).

## Controller Patterns
- Admin create/edit uses direct Mongoose document save (`new Product(...).save()`, `findById(...).save()`).
- Cart updates call model instance methods attached on `userSchema.methods` (`addToCart`, `deleteProductFromCart`, `clearCart`).
- Orders are created from the current user cart, then cart is cleared (`postCreateOrder` in `controllers/shop.controller.ts`).

## Dev Workflows
- Install: `npm install`
- Run app (TS): `npm run start:ts`
- Dev watch: `npm run start:ts-dev`
- Typecheck: `npm run typecheck`
- Build: `npm run build:ts`
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- CI (`build.yml`) runs `npm ci` then `npm run build:ts` on push/PR to `main` and `master`.

## Guardrails For Agents
- Keep `req.user` augmentation in `global.d.ts` aligned with `UserModel` usage in `app.ts`.
- Preserve the middleware ordering in `app.ts`; tests rely on 404 fallback behavior.
- Do not bypass `isAuth` for `/admin` routes; mount under `/admin` only.
- Every POST form must include hidden `_csrf` from `res.locals.csrfToken`.
- Keep session writes followed by `req.session.save()` before redirects in auth flows.
- Use Bootstrap-compatible markup in EJS views; shared add-to-cart form is `views/parts/add-to-cart.ejs` posting hidden `id` to `/cart`.
