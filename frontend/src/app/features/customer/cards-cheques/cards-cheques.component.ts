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
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-credit-card"></i> Card Management & Cheque Services
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Cards & Cheques Hub
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Manage your RuPay & Visa debit cards, configure PIN security, daily spending limits, and order doorstep cheque books.
        </p>
      </div>

      <!-- SECTION 1: DEBIT CARDS -->
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-1">
          <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-credit-card text-amber-500"></i> Issued Debit Cards
          </h2>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ debitCards().length }} Active Cards</span>
        </div>

        <div *ngIf="debitCards().length === 0" class="bank-card p-6 text-center text-xs text-slate-500">
          No debit cards issued yet.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div *ngFor="let card of debitCards()" class="bank-card p-5 flex flex-col justify-between gap-4">
            
            <!-- Flat Clean Card Visualizer -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-xs">
              <div class="flex justify-between items-center text-xs">
                <span class="text-amber-400 font-extrabold text-[11px] tracking-wider uppercase font-mono">GODAVARI BANK</span>
                <span class="text-slate-300 text-[10px] uppercase font-bold">{{ card.cardType.replace('_', ' ') }}</span>
              </div>

              <!-- Card Number -->
              <div class="font-mono text-base tracking-widest text-amber-300 font-extrabold py-1">
                {{ card.maskedCardNumber }}
              </div>

              <!-- Card Holder & Expiry -->
              <div class="flex justify-between items-end text-xs text-slate-300">
                <div>
                  <div class="text-[9px] uppercase text-slate-400">Cardholder</div>
                  <div class="font-bold text-white text-[11px] uppercase">{{ card.cardHolderName }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[9px] uppercase text-slate-400">Expires</div>
                  <div class="font-mono text-white text-[11px] font-bold">{{ card.expiryMonth }}/{{ card.expiryYear }}</div>
                </div>
              </div>
            </div>

            <!-- Card Controls -->
            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Status:</span>
                <span class="pill-green text-[9px] py-0 px-2">
                  <i class="fa-solid fa-circle-check"></i> {{ card.status }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Linked Account:</span>
                <span class="font-mono text-slate-900 font-bold">{{ card.accountNumber }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Daily ATM Limit:</span>
                <span class="font-extrabold text-slate-900">{{ card.dailyLimit | inrCurrency }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button (click)="toggleCard(card)" 
                        class="bank-btn-secondary text-xs py-1.5 cursor-pointer font-semibold">
                  <i class="fa-solid" [ngClass]="card.status === 'ACTIVE' ? 'fa-lock text-amber-500' : 'fa-lock-open text-emerald-500'"></i>
                  {{ card.status === 'ACTIVE' ? 'Freeze Card' : 'Unfreeze Card' }}
                </button>
                <button (click)="openPinReset(card)" class="bank-btn-secondary text-xs py-1.5 cursor-pointer font-semibold">
                  <i class="fa-solid fa-key text-amber-500"></i> Set ATM PIN
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- SECTION 2: CHEQUE BOOK ISSUANCE -->
      <div class="bank-card p-5 space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-money-check text-amber-500"></i> Cheque Book Requests
            </h2>
            <p class="text-[11px] text-slate-500">Order personalized CTS-2010 compliant cheque books</p>
          </div>
          <button (click)="showChequeModal.set(true)" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
            <i class="fa-solid fa-plus"></i> Request Cheque Book
          </button>
        </div>

        <!-- Cheque Requests Table -->
        <div *ngIf="chequeRequests().length === 0" class="py-4 text-center text-xs text-slate-500">
          No cheque books requested yet.
        </div>

        <div *ngIf="chequeRequests().length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Leaves</th>
                <th>Series Range</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of chequeRequests()">
                <td class="font-mono text-xs font-bold text-slate-900">{{ req.accountNumber }}</td>
                <td class="text-xs font-semibold text-slate-700">{{ req.totalLeaves }} Leaves</td>
                <td class="text-xs font-mono text-slate-500">
                  <span *ngIf="req.startLeafNumber">{{ req.startLeafNumber }} - {{ req.endLeafNumber }}</span>
                  <span *ngIf="!req.startLeafNumber" class="text-slate-400 italic">Processing</span>
                </td>
                <td class="text-xs text-slate-500">{{ req.requestDate | date:'mediumDate' }}</td>
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
      <div *ngIf="selectedCardForPin()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-xs w-full shadow-2xl text-center space-y-4">
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif">Set 4-Digit ATM PIN</h3>
            <p class="text-xs text-slate-500 mt-0.5">Card ending in {{ selectedCardForPin()?.maskedCardNumber?.slice(-4) }}</p>
          </div>

          <div class="space-y-2">
            <input [(ngModel)]="newAtmPin" maxlength="4" type="password" placeholder="New 4-Digit PIN" class="bank-input text-center text-base font-bold" />
            <input [(ngModel)]="confirmAtmPin" maxlength="4" type="password" placeholder="Confirm PIN" class="bank-input text-center text-base font-bold" />
          </div>

          <div class="flex gap-2 pt-2 border-t border-slate-100">
            <button (click)="selectedCardForPin.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
            <button (click)="submitAtmPin()" [disabled]="!newAtmPin || newAtmPin !== confirmAtmPin" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
              Save PIN
            </button>
          </div>
        </div>
      </div>

      <!-- Request Cheque Modal -->
      <div *ngIf="showChequeModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Request Cheque Book</h3>
            <button (click)="showChequeModal.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Select Account *</label>
              <select [(ngModel)]="selectedChequeAccount" class="bank-input text-xs font-semibold">
                <option *ngFor="let a of accounts()" [value]="a.accountNumber">{{ a.accountNumber }} — {{ a.accountTypeName }}</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Number of Leaves *</label>
              <div class="grid grid-cols-3 gap-2">
                <button *ngFor="let l of [25, 50, 100]" 
                        (click)="selectedLeaves = l" 
                        class="py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        [ngClass]="selectedLeaves === l ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
                  {{ l }}
                </button>
              </div>
            </div>

            <div class="flex gap-2 pt-2 border-t border-slate-100">
              <button (click)="showChequeModal.set(false)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button (click)="submitChequeRequest()" [disabled]="!selectedChequeAccount" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
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
