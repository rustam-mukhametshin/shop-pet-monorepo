const { UserModel } = require('../../models/user.model.ts');

describe('user.model', () => {
  it('exports User mongoose model', () => {
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

  it('validates email format via static isValidEmail', () => {
    expect(UserModel.isValidEmail('user@example.com')).toBe(true);
    expect(UserModel.isValidEmail('name.surname@domain.co')).toBe(true);
  });

  it('returns false for invalid email format', () => {
    expect(UserModel.isValidEmail('invalid-email')).toBe(false);
    expect(UserModel.isValidEmail('missing-at-sign.com')).toBe(false);
    expect(UserModel.isValidEmail('missing-domain@')).toBe(false);
  });
});
