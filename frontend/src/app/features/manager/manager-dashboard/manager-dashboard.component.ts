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
    <div class="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      <!-- Executive Header -->
      <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#0f172a] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <i class="fa-solid fa-crown"></i> Executive Branch Governance
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white">
            Godavari Bank Branch Executive Overview
          </h1>
          <p class="text-xs md:text-sm text-slate-300 mt-1">
            Real-time branch liquidity, credit portfolio exposure, and risk indicators
          </p>
        </div>

        <div class="flex flex-wrap gap-2.5">
          <a routerLink="/manager/loans" class="bank-btn-primary py-2.5 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700">
            <i class="fa-solid fa-stamp"></i> Loan Sanctions ({{ stats()?.pendingLoanApplications || 0 }})
          </a>
          <a routerLink="/manager/employees" class="bank-btn-secondary py-2.5 px-4 text-xs font-bold">
            <i class="fa-solid fa-users-gear text-purple-400"></i> Manage Staff
          </a>
        </div>
      </div>

      <!-- High-Level KPI Metric Cards (4 Columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Total Bank Deposits -->
        <div class="bank-glass p-6 rounded-3xl border border-sky-500/20 hover:border-sky-500/50 transition-all">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase">Total Branch Deposits</span>
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-vault"></i>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-white font-mono">
            {{ stats()?.totalBankDeposits || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <i class="fa-solid fa-arrow-trend-up"></i> {{ stats()?.activeAccounts || 0 }} Active Accounts
          </div>
        </div>

        <!-- Disbursed Loan Portfolio -->
        <div class="bank-glass p-6 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-all">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase">Disbursed Loans</span>
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-rose-400 font-mono">
            {{ stats()?.totalDisbursedLoanAmount || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-slate-400 mt-2">
            Outstanding: <span class="font-bold text-white">{{ stats()?.totalOutstandingLoanAmount || 0 | inrCurrency }}</span>
          </div>
        </div>

        <!-- Total Customers -->
        <div class="bank-glass p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase">Registered Customers</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-white font-mono">
            {{ stats()?.totalCustomers || 0 }}
          </div>
          <div class="text-[11px] text-emerald-400 font-semibold mt-2">
            100% KYC Verified
          </div>
        </div>

        <!-- Today Transactions -->
        <div class="bank-glass p-6 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold text-slate-400 uppercase">Today's Txn Volume</span>
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-purple-300 font-mono">
            {{ stats()?.todayCreditVolume || 0 | inrCurrency }}
          </div>
          <div class="text-[11px] text-slate-400 mt-2">
            {{ stats()?.todayTransactions || 0 }} transactions processed
          </div>
        </div>

      </div>

      <!-- Charts Section (2 Columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Monthly Trend Bar Chart (2 Cols) -->
        <div class="lg:col-span-2 bank-glass p-6 md:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-simple text-purple-400"></i> 6-Month Liquidity & Flow Trends (₹)
            </h3>
          </div>
          <div class="h-64 relative">
            <canvas #trendChartCanvas></canvas>
          </div>
        </div>

        <!-- Right: Governance Quick Desks -->
        <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shield-halved text-purple-400"></i> Executive Quick Actions
            </h3>

            <div class="space-y-3">
              <a routerLink="/manager/loans" class="p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/20 flex items-center justify-between transition-all group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-stamp"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">Loan Sanctions</div>
                    <div class="text-[10px] text-rose-400 font-semibold">{{ stats()?.pendingLoanApplications || 0 }} pending sanction</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-rose-400"></i>
              </a>

              <a routerLink="/manager/customers" class="p-3 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-between transition-all group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-user-lock"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">Customer Account Controls</div>
                    <div class="text-[10px] text-emerald-400 font-semibold">{{ stats()?.activeAccounts || 0 }} Active Accounts</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-emerald-400"></i>
              </a>

              <a routerLink="/manager/bank-charges" class="p-3 rounded-2xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/20 flex items-center justify-between transition-all group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-sliders"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">Bank Charges & Scheduler</div>
                    <div class="text-[10px] text-amber-400 font-semibold">Min Balance Maintenance</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-amber-400"></i>
              </a>

              <a routerLink="/manager/audit-logs" class="p-3 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-between transition-all group">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">System Audit Logs</div>
                    <div class="text-[10px] text-indigo-400 font-semibold">Live Security Trail</div>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-indigo-400"></i>
              </a>
            </div>
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
