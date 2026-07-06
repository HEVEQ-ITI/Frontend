import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component } from '@angular/core'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { finalize } from 'rxjs'
import { Auth } from '../../../core/services/auth'
import { TokenStorage } from '../../../core/services/token-storage'

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
  password = ''
  selectedRole: 'Customer' | 'Provider' = 'Customer'

  errorMessage = ''
  successMessage = ''
  isLoading = false

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}

  selectRole(role: 'Customer' | 'Provider'): void {
    this.selectedRole = role
  }

  submit(): void {
    this.errorMessage = ''
    this.successMessage = ''

    if (!this.firstName || !this.lastName || !this.userName || !this.email || !this.password) {
      this.errorMessage = 'من فضلك املأ كل البيانات المطلوبة'
      this.cdr.detectChanges()
      return
    }

    if (this.phoneNumber.length !== 11) {
      this.errorMessage = 'رقم الهاتف يجب أن يكون 11 رقم'
      this.cdr.detectChanges()
      return
    }

    this.isLoading = true
    this.cdr.detectChanges()

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      email: this.email,
      password: this.password,
      role: this.selectedRole
    })
    .pipe(
      finalize(() => {
        this.isLoading = false
        this.cdr.detectChanges()
      })
    )
    .subscribe({
      next: response => {
        if (response.succeeded || response.emailConfirmationSent || response.requiresEmailConfirmation) {
          this.successMessage = response.message || 'تم إنشاء الحساب بنجاح، برجاء تأكيد البريد الإلكتروني'
          this.cdr.detectChanges()

        if (!response.isAuthenticated) {
          this.errorMessage = response.message || 'فشل إنشاء الحساب'
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

        this.errorMessage = response.message || 'فشل إنشاء الحساب'
        this.cdr.detectChanges()
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'حدث خطأ أثناء إنشاء الحساب')
        this.cdr.detectChanges()
        this.router.navigate(['/'])
      },
      error: error => {
        this.isLoading = false
        this.errorMessage =
          error.error?.message ||
          error.error?.title ||
          (error.error?.errors ? Object.values(error.error.errors).flat().join(' - ') : null) ||
          (typeof error.error === 'string' ? error.error : null) ||
          'حدث خطأ أثناء إنشاء الحساب'
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