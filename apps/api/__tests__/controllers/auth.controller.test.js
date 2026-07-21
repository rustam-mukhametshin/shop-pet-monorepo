const mockUserSave = jest.fn();
const mockFindOne = jest.fn();
const mockIsValidEmail = jest.fn();
const mockIsUserExistByEmail = jest.fn();
const mockGetUserByEmail = jest.fn();

const mockProfileSave = jest.fn();
const mockProfileFindOne = jest.fn();

const mockCompareSync = jest.fn();
const mockHash = jest.fn();
const mockValidationResult = jest.fn();
const mockJwtSign = jest.fn();

const mockSendWelcomeEmail = jest.fn();
const mockCreateResetPasswordToken = jest.fn();
const mockSendResetPasswordEmail = jest.fn();
const mockGetResetPasswordTokenLink = jest.fn();
const mockVerifyResetPasswordToken = jest.fn();

jest.mock('../../models/user.model', () => {
  const UserModel = jest.fn().mockImplementation(() => ({
    save: mockUserSave,
  }));
  UserModel.findOne = mockFindOne;
  UserModel.isValidEmail = mockIsValidEmail;
  UserModel.isUserExistByEmail = mockIsUserExistByEmail;
  UserModel.getUserByEmail = mockGetUserByEmail;
  return {UserModel};
});

jest.mock('../../models/profile.model', () => {
  const ProfileModel = jest.fn().mockImplementation(() => ({
    save: mockProfileSave,
  }));
  ProfileModel.findOne = mockProfileFindOne;
  return {ProfileModel};
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

jest.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: jest.fn(),
  generateRegistrationOptions: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
}));

jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verify: jest.fn(),
}));

const {UserModel} = require('../../models/user.model');
const {ProfileModel} = require('../../models/profile.model');
const {
  postLogin,
  postSignup,
  getStatus,
  postReset,
  getResetPassword,
  postResetPassword,
} = require('../../controllers/auth.controller.ts');

const mockReq = (overrides = {}) => ({
  body: {},
  query: {},
  user: {userId: 'u1', status: 'active'},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.redirect = jest.fn();
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_STATE_SECRET = 'test-state-secret';

  mockCompareSync.mockReturnValue(true);
  mockHash.mockResolvedValue('hashed-value');
  mockJwtSign.mockImplementation((payload, secret) => {
    if (secret === 'test-state-secret') {
      return 'state-token';
    }
    return 'access-token';
  });

  mockSendWelcomeEmail.mockResolvedValue(undefined);
  mockCreateResetPasswordToken.mockReturnValue('token-1');
  mockSendResetPasswordEmail.mockResolvedValue(undefined);
  mockGetResetPasswordTokenLink.mockReturnValue('https://example.com/reset?token=token-1');
  mockVerifyResetPasswordToken.mockReturnValue({email: 'john@example.com'});

  mockUserSave.mockResolvedValue({_id: 'new-user-id', email: 'john@example.com', name: 'john'});
  mockProfileSave.mockResolvedValue({_id: 'profile-id'});

  mockFindOne.mockResolvedValue(null);
  mockProfileFindOne.mockResolvedValue(null);
  mockIsValidEmail.mockReturnValue(true);
  mockIsUserExistByEmail.mockResolvedValue(null);
  mockGetUserByEmail.mockResolvedValue({_id: 'user-id', email: 'john@example.com'});
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
        array: () => [{msg: 'Invalid email or password'}],
      });
      const req = mockReq({body: {email: '', password: ''}});
      const res = mockRes();

      await postLogin(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: ['Invalid email or password'],
      });
    });

    it('returns 422 json when password does not match', async () => {
      mockCompareSync.mockReturnValue(false);
      const user = {_id: 'u1', id: 'u1', status: 'active', email: 'john@example.com', password: 'hashed'};
      mockFindOne.mockResolvedValue(user);
      const req = mockReq({body: {email: 'john@example.com', password: 'wrong-password'}});
      const res = mockRes();

      await postLogin(req, res, jest.fn());

      expect(UserModel.findOne).toHaveBeenCalledWith({email: 'john@example.com'});
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        error: 'Incorrect user or password',
      });
    });

    it('returns MFA_REQUIRED json when profile has 2FA enabled', async () => {
      const user = {_id: 'u1', id: 'u1', status: 'active', email: 'john@example.com', password: 'hashed'};
      mockFindOne.mockResolvedValue(user);
      mockProfileFindOne.mockResolvedValue({twoFA: true});
      const req = mockReq({body: {email: 'john@example.com', password: '123456'}});
      const res = mockRes();

      await postLogin(req, res, jest.fn());

      expect(ProfileModel.findOne).toHaveBeenCalledWith({userId: 'u1'});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MFA_REQUIRED',
        message: 'MFA is required',
        state_token: 'state-token',
        expires_at: expect.any(Number),
      });
    });

    it('returns access token payload json for valid credentials without 2FA', async () => {
      const user = {_id: 'u1', id: 'u1', status: 'active', email: 'john@example.com', password: 'hashed'};
      mockFindOne.mockResolvedValue(user);
      mockProfileFindOne.mockResolvedValue({twoFA: false});
      const req = mockReq({body: {email: 'john@example.com', password: '123456'}});
      const res = mockRes();

      await postLogin(req, res, jest.fn());

      expect(mockJwtSign).toHaveBeenCalledWith({userId: 'u1', status: 'active'}, 'test-secret', {expiresIn: '1h'});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Login successfully',
        userId: 'u1',
        token: 'access-token',
      });
    });
  });

  describe('postSignup', () => {
    it('returns 422 json when validator returns errors', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{msg: 'All fields are required.'}],
      });
      const req = mockReq({body: {email: '', password: '', confirmPassword: ''}});
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: ['All fields are required.'],
      });
    });

    it('returns 422 json when user already exists', async () => {
      mockIsUserExistByEmail.mockResolvedValue({_id: 'existing-user-id'});
      const req = mockReq({
        body: {email: 'john@example.com', password: '123456', confirmPassword: '123456'},
      });
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(UserModel.isUserExistByEmail).toHaveBeenCalledWith('john@example.com');
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User or password are incorrect',
      });
    });

    it('creates user/profile and returns 201 json for valid payload', async () => {
      const savedUser = {_id: 'u1', email: 'john@example.com', name: 'john'};
      mockUserSave.mockResolvedValue(savedUser);
      const req = mockReq({
        body: {email: 'john@example.com', password: '123456', confirmPassword: '123456'},
      });
      const res = mockRes();

      await postSignup(req, res, jest.fn());

      expect(UserModel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'john',
        email: 'john@example.com',
      }));
      expect(ProfileModel).toHaveBeenCalledWith({
        name: 'john',
        twoFA: false,
        userId: 'u1',
      });
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith('john@example.com', 'john');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
      });
    });
  });

  describe('getStatus', () => {
    it('returns current user status', () => {
      const req = mockReq({user: {status: 'active'}});
      const res = mockRes();

      getStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'active',
      });
    });
  });

  describe('postReset', () => {
    it('rejects reset request for invalid email', async () => {
      mockIsValidEmail.mockReturnValue(false);
      const req = mockReq({body: {email: 'wrong-email'}});
      const res = mockRes();

      await postReset(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledWith('/reset');
    });

    it('rejects reset request when user does not exist', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      const req = mockReq({body: {email: 'john@example.com'}});
      const res = mockRes();

      await postReset(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.redirect).toHaveBeenCalledWith('/reset');
    });

    it('sends reset email and redirects for existing user', async () => {
      const req = mockReq({body: {email: 'john@example.com'}});
      const res = mockRes();

      await postReset(req, res);

      expect(UserModel.getUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockSendResetPasswordEmail).toHaveBeenCalledWith(
        'john@example.com',
        'https://example.com/reset?token=token-1',
      );
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getResetPassword', () => {
    it('redirects to reset when token payload is invalid', () => {
      mockVerifyResetPasswordToken.mockReturnValue(null);
      const req = mockReq({query: {token: 'bad-token'}});
      const res = mockRes();

      getResetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.redirect).toHaveBeenCalledWith('/reset');
    });

    it('returns reset-password payload for valid token', () => {
      mockVerifyResetPasswordToken.mockReturnValue({email: 'john@example.com'});
      const req = mockReq({query: {token: 'good-token'}});
      const res = mockRes();

      getResetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        _email: 'john@example.com',
        _token: 'good-token',
      });
    });
  });

  describe('postResetPassword', () => {
    it('redirects to reset-password when user does not exist', async () => {
      mockFindOne.mockResolvedValue(null);
      const req = mockReq({
        body: {password: '123456', confirmPassword: '123456', _email: 'nope@example.com', _token: 't1'},
      });
      const res = mockRes();

      await postResetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.redirect).toHaveBeenCalledWith('/reset-password');
    });

    it('updates user password and redirects to login', async () => {
      const user = {
        password: 'old',
        confirmPassword: 'old',
        save: jest.fn().mockResolvedValue({_id: 'u1'}),
      };
      mockFindOne.mockResolvedValue(user);
      mockHash.mockResolvedValueOnce('hashed-password').mockResolvedValueOnce('hashed-confirm-password');
      const req = mockReq({
        body: {password: '123456', confirmPassword: '123456', _email: 'john@example.com', _token: 't1'},
      });
      const res = mockRes();

      await postResetPassword(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({email: 'john@example.com'});
      expect(user.password).toBe('hashed-password');
      expect(user.confirmPassword).toBe('hashed-confirm-password');
      expect(user.save).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });
});
