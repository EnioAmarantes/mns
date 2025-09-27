// ...existing code...
import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { ChangePasswordRequest, LoginResponse, LoginResult } from "../models/auth.model";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private loggedIn = signal<boolean>(false);
    private companyId: string | null = null;
    private companyName = signal<string | null>(null);
    private name = signal<string | null>(null);
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('token');
        this.companyId = localStorage.getItem('companyId');
        this.companyName.set(localStorage.getItem('companyName'));
        this.name.set(localStorage.getItem('name'));
        this.loggedIn.set(this.validateToken(this.token));
    }

    private validateToken(token: string | null): boolean {
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp && payload.exp > now;
        } catch {
            return false;
        }
    }

    login(email: string, password: string): Observable<LoginResult> {
        const apiUrl = `${environment.apiUrl}/api/Auth/login`;

        return this.http.post<LoginResponse>(apiUrl, { email, password }).pipe(
            map((response) => {
                console.log('Login response:', response);
                if (response.mustChangePassword === true) {
                    console.log('Password change required for user:', response.email, response.mustChangePassword);
                    return { success: true, mustChangePassword: true, email: response.email } as LoginResult;
                }

                this.token = response.token;
                this.companyId = response.companyId;
                this.companyName.set(response.companyName);
                this.name.set(response.name);

                localStorage.setItem('token', response.token);
                localStorage.setItem('companyId', response.companyId);
                localStorage.setItem('companyName', response.companyName);
                localStorage.setItem('name', response.name);
                this.loggedIn.set(true);

                return { success: true, mustChangePassword: false } as LoginResult;
            }),
            catchError((err) => {
                console.error('Login failed', err);
                this.logout();
                return of({ success: false, error: 'Login failed: ' + err.message } as LoginResult);
            })
        );
    }

    changePassword(request: ChangePasswordRequest): Observable<boolean> {
        const apiUrl = `${environment.apiUrl}/api/Auth/change-password`;
        return this.http.post(apiUrl, { email: request.email, newPassword: request.newPassword, confirmPassword: request.confirmPassword }, { responseType: 'json' }).pipe(
            map(() => true),
            catchError((err) => {
                console.error('Erro ao trocar a senha', err);
                return of(false);
            })
        );
    }

    logout() {
        this.token = null;
        this.companyId = null;
        this.companyName.set(null);
        this.name.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('companyId');
        localStorage.removeItem('companyName');
        localStorage.removeItem('name');
        this.loggedIn.set(false);
    }

    isAuthenticated(): boolean {
        return this.validateToken(this.token);
    }

    isLoggedIn(): boolean {
        return this.loggedIn();
    }

    getToken(): string | null {
        return this.token;
    }

    getCompanyId(): string | null {
        return this.companyId;
    }

    getCompanyName(): string | null {
        return this.companyName();
    }

    getUserName(): string | null {
        return this.name();
    }

    isMustChangePasswordResult(result: LoginResult): result is { success: true; email: string; mustChangePassword: true } {
        return result.success === true && result.mustChangePassword === true;
    }

    isLoginSuccess(result: LoginResult): result is { success: true; mustChangePassword: false } {
        return result.success === true && result.mustChangePassword === false;
    }

    isLoginFailure(result: LoginResult): result is { success: false; error?: string } {
        return result.success === false;
    }
}