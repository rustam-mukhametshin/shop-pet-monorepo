import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {first} from 'rxjs';
import {AuthService} from '../../auth.service';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";

@Component({
    selector: 'app-login-page',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [
        MatCardModule,
        ReactiveFormsModule,
        MatInputModule,
        NgIf,
        MatCheckboxModule,
        MatButtonModule,
        RouterLink
    ]
})
export class LoginComponent implements OnInit {
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    twoFA: ['', [Validators.minLength(6), Validators.maxLength(6)]],
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isTwoFASubmit = false;
  private returnUrl = '';
  private stateToken = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
  }

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  get twoFAControl() {
    return this.loginForm.controls.twoFA;
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
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
          if (response.status === 'success') {
            // loginWithTwoFA
            this.successMessage = response.message;
            this.router.navigateByUrl(this.returnUrl);
          } else if (response.status === 'MFA_REQUIRED') {
            this.isTwoFASubmit = true;
            this.stateToken = response.state_token;
          }

          this.isSubmitting = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error);
          this.isSubmitting = false;
        },
      });
  }

  submitTwoFA(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .loginWithTwoFA(
        this.loginForm.get('twoFA')?.value as string,
        this.stateToken,
      )
      .pipe(first())
      .subscribe({
        next: response => {
          if (response.status === 'success') {
            this.successMessage = response.message;
            this.router.navigateByUrl(this.returnUrl);
          }

          this.isSubmitting = false;
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
