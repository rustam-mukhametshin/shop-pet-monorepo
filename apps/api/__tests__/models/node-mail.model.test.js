const sendMailMock = jest.fn();
const signMock = jest.fn();
const verifyMock = jest.fn();

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock,
    })),
  },
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: (...args) => signMock(...args),
    verify: (...args) => verifyMock(...args),
  },
}));

const {NodeMailModel} = require('../../models/node-mail.model.ts');

describe('node-mail.model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_MAIL_SERVICE = 'gmail';
    process.env.NODE_MAIL_USER = 'noreply@example.com';
    process.env.NODE_MAIL_PASSWORD = 'test-password';
    process.env.DB_SESSION_SECRET = 'test-secret';
    process.env.MAIN_URL = 'http://localhost:3333/';
    process.env.ENV = 'prod';

    sendMailMock.mockResolvedValue({accepted: ['user@example.com']});
    signMock.mockReturnValue('signed-token');
    verifyMock.mockReturnValue({email: 'user@example.com', iat: 1, exp: 2});
  });

  describe('sendMail', () => {
    it('sends email with provided receiver and content in prod', async () => {
      const mailer = new NodeMailModel();

      await mailer.sendMail({
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Hello user',
      });

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Hello user',
      }));
    });

    it('returns dev sentinel when ENV is not prod', async () => {
      process.env.ENV = 'dev';
      const mailer = new NodeMailModel();

      const result = await mailer.sendMail({
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Hello user',
      });

      expect(result).toBe('DEV ENVIRONMENT');
      expect(sendMailMock).not.toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('sends welcome mail to provided email and name', async () => {
      await NodeMailModel.sendWelcomeEmail('user@example.com', 'user');

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Welcome to Your Account user',
      }));
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('sends reset password mail containing provided link', async () => {
      await NodeMailModel.sendResetPasswordEmail('user@example.com', 'http://localhost:3333/reset-password?token=t1');

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
      }));
      expect(sendMailMock.mock.calls[0][0].text).toContain('http://localhost:3333/reset-password?token=t1');
    });
  });

  describe('getResetPasswordTokenLink', () => {
    it('builds a reset-password link with provided token', () => {
      const link = NodeMailModel.getResetPasswordTokenLink('user@example.com', 't1');
      expect(link).toBe('http://localhost:3333/reset-password?token=t1');
    });
  });

  describe('createResetPasswordToken', () => {
    it('signs JWT payload with email and one hour expiry', () => {
      const token = NodeMailModel.createResetPasswordToken('user@example.com');

      expect(signMock).toHaveBeenCalledWith(
        {email: 'user@example.com'},
        'test-secret',
        {expiresIn: '1h'},
      );
      expect(token).toBe('signed-token');
    });
  });

  describe('verifyResetPasswordToken', () => {
    it('returns decoded token payload', () => {
      const payload = NodeMailModel.verifyResetPasswordToken('token-1');

      expect(verifyMock).toHaveBeenCalledWith('token-1', 'test-secret');
      expect(payload).toEqual({email: 'user@example.com', iat: 1, exp: 2});
    });
  });
});
