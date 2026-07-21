import {AsyncPipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Observable} from "rxjs";
import {Product, ProductsService} from "../products.service";
import {ProductComponent} from "../product/product.component";

@Component({
  selector: "app-view-product",
  imports: [
    ProductComponent,
    AsyncPipe,
    RouterLink,
  ],
  templateUrl: "./view-product.component.html",
  styleUrl: "./view-product.component.css",
})
export class ViewProductComponent implements OnInit {
  product$?: Observable<Product>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductsService,
  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (!id) {
      return;
    }

    this.product$ = this.productsService.getProductById(id);
  }
}
