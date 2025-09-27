import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthLocalService {
  private loggedIn = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('loggedIn');
    this.loggedIn.set(saved === 'true');
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@teste.com' && password === '123456') {
      localStorage.setItem('loggedIn', 'true');
      this.loggedIn.set(true);
    }
    return this.isAuthenticated();
  }

  logout() {
    localStorage.removeItem('loggedIn');
    this.loggedIn.set(false);
  }

  isAuthenticated() {
    return this.loggedIn();
  }
}

