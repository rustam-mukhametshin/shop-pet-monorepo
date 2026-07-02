import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {Product, ProductsService} from '../products.service';
import {ProductComponent} from "../product/product.component";
import {RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {first} from "rxjs";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    ProductComponent,
    RouterLink,
    NgIf,
    NgForOf
  ]
})
export class ProductsComponent implements OnInit {
  products?: WritableSignal<Product[] | undefined> = signal(undefined);

  constructor(private readonly productsService: ProductsService) {
  }

  ngOnInit() {
    this.productsService.getProducts()
      .pipe(
        first()
      ).subscribe(value => {
      this.products?.set(value)
    })
  }

  removeProduct(productId: string): void {
    this.productsService.deleteProduct(productId);
  }
}
