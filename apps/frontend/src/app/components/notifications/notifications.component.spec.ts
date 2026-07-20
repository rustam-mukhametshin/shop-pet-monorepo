import { BehaviorSubject } from 'rxjs';
import { Notification, NotificationService } from '../../services/notification.service';
import { NotificationsComponent } from './notifications.component';
import {vi} from "vitest";

function makeService(initial: Notification[] = []): NotificationService {
  const service = new NotificationService();
  (service as any).notificationsSubject = new BehaviorSubject<Notification[]>(initial);
  service.notifications$ = (service as any).notificationsSubject.asObservable();
  return service;
}

describe('NotificationsComponent', () => {
  let service: NotificationService;
  let component: NotificationsComponent;

  beforeEach(() => {
    service = makeService();
    component = new NotificationsComponent(service);
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty notifications list', () => {
    expect(component.notifications()).toEqual([]);
  });

  it('should reflect notifications emitted by the service', () => {
    const notif: Notification = { id: '1', message: 'Hello', type: 'info' };
    (service as any).notificationsSubject.next([notif]);
    expect(component.notifications()).toEqual([notif]);
  });

  it('should call service.remove when close() is called', () => {
    const removeSpy = vi.spyOn(service, 'remove');
    component.close('42');
    expect(removeSpy).toHaveBeenCalledWith('42');
  });

  it('should unsubscribe on destroy', () => {
    const sub = component.sub$!;
    const unsubSpy = vi.spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
