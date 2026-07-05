import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_BASE_URL } from '../constants/api.constants'
import { Category, CategoryType } from '../models/category.models'

@Injectable({
  providedIn: 'root'
})
export class Categories {
  constructor(private http: HttpClient) {}

  getAll(type?: CategoryType) {
    const url = type
      ? `${API_BASE_URL}/categories?type=${type}`
      : `${API_BASE_URL}/categories`

    return this.http.get<Category[]>(url)
  }
}
