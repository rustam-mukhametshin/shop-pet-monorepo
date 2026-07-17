import {Component} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../auth.service';
import {MatDivider} from "@angular/material/divider";
import {MatToolbar} from "@angular/material/toolbar";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
  imports: [
    RouterLink,
    RouterLinkActive,
    MatDivider,
    MatToolbar,
    MatButton,
    MatAnchor,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
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
