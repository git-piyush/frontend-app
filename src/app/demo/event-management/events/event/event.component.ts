import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../../../eventservices/event.service';
import { EventModel } from '../../event.model';
import { NotificationService } from '../../../../shared/services/notification.service';
import { RfcEventType } from 'src/app/enums/rfc-event-type.enum';
import { RfcDepartment } from 'src/app/enums/rfc-department.enum';
import { RfcVehiclePriority } from 'src/app/enums/rfc-vehicle-priority.enum';
import { RfcBookingStatus } from 'src/app/enums/rfc-booking-status.enum';
import { RfcProgress } from 'src/app/enums/rfc-progress.enum';
import { RefcodeService } from 'src/app/demo/refcode-management/refcode.service';

@Component({
  selector: 'app-event',
  standalone: true,
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FullCalendarModule]
})
export class EventComponent implements OnInit {

  calendarOptions!: CalendarOptions;
  events: EventModel[] = [];

  showModal = false;
  editMode = false;

  // Enum arrays for dropdowns
  departments = Object.values(RfcDepartment);
  vehiclePriorities = Object.values(RfcVehiclePriority);
  bookingStatuses = Object.values(RfcBookingStatus);
  progress = Object.values(RfcProgress);

  bookingStatusOptions: { key: string; value: unknown; }[];
  vehiclePriorityOptions: { key: string; value: unknown; }[];
  departmentOptions: { key: string; value: unknown; }[];
  eventTypeOptions: { key: string; value: unknown; }[];
  progressOptions: { key: string; value: unknown; }[];



  form: EventModel = {
    title: '',
    description: '',
    rfcEventType: '',
    rfcEventProgress: '',
    rfcVehiclePriority: '',
    rfcBookingStatus: '',
    rfcDepartment: '',
    privateEvent: false,
    departmentEvent: false,
    vehicleUpdate: false,
    startDate: '',
    dueDate: '',
    endDate: ''
  };

  constructor(private service: EventService,private refcodeService:RefcodeService // private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadDropDown();
  }

  loadDropDown() {
        this.refcodeService.getAllRefcodeMap().subscribe({
              next: (response) => {
                console.log(response.refCodeMap);

                const eventTypeOptionsMap = response.refCodeMap1["CAT_EVENT_TYPE"];
                this.eventTypeOptions = Object.entries(eventTypeOptionsMap).map(([key, value]) => ({
                  key,
                  value
                }));

                const departmentOptionsMap = response.refCodeMap1["CAT_DEPARTMENT"];
                this.departmentOptions = Object.entries(departmentOptionsMap).map(([key, value]) => ({
                  key,
                  value
                }));

                const vehiclePriorityOptionsMap = response.refCodeMap1["CAT_VEHICLE_PRIORITY"];
                this.vehiclePriorityOptions = Object.entries(vehiclePriorityOptionsMap).map(([key, value]) => ({
                  key,
                  value
                }));


                const bookingStatusOptionsMap = response.refCodeMap1["CAT_BOOKING_STATUS"];
                this.bookingStatusOptions = Object.entries(bookingStatusOptionsMap).map(([key, value]) => ({
                  key,
                  value
                }));



                const eventProgressMap = response.refCodeMap1["CAT_EVENT_PROGRESS"];
                this.progressOptions = Object.entries(eventProgressMap).map(([key, value]) => ({
                  key,
                  value
                }));

            },
            error: (err) => {
              if(err.error.status=401){
                //this.showError(err.error.message);
                //this.router.navigate(['/login']);
               }
                    //this.showError(err.error.message);
              }
        });

  }

  loadEvents() {
    this.service.getAllEvents().subscribe(res => {
      this.events = res.map(e => ({
        ...e,
        color: this.getColor(e)
      }));
      console.log(this.events);
      this.calendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        events: res.map(e => {
          // Build title with visual indicators
          let title = e.title;
          if (e.privateEvent) title = '🔒 ' + title;
          if (e.departmentEvent) title = '👥 ' + title;
          if (e.vehicleUpdate) title = '🌐 ' + title;

          return {
            id: String(e.id),
            title: title,
            start: e.startDate ? e.startDate.split('T')[0] : undefined, // Use date only for all-day events
            end: e.endDate ? e.endDate.split('T')[0] : undefined,
            allDay: true, // Mark as all-day events
            color: this.getColor(e),
            extendedProps: {
              description: e.description,
              rfcEventProgress: e.rfcEventProgress,
              rfcBookingStatus: e.rfcBookingStatus,
              rfcVehiclePriority: e.rfcVehiclePriority,
              rfcDepartment: e.rfcDepartment,
              privateEvent: e.privateEvent,
              departmentEvent: e.departmentEvent,
              vehicleUpdate: e.vehicleUpdate
            }
          };
        }),
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.openEdit.bind(this)
      };
    });
  }

  // EVENT COLOR RULES - Updated according to requirements
  getColor(e: EventModel): string {
    // Tasks (Due Date) red colour - highest priority
    if (e.rfcEventProgress?.toLowerCase() === 'rfupc' && e.dueDate) {
      return 'red';
    }

    // Completed Tasks green
    if (e.rfcBookingStatus?.toLowerCase() === 'completed') {
      return 'green';
    }

    // Overdue Tasks red
    if (e.rfcBookingStatus?.toLowerCase() === 'overdue') {
      return 'red';
    }

    // Critical Priority red
    if (e.rfcVehiclePriority?.toLowerCase() === 'CRITICAL') {
      return 'red';
    }

    // High Priority yellow
    if (e.rfcVehiclePriority?.toLowerCase() === 'rfhig') {
      return 'yellow';
    }

    // Low Priority orange
    if (e.rfcVehiclePriority?.toLowerCase() === 'rflow') {
      return 'orange';
    }

    // Regular Events blue - default
    return 'blue';
  }

  handleDateClick(arg: any) {
    this.resetForm();
    this.form.startDate = arg.dateStr;
    this.form.endDate = arg.dateStr;
    this.showModal = true;
  }

  openEdit(info: any) {
    const event = this.events.find(e => String(e.id) === info.event.id);
    if (event) {
      // Convert ISO datetime strings back to date-only strings for form inputs
      const formData = { ...event };
      if (formData.startDate && formData.startDate.includes('T')) {
        formData.startDate = formData.startDate.split('T')[0];
      }
      if (formData.endDate && formData.endDate.includes('T')) {
        formData.endDate = formData.endDate.split('T')[0];
      }
      if (formData.dueDate && formData.dueDate.includes('T')) {
        formData.dueDate = formData.dueDate.split('T')[0];
      }

      this.form = formData;
      this.editMode = true;
      this.showModal = true;
    }
  }

  saveEvent() {
    console.log('Save event called. Edit mode:', this.editMode);
    console.log('Form data:', this.form);

    if (!this.form.title || this.form.title.trim() === '') {
      alert('Title is required');
      return;
    }

    // Convert date strings to ISO datetime strings for backend
    const formData = { ...this.form };
    if (formData.startDate) {
      formData.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate) {
      formData.endDate = new Date(formData.endDate).toISOString();
    }
    if (formData.dueDate) {
      formData.dueDate = new Date(formData.dueDate).toISOString();
    }

    console.log('Processed form data:', formData);

    if (this.editMode) {
      console.log('Updating event with ID:', this.form.id);
      this.service.update(this.form.id!, formData).subscribe({
        next: (result) => {
          console.log('Update successful:', result);
          // this.notificationService.notifyEventUpdated({ title: this.form.title, id: this.form.id });
          this.close();
          window.location.reload();
          //this.loadEvents();
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert('Failed to update event: ' + (error.error?.message || error.message));
        }
      });
    } else {
      console.log('Creating new event');
      this.service.create(formData).subscribe({
        next: (result) => {
          console.log('Create successful:', result);
          // this.notificationService.notifyEventCreated({ title: this.form.title, id: result.id });
          this.close();
          //this.loadEvents();
          window.location.reload();
        },
        error: (error) => {
          console.error('Create failed:', error);
          alert('Failed to create event: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  deleteEvent() {
    if (this.form.id) {
      const eventTitle = this.form.title;
      this.service.delete(this.form.id).subscribe(() => {
        // this.notificationService.notifyEventDeleted({ title: eventTitle, id: this.form.id });
        this.close();
        this.loadEvents();
      });
    }
  }

  close() {
    this.showModal = false;
    this.editMode = false;
  }

  resetForm() {
    this.form = {
      title: '',
      description: '',
      rfcEventType: '',
      rfcEventProgress: '',
      rfcVehiclePriority: '',
      rfcBookingStatus: '',
      rfcDepartment: '',
      privateEvent: false,
      departmentEvent: false,
      vehicleUpdate: false,
      startDate: '',
      endDate: '',
      dueDate: ''
    };
  }

}
