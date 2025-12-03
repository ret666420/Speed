import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse, RegisterResponse } from '../models/auth.models';

interface UserSession {
  user_id: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL de Producción en Vercel
  private apiUrl = 'https://speed-backend-rouge.vercel.app/api';
  private userKey = 'speed_mobile_user';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap((response) => {
        if (response && response.user) {
          this.saveUserToStorage(response.user);
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
      display_name: username
    });
  }


  private saveUserToStorage(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  get currentUser(): any | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error al leer usuario del storage', e);
      return null;
    }
  }

  get currentUserId(): string | null {
    return this.currentUser?.user_id || null;
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
  }
}
