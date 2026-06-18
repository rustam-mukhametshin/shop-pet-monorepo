import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(first())
      .subscribe({
        next: response => {
          this.successMessage = response.message;
          this.isSubmitting = false;
          this.router.navigate(['/products']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.isSubmitting = false;
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as
      | { error?: string | string[]; message?: string }
      | string
      | undefined;
    const errorValue = body && typeof body === 'object' ? body.error : undefined;

    if (typeof body === 'string') {
      return body;
    }

    if (Array.isArray(errorValue) && errorValue.length > 0) {
      return errorValue[0];
    }

    if (typeof errorValue === 'string') {
      return errorValue;
    }

    if (typeof body?.message === 'string') {
      return body.message;
    }

    return 'Unable to sign in. Please try again.';
  }
}
