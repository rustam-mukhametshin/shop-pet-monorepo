import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductsService } from '../products.service';
import {ProductComponent} from "../product/product.component";
import {RouterLink} from "@angular/router";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    ProductComponent,
    RouterLink,
    NgIf,
    AsyncPipe,
    NgForOf
  ]
})
export class ProductsComponent {
  readonly products$: Observable<Product[]> = this.productsService.getProducts();

  constructor(private readonly productsService: ProductsService) {}

  removeProduct(productId: string): void {
    this.productsService.deleteProduct(productId);
  }
}
