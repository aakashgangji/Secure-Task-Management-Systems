import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3001/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('token');
    if (token) {
      // Try to load profile, but don't clear token immediately on failure
      this.getProfile().subscribe({
        next: (user) => {
          // Profile loaded successfully
          console.log('User profile loaded on init:', user);
        },
        error: (error) => {
          console.error('Error loading profile on init:', error);
          // Only clear token if it's a 401/403 (unauthorized) error
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.currentUserSubject.next(null);
          }
          // For other errors (network, server down, etc.), keep the token
          // and let individual components handle the authentication check
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, userData);
  }

  getProfile(): Observable<User> {
    const token = this.getToken();
    return this.http.get<User>(`${this.API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      // Call the backend logout endpoint to log the logout event
      this.http.post(`${this.API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: () => {
          console.log('Logout logged successfully');
        },
        error: (error) => {
          console.error('Error logging logout:', error);
        }
      });
    }
    
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  isOwner(): boolean {
    return this.hasRole('owner');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canCreateTasks(): boolean {
    return this.isOwner() || this.isAdmin();
  }

  canViewAuditLogs(): boolean {
    return this.isOwner() || this.isAdmin();
  }
}
