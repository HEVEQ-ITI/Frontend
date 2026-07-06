import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { finalize } from 'rxjs'
import { CategoryDto } from '../../../core/models/Category.models'
import { CreateMarketplaceListingRequest, MarketplaceCondition, MarketplaceTransactionMethod } from '../../../core/models/marketplace.models'
import { CategoriesService } from '../../../core/services/categories'
import { MarketplaceService } from '../../../core/services/marketplace'

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css',
})
export class CreateListing implements OnInit {
  form: FormGroup
  categories: CategoryDto[] = []
  isSubmitting = false
  submitMessage = ''
  submitError = ''

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private marketplaceService: MarketplaceService,
    public router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      categoryId: [null, [Validators.required]],
      condition: ['New', Validators.required],
      yearOfManufacture: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      specifications: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      isNegotiable: [false],
      transactionMethod: ['Pickup', Validators.required],
      governorate: ['', Validators.required],
      district: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.loadCategories()
  }

  loadCategories(): void {
    this.categoriesService.getCategories('Marketplace').subscribe({
      next: (categories) => {
        this.categories = categories

        if (categories.length > 0) {
          this.form.patchValue({ categoryId: categories[0].id })
        }
      },
      error: () => {
        this.submitError = 'تعذر تحميل الفئات حالياً.'
      },
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      this.submitError = 'يرجى تعبئة جميع الحقول المطلوبة.'
      return
    }

    const payload: CreateMarketplaceListingRequest = {
      categoryId: Number(this.form.value.categoryId),
      title: this.form.value.title.trim(),
      condition: this.form.value.condition as MarketplaceCondition,
      yearOfManufacture: Number(this.form.value.yearOfManufacture),
      description: this.form.value.description.trim(),
      specifications: this.form.value.specifications?.trim() || '',
      price: Number(this.form.value.price),
      isNegotiable: Boolean(this.form.value.isNegotiable),
      transactionMethod: this.form.value.transactionMethod as MarketplaceTransactionMethod,
      governorate: this.form.value.governorate.trim(),
      district: this.form.value.district.trim(),
    }

    this.isSubmitting = true
    this.submitMessage = ''
    this.submitError = ''

    this.marketplaceService
      .createListing(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.submitMessage = `تم حفظ العرض بنجاح. الحالة: ${response.statusAr || response.status}. الخطوة التالية: ${response.nextStep || 'إضافة صور'}`
          this.form.reset({
            condition: 'New',
            yearOfManufacture: new Date().getFullYear(),
            isNegotiable: false,
            transactionMethod: 'Pickup',
          })

          if (this.categories.length > 0) {
            this.form.patchValue({ categoryId: this.categories[0].id })
          }

          setTimeout(() => this.router.navigate(['/provider-dashboard']), 1200)
        },
        error: () => {
          this.submitError = 'تعذر نشر العرض. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
        },
      })
  }
}
