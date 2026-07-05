import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject, tap } from 'rxjs'
import { API_BASE_URL } from '../constants/api.constants'
import { MarkNotificationReadResponse, NotificationItem, NotificationsResponse
} from '../models/notificationModels'

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private unreadCountSubject = new BehaviorSubject<number>(0)
  private latestNotificationSubject = new Subject<NotificationItem>()

  unreadCount$ = this.unreadCountSubject.asObservable()
  latestNotification$ = this.latestNotificationSubject.asObservable()

  constructor(private http: HttpClient) {}

  getMyNotifications(isRead: boolean | null = null, page = 1, pageSize = 20) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())

    if (isRead !== null) {
      params = params.set('isRead', String(isRead))
    }

    return this.http
      .get<NotificationsResponse>(`${API_BASE_URL}/notifications/my`, { params })
      .pipe(
        tap(response => {
          this.setUnreadCount(response.unreadCount ?? 0)
        })
      )
  }

  markAsRead(id: string) {
    return this.http
      .patch<MarkNotificationReadResponse>(`${API_BASE_URL}/notifications/${id}/read`, {})
      .pipe(
        tap(response => {
          if (response.isRead) {
            this.decreaseUnreadCount()
          }
        })
      )
  }

  loadUnreadCount(): void {
    this.getMyNotifications(false, 1, 5).subscribe({
      next: response => {
        this.setUnreadCount(response.unreadCount ?? response.items.length)
      },
      error: () => {
        this.setUnreadCount(0)
      }
    })
  }

  pushRealtimeNotification(notification: NotificationItem): void {
    this.latestNotificationSubject.next(notification)

    if (!notification.isRead) {
      this.increaseUnreadCount()
    }
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(count, 0))
  }

  increaseUnreadCount(): void {
    const current = this.unreadCountSubject.value
    this.unreadCountSubject.next(current + 1)
  }

  decreaseUnreadCount(): void {
    const current = this.unreadCountSubject.value
    this.unreadCountSubject.next(Math.max(current - 1, 0))
  }
}