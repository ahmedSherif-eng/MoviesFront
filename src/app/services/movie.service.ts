import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

interface SavedIdsResponse {
  imdbIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private savedMovieIds = new BehaviorSubject<Set<string>>(new Set());
  savedMovieIds$ = this.savedMovieIds.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load saved IDs immediately when service is created
    this.loadSavedMovieIds();
  }

  private loadSavedMovieIds() {
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('Fetching saved movie IDs...');
    this.http.get<string[]>('/api/admin/movies/saved/ids', {
      headers
    }).subscribe({
      next: (response) => {
        console.log('Received saved movie IDs:', response);
        const ids = new Set(response);
        console.log('Created Set of IDs:', Array.from(ids));
        this.savedMovieIds.next(ids);
      },
      error: (error) => {
        console.error('Error loading saved movie IDs:', error);
        this.savedMovieIds.next(new Set()); // Reset on error
      }
    });
  }

  refreshSavedMovies() {
    console.log('Refreshing saved movies...');
    this.loadSavedMovieIds();
  }

  getSavedMovieIds(): Observable<Set<string>> {
    return this.savedMovieIds$;
  }
} 