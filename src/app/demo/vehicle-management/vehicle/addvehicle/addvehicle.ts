import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BookingStatus } from 'src/app/enums/booking-status.enum';
import { VehicleStatus } from 'src/app/enums/vehicle-status.enum';
import { VehicleType } from '../../../../enums/vehicle-type.enum';
import { BookingService } from '../../bookings/services/booking.service';
import { VehicleService } from '../../service/vehicle.service';

@Component({
  selector: 'app-addvehicle',
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './addvehicle.html',
  styleUrl: './addvehicle.scss'
})
export class Addvehicle  implements OnInit {

  vehicleForm: FormGroup;
  availableVehicles: any[] = [];
  loadingVehicles = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private vehicleService: VehicleService
    // private notificationService: NotificationService
  ) {
    this.vehicleForm = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleType: ['', Validators.required],
      permitLevel: ['', Validators.required],
      driverMob: ['', Validators.required],
      price: ['', Validators.required],
      capacity: ['', Validators.required],
      originCity: ['', Validators.required],
      destinationCity: ['', Validators.required],
      description: ['', Validators.required]
    }, { validators: this.originDestinationValidator });
  }

    originDestinationValidator(form: FormGroup) {
        const originCity = form.get('originCity')?.value;
        const desCity = form.get('destinationCity')?.value;
        return originCity !== desCity ? null : { mismatch: true };
      }

  ngOnInit(): void {
    //this.loadAvailableVehicles();
  }

  onSubmit() {
    if (this.vehicleForm.invalid) {
      this.snackBar.open('Please fill all required fields!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      return;
    }
    const formValue = this.vehicleForm.value;
    console.log(formValue);
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe({
          next: (res:any) => {
                if (res.status === 200) {
                   this.showError(res.message);
                      this.viewVehicleList();             
                }
              },
              error: (err: any) => {
              this.showError(err.error.message);
            }
          });
  }

  viewVehicleList() {
    this.router.navigate(['/vehicle-list']);
  }
  showError(msg: string){
    this.snackBar.open(msg, '', {
    duration: 3000, // auto-close after 5 seconds
    verticalPosition: 'top',
    horizontalPosition: 'center'
    });
  }

}
