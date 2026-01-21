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

  getAllRefCode(page:number, size:number, order:string, orderBy:string): Observable<any> {
    return this.http.get(`${RefcodeService.BASE_URL}/refcode/refcode-list?page=`+page+`&size=`+size+`&order=`+order+`&orderBy`+order, {
      headers: this.getHeader(),
    });
  }

  getAllRefcodeList(): Observable<any> {
    return this.http.get(`${RefcodeService.BASE_URL}/refcode/getAllRefcodeCategoryList`, {
      headers: this.getHeader(),
    });
  }

  createRefCode(requestBody: any): Observable<any> {
    console.log(requestBody);
    return this.http.post(`${RefcodeService.BASE_URL}/refcode/create`,requestBody, {
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