import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MovieService } from '../../services/movie.service';
import { MovieResult, SearchResponse, SelectedMovie } from '../../models/movie.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Admin Dashboard</h1>
        <div class="header-buttons">
          <button class="saved-btn" (click)="viewSavedMovies()">View Saved Movies</button>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </div>

      <div class="search-container">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search movies...">
        <button class="search-btn" (click)="searchMovies()">Search</button>
      </div>

      <p class="error-message" *ngIf="errorMessage">{{ errorMessage }}</p>
      <p class="success-message" *ngIf="successMessage">{{ successMessage }}</p>

      <div class="selected-movies-bar">
        <span>Selected Movies: {{ selectedMovies.length }}</span>
        <button class="save-selected-btn" [disabled]="selectedMovies.length === 0 || isSaving" (click)="saveSelectedMovies()">
          {{ isSaving ? 'Saving...' : 'Save Selected Movies' }}
        </button>
      </div>

      <div *ngIf="isLoading" class="loading">Loading...</div>

      <div class="movie-grid">
        <div *ngFor="let movie of movies" class="movie-card" (click)="showMovieDetails(movie.imdbID)">
          <div class="movie-card-header">
            <button 
              *ngIf="!isMovieSaved(movie)"
              class="select-btn" 
              [class.selected]="isMovieSelected(movie)"
              (click)="toggleMovieSelection($event, movie)"
            >
              {{ isMovieSelected(movie) ? '✓ Selected' : 'Select' }}
            </button>
            <span *ngIf="isMovieSaved(movie)" class="saved-badge">
              Already Saved
            </span>
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

      <!-- Pagination Controls -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          [disabled]="currentPage === 1"
          (click)="searchMovies(currentPage - 1)"
          class="page-btn"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button 
          [disabled]="currentPage === totalPages"
          (click)="searchMovies(currentPage + 1)"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Add Modal for Movie Details -->
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
              
              <button 
                *ngIf="!isMovieSaved(selectedMovie)"
                class="select-btn" 
                [class.selected]="isMovieSelected(selectedMovie)"
                (click)="toggleMovieSelection($event, selectedMovie)"
              >
                {{ isMovieSelected(selectedMovie) ? '✓ Selected' : 'Select Movie' }}
              </button>
              <span *ngIf="isMovieSaved(selectedMovie)" class="saved-badge">
                Already Saved
              </span>
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
  `,
  styles: [`
    .dashboard-container {
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

    h1 {
      color: #333;
      margin: 0;
    }

    .header-buttons {
      display: flex;
      gap: 10px;
    }

    .saved-btn {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .saved-btn:hover {
      background-color: #218838;
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

    .search-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .search-btn {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .search-btn:hover {
      background-color: #0056b3;
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
      position: relative;
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

    .imdb-id {
      color: #007bff;
      font-size: 0.8em;
    }

    h2 {
      margin: 20px 0;
      color: #444;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
      padding: 20px 0;
    }

    .page-btn {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .page-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .page-info {
      color: #666;
      font-size: 0.9em;
    }

    .selected-movies-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 20px;
      border: 1px solid #dee2e6;
    }

    .save-selected-btn {
      padding: 8px 16px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .save-selected-btn:hover:not(:disabled) {
      background-color: #218838;
    }

    .save-selected-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .movie-card-header {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1;
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

    .select-btn:hover {
      background-color: #007bff;
      color: white;
    }

    .saved-badge {
      padding: 6px 12px;
      background-color: #6c757d;
      color: white;
      border-radius: 4px;
      font-size: 0.8em;
    }

    .success-message {
      color: #28a745;
      margin: 10px 0;
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

    .year, .rating {
      color: #666;
      margin: 5px 0;
    }

    .movie-info-grid {
      display: grid;
      gap: 15px;
    }

    .info-item {
      line-height: 1.6;
    }

    .info-item.plot {
      grid-column: 1 / -1;
    }

    .movie-poster {
      cursor: pointer;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  searchQuery: string = '';
  movies: MovieResult[] = [];
  totalResults: string = '0';
  errorMessage: string = '';
  isLoading: boolean = false;
  currentPage: number = 0;
  totalPages: number = 0;
  selectedMovies: SelectedMovie[] = [];
  isSaving: boolean = false;
  private savedMovieIdsArray: string[] = [];
  savedMovieIds: Set<string> = new Set();
  successMessage: string = '';
  selectedMovie: MovieDetails | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private movieService: MovieService
  ) {
    this.movieService.getSavedMovieIds().subscribe(ids => {
      console.log('Updated saved movie IDs in AdminDashboard:', Array.from(ids));
      this.savedMovieIdsArray = Array.from(ids);
      this.savedMovieIds = new Set(this.savedMovieIdsArray);
    });
  }

  ngOnInit() {
    console.log('AdminDashboard initializing...');
    // Load saved IDs when component initializes
    this.movieService.refreshSavedMovies();
  }

  searchMovies(page: number = 1) {
    console.log(`Sending search request - Query: ${this.searchQuery}, Page: ${page}`);
    
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;
    
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'No authentication token found. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.get<SearchResponse>('/api/admin/movies/search', {
      headers,
      params: { 
        query: this.searchQuery.trim(),
        page: page.toString()
      }
    }).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        this.movies = response.Search;
        this.totalResults = response.totalResults;
        this.totalPages = Math.ceil(parseInt(response.totalResults) / 10);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to search movies.';
        } else if (error.status === 404) {
          this.errorMessage = 'Search endpoint not found.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid search request. Please try again.';
        } else {
          this.errorMessage = `Error: ${error.status} - ${error.message}`;
        }
        
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  viewSavedMovies() {
    this.router.navigate(['/saved-movies']);
  }

  isMovieSelected(movie: MovieResult): boolean {
    return this.selectedMovies.some(m => m.imdbID === movie.imdbID);
  }

  isMovieSaved(movie: MovieResult): boolean {
    const isSaved = this.savedMovieIdsArray.includes(movie.imdbID);
    console.log(`Checking if movie ${movie.imdbID} is saved:`, isSaved, 'Current saved IDs:', this.savedMovieIdsArray);
    return isSaved;
  }

  toggleMovieSelection(event: MouseEvent, movie: MovieResult) {
    event.stopPropagation();
    console.log('Attempting to toggle movie:', movie.imdbID);
    
    if (this.savedMovieIdsArray.includes(movie.imdbID)) {
      console.log('Movie is already saved, preventing selection:', movie.imdbID);
      return;
    }

    const index = this.selectedMovies.findIndex(m => m.imdbID === movie.imdbID);
    if (index === -1) {
      console.log('Adding movie to selection:', movie.imdbID);
      this.selectedMovies.push(movie);
    } else {
      console.log('Removing movie from selection:', movie.imdbID);
      this.selectedMovies.splice(index, 1);
    }
  }

  saveSelectedMovies() {
    if (this.selectedMovies.length === 0) return;

    this.isSaving = true;
    const token = this.authService.getToken();
    
    if (!token) {
      this.errorMessage = 'No authentication token found. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Send IMDb IDs instead of titles
    const imdbIds = this.selectedMovies.map(movie => movie.imdbID);

    this.http.post<boolean>('/api/admin/movies/batch', imdbIds, { headers })
      .subscribe({
        next: (response) => {
          if (response) {
            this.successMessage = 'Movies saved successfully!';
            this.movieService.refreshSavedMovies();
            this.selectedMovies = [];
            setTimeout(() => this.successMessage = '', 3000);
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving movies:', error);
          this.errorMessage = 'Error saving selected movies. Please try again.';
          this.isSaving = false;
        }
      });
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

    this.http.get<MovieDetails>('/api/admin/movies/details', {
      headers,
      params: { imdbId }
    }).subscribe({
      next: (movie) => {
        console.log('Movie details:', movie);
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