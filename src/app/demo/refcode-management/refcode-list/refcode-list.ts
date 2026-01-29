import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RefcodeService } from '../refcode.service';
import { RefCode } from '../../transport-management/bookings/models/model-list.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// Interfaces for leave management
interface LeaveType {
  id: number;
  name: string;
  maxDaysPerYear: number;
  description: string;
  status: 'Active' | 'Inactive';
}

interface RefCodeModel{
  id: number;
  refCode: string;
  category: string;
  active: string;
  longName: string;
}

interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface Employee {
  id: number;
  name: string;
  designation?: string;
}

@Component({
  selector: 'app-refcode-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './refcode-list.html',
  styleUrl: './refcode-list.scss'
})
export class RefcodeList implements OnInit {

  pageNumber: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  order:string="asc";
  orderBy:string="category";
  refCodeList: any[] = [];
  allRefCodes: any[] = [];


  // Leave management properties
  leaveTypes: LeaveType[] = [];
  leaveApplications: LeaveApplication[] = [];
  showLeaveApplicationModal = false;
  showNewCatApplicationModal = false;
  showLeaveTypesModal = false;
  showConfirmationDialog = false;
  showExportDropdown = false;
  leaveApplicationForm: FormGroup;
  refCodeForm: FormGroup;
  leaveTypeForm: FormGroup;
  refCodeCategoryForm: FormGroup;
  editMode = false;
  selectedLeaveApplication?: LeaveApplication;
  selectedLeaveApplicationToDelete?: LeaveApplication;
  categoryList: [];

  constructor(private fb: FormBuilder, 
    private refcodeService: RefcodeService,
  private snackBar: MatSnackBar,private router: Router) {}

  ngOnInit() {
    this.loadFormDropDown();
    this.loadRefCode(this.pageNumber,this.pageSize,this.order,this.orderBy);
    this.initializeForms();
  }

  private  loadRefCode(pageNumber,pageSize,order,orderBy){
    //this.loading = true;
    // Try to load from backend API first
    this.refcodeService.getAllRefCode(pageNumber,pageSize,order,orderBy ).subscribe({
      next: (res) => {
        console.log("BACKEND RESPONSE - All bookings:", res);
        this.refCodeList = res.content || [];
        this.pageNumber = res.pageable.pageNumber;
        this.pageSize = res.pageable.pageSize;
        this.totalPages = res.totalPages;
        console.log('pageSize '+this.pageSize);
        //his.hasLocalUpdates = false;
        //this.loading = false;
        console.log(this.refCodeList);
      },
      error: (err) => {
        //this.loading = false;
          this.snackBar.open(err.error.message, '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
      }
    });
  }


changePage(newPage: number) {
  if (newPage >= 0 && newPage < this.totalPages) {
    this.pageNumber = newPage;
    this.updatePageData(this.pageNumber,this.pageSize,this.order,this.orderBy);
  }
}

updatePageData(pageNumber,pageSize,order,orderBy) {
  const start = this.pageNumber * this.pageSize;
  const end = start + this.pageSize;
  this.loadRefCode(pageNumber,pageSize,order,orderBy);
  //this.refCodeList = this.allRefCodes.slice(start, end);
}


getPageNumbers(): number[] {
  console.log('getPageNumbers');
  const pages: number[] = [];
  const maxPagesToShow = 5;

  if (this.totalPages <= maxPagesToShow) {
    for (let i = 0; i < this.totalPages; i++) pages.push(i);
  } else {
    let start = Math.max(0, this.pageNumber - 2);
    let end = Math.min(this.totalPages, start + maxPagesToShow);

    if (end - start < maxPagesToShow) {
      start = Math.max(0, end - maxPagesToShow);
    }

    for (let i = start; i < end; i++) pages.push(i);

    // Add ellipsis effect
    if (end < this.totalPages) {
      pages.push(this.totalPages - 1);
    }
  }
  return pages;
}

  onPageSizeChange() {
    this.pageNumber = 0;
    this.totalPages = Math.ceil(this.allRefCodes.length / this.pageSize);
    this.updatePageData(this.pageNumber,this.pageSize,this.order,this.orderBy);
  }

  // Initialize forms for leave management
 private initializeForms() {
    
    this.refCodeForm = this.fb.group({
      id: [],
      refCode: [null, Validators.required],
      category: ['', Validators.required],
      active: ['Yes', Validators.required],
      longName: ['', Validators.required]
    });
  }
  // Leave management methods
  openLeaveApplicationModal() {
    this.refCodeForm.reset();
    this.loadFormDropDown();
    this.closeNewCategoryCreateApplicationModal();
    this.showLeaveApplicationModal = true;
  }

  loadFormDropDown() {
        this.refcodeService.getAllRefcodeList().subscribe({
              next: (response) => {
                console.log(response.refCodeList);
                this.categoryList = response.refCodeList;
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

  closeLeaveApplicationModal() {
    this.showLeaveApplicationModal = false;
  }

  submitLeaveApplication() {
    if (this.refCodeForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formValue = this.refCodeForm.value;

    console.log('Leave application submitted successfully!'+ JSON.stringify(formValue));
    
    this.refcodeService.createRefCode(formValue).subscribe({
          next: (res:any) => {
                if (res.status === 200) {
                   this.showError(res.message);
                      //this.viewVehicleList();             
                }
              },
              error: (err: any) => {
                this.showError(err.error.message);
                //this.router.navigate(['/login']);
            }
          });

    this.closeLeaveApplicationModal();
    this.closeNewCategoryCreateApplicationModal();
    window.location.reload();
  }

  createNewCategoryApplication(){
    this.closeLeaveApplicationModal();
    this.openNewCategoryCreateApplicationModal();
  }

  closeNewCategoryCreateApplicationModal(){
    this.showNewCatApplicationModal=false;
  }

  openNewCategoryCreateApplicationModal(){
    this.showNewCatApplicationModal=true;
  }

  openLeaveTypesModal() {
    this.leaveTypeForm.reset();
    this.showLeaveTypesModal = true;
  }

  closeLeaveTypesModal() {
    this.showLeaveTypesModal = false;
  }

  addRefCodeCategory() {

    const formValue = this.refCodeForm.value;
    this.refcodeService.createRefCode(formValue).subscribe({
          next: (res:any) => {
                if (res.status === 200) {
                   this.showError(res.message);
                      //this.viewVehicleList();             
                }
              },
              error: (err: any) => {
                this.showError(err.error.message);
                //this.router.navigate(['/login']);
            }
          });
    this.closeLeaveTypesModal();
  }

  editRefCode(id:number){
    this.refcodeService.getRefCodeById(id).subscribe({
              next: (response) => {
                this.refCodeForm.patchValue(response.refCode);
                this.showLeaveApplicationModal = true;
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
