import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductPayload, ProductsService } from '../products.service';
import { FormProductComponent } from '../form-product/form-product.component';
import { finalize, first } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { AiGenerationService } from '../../services/ai-generation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
  imports: [FormProductComponent, MatButton, RouterLink],
})
export class CreateProductComponent {
  isGeneratingDescription = false;

  constructor(
    private readonly productsService: ProductsService,
    private readonly aiGenerationService: AiGenerationService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  createProduct(payload: ProductPayload): void {
    const formData: FormData = new FormData();
    formData.append('title', payload.title || 'Unknown title');
    formData.append('description', payload.description || 'Unknown description');
    formData.append('price', payload.price?.toString() || '0');
    if (payload.image) {
      formData.append('image', payload.image);
    }

    this.productsService
      .createProduct(formData)
      .pipe(first())
      .subscribe(() => {
        void this.router.navigate(['/products']);
      });
  }

  generateDescription(formProduct: FormProductComponent): void {
    this.isGeneratingDescription = true;

    this.aiGenerationService
      .generateProductDescription(formProduct.getTitleValue())
      .pipe(
        first(),
        finalize(() => {
          this.isGeneratingDescription = false;
        }),
      )
      .subscribe({
        next: (payload) => {
          if (payload.status !== 'success') {
            this.notificationService.error(
              'Error generating description: ' +
                (payload.message || 'Failed to generate description'),
            );
            return;
          }

          if (payload.data) {
            formProduct.setDescriptionValue(payload.data);
          }
          this.notificationService.success('Description generated successfully!');
        },
        error: (error: Error) => {
          console.error(error);
          this.notificationService.error('Error generating description: ' + error.message);
        },
      });
  }
}
