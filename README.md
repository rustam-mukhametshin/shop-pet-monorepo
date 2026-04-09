# Node Course Shop (TypeScript + MongoDB)

Developer guide for running and working on this project.

## Stack
- Node.js + Express 5
- EJS templates
- TypeScript
- MongoDB (`mongodb` driver)
- Bootstrap 5 (CDN in `views/parts/head.ejs`)

## Project Entry Points
- App entry: `app.ts`
- DB connection: `database.ts`
- Main startup path for development: `npm run start:ts`

> Note: `package.json` still contains legacy scripts pointing to `app.js`; current active runtime is `app.ts`.

## Prerequisites
- Node.js and npm installed
- Network access to MongoDB Atlas (or your own Mongo URI)

## Environment Variables
Create a `.env` file or export variables in your shell:

- `MONGO_URI` (optional)
  - If not set, `database.ts` uses the default Atlas URI in code.

Example (zsh):
```zsh
export MONGO_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0"
```

## Install Dependencies
```zsh
npm install
```

## Run the Project
Recommended (TypeScript runtime):
```zsh
npm run start:ts
```

Watch mode:
```zsh
npm run start:ts-dev
```

Type-check only:
```zsh
npm run typecheck
```

Build TypeScript:
```zsh
npm run build:ts
```

## Testing
Run all tests:
```zsh
npm test
```

Watch mode:
```zsh
npm run test:watch
```

Coverage:
```zsh
npm run test:coverage
```

Notes:
- Jest uses a custom TS transformer: `jest.ts-transformer.js`
- Test bootstrap file: `jest.setup.js`
- `__tests__/app.test.js` checks unknown route returns `404`

## Request Flow (High Level)
1. Static files from `public/`
2. `express.urlencoded`
3. User middleware loads fixed user (`69d25d8b7a2150418bf5eb67`) and attaches `req.user`
4. `/admin` routes, then shop routes
5. `notFound` handler renders `views/404.ejs`

## Important Routes
### Admin
- `GET /admin/products`
- `GET /admin/add-product`
- `POST /admin/add-product`
- `GET /admin/edit-product/:id`
- `POST /admin/edit-product`
- `GET /admin/delete-product/:id`

### Shop
- `GET /`
- `GET /products`
- `GET /products/:id`
- `GET /cart`
- `POST /cart`
- `GET /cart-delete-item/:id`
- `GET /orders`
- `POST /create-order`
- `POST /order-delete-item`

## Common Pitfalls
- `ObjectId` throws on invalid IDs; validate/sanitize before `new ObjectId(...)`.
- `getDb()` throws until `mongoConnect` runs.
- Navigation active-link checks depend on exact `url` strings in `views/parts/navigation.ejs`.
- `global.d.ts` request typing should stay aligned with `UserModel` export usage.

## UI Notes
- Bootstrap is globally included.
- Product list pages (`views/shop/index.ejs`, `views/shop/product-list.ejs`, `views/admin/products.ejs`) use Bootstrap card grids.
- Cart and orders pages use Bootstrap card/list-group layouts.

