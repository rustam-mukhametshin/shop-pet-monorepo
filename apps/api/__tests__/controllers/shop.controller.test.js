const { Product } = require('../../models/product.model.ts');
const { UserModel } = require('../../models/user.model.ts');
const { OrderModel } = require('../../models/order.model.ts');
const mockValidationResult = jest.fn();

jest.mock('express-validator', () => ({
  validationResult: (...args) => mockValidationResult(...args),
}));

const VALID_ID = '64b1f1e2a4c3d2e1f0a9b8c7';
const VALID_ID2 = '64b1f1e2a4c3d2e1f0a9b8c8';

const mockUser = () => ({
  _id: VALID_ID,
  cart: { items: [] },
  addToCart: jest.fn().mockResolvedValue({}),
  deleteProductFromCart: jest.fn().mockResolvedValue({}),
  clearCart: jest.fn().mockResolvedValue({}),
  deleteProductFromOrder: jest.fn().mockResolvedValue({}),
});

const mockReq = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  user: mockUser(),
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.redirect = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

afterEach(() => jest.restoreAllMocks());

describe('shop.controller', () => {
  const {
    getIndex,
    getProducts,
    getProduct,
    getCart,
    patchProduct,
    postAddProductToCart,
    postCartDeleteProduct,
    getOrders,
  } = require('../../controllers/shop.controller.ts');

  beforeEach(() => {
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
  });

  describe('getIndex', () => {
    it('returns paginated json via getProducts', async () => {
      const fakeProducts = [{ title: 'A' }];
      jest.spyOn(Product, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(Product, 'find').mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeProducts),
          }),
        }),
      });
      const req = mockReq();
      const res = mockRes();

      await getIndex(req, res);

      expect(res.json).toHaveBeenCalledWith({
        prods: fakeProducts,
        currentPage: 1,
        lastPage: 1,
        length: 1,
        pageSize: 10,
      });
    });
  });

  describe('getProducts', () => {
    it('returns paginated json with products', async () => {
      const fakeProducts = [{ title: 'B' }];
      jest.spyOn(Product, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Product, 'find').mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeProducts),
          }),
        }),
      });
      const req = mockReq({ query: { page: '2', pageSize: '2' } });
      const res = mockRes();

      await getProducts(req, res);

      expect(res.json).toHaveBeenCalledWith({
        prods: fakeProducts,
        currentPage: 2,
        lastPage: 3,
        length: 5,
        pageSize: 2,
      });
    });
  });

  describe('getProduct', () => {
    it('returns product json for a found product', async () => {
      const fakeProduct = { title: 'My Product' };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();

      await getProduct(req, res);

      expect(res.json).toHaveBeenCalledWith({
        product: fakeProduct,
      });
    });

    it('returns 404 json for a missing product', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue(null);
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();

      await getProduct(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('getCart', () => {
    it('returns cart json when user has a cart', async () => {
      const fakeItems = [{ productId: { title: 'P' }, quantity: 2 }];
      const fakeUser = { cart: { items: fakeItems } };
      jest.spyOn(UserModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(fakeUser),
        }),
      });
      const req = mockReq();
      const res = mockRes();

      await getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        cart: fakeUser.cart,
        products: fakeItems,
      });
    });

    it('returns 404 json when user has no cart', async () => {
      jest.spyOn(UserModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null),
        }),
      });
      const req = mockReq();
      const res = mockRes();

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        cart: {},
        products: [],
      });
    });
  });

  describe('patchProduct', () => {
    it('returns 422 json when validator fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{msg: 'Invalid title'}],
      });
      const req = mockReq({ params: { id: VALID_ID }, body: { title: '' } });
      const res = mockRes();

      await patchProduct(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        errorMessage: [{msg: 'Invalid title'}],
      });
    });

    it('returns 404 json when product to patch is missing', async () => {
      jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(null);
      const req = mockReq({ params: { id: VALID_ID }, body: { title: 'Updated title' } });
      const res = mockRes();

      await patchProduct(req, res, jest.fn());

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        {$set: {title: 'Updated title'}},
        {new: true, runValidators: true},
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });

    it('returns updated product json when patch succeeds', async () => {
      const updatedProduct = {_id: VALID_ID, title: 'Updated title'};
      jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(updatedProduct);
      const req = mockReq({ params: { id: VALID_ID }, body: { title: 'Updated title' } });
      const res = mockRes();

      await patchProduct(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });
  });

  describe('postAddProductToCart', () => {
    it('adds product to cart and returns it as json', async () => {
      const fakeProduct = { _id: VALID_ID, title: 'P' };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({ body: { id: VALID_ID } });
      const res = mockRes();

      await postAddProductToCart(req, res);

      expect(req.user.addToCart).toHaveBeenCalledWith(fakeProduct);
      expect(res.json).toHaveBeenCalledWith({
        product: fakeProduct,
      });
    });

    it('returns 404 json when product is missing', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue(null);
      const req = mockReq({ body: { id: VALID_ID } });
      const res = mockRes();

      await postAddProductToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('postCartDeleteProduct', () => {
    it('removes product from cart and returns operation result', async () => {
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();

      await postCartDeleteProduct(req, res);

      expect(req.user.deleteProductFromCart).toHaveBeenCalledWith(VALID_ID);
      expect(res.json).toHaveBeenCalledWith({
        product: {},
      });
    });
  });

  describe('getOrders', () => {
    it('returns user orders json', async () => {
      const fakeOrders = [{ _id: VALID_ID2, products: [] }];
      jest.spyOn(OrderModel, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeOrders),
      });
      const req = mockReq();
      const res = mockRes();

      await getOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({
        orders: fakeOrders,
      });
    });
  });
});
