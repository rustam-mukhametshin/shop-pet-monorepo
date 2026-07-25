import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  effect,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, first } from 'rxjs';
import { AuthService } from '../../auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import {
  debounce,
  email,
  form,
  FormField,
  maxLength,
  minLength,
  required,
} from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
  twoFA: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterLink,
    FormField,
  ],
})
export class LoginComponent implements OnInit {
  public readonly loginModel: WritableSignal<LoginData> = signal<LoginData>({
    email: '',
    password: '',
    twoFA: '',
  });

  public readonly loginFormNew = form(this.loginModel, (schemaPath) => {
    debounce(schemaPath.email, 200);
    required(schemaPath.email, {
      message: 'E-mail address required',
    });
    email(schemaPath.email, {
      message: 'Invalid e-mail address',
    });

    required(schemaPath.password, {
      message: 'Password required',
    });
    maxLength(schemaPath.password, 50, {
      message: 'Password is too long',
    });
    minLength(schemaPath.password, 6, {
      message: 'Password is too short',
    });

    if (schemaPath.twoFA) {
      minLength(schemaPath.twoFA, 6, {
        message: 'Two-factor authentication code is too short',
      });
      maxLength(schemaPath.twoFA, 6, {
        message: 'Two-factor authentication code is too long',
      });
    }
  });

  public isSubmitting = false;
  public errorMessage = '';
  public successMessage = '';
  public isTwoFASubmit = false;
  private returnUrl = '';
  private stateToken = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.onTwoFAChange();
  }

  public get emailControlNew() {
    return this.loginFormNew.email;
  }

  public get passwordControlNew() {
    return this.loginFormNew.password;
  }

  public get twoFAControlNew() {
    return this.loginFormNew.twoFA;
  }

  public ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
  }

  public submit(): void {
    if (this.loginFormNew().invalid()) {
      this.loginFormNew().markAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email: this.loginModel().email,
      password: this.loginModel().password,
    };

    this.authService
      .login(payload)
      .pipe(
        first(),
        finalize(() => {
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
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

  public submitTwoFA(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginModel().twoFA.length !== 6) {
      this.isSubmitting = !this.isSubmitting;
      return;
    }

    this.authService
      .loginWithTwoFA(this.loginModel().twoFA, this.stateToken)
      .pipe(first())
      .subscribe({
        next: (response) => {
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

  private onTwoFAChange(): void {
    effect(() => {
      const value = this.loginFormNew.twoFA().value();

      if (!this.isTwoFASubmit || this.isSubmitting || value.length !== 6) {
        return;
      }
      this.submitTwoFA();
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as
      { error?: string | string[]; message?: string } | string | undefined;
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
