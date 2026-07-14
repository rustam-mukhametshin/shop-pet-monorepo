import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {MenuComponent} from "./components/menu/menu.component";
import {NotificationsComponent} from "./components/notifications/notifications.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    MenuComponent,
    NotificationsComponent
  ]
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // afterRender(() => {
    //     console.log('afterRender');
    // })
    //
    // afterNextRender(() => {
    //     console.log('afterNextRender');
    // })
  }
}
