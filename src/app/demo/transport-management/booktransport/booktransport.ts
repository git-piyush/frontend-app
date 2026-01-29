import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BookingService } from '../bookings/services/booking.service';
import { VehicleService } from '../service/vehicle.service';
import { TransportService } from '../service/transport.service';
import { RefcodeService } from '../../refcode-management/refcode.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-booktransport',
  imports: [ReactiveFormsModule,FormsModule, CommonModule],
  templateUrl: './booktransport.html',
  styleUrl: './booktransport.scss'
})
export class Booktransport  implements OnInit {

  bookingForm: FormGroup;
  availableVehicles: any[] = [];
  loadingVehicles = false;

  htmlLabels = {
    bookingDate: 'Booking Date'
  };
  totalFair1: number;
  categoryList: [];
  transportType: { key: string; value: unknown; }[];
  transportVehicle: { key: string; value: unknown; }[];
  originCity: { key: string; value: unknown; }[];
  destinationCity:{ key: string; value: unknown; }[];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private transportService: TransportService,
    private refcodeService: RefcodeService
    // private notificationService: NotificationService
  ) {

    this.bookingForm = this.fb.group({
      bookingDate: [new Date().toISOString().split('T')[0], Validators.required],
      transportDate: ['', Validators.required],
      rfcTransportType: ['', Validators.required],
      rfcTransportVehicle: ['', Validators.required],
      rfcFromCity: ['', Validators.required],
      rfcToCity: ['', Validators.required],
      totalFair: ['', Validators.required],
      phone: ['', Validators.required],
      description: ['', Validators.required]
    }, { validators: this.originDestinationValidator });
  }

    originDestinationValidator(form: FormGroup) {
        const fromCity = form.get('rfcFromCity')?.value;
        const toCity = form.get('rfcToCity')?.value;
        return fromCity !== toCity ? null : { mismatch: true };
      }

  ngOnInit(): void {
    this.loadFormDropDown();
  }

  loadFormDropDown() {
        this.refcodeService.getAllRefcodeMap().subscribe({
              next: (response) => {
                const transportTypeMap = response.refCodeMap1["CAT_TRANSPORT_TYPE"];
                this.transportType = Object.entries(transportTypeMap).map(([key, value]) => ({
                  key,
                  value
                }));

                const transportVehicleMap = response.refCodeMap1["CAT_TRANSPORT_VEHICLE"];
                this.transportVehicle = Object.entries(transportVehicleMap).map(([key, value]) => ({
                  key,
                  value
                }));

                const destinationCityMap = response.refCodeMap1["CAT_DESTINATION_CITY"];
                this.destinationCity = Object.entries(destinationCityMap).map(([key, value]) => ({
                  key,
                  value
                }));

                const originCityMap = response.refCodeMap1["CAT_ORIGIN_CITY"];
                console.log('originCityMap'+originCityMap);
                this.originCity = Object.entries(originCityMap).map(([key, value]) => ({
                  key,
                  value
                }));
            },
            error: (err) => {
              if(err.error.status=401){
                this.showError(err.error.message);
                this.router.navigate(['/login']);
               }
                this.showError(err.error.message);
        }
    });

  }

  onSubmit() {
    if (this.bookingForm.invalid) {
      this.snackBar.open('Please fill all required fields!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      return;
    }
    const formValue = this.bookingForm.value;
    console.log(formValue);
    this.transportService.bookTransport(this.bookingForm.value).subscribe({
          next: (res:any) => {
                if (res.status === 200) {
                   this.showError(res.message);
                      this.viewBookingList();             
                }else{
                  this.showError(res.message);
                }
              },
              error: (err: any) => {
              if(err.error.status=401){
                this.showError(err.error.message);
                this.router.navigate(['/login']);
              }
                this.showError(err.error.message);
            }
    });
  }

  viewBookingList() {
    this.router.navigate(['/booked-transport']);
  }
  showError(msg: string){
    this.snackBar.open(msg, '', {
    duration: 3000, // auto-close after 5 seconds
    verticalPosition: 'top',
    horizontalPosition: 'center'
    });
  }

}

