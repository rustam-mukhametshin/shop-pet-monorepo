const { TokenModel } = require('../../models/token.model.ts');

describe('token.model', () => {
  describe('TokenModel', () => {
    it('exports the Token mongoose model', () => {
      expect(TokenModel).toBeDefined();
      expect(TokenModel.modelName).toBe('Token');
    });

    it('contains required schema paths', () => {
      expect(TokenModel.schema.path('userId')).toBeDefined();
      expect(TokenModel.schema.path('token')).toBeDefined();
      expect(TokenModel.schema.path('userId').isRequired).toBe(true);
      expect(TokenModel.schema.path('token').isRequired).toBe(true);
    });

    it('keeps userId ref to User', () => {
      expect(TokenModel.schema.path('userId').options.ref).toBe('User');
    });
  });
});

