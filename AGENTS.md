# AGENTS Guide

## Project Snapshot
- **Stack**: Node.js + Express 5 + EJS templates + TypeScript + Sequelize ORM + MySQL
- **Runtimes**: 
  - CommonJS (original): `npm start` → `app.js` on port 3333
  - TypeScript: `npm run start:ts` → `app.ts` via `ts-node`
- **Database**: MySQL (Sequelize ORM) — see `util/database.ts` for connection config
- **Persistence**: File-based fallback for cart (`data/cart.json`); products via Sequelize models
- **Author**: Rustam

## Architecture (How Requests Flow)
Both `app.js` (CommonJS) and `app.ts` (TypeScript) share identical middleware order:
1. Static assets (`public/`)
2. `express.urlencoded` body parsing
3. Middleware: Attach user from DB to `req.user` (fixture: user ID 1)
4. Routes: `/admin/*` → admin routes → shop routes → 404 handler

**Route layers** (available in both `.js` and `.ts` versions):
- Admin CRUD: `routes/admin.routes.[js|ts]` → `controllers/admin.controller.[js|ts]`
  - `GET /admin/products` — list all
  - `GET /admin/add-product` — form (render)
  - `POST /admin/add-product` — create via `Product.create()`
  - `GET /admin/edit-product/:id` — form with `?edit=true` query
  - `POST /admin/edit-product` — update via `product.save()`
  - `GET /admin/delete-product/:id` — delete via `product.destroy()`

- Shop/cart: `routes/shop.routes.[js|ts]` → `controllers/shop.controller.[js|ts]`
  - `GET /` — index (list products)
  - `GET /products` — product list
  - `GET /products/:id` — product detail
  - `GET /cart` — cart page (joins cart entries with product data)
  - `POST /cart` — add to cart via `CartModel.addProduct()`
  - `GET /cart-delete-item/:id` — remove item via `CartModel.deleteProduct()`
  - `GET /orders`, `GET /checkout` — placeholder views

**Models** (Sequelize ORM, shared between JS/TS):
- `User` — authentication fixture; `{ id, username, email, password, role, firstName, lastName, ... }`
- `Product` — `{ id, title, price, imageUrl, description, userId }`; belongs to User
- `Cart` — `{ id, products: [{id, quantity}], totalPrice, userId }`; one-per-user
- `CartModel` class (file-based hybrid) — `addProduct()`, `deleteProduct()`, `getCart()` (for fallback JSON reads)

## Data Contracts and Cross-Component Coupling
- **Product shape**: `{ id, title, imageUrl, description, price }` (matches Sequelize model)
- **Cart shape**: `{ products: [{id, quantity}], totalPrice }`
- **User on Request**: `Express.Request.user` augmented via `types/global.d.ts` (TypeScript) as `UserAttributes`
- **Admin edit mode**: Query string `?edit=true` in `getEditProduct()` toggles edit form
- **Navigation highlighting**: Depends on exact `url` string passed from controller (e.g., `/products` vs `/products `)
- **Product deletion**: Cascades to user's cart via Sequelize `onDelete: 'CASCADE'`

## TypeScript / CommonJS Dual Mode
- **Both work**: Original `.js` files remain untouched; TypeScript `.ts` files are new parallel implementations
- **Imports**: TS files use `import/export`; JS files use `require/module.exports`
- **Runtime**: `ts-node` executes `.ts` directly without compilation step
- **Build**: `npm run build:ts` compiles TypeScript to `dist/` via `tsconfig.build.json`
- **Type checking**: `npm run typecheck` validates without emitting
- **Global augmentation**: `types/global.d.ts` extends `Express.Request` with `user` property (only affects TS)

## Working Conventions in This Repo
- **Model methods**: All Sequelize models use async/Promise-based methods (`create()`, `findByPk()`, `findAll()`, `save()`, `destroy()`)
- **Forms**: POST/GET via hidden fields for IDs (e.g., `views/parts/add-to-cart.ejs` posts product `id`)
- **Deletes**: GET-driven routes (`/admin/delete-product/:id`, `/cart-delete-item/:id`); preserve unless refactoring routes + forms together
- **Template partials**: Consistent order: `head` → `head-end` → `body` → `navigation` → page content → `body-end`
- **Param casting** (TypeScript): Use `as string` casts for `req.params[key]` and `req.query[key]` when passing to Sequelize (which expects `Identifier`, not `string[]`)

## Developer Workflows

### CommonJS (Original)
```bash
npm install              # install dependencies
npm start                # run app.js with nodemon
npm run start-dev        # run app.js with --inspect for debugging
npm run typecheck        # validate TypeScript files without emitting
```

### TypeScript (New)
```bash
npm install              # ensures ts-node is installed
npm run start:ts         # run app.ts once via ts-node (no watch)
npm run start:ts-dev     # run app.ts with nodemon + ts-node (watch mode)
npm run build:ts         # compile all .ts to dist/ (excludes .js)
npm run typecheck        # validate TS before running
```

### Testing (Jest)
```bash
npm test                 # run all tests
npm run test:watch      # watch mode
npm run test:coverage   # coverage report
```

## File Structure (Both Formats Available)
```
app.js                   # CommonJS entry (original)
app.ts                   # TypeScript entry (new)
util/
  database.js           # CommonJS Sequelize config
  database.ts           # TypeScript Sequelize config
models/
  product.model.js      # CommonJS Sequelize model
  product.model.ts      # TypeScript Sequelize model (with interfaces)
  cart.model.js         # CommonJS CartModel + Cart model
  cart.model.ts         # TypeScript CartModel + Cart model (typed CartItem, CartData)
  user.model.js         # CommonJS User model
  user.model.ts         # TypeScript User model (with UserAttributes interface)
controllers/
  admin.controller.js   # CommonJS controllers
  admin.controller.ts   # TypeScript controllers (typed Request/Response)
  shop.controller.js    # CommonJS controllers
  shop.controller.ts    # TypeScript controllers
  public.controller.js  # CommonJS 404 handler
  public.controller.ts  # TypeScript 404 handler
routes/
  admin.routes.js       # CommonJS router
  admin.routes.ts       # TypeScript router (named imports)
  shop.routes.js        # CommonJS router
  shop.routes.ts        # TypeScript router
types/
  global.d.ts          # Express.Request augmentation (user property)
```

## Known Pitfalls / Agent Guardrails
- **Sequelize Identifier type**: `req.params.id` is `string | string[]`; Sequelize's `findByPk()` expects `Identifier` (single value). Always cast: `req.params.id as string`
- **Triple-slash directive**: `app.ts` uses `/// <reference path="./types/global.d.ts" />` to ensure TypeScript includes ambient declarations at runtime
- **Async file writes**: `CartModel.deleteProduct()` writes to `data/cart.json` async without transactions; avoid parallel mutations
- **Module resolution**: `ts-node` may not auto-load `.d.ts` files from glob; use triple-slash refs or explicit imports
- **Database path**: `util/database.ts` uses `require.main?.filename` as root; keep relative to project root
- **Navigation highlighting**: Some templates check exact `url` string matches including trailing spaces (e.g., `'/products '`); bugs may appear if refactoring controller URL assignments
- **User fixture**: Middleware assumes user ID `1` exists; creates it on first sync if missing

## Integration Points
- **Sequelize → MySQL**: `util/database.ts` creates connection; all models initialized via `sequelize.define()` or `Model.init()`
- **User middleware**: Every request loads user from DB and attaches to `req.user` (async, blocks until DB query completes)
- **Cart display**: `ShopController.getCart()` manually joins cart entries with product data via `ProductModel.findAll()`
- **Associations**: `Product` belongs to `User`, `User` has many `Product`; `Cart` belongs to `User`, `User` has one `Cart` (Sequelize handles cascades)


