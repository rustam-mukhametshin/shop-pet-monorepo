const mockUserSave = jest.fn();
const mockTokenSave = jest.fn();

const mockFindOne = jest.fn();
const mockIsValidEmail = jest.fn();
const mockIsPasswordLengthIsOk = jest.fn();
const mockIsUserExistByEmail = jest.fn();
const mockGetUserByEmail = jest.fn();

const mockCompareSync = jest.fn();
const mockHash = jest.fn();
const mockValidationResult = jest.fn();

const mockSendWelcomeEmail = jest.fn();
const mockCreateResetPasswordToken = jest.fn();
const mockSendResetPasswordEmail = jest.fn();
const mockGetResetPasswordTokenLink = jest.fn();
const mockVerifyResetPasswordToken = jest.fn();

const mockDeleteOne = jest.fn();

jest.mock('../../models/user.model', () => {
  const UserModel = jest.fn().mockImplementation(() => ({
    save: mockUserSave,
  }));
  UserModel.findOne = mockFindOne;
  UserModel.isValidEmail = mockIsValidEmail;
  UserModel.isPasswordLengthIsOk = mockIsPasswordLengthIsOk;
  UserModel.isUserExistByEmail = mockIsUserExistByEmail;
  UserModel.getUserByEmail = mockGetUserByEmail;
  return { UserModel };
});

jest.mock('bcryptjs', () => ({
  compareSync: (...args) => mockCompareSync(...args),
  hash: (...args) => mockHash(...args),
}));

jest.mock('express-validator', () => ({
  validationResult: (...args) => mockValidationResult(...args),
}));

jest.mock('../../models/node-mail.model', () => ({
  NodeMailModel: {
    sendWelcomeEmail: (...args) => mockSendWelcomeEmail(...args),
    createResetPasswordToken: (...args) => mockCreateResetPasswordToken(...args),
    sendResetPasswordEmail: (...args) => mockSendResetPasswordEmail(...args),
    getResetPasswordTokenLink: (...args) => mockGetResetPasswordTokenLink(...args),
    verifyResetPasswordToken: (...args) => mockVerifyResetPasswordToken(...args),
  },
}));

jest.mock('../../models/token.model', () => {
  const TokenModel = jest.fn().mockImplementation(() => ({
    save: mockTokenSave,
  }));
  TokenModel.deleteOne = (...args) => mockDeleteOne(...args);
  return { TokenModel };
});

const { UserModel } = require('../../models/user.model');
const { TokenModel } = require('../../models/token.model');
const {
  getLogin,
  postLogin,
  getLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getResetPassword,
  postResetPassword,
} = require('../../controllers/auth.controller.ts');

const mockReq = (overrides = {}) => ({
  session: {
    isLoggedIn: false,
    save: jest.fn((cb) => (cb ? cb() : undefined)),
    destroy: jest.fn((cb) => (cb ? cb() : undefined)),
  },
  body: {},
  query: {},
  flash: jest.fn(() => []),
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
  mockIsValidEmail.mockReturnValue(true);
  mockIsPasswordLengthIsOk.mockReturnValue(true);
  mockCompareSync.mockReturnValue(true);
  mockHash.mockResolvedValue('hashed-value');
  mockSendWelcomeEmail.mockResolvedValue(undefined);
  mockCreateResetPasswordToken.mockReturnValue('token-1');
  mockSendResetPasswordEmail.mockResolvedValue(undefined);
  mockGetResetPasswordTokenLink.mockReturnValue('https://example.com/reset?token=token-1');
  mockVerifyResetPasswordToken.mockReturnValue({ email: 'john@example.com' });
  mockUserSave.mockResolvedValue({ _id: 'new-user-id', email: 'john@example.com', name: 'john' });
  mockTokenSave.mockResolvedValue({ _id: 'token-id' });
  mockDeleteOne.mockResolvedValue({ deletedCount: 1 });
  mockFindOne.mockResolvedValue(null);
  mockIsUserExistByEmail.mockResolvedValue(null);
  mockGetUserByEmail.mockResolvedValue({ _id: 'user-id', email: 'john@example.com' });
  mockValidationResult.mockReturnValue({
    isEmpty: () => true,
    array: () => [],
  });
});

describe('auth.controller', () => {
  describe('getLogin', () => {
    it('renders login view with flash errors', () => {
      const req = mockReq({ flash: jest.fn(() => ['Login failed']) });
      const res = mockRes();

      getLogin(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        pageTitle: 'Login',
        url: '/login',
        errorMessage: ['Login failed'],
      });
    });
  });

  describe('postLogin', () => {
    it('renders login with 422 when validator returns errors', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email or password' }],
      });
      const req = mockReq({ body: { email: '', password: '' } });
      const res = mockRes();

      await postLogin(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', ['Invalid email or password']);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.render).toHaveBeenCalledWith('auth/login', {
        pageTitle: 'Login',
        url: '/login',
        errorMessage: ['Invalid email or password'],
      });
    });

    it('redirects to admin products for valid credentials', async () => {
      const user = { _id: 'u1', email: 'john@example.com', password: 'hashed' };
      mockFindOne.mockResolvedValue(user);
      const req = mockReq({ body: { email: 'john@example.com', password: '123456' } });
      const res = mockRes();

      await postLogin(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(req.session.user).toBe(user);
      expect(req.session.isLoggedIn).toBe(true);
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('getLogout', () => {
    it('destroys session and redirects to home', () => {
      const req = mockReq();
      const res = mockRes();

      getLogout(req, res);

      expect(req.session.destroy).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getSignup', () => {
    it('renders signup view with expected locals', () => {
      const req = mockReq();
      const res = mockRes();

      getSignup(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        errorMessage: false,
      });
    });
  });

  describe('postSignup', () => {
    it('renders signup with 422 when required fields are missing', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'All fields are required.' }],
      });
      const req = mockReq({ body: { email: '', password: '', confirmPassword: '' } });
      const res = mockRes();

      await postSignup(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', ['All fields are required.']);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.render).toHaveBeenCalledWith('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        errorMessage: ['All fields are required.'],
      });
    });

    it('renders signup with 422 when password mismatch is reported by validator', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Passwords have to match!' }],
      });
      const req = mockReq({
        body: { email: 'john@example.com', password: '123456', confirmPassword: '654321' },
      });
      const res = mockRes();

      await postSignup(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', ['Passwords have to match!']);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.render).toHaveBeenCalledWith('auth/signup', {
        pageTitle: 'Sign Up',
        url: '/signup',
        errorMessage: ['Passwords have to match!'],
      });
    });

    it('creates a user, logs in and sends welcome email when signup is valid', async () => {
      const savedUser = { _id: 'u1', email: 'john@example.com', name: 'john' };
      mockIsUserExistByEmail.mockResolvedValue(null);
      mockUserSave.mockResolvedValue(savedUser);
      const req = mockReq({
        body: { email: 'john@example.com', password: '123456', confirmPassword: '123456' },
      });
      const res = mockRes();

      await postSignup(req, res);

      expect(UserModel.isUserExistByEmail).toHaveBeenCalledWith('john@example.com');
      expect(UserModel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'john',
        email: 'john@example.com',
      }));
      expect(req.session.user).toBe(savedUser);
      expect(req.session.isLoggedIn).toBe(true);
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith('john@example.com', 'john');
    });
  });

  describe('getReset', () => {
    it('renders reset page with flash errors', () => {
      const req = mockReq({ flash: jest.fn(() => ['Invalid token']) });
      const res = mockRes();

      getReset(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/reset', {
        pageTitle: 'Reset Password',
        url: '/reset',
        errorMessage: ['Invalid token'],
      });
    });
  });

  describe('postReset', () => {
    it('rejects reset request for invalid email', async () => {
      mockIsValidEmail.mockReturnValue(false);
      const req = mockReq({ body: { email: 'wrong-email' } });
      const res = mockRes();

      await postReset(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', 'Invalid email format');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledWith('/reset');
    });

    it('creates token record and sends reset email for existing user', async () => {
      const req = mockReq({ body: { email: 'john@example.com' } });
      const res = mockRes();

      await postReset(req, res);

      expect(UserModel.getUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(TokenModel).toHaveBeenCalledWith({
        userId: 'user-id',
        token: 'token-1',
      });
      expect(mockTokenSave).toHaveBeenCalledTimes(1);
      expect(mockSendResetPasswordEmail).toHaveBeenCalledWith(
        'john@example.com',
        'https://example.com/reset?token=token-1',
      );
      expect(req.flash).toHaveBeenCalledWith('success', 'Success. Check your email');
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getResetPassword', () => {
    it('redirects to reset when token payload is invalid', () => {
      mockVerifyResetPasswordToken.mockReturnValue(null);
      const req = mockReq({ query: { token: 'bad-token' } });
      const res = mockRes();

      getResetPassword(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', 'Invalid token');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.redirect).toHaveBeenCalledWith('/reset');
    });

    it('renders reset-password page for valid token payload', () => {
      mockVerifyResetPasswordToken.mockReturnValue({ email: 'john@example.com' });
      const req = mockReq({ query: { token: 'good-token' }, flash: jest.fn(() => []) });
      const res = mockRes();

      getResetPassword(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/reset-password', {
        pageTitle: 'Reset Password',
        url: '/reset-password',
        errorMessage: [],
        _email: 'john@example.com',
        _token: 'good-token',
      });
    });
  });

  describe('postResetPassword', () => {
    it('redirects to reset-password when user does not exist', async () => {
      mockFindOne.mockResolvedValue(null);
      const req = mockReq({
        body: { password: '123456', confirmPassword: '123456', _email: 'nope@example.com', _token: 't1' },
      });
      const res = mockRes();

      await postResetPassword(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', 'Unable to find user');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.redirect).toHaveBeenCalledWith('/reset-password');
    });

    it('updates user password, deletes token and redirects to login', async () => {
      const user = {
        password: 'old',
        confirmPassword: 'old',
        save: jest.fn().mockResolvedValue({ _id: 'u1' }),
      };
      mockFindOne.mockResolvedValue(user);
      mockHash.mockResolvedValueOnce('hashed-password').mockResolvedValueOnce('hashed-confirm-password');
      const req = mockReq({
        body: { password: '123456', confirmPassword: '123456', _email: 'john@example.com', _token: 't1' },
      });
      const res = mockRes();

      await postResetPassword(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(user.password).toBe('hashed-password');
      expect(user.confirmPassword).toBe('hashed-confirm-password');
      expect(user.save).toHaveBeenCalledTimes(1);
      expect(mockDeleteOne).toHaveBeenCalledWith({ token: 't1' });
      expect(req.flash).toHaveBeenCalledWith('success', 'Success. Password reset successfully');
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });
});
