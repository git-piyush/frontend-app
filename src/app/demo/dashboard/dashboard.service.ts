// event.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private static BASE_URL = environment.BASE_URL;
  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/dashboard`, {
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