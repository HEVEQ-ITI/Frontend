import { Component, OnDestroy } from '@angular/core'
import { Router, NavigationEnd, RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { Subscription, filter } from 'rxjs'
import { TokenStorage } from '../../core/services/token-storage'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnDestroy {
  currentUrl = ''
  private routerSub: Subscription

  constructor(
    private router: Router,
    private tokenStorage: TokenStorage
  ) {
    this.currentUrl = this.router.url
    this.syncBodyClass()

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentUrl = (event as NavigationEnd).urlAfterRedirects
        this.syncBodyClass()
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
      return ['/provider-dashboard', '/booking-requests', '/active-jobs', '/equipment', '/operators', '/create-listing', '/earnings'].some(x => url.startsWith(x))
    }

    if (this.role === 'admin' || this.role === 'employee') {
      return url.startsWith('/admin')
    }

    return false
  }

  // The global layout CSS (.sidebar { position: fixed }, body.has-sidebar
  // .main-content { padding-right: var(--sidebar-width) }) depends entirely
  // on this class being kept in sync with the visible sidebar state — nothing
  // else in the app was doing that, which is why the fixed sidebar floated
  // over the navbar/content with no compensation.
  private syncBodyClass(): void {
    document.body.classList.toggle('has-sidebar', this.showSidebar)
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe()
    document.body.classList.remove('has-sidebar')
  }
}