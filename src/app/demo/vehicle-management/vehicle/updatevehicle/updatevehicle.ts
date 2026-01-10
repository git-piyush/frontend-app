import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { VehicleService } from '../../service/vehicle.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-updatevehicle',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FullCalendarModule],
  templateUrl: './updatevehicle.html',
  styleUrl: './updatevehicle.scss'
})
export class Updatevehicle implements OnInit {

    vehicleForm: FormGroup;
    availableVehicles: any[] = [];
    loadingVehicles = false;

    vehicleId : number;

    constructor(private vehicleService: VehicleService,
        private snackBar: MatSnackBar,
        private router: Router, private activatedRoute: ActivatedRoute, private fb:FormBuilder
      ) {
            this.vehicleForm = this.fb.group({
            id: ['', Validators.required],
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

      ngOnInit(): void {
        this.vehicleId = this.activatedRoute.snapshot.params['vehicleId']
        this.updateBooking(this.vehicleId);
      }

      originDestinationValidator(form: FormGroup) {
        const originCity = form.get('originCity')?.value;
        const desCity = form.get('destinationCity')?.value;
        return originCity !== desCity ? null : { mismatch: true };
      }

      updateBooking(vehicleId: number) {
        this.vehicleService.getVehicleById(vehicleId).subscribe({
              next: (response) => {
                console.log(response);
                this.vehicleForm.patchValue(response);
              },
              error: (err) => {
                console.error('Error fetching booking:', err);
              }
            });

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
                  this.showError("Vehicle Updated.");
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
