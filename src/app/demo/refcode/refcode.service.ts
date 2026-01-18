import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RefcodeService {
  //private baseUrl = 'http://localhost:8080/api/event';
  private static BASE_URL = environment.BASE_URL;
  constructor(private http: HttpClient) {
  }

  findRefcodeByCategory(category:string): Observable<any> {
    return this.http.get(`${RefcodeService.BASE_URL}/refcode/getRecodeMap/`+category, {
      headers: this.getHeader(),
    });
  }

    getAllRefcodeMap(): Observable<any> {
    return this.http.get(`${RefcodeService.BASE_URL}/refcode/getAllRefcodeMap`, {
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