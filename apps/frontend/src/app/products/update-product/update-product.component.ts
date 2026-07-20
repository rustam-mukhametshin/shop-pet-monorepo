import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductPayload, ProductsService } from '../products.service';
import {FormProductComponent} from "../form-product/form-product.component";
import { AsyncPipe } from "@angular/common";
import {Observable} from "rxjs";

@Component({
    selector: 'app-update-product',
    templateUrl: './update-product.component.html',
    styleUrls: ['./update-product.component.css'],
    imports: [
    FormProductComponent,
    AsyncPipe
]
})
export class UpdateProductComponent implements OnInit {
  product$?: Observable<Product>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.product$ = this.productsService.getProductById(id);
  }

  updateProduct(payload: ProductPayload): void {
    if (!this.product$) {
      return;
    }

    // this.productsService.updateProduct(this.product._id, payload);
    // void this.router.navigate(['/products', this.product._id]);
  }
}
