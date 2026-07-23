import {of} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';
import {ProductsService} from './products.service';

describe('ProductsService', () => {
  it('should map products to include the inline edit flag', () => {
    const httpClient = {
      get: vi.fn().mockReturnValue(of({
        prods: [
          {_id: '1', title: 'Dog Food', description: 'Food', price: 10},
        ],
        currentPage: 1,
        lastPage: 1,
        length: 1,
        pageSize: 10,
      })),
    } as any;
    const service = new ProductsService(httpClient);

    service.getProducts().subscribe(response => {
      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3333/v1/products',
        {
          params: {
            page: 0,
            pageSize: 10,
          },
        }
      );
      expect(response.prods).toEqual([
        {
          _id: '1',
          title: 'Dog Food',
          description: 'Food',
          price: 10,
          isEdit: false,
        },
      ]);
    });
  });

  it('should patch the product title through the api', () => {
    const patch = vi.fn().mockReturnValue(of({
      _id: '1',
      title: 'Updated title',
      description: 'Food',
      price: 10,
    }));
    const service = new ProductsService({
      patch,
    } as any);

    service.patchProduct('1', {title: 'Updated title'}).subscribe(product => {
      expect(patch).toHaveBeenCalledWith(
        'http://localhost:3333/v1/products/1',
        {title: 'Updated title'},
      );
      expect(product).toEqual({
        _id: '1',
        title: 'Updated title',
        description: 'Food',
        price: 10,
      });
    });
  });
});
