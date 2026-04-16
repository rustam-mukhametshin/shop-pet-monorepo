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
});

