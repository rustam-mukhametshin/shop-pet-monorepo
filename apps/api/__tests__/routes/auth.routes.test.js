jest.mock('../../controllers/auth.controller', () => ({
  postLogin: jest.fn(),
  getLogout: jest.fn(),
  postSignup: jest.fn(),
  getStatus: jest.fn(),
  getReset: jest.fn(),
  postReset: jest.fn(),
  getResetPassword: jest.fn(),
  postResetPassword: jest.fn(),
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
      { path: '/login', methods: ['post'] },
      { path: '/logout', methods: ['get'] },
      { path: '/signup', methods: ['post'] },
      { path: '/status', methods: ['get'] },
      { path: '/reset', methods: ['get'] },
      { path: '/reset', methods: ['post'] },
      { path: '/reset-password', methods: ['get'] },
      { path: '/reset-password', methods: ['post'] },
    ]));
  });
});

