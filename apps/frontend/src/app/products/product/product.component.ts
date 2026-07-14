import {booleanAttribute, Component, input, Input, InputSignal, OnInit, output} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Product, ProductsService} from '../products.service';
import {DecimalPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule
  ]
})
export class ProductComponent implements OnInit {
  product: InputSignal<Product | undefined> = input.required<Product | undefined>()
  @Input({
    transform: booleanAttribute
  }) showActions = true;
  remove = output<string | undefined>();

  detailView = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductsService,
  ) {
  }

  ngOnInit(): void {
    if (this.product()) {
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    // this.product = this.productsService.getProductById(id);
  }

  deleteProduct(): void {
    if (!this.product()) {
      return;
    }

    this.remove.emit(this.product()?._id);
  }
}
