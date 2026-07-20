import { signal } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MenuComponent } from './menu.component';

function makeAuthService(isAuth = false): AuthService {
  return {
    isAuth: signal(isAuth),
    logout: vi.fn(),
  } as unknown as AuthService;
}

function makeRouter() {
  return { navigate: vi.fn() };
}

describe('MenuComponent', () => {
  let authService: AuthService;
  let router: ReturnType<typeof makeRouter>;
  let component: MenuComponent;

  beforeEach(() => {
    authService = makeAuthService();
    router = makeRouter();
    component = new MenuComponent(authService, router as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose isAuth signal from AuthService', () => {
    expect(component.isAuth()).toBe(false);
  });

  it('isAuth reflects authenticated state', () => {
    authService = makeAuthService(true);
    component = new MenuComponent(authService, router as any);
    expect(component.isAuth()).toBe(true);
  });

  it('logout() does nothing when user cancels confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.logout();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('logout() calls authService.logout and navigates to /login on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
