import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('mns');
  protected router = inject(Router);

  private auth = inject(AuthService);
  isLoggedIn = computed(() => this.auth.isLoggedIn());
  companyName = computed(() => this.auth.getCompanyName());
  name = computed(() => this.auth.getUserName());

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
