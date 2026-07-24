import { Service } from '@angular/core';

@Service()
export class StorageService {
  private readonly tokenKey: string = 'shop-pet-auth-token';

  public get(): string {
    return localStorage.getItem(this.tokenKey) || 'NO AUTH TOKEN';
  }

  public remove(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public set(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public has(): boolean {
    return this.get() !== null && this.get() !== 'NO AUTH TOKEN';
  }

  public getBearerAuthToken(): string {
    return `Bearer ${this.get()}`;
  }
}
