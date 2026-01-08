import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { Appservice } from 'src/app/myservice/appservice';
import { Authservice } from 'src/app/service/auth/authservice';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss'],
  imports: [
    CommonModule,
    FormsModule,   // ✅ This enables ngModel
    RouterModule,
    ReactiveFormsModule
    // other modules
  ]

})
export class AuthSigninComponent {

  loginData!: FormGroup;

  // loginData = {
  //   email: '',
  //   password: ''
  // };

  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: Authservice, private router: Router,private snackBar: MatSnackBar
) {}

  
  ngOnInit(): void {
    this.loginData = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSignUp(){
    alert('alert');
  }

  onLogin() {
        if (this.loginData.valid) {
          console.log('Login User: ' + JSON.stringify(this.loginData.value));
          const userData = this.loginData.value;      
          this.authService.loginUser(this.loginData.value).subscribe({
            next: (res:any) => {
              if (res.status === 200) {
                  this.authService.storeToken('token', res.token);
                  this.authService.storeToken('role', res.role);
                  this.authService.storeToken('userName', res.userName);
                  this.authService.storeToken('validToken', res.validToken);
                  this.showAutoCloseAlert();
                  this.router.navigate(['/dashboard']);                
              }
            },
            error: (err: any) => {
              this.showError(err.error.message);
            }
          });
    }
  }
  showError(message: any) {
        this.snackBar.open(message, '', {
        duration: 3000, // auto-close after 5 seconds
        verticalPosition: 'top',
        horizontalPosition: 'center'
    });
  }



  showAutoCloseAlert() {
      this.snackBar.open('Login successful!', '', {
        duration: 3000, // auto-close after 5 seconds
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
    }


}
