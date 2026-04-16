const { OrderModel } = require('../../models/order.model.ts');

describe('order.model', () => {
  it('exports Order mongoose model', () => {
    expect(OrderModel).toBeDefined();
    expect(OrderModel.modelName).toBe('Order');
  });

  it('contains required schema paths', () => {
    expect(OrderModel.schema.path('products')).toBeDefined();
    expect(OrderModel.schema.path('userId')).toBeDefined();
  });

  it('keeps userId ref to User', () => {
    expect(OrderModel.schema.path('userId').options.ref).toBe('User');
  });
});

