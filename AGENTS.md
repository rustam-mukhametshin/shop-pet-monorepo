# AGENTS Guide

## Project Snapshot
- Current stack is `Node.js + Express 5 + EJS + TypeScript + Mongoose`.
- Runtime entry is `app.ts`; database bootstrap is `database.ts` (`mongoConnect`).
- UI is server-rendered EJS with Bootstrap CDN + custom styles in `public/css/*.css`.
- CI build is GitHub Actions in `.github/workflows/build.yml`.

## Request Flow (`app.ts`)
1. `express.static('public')`
2. `express.urlencoded({ extended: true })`
3. Middleware loads a fixed Mongo user by id and assigns `req.user`
4. Mount `/admin` routes, then shop routes
5. Fallback `notFound` handler renders `views/404.ejs`
6. App listens only when `require.main === module` (safe to import in tests)

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
- Existing code contains legacy/transition snippets (commented blocks and mixed query style); follow active Mongoose paths used by controllers.
- Use Bootstrap-compatible markup in EJS views; shared add-to-cart form is `views/parts/add-to-cart.ejs` posting hidden `id` to `/cart`.
