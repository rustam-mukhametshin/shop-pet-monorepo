jest.mock('../../controllers/auth.controller', () => ({
  getLogin: jest.fn(),
  postLogin: jest.fn(),
  getLogout: jest.fn(),
  getSignup: jest.fn(),
  postSignup: jest.fn(),
}));

const authRoutes = require('../../routes/auth.routes.ts').default;

const getRouteMeta = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

describe('auth.routes', () => {
  it('registers all expected endpoints', () => {
    const routes = getRouteMeta(authRoutes);

    expect(routes).toEqual(expect.arrayContaining([
      { path: '/login', methods: ['get'] },
      { path: '/login', methods: ['post'] },
      { path: '/logout', methods: ['get'] },
      { path: '/signup', methods: ['get'] },
      { path: '/signup', methods: ['post'] },
    ]));
  });
});

