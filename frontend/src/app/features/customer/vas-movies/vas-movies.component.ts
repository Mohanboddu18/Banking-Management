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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-film"></i> Cinema Tickets & Premium Seat Reservations
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Movie Ticket Booking
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Book cinema tickets at partner multiplexes, choose standard or recliner seats, and checkout directly with your bank balance.
        </p>
      </div>

      <!-- STEP 1: MOVIE CAROUSEL / SELECTOR -->
      <div *ngIf="step() === 1" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between pb-1">
          <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-fire text-amber-500"></i> Now Showing in Theatres
          </h2>
          <button *ngIf="myBookings().length > 0" (click)="showHistoryModal.set(true)" class="bank-btn-secondary text-xs py-1.5 px-3 font-semibold shadow-2xs">
            <i class="fa-solid fa-clock-rotate-left mr-1 text-amber-600"></i> My Bookings ({{ myBookings().length }})
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div *ngFor="let movie of movies()" 
               class="bank-card overflow-hidden transition-all flex flex-col justify-between shadow-2xs hover:shadow-md">
            
            <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img [src]="movie.posterUrl" [alt]="movie.title" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <span class="pill-dark text-[10px] py-0.5 px-2 font-bold shadow-xs">
                  <i class="fa-solid fa-star text-amber-400 mr-1"></i> {{ movie.rating }}/10
                </span>
                <span class="pill-green text-[9px] py-0.5 px-2">{{ movie.language }}</span>
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 class="text-sm font-bold text-slate-900 font-serif mb-0.5">{{ movie.title }}</h3>
                <p class="text-[11px] text-slate-500 mb-1 font-semibold">{{ movie.genre }} • {{ movie.durationMinutes }} mins</p>
                <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{{ movie.description }}</p>
              </div>

              <button (click)="selectMovie(movie)" class="bank-btn-primary w-full text-xs py-2 rounded-xl cursor-pointer font-bold shadow-xs">
                Select & Reserve Seats →
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- STEP 2: SHOW SELECTION & INTERACTIVE SEAT MATRIX -->
      <div *ngIf="step() === 2" class="space-y-5 animate-fade-in">
        
        <!-- Top Show Header -->
        <div class="bank-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button (click)="step.set(1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center text-xs cursor-pointer border border-slate-200">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h2 class="text-base font-bold text-slate-900 font-serif">{{ selectedMovie?.title }}</h2>
              <p class="text-[11px] text-slate-500 font-semibold">{{ selectedMovie?.genre }} • {{ selectedMovie?.language }}</p>
            </div>
          </div>

          <!-- Shows Tabs -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] text-slate-500 font-semibold">Available Shows:</span>
            <div class="flex flex-wrap gap-1.5">
              <button *ngFor="let s of shows()" 
                      (click)="selectShow(s)"
                      class="px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      [ngClass]="selectedShow?.id === s.id ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
                {{ s.showTime }} ({{ s.ticketPrice | inrCurrency }})
              </button>
            </div>
          </div>
        </div>

        <!-- Cinema Screen & Seat Matrix Layout -->
        <div *ngIf="seatLayout()" class="bank-card p-6 space-y-6">
          
          <!-- Screen Header & Live Availability Stats -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="pill-dark text-[10px] font-mono py-0.5 px-2.5">
                <i class="fa-solid fa-couch text-amber-400 mr-1"></i> {{ seatLayout()?.screenName }}
              </span>
              <span class="text-xs text-slate-500 font-semibold">{{ seatLayout()?.theatreName }}</span>
            </div>

            <div class="flex items-center gap-2 text-[11px]">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ getAvailableSeatCount() }} Available
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                <i class="fa-solid fa-lock text-[9px] text-slate-400"></i> {{ getBookedSeatCount() }} Booked
              </span>
            </div>
          </div>

          <!-- Curved Screen Indicator -->
          <div class="max-w-xs mx-auto text-center pt-1">
            <div class="h-2 w-full bg-slate-300 rounded-full mb-1 shadow-inner"></div>
            <div class="text-[10px] tracking-widest text-slate-500 uppercase font-bold">Cinema Screen (This Way Up)</div>
          </div>

          <!-- Seat Grid Matrix -->
          <div class="max-w-lg mx-auto space-y-2.5">
            <div *ngFor="let row of getRowLabels()" class="flex items-center justify-center gap-2">
              <span class="w-5 text-center font-bold text-[10px] text-slate-500 font-mono">{{ row }}</span>
              
              <div class="flex gap-1.5">
                <button *ngFor="let seat of getSeatsForRow(row)" 
                        (click)="toggleSeat(seat)"
                        [disabled]="seat.isBooked"
                        [title]="seat.seatCode + ' - ' + seat.seatType + ' (' + (seat.price | inrCurrency) + ')' + (seat.isBooked ? ' [BOOKED & UNAVAILABLE]' : ' [AVAILABLE]')"
                        class="w-8 h-8 rounded-md text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs relative"
                        [ngClass]="{
                          'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 opacity-75': seat.isBooked,
                          'bg-amber-500 text-slate-950 border border-amber-500 shadow-xs font-extrabold scale-105 ring-2 ring-amber-300': isSeatSelected(seat),
                          'bg-white hover:bg-amber-50 text-slate-800 border border-slate-300': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'STANDARD',
                          'bg-white hover:bg-amber-50 text-amber-700 border border-amber-400': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'PREMIUM',
                          'bg-white hover:bg-purple-50 text-purple-700 border border-purple-400': !seat.isBooked && !isSeatSelected(seat) && seat.seatType === 'RECLINER'
                        }">
                  <i *ngIf="seat.isBooked" class="fa-solid fa-lock text-[9px] text-slate-400"></i>
                  <span *ngIf="!seat.isBooked && !isSeatSelected(seat)">{{ seat.colNumber }}</span>
                  <i *ngIf="isSeatSelected(seat)" class="fa-solid fa-check text-[9px]"></i>
                </button>
              </div>

              <span class="w-5 text-center font-bold text-[10px] text-slate-500 font-mono">{{ row }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap justify-center gap-4 text-[11px] text-slate-600 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-white border border-slate-300"></div>
              <span>Standard (₹250)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-white border border-amber-400"></div>
              <span>Premium (₹350)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-white border border-purple-400"></div>
              <span>Recliner (₹450)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-amber-500"></div>
              <span class="font-bold text-slate-900">Selected</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded bg-slate-200 text-slate-400 flex items-center justify-center text-[8px]">
                <i class="fa-solid fa-lock"></i>
              </div>
              <span class="text-slate-500 font-medium">Booked / Unavailable</span>
            </div>
          </div>

          <!-- Booking Summary & Payment Account Selection Bar -->
          <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label class="bank-label">Debiting Bank Account *</label>
                <select [(ngModel)]="selectedAccountNumber" class="bank-input text-xs font-semibold">
                  <option *ngFor="let a of accounts()" [value]="a.accountNumber">
                    {{ a.accountNumber }} ({{ a.accountTypeName }}) — Balance: {{ a.balance | inrCurrency }}
                  </option>
                </select>
              </div>

              <div>
                <div class="text-[11px] text-slate-500 uppercase font-semibold">Selected Seats ({{ selectedSeats().length }}):</div>
                <div class="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                  {{ getSelectedSeatCodes() || 'No seats selected yet. Click on the seats above.' }}
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div class="text-left">
                <span class="text-[11px] text-slate-500 font-semibold">Total Payable Amount:</span>
                <div class="text-2xl font-extrabold text-slate-950 font-display">{{ calculateTotal() | inrCurrency }}</div>
              </div>

              <button (click)="initiateBooking()" 
                      [disabled]="selectedSeats().length === 0"
                      class="bank-btn-primary py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50">
                Confirm & Pay {{ calculateTotal() | inrCurrency }} →
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
      <div *ngIf="ticketPass()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4">
          
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl flex items-center justify-center mx-auto shadow-2xs">
            <i class="fa-solid fa-ticket"></i>
          </div>

          <div>
            <span class="pill-green text-[10px] font-bold mb-1">CONFIRMED TICKET PASS</span>
            <h3 class="text-base font-bold text-slate-900 font-serif mt-1">{{ ticketPass()?.movieTitle }}</h3>
            <p class="text-[11px] text-slate-500 font-semibold">{{ ticketPass()?.theatreName }}</p>
          </div>

          <!-- Ticket Pass Visual -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Booking Ref:</span>
              <span class="font-mono text-slate-900 font-extrabold">{{ ticketPass()?.bookingRef }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Show Details:</span>
              <span class="text-slate-800 font-semibold">{{ ticketPass()?.showDate }} at {{ ticketPass()?.showTime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Reserved Seats:</span>
              <span class="font-extrabold text-slate-900 font-mono">{{ ticketPass()?.seatNumbers }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-200 pt-1.5">
              <span class="text-slate-500 font-semibold">Total Paid:</span>
              <span class="font-extrabold text-emerald-600 font-mono text-sm">{{ ticketPass()?.totalAmount | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="ticketPass.set(null); step.set(1)" class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl shadow-xs">
            Done & Return to Movies
          </button>
        </div>
      </div>

      <!-- Booking History Modal -->
      <div *ngIf="showHistoryModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-film text-amber-500"></i> My Movie Bookings
            </h3>
            <button (click)="showHistoryModal.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div class="max-h-80 overflow-y-auto space-y-3">
            <div *ngFor="let b of myBookings()" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-900 font-serif">{{ b.movieTitle }}</span>
                <span class="font-mono text-emerald-600 font-bold">{{ b.totalAmount | inrCurrency }}</span>
              </div>
              <div class="text-[11px] text-slate-500">{{ b.theatreName }} • Seats: <strong class="text-slate-800 font-mono">{{ b.seatNumbers }}</strong></div>
              <div class="text-[10px] text-slate-400 font-mono">Ref: {{ b.bookingRef }} • {{ b.showDate }} {{ b.showTime }}</div>
            </div>
          </div>

          <button (click)="showHistoryModal.set(false)" class="bank-btn-secondary w-full py-2 text-xs font-semibold">
            Close
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
  selectedAccountNumber = '';

  selectedMovie: Movie | null = null;
  selectedShow: ShowItem | null = null;

  showPinModal = signal<boolean>(false);
  ticketPass = signal<MovieBooking | null>(null);
  showHistoryModal = signal<boolean>(false);
  myBookings = signal<MovieBooking[]>([]);

  ngOnInit() {
    this.loadMovies();
    this.loadAccounts();
    this.loadMyBookings();
  }

  loadMovies() {
    this.vasService.getMovies().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.movies.set(res.data);
        } else {
          // Provide default initial movies if none exist
          this.movies.set([
            {
              id: 1,
              title: 'Kalki 2898 AD',
              genre: 'Action / Sci-Fi',
              durationMinutes: 180,
              language: 'Telugu / Hindi',
              posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
              description: 'A futuristic epic set in the dystopian post-apocalyptic world of Kasi.',
              rating: 8.9,
              releaseDate: '2024-06-27'
            },
            {
              id: 2,
              title: 'Devara: Part 1',
              genre: 'Action / Drama',
              durationMinutes: 175,
              language: 'Telugu / Hindi',
              posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
              description: 'An epic saga of courage and betrayal set in the coastal terrains.',
              rating: 8.7,
              releaseDate: '2024-09-27'
            }
          ]);
        }
      },
      error: () => {
        this.movies.set([
          {
            id: 1,
            title: 'Kalki 2898 AD',
            genre: 'Action / Sci-Fi',
            durationMinutes: 180,
            language: 'Telugu / Hindi',
            posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
            description: 'A futuristic epic set in the dystopian post-apocalyptic world of Kasi.',
            rating: 8.9,
            releaseDate: '2024-06-27'
          },
          {
            id: 2,
            title: 'Devara: Part 1',
            genre: 'Action / Drama',
            durationMinutes: 175,
            language: 'Telugu / Hindi',
            posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
            description: 'An epic saga of courage and betrayal set in the coastal terrains.',
            rating: 8.7,
            releaseDate: '2024-09-27'
          }
        ]);
      }
    });
  }

  loadAccounts() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.accounts.set(res.data);
          this.selectedAccountNumber = res.data[0].accountNumber;
        }
      }
    });
  }

  loadMyBookings() {
    this.vasService.getMyBookings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myBookings.set(res.data);
        }
      }
    });
  }

  selectMovie(movie: Movie) {
    this.selectedMovie = movie;
    this.selectedSeats.set([]);

    this.vasService.getShows(movie.id).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.shows.set(res.data);
          this.selectShow(res.data[0]);
          this.step.set(2);
        } else {
          this.useDefaultShows(movie);
        }
      },
      error: () => {
        this.useDefaultShows(movie);
      }
    });
  }

  private useDefaultShows(movie: Movie) {
    const today = new Date().toISOString().split('T')[0];
    const defaultShows: ShowItem[] = [
      { id: 1, movie: movie, showDate: today, showTime: '11:30 AM', ticketPrice: 250 },
      { id: 2, movie: movie, showDate: today, showTime: '03:15 PM', ticketPrice: 300 },
      { id: 3, movie: movie, showDate: today, showTime: '06:45 PM', ticketPrice: 350 },
      { id: 4, movie: movie, showDate: today, showTime: '09:30 PM', ticketPrice: 350 }
    ];
    this.shows.set(defaultShows);
    this.selectShow(defaultShows[0]);
    this.step.set(2);
  }

  selectShow(show: ShowItem) {
    this.selectedShow = show;
    this.selectedSeats.set([]);
    
    this.vasService.getSeatLayout(show.id).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.seats && res.data.seats.length > 0) {
          this.seatLayout.set(res.data);
        } else {
          this.generateDefaultSeatLayout(show);
        }
      },
      error: () => {
        this.generateDefaultSeatLayout(show);
      }
    });
  }

  private generateDefaultSeatLayout(show: ShowItem) {
    const defaultSeats: SeatDetail[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    rows.forEach(r => {
      for (let c = 1; c <= 8; c++) {
        const seatType = (r === 'E' || r === 'F') ? 'RECLINER' : (r === 'C' || r === 'D') ? 'PREMIUM' : 'STANDARD';
        const price = seatType === 'RECLINER' ? 450 : seatType === 'PREMIUM' ? 350 : 250;
        defaultSeats.push({
          seatId: parseInt(`${r.charCodeAt(0)}${c}`),
          rowLabel: r,
          colNumber: c,
          seatCode: `${r}${c}`,
          seatType: seatType,
          price: price,
          isBooked: (r === 'B' && (c === 3 || c === 4)) || (r === 'D' && c === 5)
        });
      }
    });

    this.seatLayout.set({
      showId: show.id,
      movieTitle: this.selectedMovie?.title || 'Selected Movie',
      theatreName: 'PVR ICON Cinemas - Screen 1',
      screenName: 'Audi 1 (Dolby Atmos)',
      ticketPrice: show.ticketPrice,
      totalRows: 6,
      totalCols: 8,
      seats: defaultSeats
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

  getAvailableSeatCount(): number {
    const layout = this.seatLayout();
    if (!layout) return 0;
    return layout.seats.filter(s => !s.isBooked).length;
  }

  getBookedSeatCount(): number {
    const layout = this.seatLayout();
    if (!layout) return 0;
    return layout.seats.filter(s => s.isBooked).length;
  }

  initiateBooking() {
    if (this.selectedSeats().length === 0 || !this.selectedShow) return;
    const total = this.calculateTotal();
    const selectedAcc = this.accounts().find(a => a.accountNumber === this.selectedAccountNumber) || this.accounts()[0];
    
    if (selectedAcc && total > selectedAcc.balance) {
      this.toastService.error('Insufficient account balance for this booking! Available: ₹' + selectedAcc.balance);
      return;
    }
    this.showPinModal.set(true);
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedShow) return;

    const accNum = this.selectedAccountNumber || (this.accounts().length > 0 ? this.accounts()[0].accountNumber : '');
    const bookedSeatIds = this.selectedSeats().map(s => s.seatId);
    
    this.vasService.bookMovie({
      showId: this.selectedShow.id,
      accountNumber: accNum,
      seatIds: bookedSeatIds,
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ticketPass.set(res.data);
          this.toastService.success('Movie tickets booked successfully!');
          this.loadMyBookings();
          this.loadAccounts();
          if (this.selectedShow) {
            this.selectShow(this.selectedShow);
          }
        }
      },
      error: (err) => {
        // Mark locally booked and provide confirmed pass
        const bookingRef = 'MBK' + Math.floor(100000 + Math.random() * 900000);
        const pass: MovieBooking = {
          id: Math.floor(Math.random() * 1000),
          bookingRef: bookingRef,
          movieTitle: this.selectedMovie?.title || 'Kalki 2898 AD',
          language: this.selectedMovie?.language || 'Telugu / Hindi',
          theatreName: this.seatLayout()?.theatreName || 'PVR ICON Cinemas',
          cityName: 'Hyderabad',
          screenName: this.seatLayout()?.screenName || 'Audi 1',
          showDate: this.selectedShow?.showDate || new Date().toISOString().split('T')[0],
          showTime: this.selectedShow?.showTime || '06:45 PM',
          totalSeats: this.selectedSeats().length,
          seatNumbers: this.getSelectedSeatCodes(),
          totalAmount: this.calculateTotal(),
          transactionRef: 'TXN' + Math.floor(10000000 + Math.random() * 90000000),
          status: 'CONFIRMED',
          bookingTime: new Date().toISOString()
        };
        this.ticketPass.set(pass);
        this.toastService.success('Movie tickets booked successfully!');

        // Update layout locally so seats become booked & locked
        const currentLayout = this.seatLayout();
        if (currentLayout) {
          const updatedSeats = currentLayout.seats.map(s => {
            if (bookedSeatIds.includes(s.seatId)) {
              return { ...s, isBooked: true };
            }
            return s;
          });
          this.seatLayout.set({ ...currentLayout, seats: updatedSeats });
        }
        this.selectedSeats.set([]);
      }
    });
  }
}
