import { create } from 'zustand';
import type { RentConfig, Bill, DepositRequest, Refund, DashboardStats } from '@/types';
import {
  defaultRentConfig,
  mockBills,
  mockDepositRequests,
  mockRefunds,
} from '@/data/mockData';
import { getApprovalStatus, generateId } from '@/utils';

interface AppState {
  rentConfig: RentConfig;
  bills: Bill[];
  depositRequests: DepositRequest[];
  refunds: Refund[];
  currentRole: 'house_manager' | 'finance' | 'manager' | 'admin';
  currentUserName: string;

  setRentConfig: (config: RentConfig) => void;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBillStatus: (billId: string, status: Bill['status']) => void;
  addDepositRequest: (
    request: Omit<DepositRequest, 'id' | 'createdAt' | 'status' | 'steps'>
  ) => void;
  approveStep: (requestId: string, stepId: string, comment: string) => void;
  rejectStep: (requestId: string, stepId: string, comment: string) => void;
  processRefund: (
    requestId: string,
    method: Refund['paymentMethod']
  ) => void;
  getDashboardStats: () => DashboardStats;
}

export const useAppStore = create<AppState>((set, get) => ({
  rentConfig: defaultRentConfig,
  bills: mockBills,
  depositRequests: mockDepositRequests,
  refunds: mockRefunds,
  currentRole: 'finance',
  currentUserName: '孙丽',

  setRentConfig: (config) => set({ rentConfig: config }),

  addBill: (billData) =>
    set((state) => ({
      bills: [
        {
          ...billData,
          id: generateId('b'),
          createdAt: new Date().toISOString().split('T')[0],
        },
        ...state.bills,
      ],
    })),

  updateBillStatus: (billId, status) =>
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === billId ? { ...b, status } : b
      ),
    })),

  addDepositRequest: (requestData) =>
    set((state) => {
      const now = new Date().toISOString().split('T')[0];
      const newRequest: DepositRequest = {
        ...requestData,
        id: generateId('d'),
        createdAt: now,
        status: 'pending_finance',
        steps: [
          {
            id: generateId('s'),
            role: 'house_manager',
            roleName: '房管',
            approver: state.currentUserName,
            status: 'approved',
            comment: '发起申请',
            approvedAt: now + ' ' + new Date().toTimeString().slice(0, 5),
          },
          {
            id: generateId('s'),
            role: 'finance',
            roleName: '财务',
            approver: '孙丽',
            status: 'pending',
            comment: '',
            approvedAt: null,
          },
          {
            id: generateId('s'),
            role: 'manager',
            roleName: '主管',
            approver: '周总',
            status: 'pending',
            comment: '',
            approvedAt: null,
          },
        ],
      };
      return { depositRequests: [newRequest, ...state.depositRequests] };
    }),

  approveStep: (requestId, stepId, comment) =>
    set((state) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const updatedRequests = state.depositRequests.map((req) => {
        if (req.id !== requestId) return req;

        const updatedSteps = req.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                status: 'approved' as const,
                comment,
                approvedAt: `${dateStr} ${timeStr}`,
              }
            : step
        );

        const newStatus = getApprovalStatus(updatedSteps);

        return {
          ...req,
          steps: updatedSteps,
          status: newStatus === 'all_approved' ? 'approved' : (newStatus as DepositRequest['status']),
        };
      });

      return { depositRequests: updatedRequests };
    }),

  rejectStep: (requestId, stepId, comment) =>
    set((state) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const updatedRequests = state.depositRequests.map((req) => {
        if (req.id !== requestId) return req;

        const updatedSteps = req.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                status: 'rejected' as const,
                comment,
                approvedAt: `${dateStr} ${timeStr}`,
              }
            : step
        );

        return {
          ...req,
          steps: updatedSteps,
          status: 'rejected' as const,
        };
      });

      return { depositRequests: updatedRequests };
    }),

  processRefund: (requestId, method) =>
    set((state) => {
      const request = state.depositRequests.find((r) => r.id === requestId);
      if (!request) return state;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const newRefund: Refund = {
        id: generateId('r'),
        requestId,
        tenantName: request.tenantName,
        amount: request.refundAmount,
        paymentMethod: method,
        voucherNo: 'REF' + now.getTime().toString().slice(-10),
        paidAt: `${dateStr} ${timeStr}`,
        operator: state.currentUserName,
        status: 'completed',
      };

      return { refunds: [newRefund, ...state.refunds] };
    }),

  getDashboardStats: () => {
    const { bills, depositRequests } = get();
    let totalReceivable = 0;
    let totalReceived = 0;
    let totalPending = 0;

    bills.forEach((b) => {
      totalReceivable += b.totalAmount;
      if (b.status === 'paid') {
        totalReceived += b.totalAmount;
      } else {
        totalPending += b.totalAmount;
      }
    });

    const pendingApprovals = depositRequests.filter(
      (r) => r.status === 'pending_finance' || r.status === 'pending_manager'
    ).length;

    return {
      totalReceivable,
      totalReceived,
      totalPending,
      pendingApprovals,
    };
  },
}));
