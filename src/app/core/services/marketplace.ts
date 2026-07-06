import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_BASE_URL } from '../constants/api.constants'
import { CreateMarketplaceListingRequest, CreateMarketplaceListingResponse, MarketplaceListing, MarketplaceListingDetails, MarketplaceListingsQuery, PagedResult } from '../models/marketplace.models'

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  constructor(private http: HttpClient) {}

  // GET /api/marketplace-listings (public, active listings only, keyword filters)
  getListings(query: MarketplaceListingsQuery) {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('pageSize', query.pageSize.toString())

    if (query.search) {
      params = params.set('search', query.search)
    }

    if (query.condition) {
      params = params.set('condition', query.condition)
    }

    if (query.governorate) {
      params = params.set('governorate', query.governorate)
    }

    if (query.minPrice != null) {
      params = params.set('minPrice', query.minPrice.toString())
    }

    if (query.maxPrice != null) {
      params = params.set('maxPrice', query.maxPrice.toString())
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId)
    }

    return this.http.get<PagedResult<MarketplaceListing>>(`${API_BASE_URL}/marketplace-listings`, { params })
  }

  // GET /api/marketplace-listings/{id} (public; non-Active listings only visible to owner/admin)
  getById(id: string) {
    return this.http.get<MarketplaceListingDetails>(`${API_BASE_URL}/marketplace-listings/${id}`)
  }

  // POST /api/marketplace-listings
  createListing(request: CreateMarketplaceListingRequest) {
    return this.http.post<CreateMarketplaceListingResponse>(`${API_BASE_URL}/marketplace-listings`, request)
  }
}