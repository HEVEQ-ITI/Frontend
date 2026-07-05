export interface NotificationItem {
  id: string
  title: string
  body: string
  eventType: string
  referenceId: string | null
  referenceType: string | null
  isRead: boolean
  sentAt: string
}

export interface NotificationsResponse {
  items: NotificationItem[]
  unreadCount: number
  totalCount: number
}

export interface MarkNotificationReadResponse {
  id: string
  isRead: boolean
  message: string
}