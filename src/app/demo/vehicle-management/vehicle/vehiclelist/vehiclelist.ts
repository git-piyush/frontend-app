import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from '../../service/vehicle.service';
import { Router } from '@angular/router';
import { Vehicle } from '../../bookings/models/vehicle-booking.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehiclelist',
  imports: [CommonModule],
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
    this.loadBookings();
  }

  loadBookings(){
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

    updateBooking(vehicleId: number) {
      this.editMode = true;
      this.showBookingModal = true;
      this.vehicleService.getVehicleById(vehicleId).subscribe({
            next: (response) => {
              console.log(response);
            },
            error: (err) => {
              console.error('Error fetching booking:', err);
            }
          });

    }
  
    deleteBooking(id) {
      this.showConfirmationDialog = true;
      alert(id);
    }

}
