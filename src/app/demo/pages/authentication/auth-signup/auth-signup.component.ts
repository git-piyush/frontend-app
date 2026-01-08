import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { Appservice } from 'src/app/myservice/appservice';
import { Authservice } from 'src/app/service/auth/authservice';

@Component({
  selector: 'app-auth-signup',
  imports: [RouterModule,CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
     registerForm: FormGroup;

    error: any = null;
    constructor(private snackBar: MatSnackBar,private fb: FormBuilder,private authService: Authservice, private router: Router) {}

      ngOnInit(): void {
          this.registerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            role: ['User', Validators.required],
          }, { validators: this.passwordMatchValidator });
      }


      passwordMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirm = form.get('confirmPassword')?.value;
        return password === confirm ? null : { mismatch: true };
      }

      onRegister(): void {    
        if (this.registerForm.valid) {
              console.log('Registering user: ' + JSON.stringify(this.registerForm.value));
              const userData = this.registerForm.value;      
              this.authService.registerUser(this.registerForm.value).subscribe({
                next: (res:any) => {
                  if (res.status === 200) {
                      this.showError(res.message);
                      this.router.navigate(['/login']);                
                  }
                },
                error: (err: any) => {
                  this.showError(err.error.message);
                }
              });
        }
      }


      showError(msg: string){
            this.snackBar.open(msg, '', {
            duration: 3000, // auto-close after 5 seconds
            verticalPosition: 'top',
            horizontalPosition: 'center'
        });
      }

  }
