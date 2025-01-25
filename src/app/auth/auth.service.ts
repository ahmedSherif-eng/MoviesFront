import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;  

  setToken(token: string) {
    if (!token) {
      console.error('Attempting to set null token');
      return;
    }
    this.token = token;
    sessionStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('jwt_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    sessionStorage.removeItem('jwt_token');
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles.includes('ROLE_ADMIN');
    }
    return false;
  }

  isUser(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles.includes('ROLE_USER');
    }
    return false;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles[0];
    }
    return null;
  }
} 