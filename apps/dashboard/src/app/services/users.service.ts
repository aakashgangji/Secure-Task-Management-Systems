import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userRoles?: Array<{
    role: {
      type: string;
      name: string;
    };
  }>;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = 'http://localhost:3001/api';

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    return this.http.get<User[]>(`${this.API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  getUserById(id: string): Observable<User> {
    const token = localStorage.getItem('token');
    return this.http.get<User>(`${this.API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    const token = localStorage.getItem('token');
    return this.http.post<User>(`${this.API_URL}/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  deleteUser(id: string): Observable<void> {
    const token = localStorage.getItem('token');
    return this.http.delete<void>(`${this.API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
