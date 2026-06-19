import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

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
}

export interface SignupResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'shop-pet-auth-token';
  private readonly isLoggedInSubj$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .pipe(tap(response => {
        this.setToken(response.token);
        this.isLoggedInSubj$.next(true);
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

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubj$.asObservable();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubj$.next(false);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private hasToken(): boolean {
    return this.getToken() !== null;
  }
}
