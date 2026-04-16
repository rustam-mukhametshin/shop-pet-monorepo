const { getSignup, postSignup } = require('../../controllers/auth.controller.ts');

// Mock UserModel to avoid real DB connection
jest.mock('../../models/user.model', () => ({
  UserModel: { findById: jest.fn() },
}));

const mockReq = (overrides = {}) => ({
  session: { isLoggedIn: false },
  body: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.render = jest.fn();
  res.redirect = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe('auth.controller', () => {
  describe('getSignup', () => {
    it('renders shop/signup with correct locals', () => {
      const req = mockReq({ session: { isLoggedIn: false } });
      const res = mockRes();

      getSignup(req, res);

      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith('shop/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        isLoggedIn: false,
      });
    });

    it('passes isLoggedIn: true when session is active', () => {
      const req = mockReq({ session: { isLoggedIn: true } });
      const res = mockRes();

      getSignup(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/signup', expect.objectContaining({
        isLoggedIn: true,
      }));
    });
  });

  describe('postSignup', () => {
    it('redirects to /login after signup', () => {
      const req = mockReq({
        body: { name: 'Alice', email: 'alice@example.com', password: 'pass', confirmPassword: 'pass' },
      });
      const res = mockRes();

      postSignup(req, res);

      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('does not render a view — only redirects', () => {
      const req = mockReq({
        body: { name: 'Bob', email: 'bob@example.com', password: '123', confirmPassword: '123' },
      });
      const res = mockRes();

      postSignup(req, res);

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });
});
