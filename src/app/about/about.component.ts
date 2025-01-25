import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="about-container">
      <div class="about-content">
        <h1>About Movies Platform</h1>
        
        <div class="profile-section">
          <h2>Ahmed Sherif</h2>
          <p class="description">
            This is a movie management platform that allows administrators to search, save, and manage their favorite movies.
            Built with Angular and Spring Boot, it features JWT authentication, role-based access control, and RESTful APIs.
          </p>
        </div>

        <div class="social-links">
          <a href="https://github.com/ahmedSherif-eng" target="_blank" class="social-link">
            <i class="fab fa-github"></i>
          </a>
          <a href="mailto:ahmedsherif000035@gmail.com.com" class="social-link">
            <i class="far fa-envelope"></i>
          </a>
          <a href="https://linkedin.com/in/ahmedsherif003/" target="_blank" class="social-link">
            <i class="fab fa-linkedin"></i>
          </a>
        </div>

        <button class="back-btn" (click)="goBack()">Back to Login</button>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .about-content {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
    }

    .profile-section {
      margin-bottom: 30px;
    }

    h2 {
      color: #444;
      margin-bottom: 15px;
    }

    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .social-link {
      font-size: 24px;
      color: #333;
      transition: color 0.2s;
      text-decoration: none;
    }

    .social-link:hover {
      color: #007bff;
    }

    .back-btn {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background-color: #0056b3;
    }
  `]
})
export class AboutComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/login']);
  }
} 