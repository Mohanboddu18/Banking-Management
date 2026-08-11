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
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-users-gear text-purple-400"></i> Branch Employee Governance
          </h1>
          <p class="text-xs text-slate-400">Hire specialized banking staff, manage roles, departments, and credentials</p>
        </div>
        <button (click)="showHireModal.set(true)" class="bank-btn-primary text-xs bg-purple-600 hover:bg-purple-700">
          <i class="fa-solid fa-user-plus"></i> Hire New Employee
        </button>
      </div>

      <!-- Employees Table -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Active Branch Staff ({{ employees().length }})</h3>

        <div class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Designation & Role</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees()">
                <td class="font-mono text-xs font-bold text-sky-400">{{ emp.employeeId }}</td>
                <td>
                  <div class="font-bold text-white text-xs">{{ emp.fullName }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ emp.username }}</div>
                </td>
                <td>
                  <span class="badge badge-purple text-[10px]">{{ emp.roleDesignation }}</span>
                </td>
                <td class="text-xs text-slate-300">{{ emp.department }}</td>
                <td>
                  <div class="text-xs text-slate-300">{{ emp.email }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">+91 {{ emp.mobile }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="emp.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                    {{ emp.status }}
                  </span>
                </td>
                <td>
                  <button (click)="toggleEmployeeStatus(emp)" class="bank-btn-secondary text-xs py-1 px-2.5">
                    {{ emp.status === 'ACTIVE' ? 'Suspend' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hire Employee Modal -->
      <div *ngIf="showHireModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-purple-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Hire New Bank Employee</h3>
            <button (click)="showHireModal.set(false)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitHire()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Full Name *</label>
                <input [(ngModel)]="newEmp.fullName" name="fn" required type="text" class="bank-input" placeholder="e.g. Vikram Sethi" />
              </div>
              <div>
                <label class="bank-label">Username *</label>
                <input [(ngModel)]="newEmp.username" name="un" required type="text" class="bank-input" placeholder="e.g. vikram_loan" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Email Address *</label>
                <input [(ngModel)]="newEmp.email" name="em" required type="email" class="bank-input" placeholder="vikram@sbi.bank" />
              </div>
              <div>
                <label class="bank-label">Mobile Number *</label>
                <input [(ngModel)]="newEmp.mobile" name="mb" required maxlength="10" type="text" class="bank-input" placeholder="9811122204" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Banking Role *</label>
                <select [(ngModel)]="newEmp.roleName" name="rn" class="bank-input">
                  <option value="ROLE_EMPLOYEE_CASHIER">Head Cashier</option>
                  <option value="ROLE_EMPLOYEE_LOAN_OFFICER">Loan Officer</option>
                  <option value="ROLE_EMPLOYEE_CUSTOMER_SERVICE">Customer Support Officer</option>
                  <option value="ROLE_EMPLOYEE_OPERATIONS">Operations & Cheque Officer</option>
                  <option value="ROLE_EMPLOYEE_ASST_MANAGER">Assistant Manager</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Department *</label>
                <input [(ngModel)]="newEmp.department" name="dp" required type="text" class="bank-input" placeholder="Credit & Loans" />
              </div>
            </div>

            <div>
              <label class="bank-label">Temporary Password *</label>
              <input [(ngModel)]="newEmp.password" name="pw" required type="password" class="bank-input" placeholder="Password@123" />
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="showHireModal.set(false)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!newEmp.fullName || !newEmp.username || !newEmp.email || !newEmp.password" class="bank-btn-primary flex-1 bg-purple-600 hover:bg-purple-700">
                Register Staff
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
