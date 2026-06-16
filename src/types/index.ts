export interface Tenant {
  id: string;
  name: string;
  roomNo: string;
  phone: string;
  area: number;
  checkInDate: string;
}

export interface RentConfig {
  id: string;
  startPrice: number;
  capPrice: number;
  shortTermDays: number;
  longTermDays: number;
  dailyRate: number;
  waterUnitPrice: number;
  electricUnitPrice: number;
  sharingRate: number;
}

export interface RentCalculationResult {
  rentDays: number;
  baseRent: number;
  pricingTier: 'short' | 'medium' | 'long';
  waterFee: number;
  electricFee: number;
  sharingFee: number;
  totalAmount: number;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

export interface Bill {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNo: string;
  period: string;
  baseRent: number;
  waterFee: number;
  waterUsage: number;
  electricFee: number;
  electricUsage: number;
  sharingFee: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  role: 'house_manager' | 'finance' | 'manager';
  roleName: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  approvedAt: string | null;
}

export interface DepositRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNo: string;
  depositAmount: number;
  refundAmount: number;
  deductionReason: string;
  reason: string;
  status: 'pending_finance' | 'pending_manager' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  steps: ApprovalStep[];
}

export type RefundMethod = 'bank_transfer' | 'alipay' | 'wechat' | 'cash';

export interface Refund {
  id: string;
  requestId: string;
  tenantName: string;
  amount: number;
  paymentMethod: RefundMethod;
  voucherNo: string;
  paidAt: string;
  operator: string;
  status: 'pending' | 'completed';
}

export interface DashboardStats {
  totalReceivable: number;
  totalReceived: number;
  totalPending: number;
  pendingApprovals: number;
}
