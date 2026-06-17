import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export type ProductPayload = Omit<Product, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly productsSubject = new BehaviorSubject<Product[]>([
    {
      id: '1',
      title: 'Dog Food',
      description: 'Balanced dry food for adult dogs.',
      price: 19.99,
    },
    {
      id: '2',
      title: 'Cat Toy',
      description: 'Soft toy mouse with catnip.',
      price: 7.5,
    },
  ]);

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(id: string): Product | undefined {
    return this.productsSubject.value.find(product => product.id === id);
  }

  createProduct(payload: ProductPayload): Product {
    const product: Product = {
      ...payload,
      id: Date.now().toString(),
    };
    this.productsSubject.next([...this.productsSubject.value, product]);
    return product;
  }

  updateProduct(id: string, payload: ProductPayload): Product | undefined {
    const products = this.productsSubject.value;
    const productIndex = products.findIndex(product => product.id === id);

    if (productIndex < 0) {
      return undefined;
    }

    const updatedProduct: Product = { id, ...payload };
    const nextProducts = [...products];
    nextProducts[productIndex] = updatedProduct;
    this.productsSubject.next(nextProducts);
    return updatedProduct;
  }

  deleteProduct(id: string): void {
    this.productsSubject.next(this.productsSubject.value.filter(product => product.id !== id));
  }
}
