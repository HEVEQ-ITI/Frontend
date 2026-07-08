import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { Auth } from '../../../core/services/auth'
import { TokenStorage } from '../../../core/services/token-storage'
import { getErrorMessage } from '../../../core/helpers/errorMessageHelper'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = ''
  lastName = ''
  userName = ''
  email = ''
  phoneNumber = ''
  password = ''
  selectedRole: 'Customer' | 'Provider' = 'Customer'

  errorMessage = ''
  successMessage = ''
  isLoading = false
  showPassword = false

  constructor(
    private authService: Auth,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}

  selectRole(role: 'Customer' | 'Provider'): void {
    this.selectedRole = role
  }

  submit(): void {
    this.errorMessage = ''
    this.successMessage = ''

    const phoneNumber = this.normalizePhone(this.phoneNumber)
    const userName = this.userName.trim().replace(/\s+/g, '_')

    if (!this.firstName.trim() || !this.lastName.trim() || !userName || !this.email.trim() || !phoneNumber || !this.password) {
      this.errorMessage = 'من فضلك املأ كل البيانات المطلوبة'
      return
    }

    if (!/^01[0125][0-9]{8}$/.test(phoneNumber)) {
      this.errorMessage = 'رقم الهاتف يجب أن يكون رقم موبايل مصري صحيح مثل 01012345678'
      return
    }

    if (this.password.length < 6) {
      this.errorMessage = 'كلمة المرور يجب أن تكون 6 رموز على الأقل'
      return
    }

    this.isLoading = true

    this.authService.register({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      userName,
      email: this.email.trim(),
      phoneNumber,
      password: this.password,
      role: this.selectedRole
    }).subscribe({
      next: response => {
        this.isLoading = false

        if (!response.isAuthenticated && !(response.succeeded || response.emailConfirmationSent || response.requiresEmailConfirmation)) {
          this.errorMessage = response.message || 'فشل إنشاء الحساب'
          return
        }

        if (!response.isAuthenticated || response.requiresEmailConfirmation || response.emailConfirmationSent) {
          this.successMessage = response.message || 'تم إنشاء الحساب بنجاح. برجاء تأكيد البريد الإلكتروني.'
          this.router.navigate(['/auth/confirm-email'], { queryParams: { email: this.email, pending: true } })
          return
        }

        this.successMessage = 'تم إنشاء الحساب بنجاح'

        const role = this.tokenStorage.getRole()

        if (role === 'customer') {
          this.router.navigate(['/'])
          return
        }

        if (role === 'provider') {
          this.router.navigate(['/provider-dashboard'])
          return
        }

        if (role === 'admin' || role === 'employee') {
          this.router.navigate(['/admin'])
          return
        }

        this.router.navigate(['/'])
      },
      error: error => {
        this.isLoading = false
        this.errorMessage = getErrorMessage(error, 'حدث خطأ أثناء إنشاء الحساب')
      }
    })
  }

  private normalizePhone(value: string): string {
    return (value || '')
      .trim()
      .replace(/[\s\-()]/g, '')
      .replace(/^\+20/, '0')
      .replace(/^0020/, '0')
      .replace(/[٠۰]/g, '0')
      .replace(/[١۱]/g, '1')
      .replace(/[٢۲]/g, '2')
      .replace(/[٣۳]/g, '3')
      .replace(/[٤۴]/g, '4')
      .replace(/[٥۵]/g, '5')
      .replace(/[٦۶]/g, '6')
      .replace(/[٧۷]/g, '7')
      .replace(/[٨۸]/g, '8')
      .replace(/[٩۹]/g, '9')
  }
}