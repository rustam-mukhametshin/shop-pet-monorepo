import { NotificationService } from './notification.service';
import {vi} from "vitest";

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty notifications list', () => {
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0]).toEqual([]);
  });

  it('should add a notification via show()', () => {
    service.show('Hello', 'info', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0]).toHaveLength(1);
    expect(emissions[0][0]).toMatchObject({ message: 'Hello', type: 'info' });
  });

  it('should add a success notification', () => {
    service.success('Done!', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0][0]).toMatchObject({ message: 'Done!', type: 'success' });
  });

  it('should add an error notification', () => {
    service.error('Oops!', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0][0]).toMatchObject({ message: 'Oops!', type: 'error' });
  });

  it('should add a warning notification', () => {
    service.warning('Watch out!', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0][0]).toMatchObject({ message: 'Watch out!', type: 'warning' });
  });

  it('should add an info notification', () => {
    service.info('FYI', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0][0]).toMatchObject({ message: 'FYI', type: 'info' });
  });

  it('should remove a notification by id', () => {
    service.show('A', 'info', 0);
    vi.advanceTimersByTime(1); // ensure unique Date.now() ids
    service.show('B', 'info', 0);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    const idToRemove = emissions[0][0].id;
    service.remove(idToRemove);
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[emissions.length - 1]).toHaveLength(1);
    expect(emissions[emissions.length - 1][0].message).toBe('B');
  });

  it('should clear all notifications', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    service.clear();
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0]).toEqual([]);
  });

  it('should auto-remove notification after duration', () => {
    service.show('Temp', 'info', 1000);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0]).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[emissions.length - 1]).toHaveLength(0);
  });

  it('should not auto-remove when duration is 0', () => {
    service.show('Persistent', 'info', 0);
    vi.advanceTimersByTime(10000);
    const emissions: any[] = [];
    service.notifications$.subscribe(n => emissions.push(n));
    expect(emissions[0]).toHaveLength(1);
  });
});
