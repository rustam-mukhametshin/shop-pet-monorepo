import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductsService } from '../products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent {
  readonly products$: Observable<Product[]> = this.productsService.getProducts();

  constructor(private readonly productsService: ProductsService) {}

  removeProduct(productId: string): void {
    this.productsService.deleteProduct(productId);
  }
}
