import { Routes } from '@angular/router'

import { Services } from './pages/public/services/services'
import { ServiceDetails } from './pages/public/service-details/service-details'

import { Login } from './pages/auth/login/login'
import { Register } from './pages/auth/register/register'
import { ConfirmEmail } from './pages/auth/confirm-email/confirm-email'

import { Dashboard } from './pages/customer/dashboard/dashboard'
import { Bookings } from './pages/customer/bookings/bookings'
import { Wallet } from './pages/customer/wallet/wallet'
import { Profile } from './pages/customer/profile/profile'

import { ProviderDashboard } from './pages/provider/provider-dashboard/provider-dashboard'
import { BookingRequests } from './pages/provider/booking-requests/booking-requests'
import { ActiveJobs } from './pages/provider/active-jobs/active-jobs'
import { Equipment } from './pages/provider/equipment/equipment'
import { Earnings } from './pages/provider/earnings/earnings'

import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard'
import { AdminUsers } from './pages/admin/admin-users/admin-users'
import { AdminTickets } from './pages/admin/admin-tickets/admin-tickets'

import { authGuard } from './core/guards/auth-guard'
import { roleGuard } from './core/guards/role-guard'
import { Home } from './pages/public/home/home'
import { Marketplace } from './pages/public/marketplace/marketplace'
import { ProductDetails } from './pages/public/product-details/product-details'

import { Notifications } from './pages/customer/notifications/notifications'

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
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
  path: 'auth/confirm-email',
  component: ConfirmEmail
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
    path: 'earnings',
    component: Earnings,
    canActivate: [authGuard, roleGuard(['provider'])]
  },

  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin-users',
    component: AdminUsers,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },
  {
    path: 'admin-tickets',
    component: AdminTickets,
    canActivate: [authGuard, roleGuard(['admin', 'employee'])]
  },

  {
  path: 'notifications',
  component: Notifications,
  canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }
]