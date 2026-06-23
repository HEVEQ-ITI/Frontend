import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
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
      return
    }

    this.isLoading = true

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      email: this.email,
      password: this.password,
      role: this.selectedRole
    }).subscribe({
      next: response => {
        this.isLoading = false

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

        this.router.navigate(['/'])
      },
      error: error => {
        this.isLoading = false
        this.errorMessage =
          error.error?.message ||
          error.error ||
          'حدث خطأ أثناء إنشاء الحساب'
      }
    })
  }
}