jest.mock('../../controllers/shop.controller', () => ({
  getIndex: jest.fn(),
  getProducts: jest.fn(),
  getProduct: jest.fn(),
  getCart: jest.fn(),
  getCheckout: jest.fn(),
  getCheckoutSuccess: jest.fn(),
  getOrders: jest.fn(),
  getInvoice: jest.fn(),
  postAddProduct: jest.fn(),
  postAddProductToCart: jest.fn(),
  postCartDeleteProduct: jest.fn(),
  postDeleteOrderItem: jest.fn(),
  patchProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

const shopRoutes = require('../../routes/shop.routes.ts').default;

const getRouteMeta = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

describe('shop.routes', () => {
  it('registers all expected endpoints', () => {
    const routes = getRouteMeta(shopRoutes);

    expect(routes).toEqual(expect.arrayContaining([
      { path: '/products', methods: ['get'] },
      { path: '/products/:id', methods: ['get'] },
      { path: '/cart', methods: ['get'] },
      { path: '/cart', methods: ['post'] },
      { path: '/cart-delete-item/:id', methods: ['get'] },
      { path: '/checkout', methods: ['get'] },
      { path: '/checkout/success', methods: ['get'] },
      { path: '/orders', methods: ['get'] },
      { path: '/add-product', methods: ['post'] },
      { path: '/order-delete-item', methods: ['post'] },
      { path: '/invoices/:orderId', methods: ['get'] },
      { path: '/products/:id', methods: ['delete'] },
      { path: '/', methods: ['get'] },
    ]));
  });
});
