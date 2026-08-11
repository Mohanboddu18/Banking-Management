export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserAuth {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  userType: 'CUSTOMER' | 'EMPLOYEE';
  customerId?: string;
  employeeId?: string;
  fullName: string;
  roles: string[];
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  mobile: string;
  userType: string;
  roles: string[];
  isPinSet: boolean;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  panNumber?: string;
  maskedAadhaar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  annualIncome?: number;
  nomineeName?: string;
  nomineeRelation?: string;
  employeeId?: string;
  roleDesignation?: string;
  department?: string;
  joiningDate?: string;
  createdAt: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  customerId: string;
  customerName: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'SALARY';
  accountTypeName: string;
  balance: number;
  ledgerBalance: number;
  minBalance: number;
  interestRate: number;
  dailyTransferLimit: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'PENDING_APPROVAL';
  ifscCode: string;
  branchName: string;
  openingDate: string;
  createdAt: string;
}

export interface BalanceInfo {
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  ledgerBalance: number;
  minBalanceRequirement: number;
  status: string;
  ifscCode: string;
}

export interface Beneficiary {
  id: number;
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  maxLimit: number;
  createdAt: string;
}

export interface Transaction {
  id: number;
  transactionRef: string;
  fromAccountNumber?: string;
  fromCustomerName?: string;
  toAccountNumber?: string;
  toCustomerName?: string;
  transactionType: string;
  transactionTypeName: string;
  amount: number;
  balanceAfter: number;
  description: string;
  status: 'SUCCESS' | 'FAILED' | 'REVERSED';
  entryType: 'DEBIT' | 'CREDIT';
  createdAt: string;
}

export interface StatementSummary {
  bankName: string;
  branchName: string;
  ifscCode: string;
  customerName: string;
  customerId: string;
  accountNumber: string;
  accountType: string;
  address: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface DebitCard {
  id: number;
  accountNumber: string;
  maskedCardNumber: string;
  cardHolderName: string;
  cardType: string;
  expiryMonth: number;
  expiryYear: number;
  dailyLimit: number;
  internationalUsage: boolean;
  contactlessPayment: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'PENDING';
  createdAt: string;
}

export interface CreditCard {
  id: number;
  maskedCardNumber: string;
  cardHolderName: string;
  cardType: string;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  billingCycleDay: number;
  paymentDueDate: string;
  expiryMonth: number;
  expiryYear: number;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  createdAt: string;
}

export interface ChequeRequest {
  id?: number;
  requestId: number;
  accountNumber: string;
  chequeBookNumber?: string;
  startLeafNumber?: number;
  endLeafNumber?: number;
  totalLeaves: number;
  status: 'REQUESTED' | 'APPROVED' | 'ISSUED' | 'REJECTED';
  requestDate: string;
  issuedDate?: string;
}

export interface LoanType {
  id: number;
  code: 'PERSONAL' | 'HOME' | 'EDUCATION' | 'VEHICLE';
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  processingFeePercent: number;
}

export interface Loan {
  id: number;
  loanAccountNumber: string;
  customerId: string;
  customerName: string;
  loanTypeCode: string;
  loanTypeName: string;
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  remainingPrincipal: number;
  remainingEmis: number;
  employmentType: string;
  monthlyIncome: number;
  purpose: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CLOSED';
  officerRecommendation?: string;
  rejectionReason?: string;
  appliedDate: string;
  approvedDate?: string;
}

export interface LoanRepayment {
  id: number;
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  paidDate?: string;
  transactionRef?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface EmiScheduleItem {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface EmiCalculationResult {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  schedule: EmiScheduleItem[];
}

export interface Merchant {
  id: number;
  merchantCode: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  category: string;
  status: string;
}

export interface MobileOperator {
  id: number;
  name: string;
  circle: string;
  logoUrl?: string;
}

export interface MobileRechargePlan {
  id: number;
  planName: string;
  amount: number;
  validityDays: number;
  dataQuota: string;
  talktime: string;
  description: string;
}

export interface MobileRecharge {
  id: number;
  mobileNumber: string;
  planName: string;
  amount: number;
  transactionRef: string;
  status: string;
  createdAt: string;
}

export interface LocationItem {
  id: number;
  cityName: string;
  stateName: string;
}

export interface Movie {
  id: number;
  title: string;
  genre: string;
  durationMinutes: number;
  language: string;
  posterUrl: string;
  description: string;
  rating: number;
  releaseDate: string;
}

export interface ShowItem {
  id: number;
  movie: Movie;
  showDate: string;
  showTime: string;
  ticketPrice: number;
}

export interface SeatDetail {
  seatId: number;
  rowLabel: string;
  colNumber: number;
  seatCode: string;
  seatType: 'STANDARD' | 'PREMIUM' | 'RECLINER';
  price: number;
  isBooked: boolean;
}

export interface SeatLayout {
  showId: number;
  movieTitle: string;
  theatreName: string;
  screenName: string;
  ticketPrice: number;
  totalRows: number;
  totalCols: number;
  seats: SeatDetail[];
}

export interface MovieBooking {
  id: number;
  bookingRef: string;
  movieTitle: string;
  language: string;
  theatreName: string;
  cityName: string;
  screenName: string;
  showDate: string;
  showTime: string;
  totalSeats: number;
  seatNumbers: string;
  totalAmount: number;
  transactionRef: string;
  status: 'CONFIRMED' | 'CANCELLED';
  bookingTime: string;
}

export interface Complaint {
  id: number;
  complaintTicket: string;
  customerId: string;
  customerName: string;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedEmployeeName: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Employee {
  id: number;
  userId: number;
  employeeId: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  roleDesignation: string;
  roleName: string;
  department: string;
  joiningDate: string;
  status: string;
  enabled: boolean;
  createdAt: string;
}

export interface BankChargeItem {
  id: number;
  chargeName: string;
  chargeType: string;
  amount: number;
  accountTypeId?: number;
  accountTypeCode?: string;
  minBalanceThreshold?: number;
  frequency: string;
  active: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  username: string;
  role: string;
  action: string;
  entityName: string;
  entityId?: string;
  ipAddress?: string;
  status: string;
  details: string;
  createdAt: string;
}

export interface MonthlyTrend {
  month: string;
  deposits: number;
  withdrawals: number;
  transfers: number;
}

export interface ManagerStats {
  totalCustomers: number;
  activeAccounts: number;
  suspendedAccounts: number;
  pendingApprovalAccounts: number;
  totalBankDeposits: number;
  totalTransactions: number;
  todayTransactions: number;
  todayCreditVolume: number;
  todayDebitVolume: number;
  pendingLoanApplications: number;
  activeLoans: number;
  totalDisbursedLoanAmount: number;
  totalOutstandingLoanAmount: number;
  activeDebitCards: number;
  pendingChequeRequests: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  accountTypeDistribution: Record<string, number>;
  loanTypeDistribution: Record<string, number>;
  monthlyTrends: MonthlyTrend[];
}
