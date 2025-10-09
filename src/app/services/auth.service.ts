import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.authApiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string, expiresInMins: number = 30) {
    return this.http.post<AuthResponse>(
      this.apiUrl,
      {
        username,
        password,
        expiresInMins,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response));
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
