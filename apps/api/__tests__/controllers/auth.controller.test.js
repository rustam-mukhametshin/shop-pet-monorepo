const mockUserSave = jest.fn();
const mockTokenSave = jest.fn();

const mockFindOne = jest.fn();
const mockIsValidEmail = jest.fn();
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
const mockJwtSign = jest.fn();

jest.mock('../../models/user.model', () => {
  const UserModel = jest.fn().mockImplementation(() => ({
    save: mockUserSave,
  }));
  UserModel.findOne = mockFindOne;
  UserModel.isValidEmail = mockIsValidEmail;
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

jest.mock('jsonwebtoken', () => ({
  sign: (...args) => mockJwtSign(...args),
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
  postLogin,
  getLogout,
  postSignup,
  getStatus,
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
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';

  mockCompareSync.mockReturnValue(true);
  mockHash.mockResolvedValue('hashed-value');
  mockJwtSign.mockReturnValue('jwt-token');

  mockSendWelcomeEmail.mockResolvedValue(undefined);
  mockCreateResetPasswordToken.mockReturnValue('token-1');
  mockSendResetPasswordEmail.mockResolvedValue(undefined);
  mockGetResetPasswordTokenLink.mockReturnValue('https://example.com/reset?token=token-1');
  mockVerifyResetPasswordToken.mockReturnValue({ email: 'john@example.com' });

  mockUserSave.mockResolvedValue({ _id: 'new-user-id', email: 'john@example.com', name: 'john' });
  mockTokenSave.mockResolvedValue({ _id: 'token-id' });
  mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

  mockFindOne.mockResolvedValue(null);
  mockIsValidEmail.mockReturnValue(true);
  mockIsUserExistByEmail.mockResolvedValue(null);
  mockGetUserByEmail.mockResolvedValue({ _id: 'user-id', email: 'john@example.com' });
  mockValidationResult.mockReturnValue({
    isEmpty: () => true,
    array: () => [],
  });
});

describe('auth.controller', () => {
  describe('postLogin', () => {
    it('returns 422 json when validator returns errors', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email or password' }],
      });
      const req = mockReq({ body: { email: '', password: '' } });
      const res = mockRes();

      await postLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: ['Invalid email or password'],
      });
    });

    it('returns 422 json when password does not match', async () => {
      mockCompareSync.mockReturnValue(false);
      const user = { _id: 'u1', id: 'u1', email: 'john@example.com', password: 'hashed' };
      mockFindOne.mockResolvedValue(user);
      const req = mockReq({ body: { email: 'john@example.com', password: 'wrong-password' } });
      const res = mockRes();

      await postLogin(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Incorrect user or password',
      });
    });

    it('returns token payload json for valid credentials', async () => {
      const user = { _id: 'u1', id: 'u1', email: 'john@example.com', password: 'hashed' };
      mockFindOne.mockResolvedValue(user);
      const req = mockReq({ body: { email: 'john@example.com', password: '123456' } });
      const res = mockRes();

      await postLogin(req, res);

      expect(mockJwtSign).toHaveBeenCalledWith({ id: 'u1' }, 'test-secret', { expiresIn: '1h' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        userId: 'u1',
        message: 'Login successfully',
        token: 'jwt-token',
      });
    });
  });

  describe('postSignup', () => {
    it('returns 422 json when validator returns errors', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'All fields are required.' }],
      });
      const req = mockReq({ body: { email: '', password: '', confirmPassword: '' } });
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: ['All fields are required.'],
      });
    });

    it('returns 422 json when user already exists', async () => {
      mockIsUserExistByEmail.mockResolvedValue({ _id: 'existing-user-id' });
      const req = mockReq({
        body: { email: 'john@example.com', password: '123456', confirmPassword: '123456' },
      });
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(UserModel.isUserExistByEmail).toHaveBeenCalledWith('john@example.com');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User or password are incorrect',
      });
    });

    it('creates a user and returns 201 json for valid payload', async () => {
      const savedUser = { _id: 'u1', email: 'john@example.com', name: 'john' };
      mockUserSave.mockResolvedValue(savedUser);
      const req = mockReq({
        body: { email: 'john@example.com', password: '123456', confirmPassword: '123456' },
      });
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(UserModel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'john',
        email: 'john@example.com',
      }));
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith('john@example.com', 'john');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
      });
    });
  });

  describe('getStatus', () => {
    it('returns success json', () => {
      const req = mockReq();
      const res = mockRes();

      getStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
      });
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
