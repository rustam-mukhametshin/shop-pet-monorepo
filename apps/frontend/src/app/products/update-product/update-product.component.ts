import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductPayload, ProductsService } from '../products.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
})
export class UpdateProductComponent implements OnInit {
  product?: Product;

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

    this.product = this.productsService.getProductById(id);
  }

  updateProduct(payload: ProductPayload): void {
    if (!this.product) {
      return;
    }

    this.productsService.updateProduct(this.product.id, payload);
    void this.router.navigate(['/products', this.product.id]);
  }
}
