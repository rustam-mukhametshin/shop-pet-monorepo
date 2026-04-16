const { Product } = require('../../models/product.model.ts');

describe('product.model', () => {
  it('exports Product mongoose model', () => {
    expect(Product).toBeDefined();
    expect(Product.modelName).toBe('Product');
  });

  it('contains required schema paths', () => {
    expect(Product.schema.path('title')).toBeDefined();
    expect(Product.schema.path('price')).toBeDefined();
    expect(Product.schema.path('imageUrl')).toBeDefined();
    expect(Product.schema.path('description')).toBeDefined();
  });

  it('keeps userId ref to User', () => {
    expect(Product.schema.path('userId').options.ref).toBe('User');
  });
});

