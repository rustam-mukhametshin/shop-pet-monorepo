const mockSave = jest.fn();
const mockFindOne = jest.fn();

jest.mock('../../models/user.model', () => {
  const UserModel = jest.fn().mockImplementation(() => ({
    save: mockSave,
  }));
  UserModel.findById = jest.fn();
  UserModel.findOne = mockFindOne;
  return { UserModel };
});

const { UserModel } = require('../../models/user.model');
const { getSignup, postSignup } = require('../../controllers/auth.controller.ts');

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

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue({ _id: 'new-user-id' });
  mockFindOne.mockResolvedValue(null);
});

describe('auth.controller', () => {
  describe('getSignup', () => {
    it('renders auth/signup with correct locals', () => {
      const req = mockReq({ session: { isLoggedIn: false } });
      const res = mockRes();

      getSignup(req, res);

      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        isLoggedIn: false,
        errorMessage: false,
      });
    });
  });

  describe('postSignup', () => {
    it('creates and saves a new user for valid input', async () => {
      const req = mockReq({
        body: { email: 'alice@example.com', password: 'pass', confirmPassword: 'pass' },
      });
      const res = mockRes();

      await postSignup(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'alice@example.com' });
      expect(UserModel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'alice',
        email: 'alice@example.com',
      }));
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('returns 422 and renders signup when required fields are missing', async () => {
      const req = mockReq({ body: { email: '', password: '', confirmPassword: '' } });
      const res = mockRes();

      await postSignup(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.render).toHaveBeenCalledWith('auth/signup', expect.objectContaining({
        errorMessage: 'Email and password are required.',
      }));
    });
  });
});
