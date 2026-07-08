import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { normalizeErrorPayload } from '../helpers/errorMessageHelper'

export const errorNormalizationInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error)
      }

      const normalizedError = new HttpErrorResponse({
        error: normalizeErrorPayload(error.error),
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined
      })

      return throwError(() => normalizedError)
    })
  )
}
