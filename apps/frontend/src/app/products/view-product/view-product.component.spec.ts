import { of } from 'rxjs';
import { ViewProductComponent } from './view-product.component';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('ViewProductComponent', () => {
  let component: ViewProductComponent;
  let productsService: { getProductById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    productsService = {
      getProductById: vi.fn().mockReturnValue(
        of({
          _id: '1',
          title: 'Dog Food',
          description: 'Food',
          price: 10,
        }),
      ),
    };

    component = new ViewProductComponent(
      {
        snapshot: {
          paramMap: {
            get: vi.fn().mockReturnValue('1'),
          },
        },
      } as any,
      productsService as any,
      null as any,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads product by route id on init', () => {
    component.ngOnInit();

    expect(productsService.getProductById).toHaveBeenCalledWith('1');
    expect(component.product$).toBeTruthy();
  });
});
