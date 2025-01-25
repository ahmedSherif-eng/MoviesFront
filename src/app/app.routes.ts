import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { SavedMoviesComponent } from './admin/saved-movies/saved-movies.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { AboutComponent } from './about/about.component';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

// Admin guard function
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAdmin()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

// User guard function
const userGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isUser()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'about', component: AboutComponent },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [() => adminGuard()]
  },
  {
    path: 'saved-movies',
    component: SavedMoviesComponent,
    canActivate: [() => adminGuard()]
  },
  { 
    path: 'user-dashboard', 
    component: UserDashboardComponent,
    canActivate: [() => userGuard()]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
