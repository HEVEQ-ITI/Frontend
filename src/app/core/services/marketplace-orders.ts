import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_BASE_URL } from '../constants/api.constants'
import { CreateMarketplaceOrderRequest, CreateMarketplaceOrderResponse } from '../models/marketplace-order.models'

@Injectable({
  providedIn: 'root'
})
export class MarketplaceOrdersService {
  constructor(private http: HttpClient) {}

  // POST /api/marketplace-orders (requires auth; buyer cannot be the listing's seller,
  // listing must be Active - see CreateMarketPlaceOrderCommandHandler)
  createOrder(request: CreateMarketplaceOrderRequest) {
    return this.http.post<CreateMarketplaceOrderResponse>(`${API_BASE_URL}/marketplace-orders`, request)
  }
}