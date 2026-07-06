import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { HttpErrorResponse } from '@angular/common/http'
import { forkJoin } from 'rxjs'
import { ServiceListings } from '../../../core/services/service-listings'
import { Categories } from '../../../core/services/categories'
import { OperatorsApi } from '../../../core/services/operators-api'
import { Toast } from '../../../core/services/toast'
import { extractErrorMessage } from '../../../core/models/api-error.models'
import { Category } from '../../../core/models/category.models'
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListing implements OnInit {
  listingId: string | null = null
  isEditMode = false

  manageData: ManageServiceListing | null = null
  currentStep = 1

  // Only true for the very first data fetch when landing on an edit-mode
  // route. Never re-set to true again afterwards — mutations (add photo,
  // link operator, add availability, etc.) refresh manageData silently in
  // the background instead, so the wizard no longer blanks back to a bare
  // "Loading..." screen after every single action.
  isInitialLoading = false

  isSavingStep1 = false

  categories: Category[] = []
  availableOperators: Operator[] = []

  basicInfoModel: ServiceListingFormPayload = { ...EMPTY_BASIC_INFO }

  newPhotoUrl = ''
  newPhotoOrder = 0
  isAddingPhoto = false

  selectedOperatorId = ''
  isLinkingOperator = false

  availabilityModel = { dayOfWeek: 0, openTime: '08:00', closeTime: '17:00' }
  isAddingAvailability = false

  readonly dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  readonly steps = [
    { id: 1, label: 'المعلومات الأساسية' },
    { id: 2, label: 'الصور' },
    { id: 3, label: 'المشغلين' },
    { id: 4, label: 'التوفر' },
    { id: 5, label: 'المراجعة والإرسال' }
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceListings: ServiceListings,
    private categoriesApi: Categories,
    private operatorsApi: OperatorsApi,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.categoriesApi.getAll('Service').subscribe({
      next: categories => (this.categories = categories),
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })

    this.operatorsApi.getMine().subscribe({
      next: operators => (this.availableOperators = operators.filter(o => o.isActive)),
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err))
    })

    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      this.listingId = idParam
      this.isEditMode = true
      this.loadInitialEditData(idParam)
    }
  }

  // Runs exactly once, when an edit-mode route is first opened. Combines the
  // two endpoints that together cover the full form:
  //  - getById()   -> ServiceListingDetailDto: has HourlyRate/DailyRate/
  //                   EquipmentModel/etc. (confirmed against
  //                   GetServiceListingByIdQueryHandler.cs)
  //  - getManage()  -> ManageServiceListingDto: has Status/Photos/Operators/
  //                   Availability/BlackoutDates/CanSubmitForReview
  // Neither endpoint alone has everything the wizard needs.
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

  // Called after every photo/operator/availability mutation. Deliberately
  // does NOT touch isInitialLoading and does NOT gate any step panel — it
  // just swaps manageData in place once the response arrives, so the current
  // step stays visible the whole time instead of flashing to a loading screen.
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

  // ---------- Step 1: Basic Info ----------

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
          this.currentStep = 2 // matches the backend's nextStep: "AddPhotos"
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingStep1 = false
          this.toast.error(extractErrorMessage(err))
        }
      })
    }
  }

  // ---------- Step 2: Photos ----------

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

  // ---------- Step 3: Operators ----------

  linkOperator(): void {
    if (!this.listingId || !this.selectedOperatorId) return

    this.isLinkingOperator = true

    // Body is a bare Guid string on the wire (not { operatorId }) — matches
    // ServiceListingsController.LinkOperator(Guid id, [FromBody] Guid operatorId).
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

  // ---------- Step 4: Availability ----------

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

  // ---------- Step 5: Review & Submit ----------

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
}