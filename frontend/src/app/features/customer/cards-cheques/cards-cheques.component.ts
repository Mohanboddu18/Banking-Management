import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../../core/services/card.service';
import { ChequeService } from '../../../core/services/cheque.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, ChequeRequest, CreditCard, DebitCard } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-cards-cheques',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-credit-card text-indigo-400"></i> Cards & Cheque Book Management
          </h1>
          <p class="text-xs text-slate-400">Manage digital debit/credit cards, ATM PINs, security limits, and cheque leaves</p>
        </div>
      </div>

      <!-- SECTION 1: DEBIT CARDS -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-brands fa-cc-visa text-sky-400"></i> Active Debit Cards
          </h2>
          <button (click)="showNewCardModal.set(true)" class="bank-btn-secondary text-xs">
            <i class="fa-solid fa-plus text-sky-400"></i> Request New Card
          </button>
        </div>

        <div *ngIf="debitCards().length === 0" class="bank-glass p-8 rounded-2xl text-center text-xs text-slate-400">
          No debit cards issued yet. Click "Request New Card" to issue an instant virtual/physical card.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let card of debitCards()" class="bank-glass p-6 rounded-3xl flex flex-col justify-between gap-6 border border-white/10">
            
            <!-- 3D Card Visualizer -->
            <div class="credit-card-preview">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-[10px] tracking-widest text-sky-300 font-bold uppercase">GODAVARI BANK</div>
                  <div class="text-xs font-semibold text-white/80">{{ card.cardType.replace('_', ' ') }}</div>
                </div>
                <i class="fa-brands fa-cc-visa text-3xl text-white/90"></i>
              </div>

              <!-- Chip & Contactless -->
              <div class="flex items-center gap-3 my-2">
                <div class="w-9 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                  <div class="w-6 h-4 border border-amber-600/40 rounded-sm"></div>
                </div>
                <i class="fa-solid fa-wifi rotate-90 text-white/70 text-sm"></i>
              </div>

              <!-- Card Number -->
              <div class="font-mono text-lg tracking-widest text-white font-bold">
                {{ card.maskedCardNumber }}
              </div>

              <!-- Card Holder & Expiry -->
              <div class="flex justify-between items-end text-xs">
                <div>
                  <div class="text-[9px] text-sky-300/80 uppercase">Cardholder Name</div>
                  <div class="font-bold tracking-wider uppercase">{{ card.cardHolderName }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[9px] text-sky-300/80 uppercase">Expires</div>
                  <div class="font-mono font-bold">{{ card.expiryMonth }}/{{ card.expiryYear }}</div>
                </div>
              </div>
            </div>

            <!-- Card Controls -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Card Status:</span>
                <span class="badge" [ngClass]="card.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                  {{ card.status }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Linked Account:</span>
                <span class="font-mono text-white">{{ card.accountNumber }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Daily POS Limit:</span>
                <span class="font-bold text-white">{{ card.dailyLimit | inrCurrency }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <button (click)="toggleCard(card)" 
                        class="bank-btn-secondary text-xs py-2"
                        [ngClass]="card.status === 'ACTIVE' ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-emerald-500/50 hover:text-emerald-400'">
                  <i class="fa-solid" [ngClass]="card.status === 'ACTIVE' ? 'fa-lock' : 'fa-lock-open'"></i>
                  {{ card.status === 'ACTIVE' ? 'Freeze / Block' : 'Unfreeze Card' }}
                </button>
                <button (click)="openPinReset(card)" class="bank-btn-secondary text-xs py-2">
                  <i class="fa-solid fa-key text-sky-400"></i> Set ATM PIN
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- SECTION 2: CHEQUE BOOK ISSUANCE -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-money-check text-emerald-400"></i> Cheque Book Services
            </h2>
            <p class="text-xs text-slate-400">Request personalized multi-leaf cheque books delivered or issued by branch</p>
          </div>
          <button (click)="showChequeModal.set(true)" class="bank-btn-primary text-xs">
            <i class="fa-solid fa-plus"></i> Request Cheque Book
          </button>
        </div>

        <!-- Cheque Requests Table -->
        <div *ngIf="chequeRequests().length === 0" class="py-6 text-center text-xs text-slate-400">
          No cheque books requested yet.
        </div>

        <div *ngIf="chequeRequests().length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Leaves</th>
                <th>Series Range</th>
                <th>Request Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of chequeRequests()">
                <td class="font-mono text-xs text-white">{{ req.accountNumber }}</td>
                <td class="text-xs font-semibold">{{ req.totalLeaves }} Leaves</td>
                <td class="text-xs font-mono text-slate-400">
                  <span *ngIf="req.startLeafNumber">{{ req.startLeafNumber }} - {{ req.endLeafNumber }}</span>
                  <span *ngIf="!req.startLeafNumber" class="italic text-slate-600">Pending issuance</span>
                </td>
                <td class="text-xs text-slate-400">{{ req.requestDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': req.status === 'ISSUED' || req.status === 'APPROVED',
                    'badge-warning': req.status === 'REQUESTED',
                    'badge-danger': req.status === 'REJECTED'
                  }">
                    {{ req.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Set ATM PIN Modal -->
      <div *ngIf="selectedCardForPin()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-sky-500/30 text-center">
          <h3 class="text-lg font-bold text-white mb-1">Set 4-Digit ATM PIN</h3>
          <p class="text-xs text-slate-400 mb-4">Card ending in {{ selectedCardForPin()?.maskedCardNumber?.slice(-4) }}</p>

          <div class="space-y-3 mb-6">
            <input [(ngModel)]="newAtmPin" maxlength="4" type="password" placeholder="New 4-Digit PIN" class="bank-input text-center text-lg font-bold" />
            <input [(ngModel)]="confirmAtmPin" maxlength="4" type="password" placeholder="Confirm PIN" class="bank-input text-center text-lg font-bold" />
          </div>

          <div class="flex gap-3">
            <button (click)="selectedCardForPin.set(null)" class="bank-btn-secondary flex-1">Cancel</button>
            <button (click)="submitAtmPin()" [disabled]="!newAtmPin || newAtmPin !== confirmAtmPin" class="bank-btn-primary flex-1">
              Save PIN
            </button>
          </div>
        </div>
      </div>

      <!-- Request Cheque Modal -->
      <div *ngIf="showChequeModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-emerald-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Request Cheque Book</h3>
            <button (click)="showChequeModal.set(false)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="bank-label">Select Account *</label>
              <select [(ngModel)]="selectedChequeAccount" class="bank-input">
                <option *ngFor="let a of accounts()" [value]="a.accountNumber">{{ a.accountNumber }} — {{ a.accountTypeName }}</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Number of Cheque Leaves *</label>
              <div class="grid grid-cols-3 gap-3">
                <button *ngFor="let l of [25, 50, 100]" 
                        (click)="selectedLeaves = l" 
                        class="p-3 rounded-xl border font-bold text-sm transition-all"
                        [ngClass]="selectedLeaves === l ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
                  {{ l }} Leaves
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-3">
              <button (click)="showChequeModal.set(false)" class="bank-btn-secondary flex-1">Cancel</button>
              <button (click)="submitChequeRequest()" [disabled]="!selectedChequeAccount" class="bank-btn-primary flex-1">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CardsChequesComponent {
  private cardService = inject(CardService);
  private chequeService = inject(ChequeService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  debitCards = signal<DebitCard[]>([]);
  chequeRequests = signal<ChequeRequest[]>([]);
  accounts = signal<Account[]>([]);

  showNewCardModal = signal<boolean>(false);
  showChequeModal = signal<boolean>(false);
  selectedCardForPin = signal<DebitCard | null>(null);

  newAtmPin = '';
  confirmAtmPin = '';
  selectedChequeAccount = '';
  selectedLeaves = 25;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.cardService.getDebitCards().subscribe({
      next: (res) => {
        if (res.success && res.data) this.debitCards.set(res.data);
      }
    });

    this.chequeService.getMyChequeRequests().subscribe({
      next: (res) => {
        if (res.success && res.data) this.chequeRequests.set(res.data);
      }
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) this.selectedChequeAccount = res.data[0].accountNumber;
        }
      }
    });
  }

  toggleCard(card: DebitCard) {
    this.cardService.toggleDebitCard(card.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastService.success(`Card ${res.data.status === 'ACTIVE' ? 'unblocked' : 'blocked'} successfully`);
          this.loadData();
        }
      }
    });
  }

  openPinReset(card: DebitCard) {
    this.selectedCardForPin.set(card);
    this.newAtmPin = '';
    this.confirmAtmPin = '';
  }

  submitAtmPin() {
    if (!this.selectedCardForPin() || this.newAtmPin !== this.confirmAtmPin) return;
    this.cardService.setCardPin(this.selectedCardForPin()!.id, {
      newPin: this.newAtmPin,
      confirmPin: this.confirmAtmPin
    }).subscribe({
      next: () => {
        this.toastService.success('ATM PIN updated successfully!');
        this.selectedCardForPin.set(null);
      }
    });
  }

  submitChequeRequest() {
    if (!this.selectedChequeAccount) return;
    this.chequeService.requestChequeBook({
      accountNumber: this.selectedChequeAccount,
      numberOfLeaves: this.selectedLeaves
    }).subscribe({
      next: () => {
        this.toastService.success('Cheque book requested successfully!');
        this.showChequeModal.set(false);
        this.loadData();
      }
    });
  }
}
