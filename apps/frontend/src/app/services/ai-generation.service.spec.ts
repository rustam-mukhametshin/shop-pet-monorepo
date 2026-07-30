import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AiGenerationService } from './ai-generation.service';

describe('AiGenerationService', () => {
  it('should send the trimmed title and auth header when generating a description', () => {
    const post = vi.fn().mockReturnValue(of({
      status: 'success',
      message: 'Successfully generated description',
      data: 'Short dog food summary.',
    }));
    const storageService = {
      getBearerAuthToken: vi.fn().mockReturnValue('Bearer token'),
    } as any;
    const service = new AiGenerationService({ post } as any, storageService);

    service.generateProductDescription('  Dog Food  ').subscribe((response) => {
      expect(response).toEqual({
        status: 'success',
        message: 'Successfully generated description',
        data: 'Short dog food summary.',
      });
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
    const post = vi.fn().mockReturnValue(of({
      status: 'success',
      message: 'Successfully generated description',
      data: 'Fallback description.',
    }));
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
