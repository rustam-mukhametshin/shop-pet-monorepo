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
      expect(UserModel.schema.path('status')).toBeDefined();
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

  describe('getUserByEmail', () => {
    it('calls findOne with the provided email and returns the user document', async () => {
      const user = { _id: 'u1', email: 'user@example.com' };
      const findOneSpy = jest.spyOn(UserModel, 'findOne').mockResolvedValue(user);

      const result = await UserModel.getUserByEmail('user@example.com');

      expect(findOneSpy).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(result).toBe(user);
      findOneSpy.mockRestore();
    });
  });

  describe('isUserExistByEmail', () => {
    it('returns true when findOne resolves with a user', async () => {
      const findOneSpy = jest.spyOn(UserModel, 'findOne').mockResolvedValue({ _id: 'u1' });

      const result = await UserModel.isUserExistByEmail('user@example.com');

      expect(result).toBe(true);
      findOneSpy.mockRestore();
    });

    it('returns false when findOne resolves with null', async () => {
      const findOneSpy = jest.spyOn(UserModel, 'findOne').mockResolvedValue(null);

      const result = await UserModel.isUserExistByEmail('missing@example.com');

      expect(result).toBe(false);
      findOneSpy.mockRestore();
    });
  });

  describe('addToCart', () => {
    it('adds a new product to an empty cart with quantity 1', async () => {
      const user = new UserModel({
        name: 'john',
        email: 'john@example.com',
        password: 'secret',
        cart: { items: [] },
      });
      user.save = jest.fn().mockResolvedValue(user);

      await user.addToCart({ _id: 'p1', id: 'p1' });

      expect(user.cart.items).toHaveLength(1);
      expect(user.cart.items[0].quantity).toBe(1);
      expect(user.save).toHaveBeenCalledTimes(1);
    });

    it('increments quantity when the same product already exists in cart', async () => {
      const user = new UserModel({
        name: 'john',
        email: 'john@example.com',
        password: 'secret',
        cart: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      user.save = jest.fn().mockResolvedValue(user);

      await user.addToCart({ _id: 'p1', id: 'p1' });

      expect(user.cart.items[0].quantity).toBe(2);
      expect(user.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteProductFromCart', () => {
    it('removes only the requested product from cart items', async () => {
      const user = new UserModel({
        name: 'john',
        email: 'john@example.com',
        password: 'secret',
        cart: { items: [{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 2 }] },
      });
      user.save = jest.fn().mockResolvedValue(user);

      await user.deleteProductFromCart('p1');

      expect(user.cart.items).toHaveLength(1);
      expect(user.cart.items[0].productId.toString()).toBe('p2');
      expect(user.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCart', () => {
    it('resets cart items to an empty array', async () => {
      const user = new UserModel({
        name: 'john',
        email: 'john@example.com',
        password: 'secret',
        cart: { items: [{ productId: 'p1', quantity: 1 }] },
      });
      user.save = jest.fn().mockResolvedValue(user);

      await user.clearCart();

      expect(user.cart.items).toEqual([]);
      expect(user.save).toHaveBeenCalledTimes(1);
    });
  });
});
