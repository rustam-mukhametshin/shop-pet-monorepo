import {computed, Injectable, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {map, Observable} from "rxjs";

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Response {
  prods: Product[];
  currentPage: number;
  lastPage: number;
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

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Response>(
      environment.apiUrl + 'v1/products'
    )
      .pipe(
        map(res => res.prods)
      );
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<{ product: Product }>(
      environment.apiUrl + `v1/products/${id}`
    ).pipe(
      map(res => res.product)
    )
  }

  createProduct(payload: ProductPayload): Product {
    const product: Product = {
      ...payload,
      _id: Date.now().toString(),
    };
    this.products.set([...this.products(), product]);
    return product;
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

  deleteProduct(id: string): void {
    this.products.set(this.products().filter(product => product._id !== id));
  }
}
