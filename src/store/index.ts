import { create } from 'zustand';
import type { RentConfig, Bill, DepositRequest, Refund, DashboardStats } from '@/types';
import {
  defaultRentConfig,
  mockBills,
  mockDepositRequests,
  mockRefunds,
} from '@/data/mockData';
import { getApprovalStatus, generateId } from '@/utils';

const STORAGE_KEY = 'rent-app-state-v1';

const roleUserMap: Record<string, string> = {
  house_manager: '赵强',
  finance: '孙丽',
  manager: '周总',
  admin: '系统管理员',
};

interface PersistedState {
  rentConfig: RentConfig;
  bills: Bill[];
  depositRequests: DepositRequest[];
  refunds: Refund[];
}

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rentConfig: state.rentConfig,
        bills: state.bills,
        depositRequests: state.depositRequests,
        refunds: state.refunds,
      })
    );
  } catch {
    // ignore
  }
}

const persisted = loadPersistedState();

interface AppState {
  rentConfig: RentConfig;
  bills: Bill[];
  depositRequests: DepositRequest[];
  refunds: Refund[];
  currentRole: 'house_manager' | 'finance' | 'manager' | 'admin';
  currentUserName: string;

  setRentConfig: (config: RentConfig) => void;
  setCurrentRole: (role: 'house_manager' | 'finance' | 'manager' | 'admin') => void;
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
  rentConfig: persisted.rentConfig ?? defaultRentConfig,
  bills: persisted.bills ?? mockBills,
  depositRequests: persisted.depositRequests ?? mockDepositRequests,
  refunds: persisted.refunds ?? mockRefunds,
  currentRole: 'finance',
  currentUserName: '孙丽',

  setRentConfig: (config) =>
    set((state) => {
      const next = { ...state, rentConfig: config };
      persistState(next);
      return next;
    }),

  setCurrentRole: (role) =>
    set(() => ({
      currentRole: role,
      currentUserName: roleUserMap[role] || '用户',
    })),

  addBill: (billData) =>
    set((state) => {
      const next = {
        ...state,
        bills: [
          {
            ...billData,
            id: generateId('b'),
            createdAt: new Date().toISOString().split('T')[0],
          },
          ...state.bills,
        ],
      };
      persistState(next);
      return next;
    }),

  updateBillStatus: (billId, status) =>
    set((state) => {
      const next = {
        ...state,
        bills: state.bills.map((b) =>
          b.id === billId ? { ...b, status } : b
        ),
      };
      persistState(next);
      return next;
    }),

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
            approver: roleUserMap.house_manager,
            status: 'approved',
            comment: '发起申请',
            approvedAt: now + ' ' + new Date().toTimeString().slice(0, 5),
          },
          {
            id: generateId('s'),
            role: 'finance',
            roleName: '财务',
            approver: roleUserMap.finance,
            status: 'pending',
            comment: '',
            approvedAt: null,
          },
          {
            id: generateId('s'),
            role: 'manager',
            roleName: '主管',
            approver: roleUserMap.manager,
            status: 'pending',
            comment: '',
            approvedAt: null,
          },
        ],
      };
      const next = {
        ...state,
        depositRequests: [newRequest, ...state.depositRequests],
      };
      persistState(next);
      return next;
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
                approver: roleUserMap[step.role] || step.approver,
                comment,
                approvedAt: `${dateStr} ${timeStr}`,
              }
            : step
        );

        const hasRejected = updatedSteps.some((s) => s.status === 'rejected');
        const allApproved = updatedSteps.every((s) => s.status === 'approved');

        let newStatus: DepositRequest['status'];
        if (hasRejected) {
          newStatus = 'rejected';
        } else if (allApproved) {
          newStatus = 'approved';
        } else {
          const nextPending = updatedSteps.find((s) => s.status === 'pending');
          if (nextPending?.role === 'finance') {
            newStatus = 'pending_finance';
          } else if (nextPending?.role === 'manager') {
            newStatus = 'pending_manager';
          } else {
            newStatus = 'approved';
          }
        }

        return {
          ...req,
          steps: updatedSteps,
          status: newStatus,
        };
      });

      const next = { ...state, depositRequests: updatedRequests };
      persistState(next);
      return next;
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
                approver: roleUserMap[step.role] || step.approver,
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

      const next = { ...state, depositRequests: updatedRequests };
      persistState(next);
      return next;
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

      const next = { ...state, refunds: [newRefund, ...state.refunds] };
      persistState(next);
      return next;
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
