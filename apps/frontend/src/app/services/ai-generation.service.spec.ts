import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AiGenerationService } from './ai-generation.service';

describe('AiGenerationService', () => {
  it('should send the trimmed title and auth header when generating a description', () => {
    const post = vi.fn().mockReturnValue(of({ description: 'Short dog food summary.' }));
    const storageService = {
      getBearerAuthToken: vi.fn().mockReturnValue('Bearer token'),
    } as any;
    const service = new AiGenerationService({ post } as any, storageService);

    service.generateProductDescription('  Dog Food  ').subscribe((description) => {
      expect(description).toBe('Short dog food summary.');
    });

    expect(post).toHaveBeenCalledWith(
      'http://localhost:3333/v1/ai/generate-description',
      { title: 'Dog Food' },
      {
        headers: {
          Authorization: 'Bearer token',
        },
      },
    );
  });

  it('should omit the title when it is empty', () => {
    const post = vi.fn().mockReturnValue(of({ description: 'Fallback description.' }));
    const storageService = {
      getBearerAuthToken: vi.fn().mockReturnValue('Bearer token'),
    } as any;
    const service = new AiGenerationService({ post } as any, storageService);

    service.generateProductDescription('   ').subscribe();

    expect(post).toHaveBeenCalledWith(
      'http://localhost:3333/v1/ai/generate-description',
      {},
      {
        headers: {
          Authorization: 'Bearer token',
        },
      },
    );
  });
});
