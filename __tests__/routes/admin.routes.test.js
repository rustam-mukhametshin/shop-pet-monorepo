jest.mock('../../controllers/admin.controller', () => ({
  getAddProduct: jest.fn(),
  postAddProduct: jest.fn(),
  getEditProduct: jest.fn(),
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
      { path: '/add-product', methods: ['get'] },
      { path: '/add-product', methods: ['post'] },
      { path: '/edit-product/:id', methods: ['get'] },
      { path: '/delete-product/:id', methods: ['get'] },
      { path: '/edit-product', methods: ['post'] },
      { path: '/products', methods: ['get'] },
    ]));
  });
});

