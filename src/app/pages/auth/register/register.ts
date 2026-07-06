import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { finalize } from 'rxjs'
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  selectRole(role: 'Customer' | 'Provider'): void {
    this.selectedRole = role
  }

  submit(): void {
    this.errorMessage = ''
    this.successMessage = ''

    if (!this.firstName || !this.lastName || !this.userName || !this.email || !this.phoneNumber || !this.password) {
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
      phoneNumber: this.phoneNumber,
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

          this.router.navigate(['/auth/confirm-email'], {
            queryParams: {
              email: this.email,
              mode: 'check-email'
            }
          })

          return
        }

        this.errorMessage = response.message || 'فشل إنشاء الحساب'
        this.cdr.detectChanges()
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(error, 'حدث خطأ أثناء إنشاء الحساب')
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