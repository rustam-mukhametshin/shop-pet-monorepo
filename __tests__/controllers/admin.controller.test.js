const { Product } = require('../../models/product.model.ts');
const deleteFileMock = jest.fn();
const mockValidationResult = jest.fn();

jest.mock('../../util/file', () => ({
  deleteFile: (...args) => deleteFileMock(...args),
}));

jest.mock('express-validator', () => ({
  validationResult: (...args) => mockValidationResult(...args),
}));

// Valid 24-char hex MongoDB ObjectId
const VALID_ID = '64b1f1e2a4c3d2e1f0a9b8c7';

const mockReq = (overrides = {}) => ({
  session: { isLoggedIn: false },
  body: {},
  params: {},
  query: {},
  user: { _id: VALID_ID, id: VALID_ID },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.render = jest.fn();
  res.redirect = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockValidationResult.mockReturnValue({
    isEmpty: () => true,
    array: () => [],
  });
});

afterEach(() => jest.restoreAllMocks());

describe('admin.controller', () => {
  const {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    deleteProduct,
  } = require('../../controllers/admin.controller.ts');

  describe('getAddProduct', () => {
    it('renders admin/edit-product with edit: false', () => {
      const req = mockReq();
      const res = mockRes();
      getAddProduct(req, res);
      expect(res.render).toHaveBeenCalledWith('admin/edit-product', expect.objectContaining({
        edit: false,
        pageTitle: 'Add product',
        url: '/admin/add-product',
      }));
    });
  });

  describe('postAddProduct', () => {
    it('saves a new product and redirects to /admin/products', async () => {
      jest.spyOn(Product.prototype, 'save').mockResolvedValue({});
      const req = mockReq({
        body: { title: 'T', description: 'D', price: '9.99' },
        file: { path: 'public/images/p.png' },
      });
      const res = mockRes();
      await postAddProduct(req, res);
      expect(Product.prototype.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('getProducts', () => {
    it('renders admin/products with fetched products', async () => {
      const fakeProducts = [{ title: 'A' }, { title: 'B' }];
      jest.spyOn(Product, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts),
      });
      const req = mockReq();
      const res = mockRes();
      await getProducts(req, res);
      expect(Product.find).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('admin/products', expect.objectContaining({
        prods: fakeProducts,
        pageTitle: 'Admin Products',
      }));
    });
  });

  describe('getEditProduct', () => {
    it('renders admin/edit-product when product is found', async () => {
      const fakeProduct = { _id: VALID_ID, title: 'Test' };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({ params: { id: VALID_ID }, query: { edit: 'true' } });
      const res = mockRes();
      await getEditProduct(req, res);
      expect(res.render).toHaveBeenCalledWith('admin/edit-product', expect.objectContaining({
        edit: true,
        product: fakeProduct,
      }));
    });

    it('redirects with 404 when product is not found', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue(null);
      const req = mockReq({ params: { id: VALID_ID }, query: {} });
      const res = mockRes();
      await getEditProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('postEditProduct', () => {
    it('updates product fields and redirects to /admin/products', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const fakeProduct = {
        title: '',
        description: '',
        price: 0,
        imageUrl: 'old.png',
        userId: { toString: () => VALID_ID },
        save: saveMock,
      };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({
        params: { id: VALID_ID },
        body: { title: 'New', description: 'Desc', price: '5.00' },
        file: { path: 'new.png' },
      });
      const res = mockRes();
      await postEditProduct(req, res);
      expect(fakeProduct.title).toBe('New');
      expect(deleteFileMock).toHaveBeenCalledWith('old.png');
      expect(saveMock).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });
  });

  describe('deleteProduct', () => {
    it('deletes product and redirects to /admin/products', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue({ _id: VALID_ID, imageUrl: 'old.png' });
      jest.spyOn(Product, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();
      const next = jest.fn();
      await deleteProduct(req, res, next);
      expect(Product.findById).toHaveBeenCalledWith(VALID_ID);
      expect(Product.deleteOne).toHaveBeenCalledWith({ _id: VALID_ID, userId: VALID_ID });
      expect(deleteFileMock).toHaveBeenCalledWith('old.png');
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });

    it('calls next with error when product is not found', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue(null);
      jest.spyOn(Product, 'deleteOne').mockResolvedValue({ deletedCount: 0 });
      const req = mockReq({ params: { id: VALID_ID } });
      const res = mockRes();
      const next = jest.fn();
      await deleteProduct(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
