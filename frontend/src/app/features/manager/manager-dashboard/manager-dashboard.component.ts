import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagerService } from '../../../core/services/manager.service';
import { ManagerStats, MonthlyTrend } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-building-shield"></i> Executive Governance & Branch Liquidity Control
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Branch Manager Console
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Monitor real-time vault liquidity, retail loan portfolios, customer KYC status, and system audit logs.
        </p>
      </div>

      <!-- Quick Action Buttons Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-amber-500"></i> Executive Performance Metrics
        </h2>
        <div class="flex flex-wrap gap-2">
          <a routerLink="/manager/loans" class="bank-btn-primary py-1.5 px-3.5 text-xs font-bold shadow-xs">
            <i class="fa-solid fa-stamp mr-1"></i> Loan Sanctions ({{ stats()?.pendingLoanApplications || 0 }})
          </a>
          <a routerLink="/manager/employees" class="bank-btn-secondary py-1.5 px-3.5 text-xs font-semibold shadow-2xs">
            <i class="fa-solid fa-users text-slate-500 mr-1"></i> Staff Directory
          </a>
        </div>
      </div>

      <!-- High-Level KPI Metric Cards (4 Columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <!-- Total Bank Deposits -->
        <div class="bank-card p-5 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Vault Deposits</span>
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs shadow-2xs">
              <i class="fa-solid fa-vault"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-950 font-display">
            {{ stats()?.totalBankDeposits || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> {{ stats()?.activeAccounts || 0 }} Active Accounts
          </div>
        </div>

        <!-- Disbursed Loan Portfolio -->
        <div class="bank-card p-5 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sanctioned Loans</span>
            <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs shadow-2xs">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-rose-700 font-display">
            {{ stats()?.totalDisbursedLoanAmount || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-slate-500 font-medium">
            Outstanding: <span class="font-bold text-slate-900 font-mono">{{ stats()?.totalOutstandingLoanAmount || 0 | inrCurrency }}</span>
          </div>
        </div>

        <!-- Total Customers -->
        <div class="bank-card p-5 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shadow-2xs">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-950 font-display">
            {{ stats()?.totalCustomers || 0 }}
          </div>
          <div class="text-[11px] text-emerald-600 font-bold">
            100% KYC Verified
          </div>
        </div>

        <!-- Today Transactions -->
        <div class="bank-card p-5 space-y-2">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Volume</span>
            <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs shadow-2xs">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div class="text-xl font-extrabold text-slate-950 font-display">
            {{ stats()?.todayCreditVolume || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-slate-500 font-medium">
            {{ stats()?.todayTransactions || 0 }} transactions processed
          </div>
        </div>

      </div>

      <!-- Charts Section (2 Columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Left: Monthly Trend Bar Chart (2 Cols) -->
        <div class="lg:col-span-2 bank-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-chart-simple text-amber-500"></i> Monthly Liquidity Trends (₹)
            </h3>
            <span class="pill-dark text-[9px] py-0 px-2">FY 2025-26</span>
          </div>
          <div class="h-64 relative">
            <canvas #trendChartCanvas></canvas>
          </div>
        </div>

        <!-- Right: Governance Quick Desks -->
        <div class="bank-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-shield-halved text-amber-500"></i> Controls & Desks
            </h3>
          </div>

          <div class="space-y-2.5">
            <a routerLink="/manager/loans" class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group shadow-2xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <i class="fa-solid fa-stamp"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Loan Sanctions</div>
                  <div class="text-[10px] text-rose-700 font-bold">{{ stats()?.pendingLoanApplications || 0 }} pending approval</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-amber-600 text-xs"></i>
            </a>

            <a routerLink="/manager/customers" class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group shadow-2xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <i class="fa-solid fa-user-lock"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Customer Controls</div>
                  <div class="text-[10px] text-slate-500 font-medium">{{ stats()?.activeAccounts || 0 }} accounts managed</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-amber-600 text-xs"></i>
            </a>

            <a routerLink="/manager/bank-charges" class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group shadow-2xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <i class="fa-solid fa-sliders"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Bank Charges</div>
                  <div class="text-[10px] text-slate-500 font-medium">Scheduler & Tariff Config</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-amber-600 text-xs"></i>
            </a>

            <a routerLink="/manager/audit-logs" class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group shadow-2xs">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Audit Logs</div>
                  <div class="text-[10px] text-slate-500 font-medium">Security & Compliance Trail</div>
                </div>
              </div>
              <i class="fa-solid fa-chevron-right text-slate-400 group-hover:text-amber-600 text-xs"></i>
            </a>
          </div>
        </div>

      </div>

    </div>
  `
})
export class ManagerDashboardComponent {
  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;

  private managerService = inject(ManagerService);
  stats = signal<ManagerStats | null>(null);
  chart: Chart | null = null;

  ngOnInit() {
    this.managerService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
          setTimeout(() => this.renderChart(res.data), 100);
        }
      }
    });
  }

  renderChart(data: ManagerStats) {
    if (!this.trendChartCanvas) return;
    if (this.chart) this.chart.destroy();

    const labels = data.monthlyTrends.map((t: MonthlyTrend) => t.month);
    const deposits = data.monthlyTrends.map((t: MonthlyTrend) => t.deposits);
    const withdrawals = data.monthlyTrends.map((t: MonthlyTrend) => t.withdrawals);
    const transfers = data.monthlyTrends.map((t: MonthlyTrend) => t.transfers);

    this.chart = new Chart(this.trendChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Deposits', data: deposits, backgroundColor: '#0284c7', borderRadius: 6 },
          { label: 'Withdrawals', data: withdrawals, backgroundColor: '#ef4444', borderRadius: 6 },
          { label: 'Transfers', data: transfers, backgroundColor: '#10b981', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
}
