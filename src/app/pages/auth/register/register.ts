import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { Auth } from '../../../core/services/auth'

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

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  selectRole(role: 'Customer' | 'Provider'): void {
    this.selectedRole = role
  }

  submit(): void {
    this.errorMessage = ''
    this.successMessage = ''

    if (!this.firstName || !this.lastName || !this.userName || !this.email || !this.phoneNumber || !this.password) {
      this.errorMessage = 'من فضلك املأ كل البيانات المطلوبة'
      return
    }

    if (this.phoneNumber.length !== 11) {
      this.errorMessage = 'رقم الهاتف يجب أن يكون 11 رقم'
      return
    }

    this.isLoading = true

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password,
      role: this.selectedRole
    }).subscribe({
      next: response => {
        this.isLoading = false

        if (response.succeeded || response.emailConfirmationSent || response.requiresEmailConfirmation) {
          this.successMessage = response.message || 'تم إنشاء الحساب بنجاح، برجاء تأكيد البريد الإلكتروني'

          this.router.navigate(['/auth/confirm-email'], {
            queryParams: {
              email: this.email,
              mode: 'check-email'
            }
          })

          return
        }

        this.errorMessage = response.message || 'فشل إنشاء الحساب'
      },
      error: error => {
        this.isLoading = false
        this.errorMessage =
          error.error?.message ||
          error.error?.Message ||
          error.error ||
          'حدث خطأ أثناء إنشاء الحساب'
      }
    })
  }
}