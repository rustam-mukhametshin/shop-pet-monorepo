import {of} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';
import {NotificationService} from '../../services/notification.service';
import {ProductsComponent} from './products.component';

describe('ProductsComponent', () => {
  const createComponent = () => {
    const productsService = {
      getProducts: vi.fn().mockReturnValue(of({
        prods: [],
        currentPage: 1,
        lastPage: 1,
        length: 0,
        pageSize: 10,
      })),
      deleteProduct: vi.fn(),
      patchProduct: vi.fn().mockReturnValue(of({
        _id: '1',
        title: 'Updated title',
        description: 'Food',
        price: 10,
      })),
    } as any;
    const notificationService = {
      success: vi.fn(),
      error: vi.fn(),
    } as any;
    const router = {
      navigate: vi.fn(),
    } as any;

    return {
      component: new ProductsComponent(productsService, notificationService, router),
      productsService,
      notificationService,
      router,
    };
  };

  it('should navigate to view and update routes', () => {
    const {component, router} = createComponent();

    component.viewOrUpdateProduct('1');
    component.viewOrUpdateProduct('1', true);

    expect(router.navigate).toHaveBeenCalledWith(['/products', '1', '']);
    expect(router.navigate).toHaveBeenCalledWith(['/products', '1', 'update']);
  });

  it('should patch a changed product title and close edit mode', () => {
    const {component, productsService, notificationService} = createComponent();
    component.products.set([
      {_id: '1', title: 'Old title', description: 'Food', price: 10, isEdit: true},
    ]);

    component.onTitleChange('1', ' Updated title ', 'Old title');

    expect(productsService.patchProduct).toHaveBeenCalledWith('1', {title: 'Updated title'});
    expect(notificationService.error).not.toHaveBeenCalled();
    expect(component.products()[0]).toEqual({
      _id: '1',
      title: 'Updated title',
      description: 'Food',
      price: 10,
      isEdit: false,
    });
  });

  it('should keep edit mode off when the title is unchanged', () => {
    const {component, productsService} = createComponent();
    component.products.set([
      {_id: '1', title: 'Old title', description: 'Food', price: 10, isEdit: true},
    ]);

    component.onTitleChange('1', 'Old title', 'Old title');

    expect(productsService.patchProduct).not.toHaveBeenCalled();
    expect(component.products()[0].isEdit).toBe(false);
  });

  it('should reject empty titles', () => {
    const {component, productsService, notificationService} = createComponent();
    component.products.set([
      {_id: '1', title: 'Old title', description: 'Food', price: 10, isEdit: true},
    ]);

    component.onTitleChange('1', '   ', 'Old title');

    expect(productsService.patchProduct).not.toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith('Title cannot be empty.');
  });
});
