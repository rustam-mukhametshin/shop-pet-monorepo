import {Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";

export interface Product {
  _id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Response {
  prods: Product[];
  currentPage: number;
  lastPage: number;
  length: number,
  pageSize: number
}

export type ProductPayload = Omit<Product, '_id'>;

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly products = signal<Product[]>([
    {
      _id: '1',
      title: 'Dog Food',
      description: 'Balanced dry food for adult dogs.',
      price: 19.99,
    },
    {
      _id: '2',
      title: 'Cat Toy',
      description: 'Soft toy mouse with catnip.',
      price: 7.5,
    },
  ]);

  constructor(
    private readonly httpClient: HttpClient,
  ) {
  }

  getProducts(params = {
    pageIndex: 0,
    pageSize: 10,
  }): Observable<Response> {
    return this.httpClient.get<Response>(
      environment.apiUrl + 'v1/products',
      {
        params: {
          page: params.pageIndex,
          pageSize: params.pageSize,
        }
      }
    )
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<{ product: Product }>(
      environment.apiUrl + `v1/products/${id}`
    ).pipe(
      map(res => res.product)
    )
  }

  createProduct(payload: FormData): Observable<Product> {
    return this.httpClient.post<Product>(
      environment.apiUrl + `v1/add-product`,
      payload,
    )
  }

  updateProduct(id: string, payload: ProductPayload): Product | undefined {
    const products = this.products();
    const productIndex = products.findIndex(product => product._id === id);

    if (productIndex < 0) {
      return undefined;
    }

    const updatedProduct: Product = {_id: id, ...payload};
    const nextProducts = [...products];
    nextProducts[productIndex] = updatedProduct;
    this.products.set(nextProducts);
    return updatedProduct;
  }

  deleteProduct(id: string) {
    return this.httpClient.delete<unknown>(
      environment.apiUrl + `v1/products/${id}`,
    )
  }
}
