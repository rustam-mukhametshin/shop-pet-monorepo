import { throwError, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CreateProductComponent } from './create-product.component';

describe('CreateProductComponent', () => {
  function createComponent() {
    const productsService = {
      createProduct: vi.fn().mockReturnValue(of({ _id: '1' })),
    } as any;
    const aiGenerationService = {
      generateProductDescription: vi.fn().mockReturnValue(
        of({
          status: 'success',
          message: 'Successfully generated description',
          data: 'Generated description',
        }),
      ),
    } as any;
    const notificationService = {
      success: vi.fn(),
      error: vi.fn(),
    } as any;
    const router = {
      navigate: vi.fn().mockResolvedValue(true),
    } as any;

    return {
      component: new CreateProductComponent(
        productsService,
        aiGenerationService,
        notificationService,
        router,
      ),
      productsService,
      aiGenerationService,
      notificationService,
      router,
    };
  }

  it('should create a product and navigate back to the products list', () => {
    const { component, productsService, router } = createComponent();

    component.createProduct({
      title: 'Dog Food',
      description: 'Healthy food',
      price: 20,
      image: undefined,
    });

    expect(productsService.createProduct).toHaveBeenCalledTimes(1);
    const formData = productsService.createProduct.mock.calls[0][0] as FormData;
    expect(formData.get('title')).toBe('Dog Food');
    expect(formData.get('description')).toBe('Healthy food');
    expect(formData.get('price')).toBe('20');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should generate a description from the current title and patch the form', () => {
    const { component, aiGenerationService, notificationService } = createComponent();
    const formProduct = {
      getTitleValue: vi.fn().mockReturnValue('Dog Food'),
      setDescriptionValue: vi.fn(),
    } as any;

    component.generateDescription(formProduct);

    expect(aiGenerationService.generateProductDescription).toHaveBeenCalledWith('Dog Food');
    expect(formProduct.setDescriptionValue).toHaveBeenCalledWith('Generated description');
    expect(notificationService.success).toHaveBeenCalledWith('Description generated successfully!');
    expect(component.isGeneratingDescription).toBe(false);
  });

  it('should show an error when description generation fails', () => {
    const { component, aiGenerationService, notificationService } = createComponent();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    aiGenerationService.generateProductDescription.mockReturnValue(
      throwError(() => new Error('Backend unavailable')),
    );
    const formProduct = {
      getTitleValue: vi.fn().mockReturnValue('Dog Food'),
      setDescriptionValue: vi.fn(),
    } as any;

    component.generateDescription(formProduct);

    expect(formProduct.setDescriptionValue).not.toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith(
      'Error generating description: Backend unavailable',
    );
    expect(component.isGeneratingDescription).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('should show an error when the AI response is unsuccessful', () => {
    const { component, aiGenerationService, notificationService } = createComponent();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    aiGenerationService.generateProductDescription.mockReturnValue(
      of({
        status: 'error',
        message: 'Failed to generate description',
        data: '',
      }),
    );
    const formProduct = {
      getTitleValue: vi.fn().mockReturnValue('Dog Food'),
      setDescriptionValue: vi.fn(),
    } as any;

    component.generateDescription(formProduct);

    expect(formProduct.setDescriptionValue).not.toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith(
      'Error generating description: Failed to generate description',
    );
    expect(component.isGeneratingDescription).toBe(false);
    consoleErrorSpy.mockRestore();
  });
});
