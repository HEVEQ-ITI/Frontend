// Mirrors HEVEQ.Domain.Enums.DeliveryPreference
export type DeliveryPreference = 'Pickup' | 'Delivery' | 'Either'

// Mirrors CreateMarketPlaceOrderRequest (HEVEQ.Application.Features.MarketPlaceOrders.Commands.CreateMarketPlaceOrder)
export interface CreateMarketplaceOrderRequest {
  listingId: string
  deliveryAddress?: string
  deliveryPreference?: DeliveryPreference
}

// Mirrors HEVEQ.Application.Features.MarketPlaceOrders.DTOs.CreateMarketplaceOrderResponse
export interface CreateMarketplaceOrderResponse {
  id: string
  orderNumber: string
  listingTitle: string
  amount: number
  status: string
  statusAr: string
  message: string
}