import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VASService } from '../../../core/services/vas.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, LocationItem, Movie, MovieBooking, SeatDetail, SeatLayout, ShowItem } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-vas-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-film text-fuchsia-400"></i> Cinema Ticket Booking
          </h1>
          <p class="text-xs text-slate-400">Book blockbuster movie tickets with interactive real-time seat layouts</p>
        </div>
      </div>

      <!-- STEP 1: MOVIE CAROUSEL / SELECTOR -->
      <div *ngIf="step() === 1" class="space-y-6 animate-fade-in">
        <h2 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-fire text-amber-400"></i> Now Showing
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div *ngFor="let movie of movies()" 
               class="bank-glass rounded-3xl overflow-hidden border border-white/10 hover:border-fuchsia-500/50 transition-all flex flex-col justify-between group">
            
            <div class="relative aspect-[3/4] overflow-hidden bg-slate-950">
              <img [src]="movie.posterUrl" [alt]="movie.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-transparent to-transparent"></div>
              
              <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <span class="badge badge-warning text-xs font-bold">
                  <i class="fa-solid fa-star"></i> {{ movie.rating }}/10
                </span>
                <span class="badge badge-info text-[10px]">{{ movie.language }}</span>
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-base font-bold text-white mb-1 group-hover:text-fuchsia-300 transition-colors">{{ movie.title }}</h3>
                <p class="text-xs text-slate-400 mb-2">{{ movie.genre }} • {{ movie.durationMinutes }} mins</p>
                <p class="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{{ movie.description }}</p>
              </div>

              <button (click)="selectMovie(movie)" class="bank-btn-primary w-full mt-4 text-xs py-2.5">
                Select Movie & Shows →
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- STEP 2: SHOW SELECTION & INTERACTIVE SEAT MATRIX -->
      <div *ngIf="step() === 2" class="space-y-6 animate-fade-in">
        
        <!-- Top Show Header -->
        <div class="bank-glass p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <button (click)="step.set(1)" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ selectedMovie?.title }}</h2>
              <p class="text-xs text-slate-400">{{ selectedMovie?.genre }} • {{ selectedMovie?.language }}</p>
            </div>
          </div>

          <!-- Shows Tabs -->
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let s of shows()" 
                    (click)="selectShow(s)"
                    class="px-4 py-2 rounded-xl border text-xs font-bold transition-all"
                    [ngClass]="selectedShow?.id === s.id ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
              {{ s.showTime }} ({{ s.ticketPrice | inrCurrency }})
            </button>
          </div>
        </div>

        <!-- Cinema Screen & Seat Matrix Layout -->
        <div *ngIf="seatLayout()" class="bank-glass p-6 md:p-10 rounded-3xl space-y-8">
          
          <!-- Curved Curved Screen Indicator -->
          <div class="max-w-md mx-auto text-center">
            <div class="h-2 w-full bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full shadow-[0_0_20px_rgba(56,189,248,0.8)] mb-2"></div>
            <div class="text-[10px] tracking-widest text-slate-500 font-bold uppercase">CINEMA SCREEN THIS WAY</div>
          </div>

          <!-- Seat Grid Matrix -->
          <div class="max-w-xl mx-auto space-y-3">
            <div *ngFor="let row of getRowLabels()" class="flex items-center justify-center gap-2">
              <span class="w-6 text-center font-bold text-xs text-slate-500 font-mono">{{ row }}</span>
              
              <div class="flex gap-2">
                <button *ngFor="let seat of getSeatsForRow(row)" 
                        (click)="toggleSeat(seat)"
                        [disabled]="seat.isBooked"
                        [title]="seat.seatCode + ' - ' + seat.seatType + ' (' + (seat.price | inrCurrency) + ')'"
                        class="w-7 h-7 md:w-8 md:h-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center"
                        [ngClass]="{
                          'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800': seat.isBooked,
                          'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/50 scale-110': isSeatSelected(seat),
                          'bg-slate-800 hover:bg-sky-600/40 text-slate-300 border border-slate-700': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'STANDARD',
                          'bg-slate-800 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'PREMIUM',
                          'bg-slate-800 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'RECLINER'
                        }">
                  {{ seat.colNumber }}
                </button>
              </div>

              <span class="w-6 text-center font-bold text-xs text-slate-500 font-mono">{{ row }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-white/5">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
              <span>Standard (₹350)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-slate-800 border border-amber-500/50 text-amber-400"></div>
              <span>Premium (₹450)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-slate-800 border border-purple-500/50 text-purple-400"></div>
              <span>Recliner (₹600)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-fuchsia-500"></div>
              <span class="text-white font-bold">Selected</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-slate-800/40 text-slate-600 border border-slate-800"></div>
              <span>Booked</span>
            </div>
          </div>

          <!-- Booking Summary & Payment Bar -->
          <div class="p-6 rounded-2xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Selected Seats ({{ selectedSeats().length }}):</div>
              <div class="text-sm font-bold text-fuchsia-300 mt-0.5">
                {{ getSelectedSeatCodes() || 'None selected' }}
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-xs text-slate-400">Total Price:</div>
                <div class="text-xl font-extrabold text-white font-mono">{{ calculateTotal() | inrCurrency }}</div>
              </div>

              <button (click)="initiateBooking()" 
                      [disabled]="selectedSeats().length === 0"
                      class="bank-btn-primary py-3 px-6 text-sm font-bold">
                <i class="fa-solid fa-ticket"></i> Confirm & Pay
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- PIN Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize Ticket Booking of ' + (calculateTotal() | inrCurrency)"
                     [subtitle]="'Seats: ' + getSelectedSeatCodes()"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Digital Ticket Pass Receipt Modal -->
      <div *ngIf="ticketPass()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-fuchsia-500/40 text-center relative overflow-hidden">
          
          <div class="w-14 h-14 rounded-full bg-fuchsia-500/15 border border-fuchsia-500 text-fuchsia-400 text-2xl flex items-center justify-center mx-auto mb-3">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <span class="badge badge-success text-xs font-bold mb-2">BOOKING CONFIRMED</span>
          <h3 class="text-xl font-extrabold text-white mb-1">{{ ticketPass()?.movieTitle }}</h3>
          <p class="text-xs text-slate-400 mb-4">{{ ticketPass()?.theatreName }} • {{ ticketPass()?.screenName }}</p>

          <!-- Ticket Pass Visual -->
          <div class="p-5 rounded-2xl bg-[#0b1329] border border-white/10 text-left space-y-3 mb-6 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Booking Pass ID:</span>
              <span class="font-mono text-sky-400 font-bold">{{ ticketPass()?.bookingRef }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Show Date & Time:</span>
              <span class="font-semibold text-white">{{ ticketPass()?.showDate }} at {{ ticketPass()?.showTime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Seats Reserved:</span>
              <span class="font-bold text-fuchsia-400 text-sm font-mono">{{ ticketPass()?.seatNumbers }} ({{ ticketPass()?.totalSeats }} Seats)</span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-2">
              <span class="text-slate-400">Total Amount Debited:</span>
              <span class="font-bold text-emerald-400 text-sm">{{ ticketPass()?.totalAmount | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="ticketPass.set(null); step.set(1)" class="bank-btn-primary w-full py-3">
            Close & Back to Movies
          </button>
        </div>
      </div>

    </div>
  `
})
export class VasMoviesComponent {
  private vasService = inject(VASService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  step = signal<number>(1);
  movies = signal<Movie[]>([]);
  shows = signal<ShowItem[]>([]);
  seatLayout = signal<SeatLayout | null>(null);
  selectedSeats = signal<SeatDetail[]>([]);
  accounts = signal<Account[]>([]);

  selectedMovie: Movie | null = null;
  selectedShow: ShowItem | null = null;

  showPinModal = signal<boolean>(false);
  ticketPass = signal<MovieBooking | null>(null);

  ngOnInit() {
    this.vasService.getMovies().subscribe({
      next: (res) => {
        if (res.success && res.data) this.movies.set(res.data);
      }
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) this.accounts.set(res.data);
      }
    });
  }

  selectMovie(movie: Movie) {
    this.selectedMovie = movie;
    this.vasService.getShows(movie.id).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.shows.set(res.data);
          this.selectShow(res.data[0]);
          this.step.set(2);
        } else {
          this.toastService.warning('No active shows available for this movie today.');
        }
      }
    });
  }

  selectShow(show: ShowItem) {
    this.selectedShow = show;
    this.selectedSeats.set([]);
    this.vasService.getSeatLayout(show.id).subscribe({
      next: (res) => {
        if (res.success && res.data) this.seatLayout.set(res.data);
      }
    });
  }

  getRowLabels(): string[] {
    const layout = this.seatLayout();
    if (!layout) return [];
    const set = new Set<string>();
    layout.seats.forEach(s => set.add(s.rowLabel));
    return Array.from(set).sort();
  }

  getSeatsForRow(row: string): SeatDetail[] {
    const layout = this.seatLayout();
    if (!layout) return [];
    return layout.seats.filter(s => s.rowLabel === row).sort((a, b) => a.colNumber - b.colNumber);
  }

  toggleSeat(seat: SeatDetail) {
    if (seat.isBooked) return;
    const current = this.selectedSeats();
    const exists = current.some(s => s.seatId === seat.seatId);
    if (exists) {
      this.selectedSeats.set(current.filter(s => s.seatId !== seat.seatId));
    } else {
      this.selectedSeats.set([...current, seat]);
    }
  }

  isSeatSelected(seat: SeatDetail): boolean {
    return this.selectedSeats().some(s => s.seatId === seat.seatId);
  }

  getSelectedSeatCodes(): string {
    return this.selectedSeats().map(s => s.seatCode).join(', ');
  }

  calculateTotal(): number {
    return this.selectedSeats().reduce((sum, s) => sum + s.price, 0);
  }

  initiateBooking() {
    if (this.selectedSeats().length === 0 || !this.selectedShow) return;
    const total = this.calculateTotal();
    if (this.accounts().length > 0 && total > this.accounts()[0].balance) {
      this.toastService.error('Insufficient account balance for this booking!');
      return;
    }
    this.showPinModal.set(true);
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedShow || this.accounts().length === 0) return;

    const primaryAcc = this.accounts()[0].accountNumber;
    this.vasService.bookMovie({
      showId: this.selectedShow.id,
      accountNumber: primaryAcc,
      seatIds: this.selectedSeats().map(s => s.seatId),
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ticketPass.set(res.data);
          this.toastService.success('Movie tickets booked successfully!');
        }
      }
    });
  }
}
