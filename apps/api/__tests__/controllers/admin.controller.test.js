const {Product} = require('../../models/product.model.ts');
const mockValidationResult = jest.fn();

jest.mock('express-validator', () => ({
  validationResult: (...args) => mockValidationResult(...args),
}));

const VALID_ID = '64b1f1e2a4c3d2e1f0a9b8c7';

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  user: {_id: VALID_ID, userId: VALID_ID},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
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
    postAddProduct,
    getProducts,
    postEditProduct,
    deleteProduct,
  } = require('../../controllers/admin.controller.ts');

  describe('postAddProduct', () => {
    it('returns 422 json when validator fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{msg: 'Invalid'}],
      });
      const req = mockReq();
      const res = mockRes();

      await postAddProduct(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        edit: false,
        product: undefined,
        errorMessage: ['Invalid'],
      });
    });

    it('returns 422 json when image is missing', async () => {
      const req = mockReq({body: {title: 'T', description: 'D', price: '10'}});
      const res = mockRes();

      await postAddProduct(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        edit: false,
        product: undefined,
        errorMessage: 'Attached file is not an image',
      });
    });

    it('saves a new product for valid payload', async () => {
      const saveSpy = jest.spyOn(Product.prototype, 'save').mockResolvedValue({});
      const req = mockReq({
        body: {title: 'T', description: 'D', price: '9.99'},
        file: {path: 'public/images/p.png'},
      });
      const res = mockRes();

      await postAddProduct(req, res, jest.fn());

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProducts', () => {
    it('returns admin products json', async () => {
      const fakeProducts = [{title: 'A'}, {title: 'B'}];
      jest.spyOn(Product, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts),
      });
      const req = mockReq();
      const res = mockRes();

      await getProducts(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith({
        prods: fakeProducts,
      });
    });
  });

  describe('postEditProduct', () => {
    it('updates product fields and saves', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const fakeProduct = {
        title: '',
        description: '',
        price: 0,
        imageUrl: 'old.png',
        userId: {toString: () => VALID_ID},
        save: saveMock,
      };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const unlinkSpy = jest.spyOn(require('node:fs'), 'unlink').mockImplementation((_, cb) => cb(null));
      const req = mockReq({
        params: {id: VALID_ID},
        body: {title: 'New', description: 'Desc', price: '5.00'},
        file: {path: 'new.png'},
      });
      const res = mockRes();

      await postEditProduct(req, res, jest.fn());

      expect(fakeProduct.title).toBe('New');
      expect(fakeProduct.description).toBe('Desc');
      expect(fakeProduct.price).toBe(5);
      expect(fakeProduct.imageUrl).toBe('new.png');
      expect(unlinkSpy).toHaveBeenCalledWith('old.png', expect.any(Function));
      expect(saveMock).toHaveBeenCalledTimes(1);
    });

    it('redirects when user is not owner', async () => {
      const fakeProduct = {
        userId: {toString: () => 'another-user'},
        save: jest.fn(),
      };
      jest.spyOn(Product, 'findById').mockResolvedValue(fakeProduct);
      const req = mockReq({
        params: {id: VALID_ID},
        body: {title: 'New', description: 'Desc', price: '5.00'},
      });
      const res = mockRes();

      await postEditProduct(req, res, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(fakeProduct.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('returns 204 json when deletion succeeds', async () => {
      jest.spyOn(Product, 'findById').mockResolvedValue({_id: VALID_ID, imageUrl: 'old.png'});
      const req = mockReq({params: {id: VALID_ID}});
      const res = mockRes();
      const next = jest.fn();

      await deleteProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({message: 'Success'});
    });
  });
});
