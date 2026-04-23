const { UserModel } = require('../../models/user.model.ts');

describe('user.model', () => {
  describe('UserModel', () => {
    it('exports the User mongoose model', () => {
      expect(UserModel).toBeDefined();
      expect(UserModel.modelName).toBe('User');
    });

    it('contains required schema paths', () => {
      expect(UserModel.schema.path('name')).toBeDefined();
      expect(UserModel.schema.path('email')).toBeDefined();
      expect(UserModel.schema.path('password')).toBeDefined();
      expect(UserModel.schema.path('confirmPassword')).toBeDefined();
      expect(UserModel.schema.path('cart')).toBeDefined();
    });

    it('registers cart helper methods', () => {
      expect(typeof UserModel.schema.methods.addToCart).toBe('function');
      expect(typeof UserModel.schema.methods.deleteProductFromCart).toBe('function');
      expect(typeof UserModel.schema.methods.clearCart).toBe('function');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for a valid email address', () => {
      expect(UserModel.isValidEmail('user@example.com')).toBe(true);
      expect(UserModel.isValidEmail('name.surname@domain.co')).toBe(true);
    });

    it('returns false for an address missing the @ symbol', () => {
      expect(UserModel.isValidEmail('missing-at-sign.com')).toBe(false);
    });

    it('returns false for an address missing the domain part', () => {
      expect(UserModel.isValidEmail('missing-domain@')).toBe(false);
    });

    it('returns false for a plain string with no email structure', () => {
      expect(UserModel.isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isPasswordLengthIsOk', () => {
    it('returns true for a short password', () => {
      expect(UserModel.isPasswordLengthIsOk('short')).toBe(true);
    });

    it('returns true for a password exactly 72 characters long', () => {
      expect(UserModel.isPasswordLengthIsOk('a'.repeat(72))).toBe(true);
    });

    it('returns true for an empty password string', () => {
      expect(UserModel.isPasswordLengthIsOk('')).toBe(true);
    });

    it('returns false for a password of 73 characters', () => {
      expect(UserModel.isPasswordLengthIsOk('a'.repeat(73))).toBe(false);
    });

    it('returns false for a password well over the limit', () => {
      expect(UserModel.isPasswordLengthIsOk('a'.repeat(100))).toBe(false);
    });
  });
});
