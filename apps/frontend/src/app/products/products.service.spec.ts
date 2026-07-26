import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service';
import { StorageService } from '../services/storage.service';

describe('ProductsService', () => {
  it('should map products to include the inline edit flag', () => {
    const httpClient = {
      get: vi.fn().mockReturnValue(
        of({
          prods: [{ _id: '1', title: 'Dog Food', description: 'Food', price: 10 }],
          currentPage: 1,
          lastPage: 1,
          length: 1,
          pageSize: 10,
        }),
      ),
    } as any;
    const tokenService = new StorageService();

    const service = new ProductsService(httpClient, tokenService);

    service.getProducts().subscribe((response) => {
      expect(httpClient.get).toHaveBeenCalledWith('http://localhost:3333/v1/products', {
        params: {
          page: 0,
          pageSize: 10,
        },
      });
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
    const patch = vi.fn().mockReturnValue(
      of({
        _id: '1',
        title: 'Updated title',
        description: 'Food',
        price: 10,
      }),
    );
    const tokenService = new StorageService();
    const service = new ProductsService(
      {
        patch,
      } as any,
      tokenService,
    );

    service.patchProduct('1', { title: 'Updated title' }).subscribe((product) => {
      expect(patch).toHaveBeenCalledWith('http://localhost:3333/v1/products/1', {
        title: 'Updated title',
      });
      expect(product).toEqual({
        _id: '1',
        title: 'Updated title',
        description: 'Food',
        price: 10,
      });
    });
  });

  it('should send auth header when creating a product', () => {
    const post = vi.fn().mockReturnValue(
      of({
        _id: '1',
        title: 'New',
        description: 'Desc',
        price: 12,
      }),
    );
    const tokenService = {
      getBearerAuthToken: vi.fn().mockReturnValue('Bearer token'),
    } as any;
    const service = new ProductsService({ post } as any, tokenService);
    const formData = new FormData();

    service.createProduct(formData).subscribe();

    expect(post).toHaveBeenCalledWith('http://localhost:3333/v1/add-product', formData, {
      headers: {
        Authorization: 'Bearer token',
      },
    });
  });

  it('should send auth header when deleting a product', () => {
    const del = vi.fn().mockReturnValue(of({ status: 'success' }));
    const tokenService = {
      getBearerAuthToken: vi.fn().mockReturnValue('Bearer token'),
    } as any;
    const service = new ProductsService({ delete: del } as any, tokenService);

    service.deleteProduct('1').subscribe();

    expect(del).toHaveBeenCalledWith('http://localhost:3333/v1/products/1', {
      headers: {
        Authorization: 'Bearer token',
      },
    });
  });
});
