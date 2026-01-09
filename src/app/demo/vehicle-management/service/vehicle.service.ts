import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Authservice } from 'src/app/service/auth/authservice';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

 // public static BASE_URL = 'http://localhost:8080/api';
  public static BASE_URL = 'https://backend-app-dhaw.onrender.com/api';
  constructor(private http: HttpClient) {}

  addVehicle(requestBody: any): Observable<any> {
    console.log(requestBody);
    return this.http.post(`${VehicleService.BASE_URL}/vehicle/add-vehicle`, requestBody, {
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
