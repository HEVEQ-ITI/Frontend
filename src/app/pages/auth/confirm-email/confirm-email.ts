import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
    selector: 'app-confirm-email',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './confirm-email.html',
    styleUrl: './confirm-email.css',
})
export class ConfirmEmail implements OnInit {
    email = '';
    isLoading = false;
    isConfirmed = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: Auth,
    ) {}

    ngOnInit(): void {
        const userId = this.route.snapshot.queryParamMap.get('userId');
        const token = this.route.snapshot.queryParamMap.get('token');
        const email = this.route.snapshot.queryParamMap.get('email');

    this.email = email || '';

    if (userId && token) {
        this.confirmEmail(userId, token);
        return;
    }

    this.successMessage = 'تم إنشاء الحساب، برجاء فتح بريدك الإلكتروني والضغط على رابط التأكيد';
    }

    confirmEmail(userId: string, token: string): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

    this.authService.confirmEmail({
        userId,
        token,
    }).subscribe({
        next: (response) => {
            this.isLoading = false;

            if (response.succeeded || response.isEmailConfirmed) {
                this.isConfirmed = true;
                this.successMessage = response.message || 'تم تأكيد البريد الإلكتروني بنجاح';

                setTimeout(() => {
                this.router.navigate(['/login']);
            }, 2000);

            return;
        }

          this.errorMessage = response.message || 'تعذر تأكيد البريد الإلكتروني';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            error.error ||
            'رابط التأكيد غير صحيح أو منتهي';
        },
      });
  }

  resendConfirmationEmail(): void {
    if (!this.email) {
      this.errorMessage = 'اكتب البريد الإلكتروني لإعادة إرسال رابط التأكيد';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendConfirmationEmail({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'تم إرسال رابط التأكيد مرة أخرى';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || error.error?.Message || error.error || 'تعذر إرسال رابط التأكيد';
      },
    });
  }
}
