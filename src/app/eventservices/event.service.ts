// event.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EventModel } from '../model/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';
  private eventsStore: EventModel[] = [];
  private events$ = new BehaviorSubject<EventModel[]>(this.eventsStore);

  constructor() {
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

  getAll(): Observable<EventModel[]> {
    return this.events$.asObservable();
  }

  create(event: EventModel): Observable<EventModel> {
    const id = Date.now();
    const newEvent = {
      ...event,
      id,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
    this.eventsStore = [...this.eventsStore, newEvent];
    this.events$.next(this.eventsStore);
    return of(newEvent);
  }

  update(id: number, event: EventModel): Observable<EventModel | undefined> {
    this.eventsStore = this.eventsStore.map(e => e.id === id ? { ...e, ...event, updatedDate: new Date().toISOString() } : e);
    const updated = this.eventsStore.find(e => e.id === id);
    this.events$.next(this.eventsStore);
    return of(updated);
  }

  delete(id: number): Observable<boolean> {
    this.eventsStore = this.eventsStore.filter(e => e.id !== id);
    this.events$.next(this.eventsStore);
    return of(true);
  }

  findById(id: number): Observable<EventModel | undefined> {
    return of(this.eventsStore.find(e => e.id === id));
  }
}
