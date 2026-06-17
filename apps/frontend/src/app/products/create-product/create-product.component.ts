import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductPayload, ProductsService } from '../products.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent {
  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
  ) {}

  createProduct(payload: ProductPayload): void {
    this.productsService.createProduct(payload);
    void this.router.navigate(['/products']);
  }
}
