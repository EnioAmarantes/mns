import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginResult } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormField, MatInputModule, MatButtonModule],
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe((result: LoginResult) => {
      this.loading.set(false);
      console.log('Login result:', result);
      if (this.auth.isMustChangePasswordResult(result)) {
        alert('Você precisa trocar sua senha antes de continuar.');
        this.router.navigate(['/trocar-senha'], { state: { email: result.email } });
      } 
      if (this.auth.isLoginSuccess(result)) {
        console.log('Login successful, navigating to dashboard');
        console.log('Auth guard check (should be true):', this.auth.isAuthenticated());
        this.router.navigate(['/dashboard']);
      } 
      if (this.auth.isLoginFailure(result)) {
        console.error('Login failed:', result.error);
        this.error.set('Credenciais inválidas ❌');
      }
    });
  }
}
