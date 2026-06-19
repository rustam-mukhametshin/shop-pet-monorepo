import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface Profile {
  name: string;
  _id: string;
  twoFA: boolean,
  userId: string
  createdAt: Date,
  updatedAt: Date,
}

export interface TwoFactorStatus {
  enabled: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

export interface UpdateProfilePayload {
  name: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly profileUrl = `${environment.apiUrl}auth/profile`;
  private readonly twoFactorUrl = `${environment.apiUrl}auth/2fa`;

  constructor(private readonly http: HttpClient) {
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.profileUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('shop-pet-auth-token')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<Profile> {
    return this.http.put<Profile>(this.profileUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('shop-pet-auth-token')}`,
      },
    });
  }

  get2fa(): Observable<TwoFactorSetup> {
    return this.http.get<TwoFactorSetup>(this.twoFactorUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('shop-pet-auth-token')}`,
      },
    });
  }

  set2fa(enabled: boolean): Observable<TwoFactorStatus> {
    return this.http.put<TwoFactorStatus>(
      this.twoFactorUrl,
      {enabled},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
