import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { finalize, Subscription } from 'rxjs'
import { NotificationItem } from '../../../core/models/notificationModels'
import { NotificationsService } from '../../../core/services/notificationsService'

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: NotificationItem[] = []
  totalCount = 0
  unreadCount = 0
  page = 1
  pageSize = 20
  isLoading = false
  errorMessage = ''

  private latestNotificationSub?: Subscription

  constructor(
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications()

    this.latestNotificationSub = this.notificationsService.latestNotification$.subscribe(notification => {
      this.notifications = [
        notification,
        ...this.notifications.filter(item => item.id !== notification.id)
      ]

      this.unreadCount += notification.isRead ? 0 : 1
      this.totalCount += 1

      this.cdr.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this.latestNotificationSub?.unsubscribe()
  }

  loadNotifications(): void {
    this.isLoading = true
    this.errorMessage = ''
    this.cdr.detectChanges()

    this.notificationsService
      .getMyNotifications(null, this.page, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false
          this.cdr.detectChanges()
        })
      )
      .subscribe({
        next: response => {
          this.notifications = response.items ?? []
          this.totalCount = response.totalCount ?? 0
          this.unreadCount = response.unreadCount ?? 0
          this.errorMessage = ''

          this.cdr.detectChanges()
        },
        error: error => {
          this.notifications = []
          this.totalCount = 0
          this.unreadCount = 0

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            'تعذر تحميل الإشعارات'

          this.cdr.detectChanges()
        }
      })
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      return
    }

    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true
        this.unreadCount = Math.max(this.unreadCount - 1, 0)

        this.cdr.detectChanges()
      },
      error: () => {}
    })
  }

  getNotificationIcon(eventType: string): string {
    if (eventType.includes('Booking')) {
      return '📅'
    }

    if (eventType.includes('Document')) {
      return '📄'
    }

    if (eventType.includes('Ticket')) {
      return '🎫'
    }

    if (eventType.includes('Marketplace') || eventType.includes('Order')) {
      return '🛒'
    }

    if (eventType.includes('Message')) {
      return '💬'
    }

    return '🔔'
  }

  trackById(index: number, item: NotificationItem): string {
    return item.id
  }
}