import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;  // Token is stored here in memory

  setToken(token: string) {
    if (!token) {
      console.error('Attempting to set null token');
      return;
    }
    console.log('Setting token:', token.substring(0, 20) + '...');  // Log first 20 chars for safety
    this.token = token;
    sessionStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('jwt_token');
      console.log('Retrieved token from session:', 
        this.token ? this.token.substring(0, 20) + '...' : 'null');
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
      return payload.roles[0]; // Returns the first role
    }
    return null;
  }
} 