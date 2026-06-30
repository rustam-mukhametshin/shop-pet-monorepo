import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { ProductPayload } from '../products.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-form-product',
  templateUrl: './form-product.component.html',
  styleUrls: ['./form-product.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ]
})
export class FormProductComponent implements OnChanges {
  @Input() initialValue?: Partial<ProductPayload>;
  @Input() submitLabel = 'Save';
  @Output() formSubmit = new EventEmitter<ProductPayload>();

  readonly productForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['initialValue'] || !this.initialValue) {
      return;
    }

    this.productForm.patchValue({
      title: this.initialValue.title ?? '',
      description: this.initialValue.description ?? '',
      price: this.initialValue.price ?? 0,
    });
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.productForm.getRawValue());
  }

  get titleControl() {
    return this.productForm.controls.title;
  }

  get descriptionControl() {
    return this.productForm.controls.description;
  }

  get priceControl() {
    return this.productForm.controls.price;
  }
}
