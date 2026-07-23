import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {EditableProduct, ProductsService} from '../products.service';
import {ProductComponent} from "../product/product.component";
import {Router, RouterLink} from "@angular/router";
import {catchError, switchMap, take} from "rxjs";
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
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";

const columnsToDisplay: string[] = [
  '_id',
  'title',
  'description',
  'price',
  'actions',
];

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
    MatPaginator,
    MatProgressSpinner,
    MatMenuTrigger,
    MatMenuItem,
    MatMenu,
    MatIcon,
    MatMenuContent,
    MatInput
  ]
})
export class ProductsComponent implements OnInit {
  readonly columnsToDisplay: string[] = columnsToDisplay;

  public products: WritableSignal<EditableProduct[]> = signal([]);
  length: WritableSignal<number> = signal(0);
  pageSize?: WritableSignal<number> = signal(10);

  constructor(
    private readonly productsService: ProductsService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {
  }

  ngOnInit() {
    this.productsService.getProducts()
      .pipe(take(1))
      .subscribe(value => {
        this.setResponseProducts(value);
        this.notificationService.success('Products successfully loaded!');
      })
  }

  viewOrUpdateProduct(id: string, update: boolean = false) {
    return this.router.navigate(['/products', id, update ? 'update' : '',]);
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
        this.setResponseProducts(products);
      })
  }

  onTitleChange(id: string, title: string, prevTitle: string) {
    const nextTitle = title.trim();

    if (title === prevTitle) {
      this.markProductAsEdited(id, false);
      return;
    }

    if (!nextTitle) {
      this.notificationService.error('Title cannot be empty.');
      return;
    }

    this.productsService.patchProduct(id, {title: nextTitle})
      .pipe(take(1))
      .subscribe({
        next: value => {
          this.markProductAsEdited(id, false, value.title);
        },
        error: error => {
          console.error(error);
          this.notificationService.error('Error updating product title: ' + error.message);
        }
      });
  }

  protected onPageChange($event: PageEvent) {
    this.productsService.getProducts({
      pageIndex: $event.pageIndex + 1,
      pageSize: $event.pageSize
    })
      .pipe(take(1))
      .subscribe(value => {
        this.setResponseProducts(value);
        this.notificationService.success('Products successfully loaded!');
      })
  }

  protected markProductAsEdited(_id: string, isEdited: boolean, value?: string | null) {
    this.products.update(products => products.map(product => {
      if (product._id !== _id) {
        return product;
      }

      return {
        ...product,
        isEdit: isEdited,
        ...(value !== undefined ? {title: value} : {}),
      };
    }));
  }

  private setResponseProducts(value: any) {
    this.products.set(value.prods);
    this.length.set(value.length);
    this.pageSize?.set(value.pageSize);
  }
}
