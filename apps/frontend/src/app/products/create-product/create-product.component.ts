import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ProductPayload, ProductsService} from '../products.service';
import {FormProductComponent} from "../form-product/form-product.component";
import {first} from "rxjs";

@Component({
    selector: 'app-create-product',
    templateUrl: './create-product.component.html',
    styleUrls: ['./create-product.component.css'],
    imports: [
        FormProductComponent
    ]
})
export class CreateProductComponent {
  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
  ) {
  }

  createProduct(payload: ProductPayload): void {
    const formData: FormData = new FormData();
    formData.append('title', payload.title || 'Unknown title');
    formData.append('description', payload.description || 'Unknown description');
    formData.append('price', payload.price?.toString() || '0');
    if (payload.image) {
      formData.append('image', payload.image);
    }

    this.productsService.createProduct(formData)
      .pipe(first())
      .subscribe(value => {
        void this.router.navigate(['/products']);
      })
  }
}
