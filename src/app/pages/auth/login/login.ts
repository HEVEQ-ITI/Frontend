import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { finalize } from 'rxjs'
import { Auth } from '../../../core/services/auth'
import { TokenStorage } from '../../../core/services/token-storage'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = ''
  password = ''

  errorMessage = ''
  infoMessage = ''
  isLoading = false
  showResendConfirmation = false

  constructor(
    private authService: Auth,
    private tokenStorage: TokenStorage,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  submit(): void {
    this.errorMessage = ''
    this.infoMessage = ''
    this.showResendConfirmation = false

    if (!this.email || !this.password) {
      this.errorMessage = 'من فضلك اكتب البريد الإلكتروني وكلمة المرور'
      this.cdr.detectChanges()
      return
    }

    this.isLoading = true
    this.cdr.detectChanges()

    this.authService.login({
      email: this.email,
      password: this.password
    })
    .pipe(
      finalize(() => {
        this.isLoading = false
        this.cdr.detectChanges()
      })
    )
    .subscribe({
      next: response => {
        if (!response.isAuthenticated) {
          this.errorMessage = response.message || 'بيانات الدخول غير صحيحة'
          this.cdr.detectChanges()
          return
        }

        this.authService.getMe().subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')
            const role = this.tokenStorage.getRole()
            const dashboardRoute = returnUrl || this.authService.getDashboardRoute(role)

            this.router.navigate([dashboardRoute])
          },
          error: () => {
            const role = this.tokenStorage.getRole()
            this.router.navigate([this.authService.getDashboardRoute(role)])
          }
        })
      },
      error: error => {
        const response = error.error

        if (error.status === 403 && response?.requiresEmailConfirmation) {
          this.showResendConfirmation = true
          this.errorMessage = response.message || 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول'
          this.cdr.detectChanges()
          return
        }

        this.errorMessage = this.getErrorMessage(error, 'حدث خطأ أثناء تسجيل الدخول')
        this.cdr.detectChanges()
      }
    })
  }

  resendConfirmationEmail(): void {
    if (!this.email) {
      this.errorMessage = 'اكتب البريد الإلكتروني أولاً'
      this.cdr.detectChanges()
      return
    }

    this.isLoading = true
    this.errorMessage = ''
    this.infoMessage = ''

    this.authService.resendConfirmationEmail({ email: this.email })
      .pipe(
        finalize(() => {
          this.isLoading = false
          this.cdr.detectChanges()
        })
      )
      .subscribe({
        next: response => {
          this.infoMessage = response.message || 'تم إرسال رابط التأكيد مرة أخرى'
          this.showResendConfirmation = false
          this.cdr.detectChanges()
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(error, 'تعذر إرسال رابط التأكيد')
          this.cdr.detectChanges()
        }
      })
  }

  private getErrorMessage(error: any, fallback: string): string {
    const response = error?.error

    if (!response) {
      return fallback
    }

    if (typeof response === 'string') {
      return response
    }

    if (response.message) {
      return response.message
    }

    if (response.Message) {
      return response.Message
    }

    if (response.errors) {
      const errors = response.errors

      if (Array.isArray(errors)) {
        return errors.join('، ')
      }

      if (typeof errors === 'object') {
        return Object.values(errors)
          .flat()
          .join('، ')
      }
    }

    return fallback
  }
}