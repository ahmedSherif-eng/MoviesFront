import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

interface MovieResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface SearchResponse {
  Search: MovieResult[];
  totalResults: string;
  Response: string;
}

@Component({
  selector: 'app-saved-movies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="saved-movies-container">
      <div class="header">
        <h1>Saved Movies</h1>
        <div class="header-buttons">
          <button 
            *ngIf="selectedMovies.length > 0"
            class="delete-btn" 
            [disabled]="isDeleting"
            (click)="deleteSelectedMovies()"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Selected' }}
          </button>
          <button class="back-btn" (click)="goBack()">Back to Search</button>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </div>

      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="isLoading" class="loading">
        Loading saved movies...
      </div>

      <div *ngIf="movies.length > 0" class="results-container">
        <div class="movie-grid">
          <div *ngFor="let movie of movies" class="movie-card">
            <div class="movie-card-header">
              <button 
                class="select-btn" 
                [class.selected]="isMovieSelected(movie)"
                (click)="toggleMovieSelection(movie)"
              >
                {{ isMovieSelected(movie) ? '✓ Selected' : 'Select' }}
              </button>
            </div>
            <img 
              [src]="movie.Poster !== 'N/A' ? movie.Poster : 'assets/no-poster.png'" 
              [alt]="movie.Title"
              class="movie-poster"
            >
            <div class="movie-info">
              <h3>{{ movie.Title }}</h3>
              <p>Year: {{ movie.Year }}</p>
              <p>Type: {{ movie.Type }}</p>
              <p class="imdb-id">IMDb: {{ movie.imdbID }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Update pagination controls -->
      <div class="pagination" *ngIf="movies.length > 0">
        <button 
          [disabled]="currentPage === 0"
          (click)="loadPage(currentPage - 1)"
          class="page-btn"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ totalPages }}
        </span>

        <button 
          [disabled]="currentPage >= totalPages - 1"
          (click)="loadPage(currentPage + 1)"
          class="page-btn"
        >
          Next
        </button>
      </div>

      <div *ngIf="movies.length === 0 && !isLoading" class="no-results">
        No saved movies found.
      </div>
    </div>
  `,
  styles: [`
    .saved-movies-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-buttons {
      display: flex;
      gap: 10px;
    }

    .back-btn {
      padding: 10px 20px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .logout-btn {
      padding: 10px 20px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }

    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .movie-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .movie-card:hover {
      transform: translateY(-5px);
    }

    .movie-poster {
      width: 100%;
      height: 350px;
      object-fit: cover;
    }

    .movie-info {
      padding: 15px;
    }

    .movie-info h3 {
      margin: 0 0 10px 0;
      font-size: 1.1em;
      color: #333;
    }

    .movie-info p {
      margin: 5px 0;
      color: #666;
      font-size: 0.9em;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .page-btn {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .page-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .no-results {
      text-align: center;
      color: #666;
      margin-top: 30px;
    }

    .error-message {
      color: #dc3545;
      margin: 10px 0;
    }

    .loading {
      text-align: center;
      margin: 20px 0;
      color: #666;
    }

    .delete-btn {
      padding: 10px 20px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .delete-btn:hover:not(:disabled) {
      background-color: #c82333;
    }

    .delete-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .success-message {
      color: #28a745;
      margin: 10px 0;
    }

    .select-btn {
      padding: 6px 12px;
      background-color: rgba(255, 255, 255, 0.9);
      border: 1px solid #007bff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .select-btn.selected {
      background-color: #007bff;
      color: white;
    }

    .page-info {
      color: #666;
    }
  `]
})
export class SavedMoviesComponent implements OnInit {
  movies: MovieResult[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedMovies: MovieResult[] = [];
  isDeleting: boolean = false;
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.movies = [];
    this.isLoading = true;
    this.loadPage(0);
  }

  loadPage(page: number) {
    console.log(`Loading saved movies page: ${page}`);
    
    this.isLoading = true;
    this.errorMessage = '';

    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'No authentication token found. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.get<SearchResponse>('/api/admin/movies/saved', {
      headers,
      params: { 
        page: page.toString()
      }
    }).subscribe({
      next: (response) => {
        console.log('Page response:', response);
        if (response && response.Search) {
          this.movies = response.Search;
          this.currentPage = page;
          this.totalPages = parseInt(response.totalResults);
          this.isLoading = false;
        } else {
          this.movies = [];
          this.errorMessage = 'No movies found';
        }
      },
      error: (error) => {
        console.error('Error loading saved movies:', error);
        this.errorMessage = 'Error loading saved movies. Please try again.';
        this.isLoading = false;
        this.movies = [];
      }
    });
  }

  goBack() {
    console.log('Navigating back to admin dashboard');
    this.router.navigate(['/admin-dashboard']).then(() => {
      console.log('Navigation complete, clearing state');
      this.currentPage = 0;
      this.totalPages = 0;
      this.movies = [];
    });
  }

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  isMovieSelected(movie: MovieResult): boolean {
    return this.selectedMovies.some(m => m.imdbID === movie.imdbID);
  }

  toggleMovieSelection(movie: MovieResult) {
    const index = this.selectedMovies.findIndex(m => m.imdbID === movie.imdbID);
    if (index === -1) {
      this.selectedMovies.push(movie);
    } else {
      this.selectedMovies.splice(index, 1);
    }
  }

  deleteSelectedMovies() {
    if (this.selectedMovies.length === 0) return;

    this.isDeleting = true;
    const token = this.authService.getToken();
    
    if (!token) {
      this.errorMessage = 'No authentication token found. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.delete<boolean>('/api/admin/movies/batch/delete', {
      headers,
      body: this.selectedMovies.map(movie => movie.Title)
    }).subscribe({
      next: (response) => {
        if (response === true) {
          this.successMessage = 'Movies deleted successfully!';
          this.selectedMovies = [];
          
          // Refresh the current page
          this.http.get<SearchResponse>('/api/admin/movies/saved', {
            headers,
            params: { 
              page: '0'
            }
          }).subscribe({
            next: (response) => {
              this.movies = response.Search;
              this.totalPages = Math.ceil(parseInt(response.totalResults) / 10);
              this.isLoading = false;
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
              console.error('Error refreshing movies:', error);
              this.errorMessage = 'Error refreshing the movie list.';
              this.isLoading = false;
            }
          });
        } else {
          this.errorMessage = 'Failed to delete movies';
        }
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting movies:', error);
        this.errorMessage = 'Error deleting selected movies. Please try again.';
        this.isDeleting = false;
      }
    });
  }
} 