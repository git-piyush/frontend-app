import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RefcodeService } from '../refcode.service';
import { RefCode } from '../../vehicle-management/bookings/models/model-list.model';
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


  // Mock employee data - in real app this would come from service
  employees: Employee[] = [
    { id: 1, name: 'John Doe', designation: 'Employee' },
    { id: 2, name: 'Jane Smith', designation: 'Manager' },
    { id: 3, name: 'Bob Johnson', designation: 'Employee' },
    { id: 4, name: 'Alice Brown', designation: 'User' },
    { id: 5, name: 'Charlie Wilson', designation: 'Employee' }
  ];

  // Leave management properties
  leaveTypes: LeaveType[] = [];
  leaveApplications: LeaveApplication[] = [];
  showLeaveApplicationModal = false;
  showLeaveTypesModal = false;
  showConfirmationDialog = false;
  showExportDropdown = false;
  leaveApplicationForm: FormGroup;
  refCodeForm: FormGroup;
  leaveTypeForm: FormGroup;
  editMode = false;
  selectedLeaveApplication?: LeaveApplication;
  selectedLeaveApplicationToDelete?: LeaveApplication;
  private nextLeaveTypeId = 1;
  private nextLeaveApplicationId = 1;
  categoryList: [];

  constructor(private fb: FormBuilder, 
    private refcodeService: RefcodeService,
  private snackBar: MatSnackBar,private router: Router) {}

  ngOnInit() {
    this.loadFormDropDown();
    this.loadRefCode(this.pageNumber,this.pageSize,this.order,this.orderBy);
    this.initializeForms();
    this.loadDefaultLeaveTypes();
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

    this.leaveTypeForm = this.fb.group({
      name: ['', Validators.required],
      maxDaysPerYear: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });
  }

  // Load default leave types
  private loadDefaultLeaveTypes() {
    this.leaveTypes = [
      {
        id: this.nextLeaveTypeId++,
        name: 'Annual Leave',
        maxDaysPerYear: 30,
        description: 'Regular annual leave entitlement',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Casual Leave',
        maxDaysPerYear: 12,
        description: 'Short-term personal leave',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Maternity Leave',
        maxDaysPerYear: 180,
        description: 'Leave for new mothers',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Paternity Leave',
        maxDaysPerYear: 15,
        description: 'Leave for new fathers',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Sick Leave',
        maxDaysPerYear: 12,
        description: 'Medical leave for illness',
        status: 'Active'
      }
    ];
  }

  // Leave management methods
  openLeaveApplicationModal() {
    this.refCodeForm.reset();
    this.loadFormDropDown();
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
  }

  openLeaveTypesModal() {
    this.leaveTypeForm.reset();
    this.showLeaveTypesModal = true;
  }

  closeLeaveTypesModal() {
    this.showLeaveTypesModal = false;
  }

  addLeaveType() {
    if (this.leaveTypeForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formValue = this.leaveTypeForm.value;
    const newLeaveType: LeaveType = {
      id: this.nextLeaveTypeId++,
      name: formValue.name,
      maxDaysPerYear: formValue.maxDaysPerYear,
      description: formValue.description,
      status: 'Active'
    };

    this.leaveTypes.push(newLeaveType);
    alert('Leave type added successfully!');
    this.closeLeaveTypesModal();
  }

  getEmployeeName(id: number): string {
    const employee = this.employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Unknown';
  }

  getLeaveTypeName(id: number): string {
    const leaveType = this.leaveTypes.find(lt => lt.id === id);
    return leaveType ? leaveType.name : 'Unknown';
  }

  toggleExportDropdown() {
    this.showExportDropdown = !this.showExportDropdown;
  }

  printLeaveApplications() {
    window.print();
  }

  exportLeaveApplications(format: string = 'csv') {
    switch (format) {
      case 'csv':
        this.exportLeaveApplicationsToCSV();
        break;
      case 'pdf':
        this.exportLeaveApplicationsToPDF();
        break;
      case 'excel':
        this.exportLeaveApplicationsToExcel();
        break;
      case 'docx':
        this.exportLeaveApplicationsToDOCX();
        break;
      default:
        this.exportLeaveApplicationsToCSV();
    }
  }

  private exportLeaveApplicationsToCSV() {
    const csvData = this.convertLeaveApplicationsToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportLeaveApplicationsToPDF() {
    const htmlContent = this.generateLeaveApplicationsHTMLContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Leave Applications Data</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Leave Applications Data</h1>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  private exportLeaveApplicationsToExcel() {
    const csvData = this.convertLeaveApplicationsToCSV();
    const excelData = this.convertCSVToExcel(csvData);
    const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.xls';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportLeaveApplicationsToDOCX() {
    const htmlContent = this.generateLeaveApplicationsHTMLContent();
    const docxContent = this.convertHTMLToDOCX(htmlContent);
    const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.docx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertLeaveApplicationsToCSV(): string {
    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Applied Date'];
    const rows = [];

    this.leaveApplications.forEach((application) => {
      rows.push([
        application.employeeName,
        application.leaveTypeName,
        application.startDate,
        application.endDate,
        application.reason,
        application.status,
        application.appliedDate
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    return csvContent;
  }

  private generateLeaveApplicationsHTMLContent(): string {
    let html = '';

    if (this.leaveApplications.length > 0) {
      html += '<table>';
      html += '<thead><tr><th>Employee</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Applied Date</th></tr></thead>';
      html += '<tbody>';
      this.leaveApplications.forEach((application) => {
        html += `<tr><td>${application.employeeName}</td><td>${application.leaveTypeName}</td><td>${application.startDate}</td><td>${application.endDate}</td><td>${application.reason}</td><td>${application.status}</td><td>${application.appliedDate}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    return html;
  }

  private convertCSVToExcel(csvData: string): string {
    // Simple Excel XML format
    const rows = csvData.split('\n');
    let excelXML = '<?xml version="1.0"?>\n';
    excelXML += '<?mso-application progid="Excel.Sheet"?>\n';
    excelXML += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    excelXML += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
    excelXML += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
    excelXML += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    excelXML += ' <Worksheet ss:Name="Leave Applications">\n';
    excelXML += '  <Table>\n';

    rows.forEach(row => {
      if (row.trim()) {
        const cells = row.split(',');
        excelXML += '   <Row>\n';
        cells.forEach(cell => {
          // Remove quotes from CSV data for Excel
          const cleanCell = cell.replace(/^"|"$/g, '');
          excelXML += `    <Cell><Data ss:Type="String">${cleanCell}</Data></Cell>\n`;
        });
        excelXML += '   </Row>\n';
      }
    });

    excelXML += '  </Table>\n';
    excelXML += ' </Worksheet>\n';
    excelXML += '</Workbook>';

    return excelXML;
  }

  private convertHTMLToDOCX(htmlContent: string): string {
    // Simple DOCX XML format (minimal implementation)
    let docxXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    docxXML += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n';
    docxXML += ' <w:body>\n';
    docxXML += '  <w:p><w:r><w:t>Leave Applications Data</w:t></w:r></w:p>\n';

    // Convert HTML tables to DOCX format
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
    const tables = doc.querySelectorAll('table');

    tables.forEach(table => {
      docxXML += '  <w:tbl>\n';
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        docxXML += '   <w:tr>\n';
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
          docxXML += '    <w:tc><w:p><w:r><w:t>';
          docxXML += cell.textContent || '';
          docxXML += '</w:t></w:r></w:p></w:tc>\n';
        });
        docxXML += '   </w:tr>\n';
      });
      docxXML += '  </w:tbl>\n';
    });

    docxXML += ' </w:body>\n';
    docxXML += '</w:document>';

    return docxXML;
  }

  showError(msg: string){
    this.snackBar.open(msg, '', {
    duration: 3000, // auto-close after 5 seconds
    verticalPosition: 'top',
    horizontalPosition: 'center'
    });
  }





}
