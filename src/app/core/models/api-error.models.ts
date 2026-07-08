import { HttpErrorResponse } from '@angular/common/http'
import { getErrorMessage } from '../helpers/errorMessageHelper'

export interface ApiProblemDetails {
  status?: number
  title?: string
  detail?: string
  instance?: string
  message?: string
  Message?: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(err: HttpErrorResponse): string {
  return getErrorMessage(err)
}
