// Mirrors HEVEQ.Application.Features.Categories.DTOs.CategoryDto
export interface CategoryDto {
  id: number
  name: string
  slug: string
  type: string
  parentId: number | null
}

// Mirrors HEVEQ.Domain.Enums.CategoryType
export type CategoryType = 'Service' | 'Marketplace'