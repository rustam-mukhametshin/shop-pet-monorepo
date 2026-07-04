import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductPayload} from '../products.service';
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-form-product',
  templateUrl: './form-product.component.html',
  styleUrls: ['./form-product.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatButton
  ]
})
export class FormProductComponent implements OnChanges {
  @Input() initialValue?: Partial<ProductPayload>;
  @Input() submitLabel = 'Save';
  @Output() formSubmit = new EventEmitter<ProductPayload>();

  readonly productForm = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    price: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
  });

  constructor() {
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

    // this.formSubmit.emit(this.productForm.getRawValue());
  }
}
