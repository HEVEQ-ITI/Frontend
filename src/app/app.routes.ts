import { Routes } from '@angular/router'

import { Services } from './pages/public/services/services'
import { ServiceDetails } from './pages/public/service-details/service-details'
import { SearchResults } from './pages/public/search-results/search-results'

import { Login } from './pages/auth/login/login'
import { Register } from './pages/auth/register/register'

import { Dashboard } from './pages/customer/dashboard/dashboard'
import { Bookings } from './pages/customer/bookings/bookings'
import { Wallet } from './pages/customer/wallet/wallet'
import { Profile } from './pages/customer/profile/profile'

import { ProviderDashboard } from './pages/provider/provider-dashboard/provider-dashboard'
import { BookingRequests } from './pages/provider/booking-requests/booking-requests'
import { ActiveJobs } from './pages/provider/active-jobs/active-jobs'
import { Equipment } from './pages/provider/equipment/equipment'
import { Earnings } from './pages/provider/earnings/earnings'
import { CreateListing } from './pages/provider/create-listing/create-listing'
import { Operators } from './pages/provider/operators/operators'

import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard'
import { AdminUsers } from './pages/admin/admin-users/admin-users'
import { AdminListingReview } from './pages/admin/admin-listing-review/admin-listing-review'
import { AdminAccountVerification } from './pages/admin/admin-account-verification/admin-account-verification'
import { AdminDocuments } from './pages/admin/admin-documents/admin-documents'
import { AdminTickets } from './pages/admin/admin-tickets/admin-tickets'
import { AdminDisputes } from './pages/admin/admin-disputes/admin-disputes'
import { AdminFieldVerificationComponent } from './pages/admin/admin-field-verification/admin-field-verification'
import { authGuard } from './core/guards/auth-guard'
import { roleGuard } from './core/guards/role-guard'
import { Home } from './pages/public/home/home'
import { Marketplace } from './pages/public/marketplace/marketplace'
import { ProductDetails } from './pages/public/product-details/product-details'

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'marketplace',
    component: Marketplace
  },
  {
    path: 'services',
    component: Services
  },
  {
    path: 'product-details/:id',
    component: ProductDetails
  },
  {
    path: 'service-details/:id',
    component: ServiceDetails
  },
  {
    path: 'search-results',
    component: SearchResults
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard(['customer'])]
  },
  {
    path: 'bookings',
    component: Bookings,
    canActivate: [authGuard, roleGuard(['customer'])]
  },
  {
    path: 'wallet',
    component: Wallet,
    canActivate: [authGuard, roleGuard(['customer'])]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },

  {
    path: 'provider-dashboard',
    component: ProviderDashboard,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'booking-requests',
    component: BookingRequests,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'active-jobs',
    component: ActiveJobs,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'equipment',
    component: Equipment,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'create-listing',
    component: CreateListing,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'create-listing/:id',
    component: CreateListing,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'operators',
    component: Operators,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'earnings',
    component: Earnings,
    canActivate: [authGuard, roleGuard(['provider'])]
  },
  {
    path: 'create-listing',
    component: CreateListing,
    canActivate: [authGuard, roleGuard(['provider'])]
  },

  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/listing-review',
    component: AdminListingReview,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/account-verifications',
    component: AdminAccountVerification,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/documents',
    component: AdminDocuments,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/tickets',
    component: AdminTickets,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/disputes',
    component: AdminDisputes,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin/field-verifications',
    component: AdminFieldVerificationComponent,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },

  {
    path: '**',
    redirectTo: ''
  }
]