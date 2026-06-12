const { Product } = require('../../models/product.model.ts');
const { UserModel } = require('../../models/user.model.ts');
const { OrderModel } = require('../../models/order.model.ts');

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
  session: { isLoggedIn: false },
  body: {},
  params: {},
  user: mockUser(),
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.render = jest.fn();
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
    postAddProductToCart,
    postCartDeleteProduct,
    getOrders,
  } = require('../../controllers/shop.controller.ts');

  describe('getIndex', () => {
    it('renders shop/index with products', async () => {
      jest.spyOn(Product, 'find').mockResolvedValue([{ title: 'A' }]);
      const req = mockReq();
      const res = mockRes();

      await getIndex(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/index', expect.objectContaining({
        pageTitle: 'Shop',
        url: '/',
        prods: [{ title: 'A' }],
      }));
    });
  });

  describe('getProducts', () => {
    it('renders shop/product-list with products', async () => {
      const fakeProducts = [{ title: 'B' }];
      jest.spyOn(Product, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts),
      });
      const req = mockReq();
      const res = mockRes();

      await getProducts(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/product-list', expect.objectContaining({
        pageTitle: 'Products',
        url: '/products',
        prods: fakeProducts,
      }));
    });
  });

  describe('getProduct', () => {
    it('renders shop/product-detail for a found product', async () => {
      const fakeProduct = { title: 'My Product' };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();

      await getProduct(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/product-detail', expect.objectContaining({
        product: fakeProduct,
        url: '/products',
      }));
    });
  });

  describe('getCart', () => {
    it('renders shop/cart with cart items when user has a cart', async () => {
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

      expect(res.render).toHaveBeenCalledWith('shop/cart', expect.objectContaining({
        pageTitle: 'Cart',
        url: '/cart',
        products: fakeItems,
      }));
    });

    it('renders shop/cart with empty products when user has no cart', async () => {
      jest.spyOn(UserModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null),
        }),
      });
      const req = mockReq();
      const res = mockRes();

      await getCart(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/cart', expect.objectContaining({
        products: [],
      }));
    });
  });

  describe('postAddProductToCart', () => {
    it('adds product to cart and redirects to /cart', async () => {
      const fakeProduct = { _id: VALID_ID, title: 'P' };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({ body: { id: VALID_ID } });
      const res = mockRes();

      await postAddProductToCart(req, res);

      expect(req.user.addToCart).toHaveBeenCalledWith(fakeProduct);
      expect(res.redirect).toHaveBeenCalledWith('/cart');
    });
  });

  describe('postCartDeleteProduct', () => {
    it('removes product from cart and redirects to /cart', async () => {
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();

      await postCartDeleteProduct(req, res);

      expect(req.user.deleteProductFromCart).toHaveBeenCalledWith(VALID_ID);
      expect(res.redirect).toHaveBeenCalledWith('/cart');
    });
  });

  describe('getOrders', () => {
    it('renders shop/orders with user orders', async () => {
      const fakeOrders = [{ _id: VALID_ID2, products: [] }];
      jest.spyOn(OrderModel, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeOrders),
      });
      const req = mockReq();
      const res = mockRes();

      await getOrders(req, res);

      expect(res.render).toHaveBeenCalledWith('shop/orders', expect.objectContaining({
        pageTitle: 'Orders',
        url: '/orders',
        orders: fakeOrders,
      }));
    });
  });
});
