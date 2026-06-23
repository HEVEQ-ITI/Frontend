import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { Router } from '@angular/router'

interface ServiceListing {
  id: string
  title: string
  image: string
  hourlyRate: number
  dailyRate: number
  equipmentModel: string
  equipmentCapacity: string
  serviceZone: string
  availabilityAr: string
  operatorSummary: string
  providerCompany: string
}

@Component({
  selector: 'app-services',
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {
  listings: ServiceListing[] = [
    {
      id: '1',
      title: 'ونش تادانو 50 طن',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      hourlyRate: 850,
      dailyRate: 2500,
      equipmentModel: 'Tadano',
      equipmentCapacity: '50 طن',
      serviceZone: 'الرياض',
      availabilityAr: 'متاح للحجز',
      operatorSummary: 'مشغل مرخص',
      providerCompany: 'المقاولون العرب'
    },
    {
      id: '2',
      title: 'حفار كاتربيلر 320D',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
      hourlyRate: 650,
      dailyRate: 2100,
      equipmentModel: 'Caterpillar 320D',
      equipmentCapacity: 'متوسط',
      serviceZone: 'الدمام',
      availabilityAr: 'متاح اليوم',
      operatorSummary: 'مشغل معتمد',
      providerCompany: 'السعودي للمعدات'
    },
    {
      id: '3',
      title: 'مولد كهرباء صناعي',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      hourlyRate: 300,
      dailyRate: 1200,
      equipmentModel: 'Generator 250KVA',
      equipmentCapacity: '250 KVA',
      serviceZone: 'جدة',
      availabilityAr: 'متاح خلال 24 ساعة',
      operatorSummary: 'بدون مشغل',
      providerCompany: 'النور للتأجير'
    }
  ]

  constructor(private router: Router) {}

  bookService(id: string): void {
    console.log('Selected service id:', id)

    // لما تعمل صفحة booking wizard بعدين هنغيرها للمسار الحقيقي
    // this.router.navigate(['/booking-wizard', id])
  }
}