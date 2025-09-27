import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChangePasswordRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormField, MatInputModule, MatButtonModule],
  templateUrl: 'change-password.component.html',
  styleUrls: ['change-password.component.scss', 'login.component.scss']
})
export class ChangePasswordComponent {
    changePasswordRequest: ChangePasswordRequest = {
        email: '',
        newPassword: '',
        confirmPassword: ''
    };
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    constructor(private auth: AuthService, private router: Router) {
        const state = (this.router.currentNavigation()?.extras.state as { email?: string }) || {};
        this.changePasswordRequest.email = state.email || '';

        if (this.changePasswordRequest.email === '') {
            alert('E-mail não fornecido. Por favor, faça login novamente.');
            this.router.navigate(['/login']);
        }
    }

    changePassword() {
        if (this.changePasswordRequest.newPassword !== this.changePasswordRequest.confirmPassword) {
            this.error.set('As senhas não coincidem ❌');
            return;
        }

        this.loading.set(true);
        this.auth.changePassword(this.changePasswordRequest).subscribe(success => {
            this.loading.set(false);

            if (success) {
                alert('Senha alterada com sucesso! Por favor, faça login novamente usando a nova senha.');
                this.router.navigate(['/login']);
            } else {
                this.error.set('Erro ao trocar a senha ❌');
            }
        });
  }
}
