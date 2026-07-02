import {HttpClient} from '@angular/common/http';
import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {environment} from '../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey: string = 'shop-pet-auth-token';
  private readonly isLoggedIn: WritableSignal<boolean> = signal(this.hasToken());
  public readonly isAuth: Signal<boolean> = computed(() => this.isLoggedIn());

  constructor(private readonly http: HttpClient) {
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .pipe(tap(response => {
        if (response.status !== 'MFA_REQUIRED' && response.status === 'success') {
          this.setToken(response.token);
          this.isLoggedIn.set(true);
        }
      }))
  }

  loginWithTwoFA(twoFACode: string, stateToken: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}auth/login-twofa`, {
          twoFACode: twoFACode,
          stateToken: stateToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      .pipe(tap((response) => {
        if (response.message && response.status === 'success') {
          if (response.token) {
            this.setToken(response.token);
          }
          this.isLoggedIn.set(true);
        }
      }))
  }

  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${environment.apiUrl}auth/signup`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn.set(false);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private hasToken(): boolean {
    return this.getToken() !== null;
  }
}
