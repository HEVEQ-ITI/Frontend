import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
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
    private route: ActivatedRoute
  ) {}

  submit(): void {
    this.isLoading = true
    this.errorMessage = ''
    this.infoMessage = ''
    this.showResendConfirmation = false

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: response => {
        if (!response.isAuthenticated) {
          this.isLoading = false
          this.errorMessage = response.message || 'بيانات الدخول غير صحيحة'
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
        this.isLoading = false

        const response = error.error

        if (error.status === 403 && response?.requiresEmailConfirmation) {
          this.showResendConfirmation = true
          this.errorMessage = response.message || 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول'
          return
        }

        this.errorMessage =
          response?.message ||
          response?.Message ||
          response ||
          'حدث خطأ أثناء تسجيل الدخول'
      }
    })
  }

  resendConfirmationEmail(): void {
    if (!this.email) {
      this.errorMessage = 'اكتب البريد الإلكتروني أولاً'
      return
    }

    this.isLoading = true
    this.errorMessage = ''
    this.infoMessage = ''

    this.authService.resendConfirmationEmail({ email: this.email }).subscribe({
      next: response => {
        this.isLoading = false
        this.infoMessage = response.message || 'تم إرسال رابط التأكيد مرة أخرى'
        this.showResendConfirmation = false
      },
      error: error => {
        this.isLoading = false
        this.errorMessage =
          error.error?.message ||
          error.error?.Message ||
          error.error ||
          'تعذر إرسال رابط التأكيد'
      }
    })
  }
}