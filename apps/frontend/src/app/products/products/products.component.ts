import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {Product, ProductsService} from '../products.service';
import {ProductComponent} from "../product/product.component";
import {RouterLink} from "@angular/router";
import {catchError, first, switchMap, take} from "rxjs";
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
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
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
    MatButton,
    MatPaginator
  ]
})
export class ProductsComponent implements OnInit {
  products: WritableSignal<Product[]> = signal([]);
  currentPage?: number;
  lastPage?: number;
  length?: number;
  pageSize?: number;
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
  }

  ngOnInit() {
    this.productsService.getProducts()
      .pipe(
        first()
      )
      .subscribe(value => {
        this.products?.set(value.prods);
        this.currentPage = value.currentPage;
        this.lastPage = value.lastPage;
        this.length = value.length;
        this.pageSize = value.pageSize;
        this.notificationService.success('Products successfully loaded!');
      })
  }

  removeProduct(productId?: string) {
    if (!productId) {
      return;
    }
    this.productsService.deleteProduct(productId)
      .pipe(
        take(1),
        switchMap((response: any) => {
          if (response.status === 'success') {
            return this.productsService.getProducts();
          }
          throw new Error('Product not found');
        }),
        catchError((error: any) => {
          console.error(error);
          this.notificationService.error('Error deleting product: ' + error.message);
          throw error;
        })
      )
      .subscribe(products => {
        this.notificationService.success('Product successfully deleted!');
        this.currentPage = products.currentPage;
        this.lastPage = products.lastPage;
        this.length = products.length;
        this.pageSize = products.pageSize;
        this.products?.set(products.prods);
      })
  }

  protected onPageChange($event: PageEvent) {
    this.productsService.getProducts({
      pageIndex: $event.pageIndex + 1,
      pageSize: $event.pageSize
    })
      .pipe(
        first()
      )
      .subscribe(value => {
        this.products?.set(value.prods);
        this.currentPage = value.currentPage;
        this.lastPage = value.lastPage;
        this.length = value.length;
        this.pageSize = value.pageSize;
        this.notificationService.success('Products successfully loaded!');
      })
  }
}
