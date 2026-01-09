import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {

  private static BASE_URL = 'https://backend-app-dhaw.onrender.com/api';

 // private static BASE_URL = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  loginUser(body: any): Observable<any> {
    console.log('Login user');
    return this.http.post(`${Authservice.BASE_URL}/auth/login`, body);
  }
  storeToken(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
    // AUTH API METHODS
  registerUser(body: any): Observable<any> {
    console.log('Registering user: ' + body);
    return this.http.post(`${Authservice.BASE_URL}/auth/register`, body);
  }
  clearAuth(){
    this.logOut();
  }  
  //clear authentication data
  private logOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
  }
  
  getLoggedInUserName():string | null{
    return this.getUserName('userName');
  }
  // Retrieve from localStorage and decrypt
  private getUserName(key: string): string | null {
    try {
      const userName = localStorage.getItem(key);
      if (!userName) return null;
      return userName;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getFromStorage('token');
    return !!token;
  }

  isAdmin(): boolean {
    const role = this.getFromStorage('role');
    return role === 'ADMIN';
  }

  isUser(): boolean {
    const role = this.getFromStorage('role');
    return role === 'USER';
  }

  isManager(): boolean {
    const role = this.getFromStorage('role');
    return role === 'MANAGER';
  }

    // Retrieve from localStorage and decrypt
  private getFromStorage(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      return value
    } catch (error) {
      return null;
    }
  }

  addQuestion(requestBody: any): Observable<any> {
    console.log(requestBody);
    return this.http.post(`${Authservice.BASE_URL}/users/question`, requestBody, {
      headers: this.getHeader(),
    });
  }

  private getHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
