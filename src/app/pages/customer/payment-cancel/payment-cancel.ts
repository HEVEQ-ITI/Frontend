import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-cancel.html',
  styleUrl: './payment-cancel.css'
})
export class PaymentCancel implements OnInit {
  returnLink = '/bookings'
  returnLabel = 'الرجوع إلى حجوزاتي'
  cancelMessage = 'لم يتم خصم أي مبلغ. يمكنك الرجوع إلى حجوزاتك والمحاولة مرة أخرى.'

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type')
    if (type === 'marketplaceOrder') {
      this.returnLink = '/marketplace-orders'
      this.returnLabel = 'الرجوع إلى طلبات السوق'
      this.cancelMessage = 'لم يتم خصم أي مبلغ. يمكنك الرجوع إلى طلبات السوق الخاصة بك والمحاولة مرة أخرى.'
    } else if (type === 'timeAdjustment') {
      this.returnLink = '/bookings'
      this.returnLabel = 'الرجوع إلى حجوزاتي'
      this.cancelMessage = 'لم يتم خصم أي مبلغ. يمكنك الرجوع إلى حجوزاتك والمحاولة مرة أخرى.'
    }
  }
}