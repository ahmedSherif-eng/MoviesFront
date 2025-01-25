import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

interface MovieResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

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

interface MovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

interface SearchResponse {
  Search: MovieResult[];
  totalResults: string;
  Response: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Movies Collection</h1>
        <div class="search-section">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search saved movies..."
              (keyup.enter)="searchMovies()"
            >
            <button class="search-btn" (click)="searchMovies()">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="isLoading" class="loading">
        Loading movies...
      </div>

      <div *ngIf="movies.length > 0" class="results-container">
        <div class="movie-grid">
          <div *ngFor="let movie of movies" class="movie-card" (click)="showMovieDetails(movie.imdbID)">
            <img 
              [src]="movie.Poster !== 'N/A' ? movie.Poster : 'assets/no-poster.png'" 
              [alt]="movie.Title"
              class="movie-poster"
            >
            <div class="movie-info">
              <h3>{{ movie.Title }}</h3>
              <p>Year: {{ movie.Year }}</p>
              <p>Type: {{ movie.Type }}</p>
            </div>
          </div>
        </div>

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
      </div>

      <div *ngIf="movies.length === 0 && !isLoading" class="no-results">
        No movies found.
      </div>

      <div *ngIf="selectedMovie" class="modal" (click)="closeMovieDetails()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <span class="close" (click)="closeMovieDetails()">&times;</span>
          <div class="movie-details">
            <div class="movie-header">
              <img [src]="selectedMovie.Poster" [alt]="selectedMovie.Title" class="detail-poster">
              <div class="movie-title-section">
                <h2>{{ selectedMovie.Title }}</h2>
                <p class="year">{{ selectedMovie.Year }} | {{ selectedMovie.Runtime }} | {{ selectedMovie.Rated }}</p>
                <p class="rating">IMDb: {{ selectedMovie.imdbRating }}/10 ({{ selectedMovie.imdbVotes }} votes)</p>
                <p class="metascore">Metascore: {{ selectedMovie.Metascore }}</p>
              </div>
            </div>
            
            <div class="movie-info-grid">
              <div class="info-item"><strong>Released:</strong> {{ selectedMovie.Released }}</div>
              <div class="info-item"><strong>Genre:</strong> {{ selectedMovie.Genre }}</div>
              <div class="info-item"><strong>Director:</strong> {{ selectedMovie.Director }}</div>
              <div class="info-item"><strong>Writers:</strong> {{ selectedMovie.Writer }}</div>
              <div class="info-item"><strong>Actors:</strong> {{ selectedMovie.Actors }}</div>
              <div class="info-item"><strong>Language:</strong> {{ selectedMovie.Language }}</div>
              <div class="info-item"><strong>Country:</strong> {{ selectedMovie.Country }}</div>
              <div class="info-item plot"><strong>Plot:</strong> {{ selectedMovie.Plot }}</div>
              <div class="info-item"><strong>Awards:</strong> {{ selectedMovie.Awards }}</div>
              <div class="info-item"><strong>Box Office:</strong> {{ selectedMovie.BoxOffice }}</div>
              <div class="info-item"><strong>Production:</strong> {{ selectedMovie.Production }}</div>
              <div class="info-item"><strong>DVD:</strong> {{ selectedMovie.DVD }}</div>
              <div class="info-item"><strong>Website:</strong> {{ selectedMovie.Website }}</div>
              <div class="info-item ratings">
                <strong>Ratings:</strong>
                <ul>
                  <li *ngFor="let rating of selectedMovie.Ratings">
                    {{ rating.Source }}: {{ rating.Value }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }

    .search-box {
      display: flex;
      gap: 10px;
      flex: 1;
      max-width: 500px;
    }

    .search-box input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .search-btn, .logout-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .search-btn {
      background-color: #007bff;
      color: white;
    }

    .logout-btn {
      background-color: #dc3545;
      color: white;
      margin-left: 10px;
    }

    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .movie-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
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

    .page-info {
      color: #666;
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

    .no-results {
      text-align: center;
      color: #666;
      margin-top: 30px;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    .close {
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .movie-header {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .detail-poster {
      width: 200px;
      height: auto;
      border-radius: 4px;
    }

    .movie-title-section {
      flex: 1;
    }

    .movie-title-section h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }

    .year, .rating, .metascore {
      color: #666;
      margin: 5px 0;
    }

    .movie-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .info-item {
      line-height: 1.6;
    }

    .info-item.plot {
      grid-column: 1 / -1;
    }

    .info-item.ratings {
      grid-column: 1 / -1;
    }

    .info-item.ratings ul {
      list-style: none;
      padding: 0;
      margin: 5px 0;
    }

    .info-item.ratings li {
      margin: 3px 0;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  movies: MovieResult[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  isLastPage: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  searchQuery: string = '';
  pageSize: number = 10;
  selectedMovie: MovieDetails | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPage(0);
  }

  loadPage(page: number) {
    console.log(`Loading page ${page}`);
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

    this.http.get<SearchResponse>('/api/public/movies/saved', {
      headers,
      params: { 
        page: page.toString()
      }
    }).subscribe({
      next: (response) => {
        console.log('Response:', response);
        if (response && response.Search) {
          this.movies = response.Search;
          this.currentPage = page;
          this.totalPages = parseInt(response.totalResults); // Don't divide by 10
          console.log(`Current page: ${this.currentPage}, Total pages: ${this.totalPages}`);
          this.isLoading = false;
        } else {
          this.movies = [];
          this.errorMessage = 'No movies found';
        }
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.errorMessage = 'Error loading movies. Please try again.';
        this.isLoading = false;
      }
    });
  }

  searchMovies(page: number = 0) {
    if (!this.searchQuery.trim()) {
      this.loadPage(0); // Load all movies if search is empty
      return;
    }

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

    this.http.get<SearchResponse>('/api/public/movies/saved/search', {
      headers,
      params: {
        title: this.searchQuery.trim(),
        page: page.toString()
      }
    }).subscribe({
      next: (response) => {
        console.log('Search response:', response);
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
        console.error('Error searching movies:', error);
        this.errorMessage = 'Error searching movies. Please try again.';
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  showMovieDetails(imdbId: string) {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'No authentication token found. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.get<MovieDetails>('/api/public/movies/details', {
      headers,
      params: { imdbId }
    }).subscribe({
      next: (movie) => {
        this.selectedMovie = movie;
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.errorMessage = 'Error loading movie details. Please try again.';
      }
    });
  }

  closeMovieDetails() {
    this.selectedMovie = null;
  }
} 