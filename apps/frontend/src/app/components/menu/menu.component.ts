import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  isLoggedIn$ = this.authService.isLoggedIn$();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) {
      return;
    }

    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
