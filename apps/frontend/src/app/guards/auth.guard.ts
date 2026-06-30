import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../auth.service';


export function canActivate() {
  const authService = inject(AuthService);
  const router = inject(Router);
  return (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    if (authService.isLoggedIn()) {
      return true;
    }
    return router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
  }
}