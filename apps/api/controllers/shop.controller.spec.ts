import {validationResult} from 'express-validator';
import {Product} from '../models/product.model';
import {patchProduct} from './shop.controller';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../models/product.model', () => ({
  Product: {
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('patchProduct', () => {
  const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;
  const mockedFindByIdAndUpdate = Product.findByIdAndUpdate as jest.MockedFunction<typeof Product.findByIdAndUpdate>;

  const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns validation errors when the payload is invalid', async () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{msg: 'Invalid title'}],
    } as any);

    const req = {
      params: {id: 'product-id'},
      body: {title: ''},
    } as any;
    const res = createResponse();
    const next = jest.fn();

    await patchProduct(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      errorMessage: [{msg: 'Invalid title'}],
    });
    expect(mockedFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when the product does not exist', async () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as any);
    mockedFindByIdAndUpdate.mockResolvedValue(null as any);

    const req = {
      params: {id: 'product-id'},
      body: {title: 'Updated title'},
    } as any;
    const res = createResponse();
    const next = jest.fn();

    await patchProduct(req, res as any, next);

    expect(mockedFindByIdAndUpdate).toHaveBeenCalledWith(
      'product-id',
      {$set: {title: 'Updated title'}},
      {new: true, runValidators: true}
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product not found',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns the updated product on success', async () => {
    const updatedProduct = {_id: 'product-id', title: 'Updated title'};
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as any);
    mockedFindByIdAndUpdate.mockResolvedValue(updatedProduct as any);

    const req = {
      params: {id: 'product-id'},
      body: {title: 'Updated title'},
    } as any;
    const res = createResponse();
    const next = jest.fn();

    await patchProduct(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedProduct);
    expect(next).not.toHaveBeenCalled();
  });
});
