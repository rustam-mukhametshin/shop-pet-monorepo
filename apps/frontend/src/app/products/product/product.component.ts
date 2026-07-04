import {booleanAttribute, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Product, ProductsService} from '../products.service';
import {DecimalPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule
  ]
})
export class ProductComponent implements OnInit {
  @Input({required: true}) product?: Product;
  @Input({
    transform: booleanAttribute
  }) showActions = true;
  @Output() remove = new EventEmitter<string>();

  detailView = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductsService,
  ) {
  }

  ngOnInit(): void {
    if (this.product) {
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.product = this.productsService.getProductById(id);
    this.detailView = true;
    this.showActions = false;
  }

  deleteProduct(): void {
    if (!this.product) {
      return;
    }

    this.remove.emit(this.product._id);
  }
}
