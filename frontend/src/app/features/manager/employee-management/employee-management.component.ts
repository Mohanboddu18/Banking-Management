import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { ToastService } from '../../../core/services/toast.service';
import { Employee } from '../../../core/models/models';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-users"></i> Human Resources & Staff Access Control
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Branch Employee Directory
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Onboard new bank staff, assign departmental operational roles, and manage employee active/suspended credentials.
        </p>
      </div>

      <!-- Header Action Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-id-badge text-amber-500"></i> Active Staff Roster
        </h2>
        <button (click)="showHireModal.set(true)" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
          <i class="fa-solid fa-plus mr-1"></i> Onboard New Staff
        </button>
      </div>

      <!-- Employees Table -->
      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif">Staff Directory</h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ employees().length }} Officers</span>
        </div>

        <div class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Staff Name</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees()">
                <td class="font-mono text-xs font-bold text-slate-900">{{ emp.employeeId }}</td>
                <td>
                  <div class="font-bold text-slate-900 text-xs">{{ emp.fullName }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ emp.username }}</div>
                </td>
                <td>
                  <span class="pill-dark text-[9px] py-0.5 px-2">{{ emp.roleDesignation }}</span>
                </td>
                <td class="text-xs font-semibold text-slate-700">{{ emp.department }}</td>
                <td>
                  <div class="text-xs font-semibold text-slate-900">{{ emp.email }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">+91 {{ emp.mobile }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="emp.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                    {{ emp.status }}
                  </span>
                </td>
                <td>
                  <button (click)="toggleEmployeeStatus(emp)" class="bank-btn-secondary text-xs py-1 px-3 font-semibold">
                    {{ emp.status === 'ACTIVE' ? 'Suspend Access' : 'Reactivate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hire Employee Modal -->
      <div *ngIf="showHireModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Onboard Bank Employee</h3>
            <button (click)="showHireModal.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitHire()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Full Name *</label>
                <input [(ngModel)]="newEmp.fullName" name="fn" required type="text" class="bank-input text-xs font-semibold" placeholder="Vikram Sethi" />
              </div>
              <div>
                <label class="bank-label">Username *</label>
                <input [(ngModel)]="newEmp.username" name="un" required type="text" class="bank-input text-xs font-semibold" placeholder="vikram_loan" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Email Address *</label>
                <input [(ngModel)]="newEmp.email" name="em" required type="email" class="bank-input text-xs" placeholder="vikram@godavari.bank" />
              </div>
              <div>
                <label class="bank-label">Mobile Number *</label>
                <input [(ngModel)]="newEmp.mobile" name="mb" required maxlength="10" type="text" class="bank-input text-xs font-mono" placeholder="9811122204" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Assigned Role *</label>
                <select [(ngModel)]="newEmp.roleName" name="rn" class="bank-input text-xs font-semibold">
                  <option value="ROLE_EMPLOYEE_CASHIER">Head Cashier</option>
                  <option value="ROLE_EMPLOYEE_LOAN_OFFICER">Loan Officer</option>
                  <option value="ROLE_EMPLOYEE_CUSTOMER_SERVICE">Support Officer</option>
                  <option value="ROLE_EMPLOYEE_OPERATIONS">Operations & Cheques</option>
                  <option value="ROLE_EMPLOYEE_ASST_MANAGER">Assistant Manager</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Department *</label>
                <input [(ngModel)]="newEmp.department" name="dp" required type="text" class="bank-input text-xs font-semibold" placeholder="Credit & Loans" />
              </div>
            </div>

            <div>
              <label class="bank-label">Initial Login Password *</label>
              <input [(ngModel)]="newEmp.password" name="pw" required type="password" class="bank-input text-xs" placeholder="Password@123" />
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="showHireModal.set(false)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!newEmp.fullName || !newEmp.username || !newEmp.email || !newEmp.password" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Register Officer →
              </button>
            </div>
          </form>
        </div>
      </div>


    </div>
  `
})
export class EmployeeManagementComponent {
  private managerService = inject(ManagerService);
  private toastService = inject(ToastService);

  employees = signal<Employee[]>([]);
  showHireModal = signal<boolean>(false);

  newEmp = {
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: 'Password@123',
    roleName: 'ROLE_EMPLOYEE_LOAN_OFFICER',
    department: 'Credit & Loans'
  };

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.managerService.getAllEmployees().subscribe({
      next: (res) => {
        if (res.success && res.data) this.employees.set(res.data);
      }
    });
  }

  submitHire() {
    this.managerService.createEmployee(this.newEmp).subscribe({
      next: () => {
        this.toastService.success('Employee hired successfully!');
        this.showHireModal.set(false);
        this.newEmp = { fullName: '', username: '', email: '', mobile: '', password: 'Password@123', roleName: 'ROLE_EMPLOYEE_LOAN_OFFICER', department: 'Credit & Loans' };
        this.loadEmployees();
      }
    });
  }

  toggleEmployeeStatus(emp: Employee) {
    const nextStatus = emp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.managerService.updateEmployee(emp.id, { status: nextStatus }).subscribe({
      next: () => {
        this.toastService.success(`Employee status changed to ${nextStatus}`);
        this.loadEmployees();
      }
    });
  }
}
