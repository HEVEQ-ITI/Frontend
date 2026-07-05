export interface RealtimeMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string | null
  messageType: string
  sentAt: string
}