import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from '../../service/vehicle.service';
import { Router, RouterModule } from '@angular/router';
import { Vehicle } from '../../bookings/models/model-list.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehiclelist',
  imports: [CommonModule, RouterModule],
  templateUrl: './vehiclelist.html',
  styleUrl: './vehiclelist.scss'
})
export class Vehiclelist implements OnInit {

      vehicles: Vehicle[] = [];
      loading = false;
      showBookingModal = false;
      showConfirmationDialog = false;
      editMode = false;
      selectedVehicle?: Vehicle;
      vehicleToDelete?: Vehicle;
      hasLocalUpdates = false;

    constructor(
    private vehicleService: VehicleService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllVehicle();
  }

  getAllVehicle(){
    this.loading = true;
    // Try to load from backend API first
    this.vehicleService.getAllVehicle().subscribe({
      next: (res) => {
        console.log("BACKEND RESPONSE - All bookings:", res);
        this.vehicles = res || [];
        this.hasLocalUpdates = false;
        this.loading = false;
        console.log(this.vehicles);
      },
      error: (err) => {
        this.loading = false;
          this.snackBar.open(err.error.message, '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
      }
    });
  }

  deleteBooking(vehicleId:number) {

      if(!confirm("Are you sure you want to delete this vehicle?")){
        return;
      }

      this.vehicleService.deleteVehicleById(vehicleId).subscribe({
        next: (res) => {
            this.snackBar.open("Vehicle Deleted.", '', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            window.location.reload();
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
      showError(msg: string){
        this.snackBar.open(msg, '', {
        duration: 3000, // auto-close after 5 seconds
        verticalPosition: 'top',
        horizontalPosition: 'center'
        });
    }

}
