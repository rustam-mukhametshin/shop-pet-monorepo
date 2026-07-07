import {afterNextRender, afterRender, Component, OnInit, signal, WritableSignal} from '@angular/core';
import {Product, ProductsService} from '../products.service';
import {ProductComponent} from "../product/product.component";
import {RouterLink} from "@angular/router";
import {first} from "rxjs";
import {NotificationService} from "../../services/notification.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {CurrencyPipe} from "@angular/common";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    ProductComponent,
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    CurrencyPipe,
    MatButton
  ]
})
export class ProductsComponent implements OnInit {
  products: WritableSignal<Product[]> = signal([]);
  columnsToDisplay: string[] = [
    '_id',
    'title',
    'description',
    'price',
    'actions',
  ]

  constructor(
    private readonly productsService: ProductsService,
    private readonly notificationService: NotificationService,
  ) {
    afterRender(() => {
      console.log('afterRender');
    })

    afterNextRender(() => {
      console.log('afterNextRender');
    })
  }

  ngOnInit() {
    this.productsService.getProducts()
      .pipe(
        first()
      ).subscribe(value => {
      this.products?.set(value);
      this.notificationService.success('Products successfully loaded!');
    })
  }

  removeProduct(productId: string): void {
    this.productsService.deleteProduct(productId);
  }
}
