import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { NotificationItem } from '../models/notificationModels'

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private latestNotificationSubject = new Subject<NotificationItem>()
  latestNotification$ = this.latestNotificationSubject.asObservable()

  constructor() {}

  loadUnreadCount(): void {
    console.log('NotificationsService.loadUnreadCount placeholder called')
  }

  pushRealtimeNotification(notification: NotificationItem): void {
    console.log('NotificationsService.pushRealtimeNotification placeholder called', notification)
    this.latestNotificationSubject.next(notification)
  }
}
