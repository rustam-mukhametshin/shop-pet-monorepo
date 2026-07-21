jest.mock('../../controllers/admin.controller', () => ({
  postAddProduct: jest.fn(),
  deleteProduct: jest.fn(),
  postEditProduct: jest.fn(),
  getProducts: jest.fn(),
}));

const adminRoutes = require('../../routes/admin.routes.ts').default;

const getRouteMeta = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

describe('admin.routes', () => {
  it('registers all expected endpoints', () => {
    const routes = getRouteMeta(adminRoutes);

    expect(routes).toEqual(expect.arrayContaining([
      { path: '/delete-product/:id', methods: ['delete'] },
      { path: '/add-product', methods: ['post'] },
      { path: '/edit-product', methods: ['post'] },
      { path: '/products', methods: ['get'] },
    ]));
  });
});
