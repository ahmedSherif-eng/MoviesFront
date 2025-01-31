import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="register-container">
        <div class="register-header">
          <h1>Movies Platform</h1>
          <p class="subtitle">Create your account</p>
        </div>

        <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="register-form">
          <div class="form-group">
            <label for="username">
              <i class="fas fa-user"></i>
              Username
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="username" 
              required
              placeholder="Choose a username"
            >
          </div>

          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i>
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              placeholder="Choose a password"
            >
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="!registerForm.form.valid" class="register-btn">
            <i class="fas fa-user-plus"></i>
            Register
          </button>
        </form>

        <div class="footer">
          <p>Already have an account? 
            <a routerLink="/login" class="login-link">
              <i class="fas fa-sign-in-alt"></i>
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f5f5;
      padding: 20px;
    }

    .register-container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .register-header h1 {
      color: #333;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .subtitle {
      color: #666;
      margin-top: 10px;
      font-size: 14px;
    }

    .register-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #444;
      font-weight: 500;
      font-size: 14px;
    }

    .form-group label i {
      margin-right: 8px;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #2a5298;
    }

    .error-message {
      background-color: #fff2f2;
      color: #dc3545;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    .error-message i {
      margin-right: 8px;
    }

    .register-btn {
      width: 100%;
      padding: 12px;
      background: #333;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .register-btn:hover:not(:disabled) {
      background: #444;
    }

    .register-btn:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .login-link {
      color: #333;
      text-decoration: none;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: color 0.3s ease;
    }

    .login-link:hover {
      color: #666;
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 20px;
      }

      .register-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onRegister() {
    const body = {
      username: this.username,
      password: this.password
    };

    fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Registration successful
      this.router.navigate(['/login']);
    })
    .catch(error => {
      console.error('Registration error:', error);
      this.errorMessage = 'Registration failed. Please try again.';
    });
  }
} 