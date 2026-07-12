import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Notification, NotificationService} from '../../services/notification.service';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-notifications',
    imports: [CommonModule],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: WritableSignal<Notification[]> = signal([]);
  sub$?: Subscription;

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.sub$ = this.notificationService.notifications$.subscribe(
      notifs => {
        this.notifications.set(notifs)
      }
    );
  }

  ngOnDestroy() {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
  }

  close(id: string) {
    this.notificationService.remove(id);
  }
}
