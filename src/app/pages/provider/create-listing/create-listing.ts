import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, NgForm } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { HttpErrorResponse } from '@angular/common/http'
import { finalize, forkJoin } from 'rxjs'

import { Category } from '../../../core/models/category.models'
import { CreateMarketplaceListingRequest, MarketplaceCondition, MarketplaceTransactionMethod } from '../../../core/models/marketplace.models'
import { CategoriesService } from '../../../core/services/categories'
import { MarketplaceService } from '../../../core/services/marketplace'
import { ServiceListings } from '../../../core/services/service-listings'
import { OperatorsApi } from '../../../core/services/operators-api'
import { Toast } from '../../../core/services/toast'
import { extractErrorMessage } from '../../../core/models/api-error.models'
import { Operator } from '../../../core/models/operator.models'
import { ManageServiceListing, ServiceListingFormPayload } from '../../../core/models/service-listing.models'

const EMPTY_BASIC_INFO: ServiceListingFormPayload = {
  categoryId: 0,
  title: '',
  description: '',
  tags: null,
  equipmentModel: null,
  equipmentCapacity: null,
  equipmentCondition: null,
  yearOfManufacture: null,
  equipmentRegistrationNumber: null,
  hourlyRate: 0,
  dailyRate: null,
  minimumBookingHours: 1
}

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListing implements OnInit {
  // Tab control
  listingType: 'service' | 'marketplace' = 'service'

  // Shared Categories
  categories: Category[] = []

  // Marketplace flow fields
  form: FormGroup
  isSubmitting = false
  submitMessage = ''
  submitError = ''

  // Service flow fields
  listingId: string | null = null
  isEditMode = false
  currentStep = 1
  isInitialLoading = false
  isSavingStep1 = false
  isAddingPhoto = false
  isLinkingOperator = false
  isAddingAvailability = false

  basicInfoModel: ServiceListingFormPayload = { ...EMPTY_BASIC_INFO }
  availabilityModel = {
    dayOfWeek: 0,
    openTime: '08:00',
    closeTime: '17:00'
  }

  availableOperators: Operator[] = []
  newPhotoUrl = ''
  newPhotoOrder = 1
  selectedOperatorId = ''
  manageData: ManageServiceListing | null = null

  steps = [
    { id: 1, label: 'المعلومات الأساسية' },
    { id: 2, label: 'الصور' },
    { id: 3, label: 'المشغلين' },
    { id: 4, label: 'التوفر' },
    { id: 5, label: 'المراجعة والإرسال' }
  ]

  readonly dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private serviceListings: ServiceListings,
    private categoriesService: CategoriesService,
    private marketplaceService: MarketplaceService,
    private operatorsApi: OperatorsApi,
    private toast: Toast
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
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      this.listingId = idParam
      this.isEditMode = true
      this.listingType = 'service'
      this.loadInitialEditData(idParam)
      this.loadServiceCategories()
    } else {
      this.switchListingType(this.listingType)
    }

    this.operatorsApi.getMine().subscribe({
      next: operators => {
        this.availableOperators = operators.filter(o => o.isActive)
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  switchListingType(type: 'service' | 'marketplace'): void {
    if (this.isEditMode) return
    this.listingType = type
    this.categories = []

    if (type === 'service') {
      this.loadServiceCategories()
    } else {
      this.loadMarketplaceCategories()
    }
  }

  loadServiceCategories(): void {
    this.categoriesService.getCategories('Service').subscribe({
      next: categories => {
        this.categories = categories
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  loadMarketplaceCategories(): void {
    this.categoriesService.getCategories('Marketplace').subscribe({
      next: categories => {
        this.categories = categories
        if (categories.length > 0) {
          this.form.patchValue({ categoryId: categories[0].id })
        }
      },
      error: () => {
        this.submitError = 'تعذر تحميل الفئات حالياً.'
      }
    })
  }

  // ---------- Service Wizard Methods ----------

  private loadInitialEditData(id: string): void {
    this.isInitialLoading = true

    forkJoin({
      detail: this.serviceListings.getById(id),
      manage: this.serviceListings.getManage(id)
    }).subscribe({
      next: ({ detail, manage }) => {
        this.basicInfoModel = {
          categoryId: detail.categoryId,
          title: detail.title,
          description: detail.description,
          tags: detail.tags,
          equipmentModel: detail.equipmentModel,
          equipmentCapacity: detail.equipmentCapacity,
          equipmentCondition: detail.equipmentCondition,
          yearOfManufacture: detail.yearOfManufacture,
          equipmentRegistrationNumber: detail.equipmentRegistrationNumber,
          hourlyRate: detail.hourlyRate,
          dailyRate: detail.dailyRate,
          minimumBookingHours: detail.minimumBookingHours
        }
        this.manageData = manage
        this.isInitialLoading = false
      },
      error: (err: HttpErrorResponse) => {
        this.isInitialLoading = false
        this.toast.error(extractErrorMessage(err))
      }
    })
  }

  private refreshManageData(): void {
    if (!this.listingId) return

    this.serviceListings.getManage(this.listingId).subscribe({
      next: data => (this.manageData = data),
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  goToStep(step: number): void {
    if (step > 1 && !this.listingId) {
      this.toast.error('احفظ المعلومات الأساسية أولاً')
      return
    }
    this.currentStep = step
  }

  saveBasicInfo(form: NgForm): void {
    if (form.invalid) return

    this.isSavingStep1 = true

    if (this.listingId) {
      this.serviceListings.update(this.listingId, this.basicInfoModel).subscribe({
        next: () => {
          this.isSavingStep1 = false
          this.toast.success('تم تحديث المعلومات الأساسية')
          this.refreshManageData()
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingStep1 = false
          this.toast.error(extractErrorMessage(err))
        }
      })
    } else {
      this.serviceListings.create(this.basicInfoModel).subscribe({
        next: result => {
          this.isSavingStep1 = false
          this.listingId = result.id
          this.toast.success(result.message)
          this.refreshManageData()
          this.currentStep = 2
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingStep1 = false
          this.toast.error(extractErrorMessage(err))
        }
      })
    }
  }

  addPhoto(): void {
    if (!this.listingId || !this.newPhotoUrl.trim()) return

    this.isAddingPhoto = true

    this.serviceListings
      .addPhoto(this.listingId, { photoUrl: this.newPhotoUrl.trim(), displayOrder: this.newPhotoOrder })
      .subscribe({
        next: () => {
          this.isAddingPhoto = false
          this.newPhotoUrl = ''
          this.newPhotoOrder = (this.manageData?.photos.length ?? 0) + 1
          this.toast.success('تمت إضافة الصورة')
          this.refreshManageData()
        },
        error: (err: HttpErrorResponse) => {
          this.isAddingPhoto = false
          this.toast.error(extractErrorMessage(err))
        }
      })
  }

  deletePhoto(photoId: string): void {
    if (!this.listingId) return

    this.serviceListings.deletePhoto(this.listingId, photoId).subscribe({
      next: () => {
        this.toast.success('تم حذف الصورة')
        this.refreshManageData()
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  linkOperator(): void {
    if (!this.listingId || !this.selectedOperatorId) return

    this.isLinkingOperator = true

    this.serviceListings.linkOperator(this.listingId, this.selectedOperatorId).subscribe({
      next: result => {
        this.isLinkingOperator = false
        this.selectedOperatorId = ''
        this.toast.success(result.message)
        this.refreshManageData()
      },
      error: (err: HttpErrorResponse) => {
        this.isLinkingOperator = false
        this.toast.error(extractErrorMessage(err))
      }
    })
  }

  unlinkOperator(operatorId: string): void {
    if (!this.listingId) return

    this.serviceListings.unlinkOperator(this.listingId, operatorId).subscribe({
      next: () => {
        this.toast.success('تم إلغاء ربط المشغل')
        this.refreshManageData()
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  addAvailability(): void {
    if (!this.listingId) return

    this.isAddingAvailability = true

    this.serviceListings.addAvailability(this.listingId, this.availabilityModel).subscribe({
      next: () => {
        this.isAddingAvailability = false
        this.toast.success('تمت إضافة الموعد')
        this.refreshManageData()
      },
      error: (err: HttpErrorResponse) => {
        this.isAddingAvailability = false
        this.toast.error(extractErrorMessage(err))
      }
    })
  }

  deleteAvailability(availabilityId: string): void {
    if (!this.listingId) return

    this.serviceListings.deleteAvailability(this.listingId, availabilityId).subscribe({
      next: () => {
        this.toast.success('تم حذف الموعد')
        this.refreshManageData()
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  submitForReview(): void {
    if (!this.listingId) return

    this.serviceListings.submitForReview(this.listingId).subscribe({
      next: result => {
        this.toast.success(result.message)
        this.router.navigate(['/equipment'])
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })
  }

  // ---------- Marketplace Submit Method ----------

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
