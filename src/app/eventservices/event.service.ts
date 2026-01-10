// event.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { EventModel } from '../model/event.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  //private baseUrl = 'http://localhost:8080/api/event';
  private eventsStore: EventModel[] = [];
  private events$ = new BehaviorSubject<EventModel[]>(this.eventsStore);
  private static BASE_URL = environment.BASE_URL;
  constructor(private http: HttpClient) {
    // Optional seed example:
    // this.create({
    //   eventType: 'Project Kickoff',
    //   category: 'Meeting',
    //   priority: 'Medium',
    //   status: 'upcoming',
    //   department: 'Operations',
    //   dueDate: new Date().toISOString(),
    //   isPrivate: false
    // }).subscribe();
  }
getAllEvents(): Observable<EventModel[]> {
    this.createDBEvent();
    return this.events$.asObservable();
  }


  private getHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }


  createDBEvent(): void {    
    this.http.get<EventModel[]>(`${EventService.BASE_URL}/event/all-event`, {
      headers: this.getHeader(),
            }).subscribe({
              next: (res) => {
                this.eventsStore = res;
                this.events$.next(this.eventsStore);
                console.log("Events loaded:", this.eventsStore);
              },
              error: (err) => {
                console.error("Error loading events:", err);
              }
            });
  }

  create(event: EventModel): Observable<any> {
    console.log(event);
    return this.http.post(`${EventService.BASE_URL}/event/create`, event, {
      headers: this.getHeader(),
    });
  }

  update(id: number, event: EventModel): Observable<any> {
    return this.http.put(`${EventService.BASE_URL}/event/update/`+id, event, {
      headers: this.getHeader(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${EventService.BASE_URL}/event/delete/`+id, {
      headers: this.getHeader(),
    });
  }

  findById(id: number): Observable<EventModel | undefined> {
    return of(this.eventsStore.find(e => e.id === id));
  }
}
