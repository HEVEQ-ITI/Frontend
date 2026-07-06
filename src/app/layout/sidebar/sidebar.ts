import { Component } from '@angular/core'
import { Router, NavigationEnd, RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs'
import { TokenStorage } from '../../core/services/token-storage'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  currentUrl = ''

  constructor(
    private router: Router,
    private tokenStorage: TokenStorage
  ) {
    this.currentUrl = this.router.url

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentUrl = (event as NavigationEnd).urlAfterRedirects
      })
  }

  get role() {
    return this.tokenStorage.getRole()
  }

  get showSidebar(): boolean {
    const url = this.currentUrl

    if (!this.role) {
      return false
    }

    if (this.role === 'customer') {
      return ['/dashboard', '/bookings', '/wallet', '/messages', '/profile', '/settings'].some(x => url.startsWith(x))
    }

    if (this.role === 'provider') {
      return ['/provider-dashboard', '/booking-requests', '/active-jobs', '/equipment', '/earnings', '/create-listing'].some(x => url.startsWith(x))
    }

    if (this.role === 'admin' || this.role === 'employee') {
      return url.startsWith('/admin')
    }

    return false
  }
}