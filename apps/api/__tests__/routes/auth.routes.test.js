jest.mock('../../controllers/auth.controller', () => ({
  postLogin: jest.fn(),
  postLoginWithTwoFa: jest.fn(),
  postSignup: jest.fn(),
  getStatus: jest.fn(),
  getProfile: jest.fn(),
  get2FA: jest.fn(),
  postReset: jest.fn(),
  getResetPassword: jest.fn(),
  postResetPassword: jest.fn(),
  putProfile: jest.fn(),
  webAuthnRegisterOptions: jest.fn(),
  webAuthnRegisterVerify: jest.fn(),
  webAuthnAuthenticateOptions: jest.fn(),
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
      { path: '/login-twofa', methods: ['post'] },
      { path: '/signup', methods: ['post'] },
      { path: '/status', methods: ['get'] },
      { path: '/profile', methods: ['get'] },
      { path: '/2fa', methods: ['get'] },
      { path: '/profile', methods: ['put'] },
      { path: '/reset', methods: ['post'] },
      { path: '/reset-password', methods: ['get'] },
      { path: '/reset-password', methods: ['post'] },
      { path: '/webauthn/register/options', methods: ['post'] },
      { path: '/webauthn/register/verify', methods: ['post'] },
      { path: '/webauthn/authenticate/options', methods: ['post'] },
    ]));
  });
});
