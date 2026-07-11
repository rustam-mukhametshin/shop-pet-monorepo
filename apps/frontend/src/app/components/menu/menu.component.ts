import {Component} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../auth.service';
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatDivider
  ]
})
export class MenuComponent {
  isAuth = this.authService.isAuth;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
  }

  logout(): void {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) {
      return;
    }

    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
