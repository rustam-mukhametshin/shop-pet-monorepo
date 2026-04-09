# AGENTS Guide

## Project Snapshot
- Stack: Node.js + Express 5 + EJS + TypeScript + MongoDB (`mongodb` driver).
- UI: Bootstrap 5 CDN is loaded globally in `views/parts/head.ejs`; custom CSS still overrides `.btn` and `.card` in `public/css/main.css`.
- Runtime entry: `app.ts` (no active CommonJS app file in root right now).
- DB entry: `database.ts` in project root (`mongoConnect`, `getDb`), not `util/database.ts`.

## Request Flow (app.ts)
1. Static assets from `public/`.
2. `express.urlencoded` body parser.
3. User middleware: loads fixed user `69d25d8b7a2150418bf5eb67` and attaches `req.user` as `new UserModel(...)`.
4. Routes: `/admin` router, then shop router, then `notFound` 404 renderer.
5. Server starts only when `require.main === module`; importing `app.ts` in tests does not auto-listen.

## Current Route Surface
- Admin (`routes/admin.routes.ts`):
  - `GET /admin/products`, `GET/POST /admin/add-product`, `GET /admin/edit-product/:id`, `POST /admin/edit-product`, `GET /admin/delete-product/:id`.
- Shop (`routes/shop.routes.ts`):
  - `GET /`, `GET /products`, `GET /products/:id`
  - `GET /cart`, `POST /cart`, `GET /cart-delete-item/:id`
  - `GET /orders`, `POST /create-order`, `POST /order-delete-item`.

## Data / Model Conventions
- `BaseModel` (`models/base.model.ts`) provides `getCollection()` and static `collection(name)` wrappers over `getDb()`.
- `Product` (`models/product.model.ts`) maps Mongo `_id` -> `id` on reads and stores `userId` in docs.
- `UserModel` (`models/user.model.ts`) owns cart/order logic:
  - per-user: `addToCart`, `getCart`, `deleteProductFromCart`, `createOrder`, `getOrders`, `deleteProductFromOrder(productId, orderId?)`.
  - admin/global cleanup: `removeProductFromAllOrders(productId)`, `removeProductFromAllCarts(productId)`.
- Admin product deletion flow (`controllers/admin.controller.ts`) must remain: remove from all orders -> remove from all carts -> delete product.

## View / UI Conventions
- Shared partial order: `head` -> `head-end` -> `body` -> `navigation` -> page content -> `body-end`.
- Product listing pages (`views/shop/index.ejs`, `views/shop/product-list.ejs`, `views/admin/products.ejs`) are Bootstrap card grids.
- Cart and orders pages are Bootstrap card/list-group layouts with POST forms for actions.
- Shared add-to-cart form is in `views/parts/add-to-cart.ejs` and posts hidden `id` to `/cart`.

## Testing & Tooling
- Commands:
  - `npm run start:ts`
  - `npm run typecheck`
  - `npm test`, `npm run test:watch`, `npm run test:coverage`
- Jest setup is custom TypeScript transform (`jest.ts-transformer.js`) + `jest.setup.js`.
- Existing test `__tests__/app.test.js` asserts unknown route returns 404; if middleware throws before `next()`, this test fails with 500.

## Known Pitfalls / Guardrails
- ObjectId creation throws on invalid IDs; validate/sanitize before `new ObjectId(...)`.
- `getDb()` throws until `mongoConnect` runs; middleware code must tolerate no-DB test runs.
- Navigation active links depend on exact `url` strings; some checks include trailing spaces in `views/parts/navigation.ejs`.
- `global.d.ts` currently imports default `User` from `./models/user.model`; keep request augmentation aligned with actual `UserModel` export when refactoring.
