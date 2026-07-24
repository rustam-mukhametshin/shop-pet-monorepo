import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { StorageService } from './services/storage.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface LoginResponse {
  userId: string;
  message: string;
  token: string;
  status: string;
  state_token: string;
  expires_at: number;
}

export interface SignupResponse {
  message: string;
}

const headers = {
  'Content-Type': 'application/json',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly isLoggedIn: WritableSignal<boolean> = signal(this.storageService.has());
  public readonly isAuth: Signal<boolean> = this.isLoggedIn.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService,
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}auth/login`, credentials, {
        headers,
      })
      .pipe(
        tap((response) => {
          if (response.status !== 'MFA_REQUIRED' && response.status === 'success') {
            this.storageService.set(response.token);
            this.isLoggedIn.set(true);
          }
        }),
      );
  }

  loginWithTwoFA(twoFACode: string, stateToken: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}auth/login-twofa`,
        {
          twoFACode: twoFACode,
          stateToken: stateToken,
        },
        { headers },
      )
      .pipe(
        tap((response) => {
          if (response.message && response.status === 'success') {
            if (response.token) {
              this.storageService.set(response.token);
            }
            this.isLoggedIn.set(true);
          }
        }),
      );
  }

  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${environment.apiUrl}auth/signup`, credentials, {
      headers,
    });
  }

  logout(): void {
    this.isLoggedIn.set(true);
    return this.storageService.remove();
  }
}
