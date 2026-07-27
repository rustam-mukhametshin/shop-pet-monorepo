import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AiGenerationService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly storageService: StorageService,
  ) {}

  generateProductDescription(title?: string | null): Observable<ResponseJsonType<string>> {
    const normalizedTitle = title?.trim();
    const payload = normalizedTitle ? { title: normalizedTitle } : {};

    return this.httpClient.post<ResponseJsonType<string>>(
      environment.apiUrl + 'v1/ai/generate-description',
      payload,
      {
        headers: {
          Authorization: this.storageService.getBearerAuthToken(),
        },
      },
    );
  }
}
