import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  //public static BASE_URL = 'http://localhost:8080/api';
  //public static BASE_URL = 'https://backend-app-dhaw.onrender.com/api';
  private static BASE_URL = environment.BASE_URL;
  constructor(private http: HttpClient) {}

  addVehicle(requestBody: any): Observable<any> {
    console.log(requestBody);
    return this.http.post(`${VehicleService.BASE_URL}/vehicle/add-vehicle`, requestBody, {
      headers: this.getHeader(),
    });
  }

  getAllVehicle(): Observable<any> {
    return this.http.get(`${VehicleService.BASE_URL}/vehicle/all-vehicle`, {
      headers: this.getHeader(),
    });
  }

  getVehicleById(vehicleId: number): Observable<any> {
    return this.http.get(`${VehicleService.BASE_URL}/vehicle/get-vehicle/`+vehicleId, {
      headers: this.getHeader(),
    });
  }

  deleteVehicleById(vehicleId: number): Observable<any> {
    return this.http.delete(`${VehicleService.BASE_URL}/vehicle/`+vehicleId, {
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
