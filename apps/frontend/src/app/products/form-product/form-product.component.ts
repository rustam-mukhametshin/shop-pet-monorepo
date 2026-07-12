import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductPayload} from '../products.service';
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-form-product',
    templateUrl: './form-product.component.html',
    styleUrls: ['./form-product.component.css'],
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
    title: new FormControl<string | null>('', [Validators.required]),
    description: new FormControl<string | null>('', [Validators.required]),
    price: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    image: new FormControl<File | null>(null, [Validators.required]),
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

  get imageControl() {
    return this.productForm.controls.image;
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

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productForm.patchValue({image: file});
    }
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // console.log(this.productForm.value)
    // Todo: fix type
    this.formSubmit.emit(this.productForm.value as any);
  }
}
