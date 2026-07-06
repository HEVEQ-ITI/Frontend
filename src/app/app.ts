import { Component, OnInit, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Footer } from './layout/footer/footer'
import { Navbar } from './layout/navbar/navbar'
import { Sidebar } from './layout/sidebar/sidebar'
import { Auth } from './core/services/auth'
import { TokenStorage } from './core/services/token-storage'
import { ToastComponent } from './shared/components/toast/toast.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Footer, Navbar, Sidebar],
  imports: [RouterOutlet, Footer, Navbar, Sidebar, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('HEVEQ')

  constructor(
    private authService: Auth,
    private tokenStorage: TokenStorage
  ) {}

  ngOnInit(): void {
    if (!this.tokenStorage.isLoggedIn()) {
      return
    }

    this.authService.getMe().subscribe({
      next: () => {},
      error: () => {
        this.tokenStorage.clear()
      }
    })
  }
}