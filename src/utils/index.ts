import type { RentConfig, RentCalculationResult, ApprovalStep, DepositRequest } from '@/types';

export function calculateRent(
  days: number,
  waterUsage: number,
  electricUsage: number,
  config: RentConfig
): RentCalculationResult {
  const breakdown: RentCalculationResult['breakdown'] = [];
  let baseRent: number;
  let pricingTier: 'short' | 'medium' | 'long';

  if (days <= config.shortTermDays) {
    baseRent = config.startPrice;
    pricingTier = 'short';
    breakdown.push({
      description: `基础租金（短租起步价，${days}天 ≤ ${config.shortTermDays}天）`,
      amount: baseRent,
    });
  } else if (days >= config.longTermDays) {
    baseRent = config.capPrice;
    pricingTier = 'long';
    breakdown.push({
      description: `基础租金（长租封顶价，${days}天 ≥ ${config.longTermDays}天）`,
      amount: baseRent,
    });
  } else {
    const calculated = config.dailyRate * days;
    baseRent = Math.min(calculated, config.capPrice);
    pricingTier = calculated > config.capPrice ? 'long' : 'medium';
    if (calculated > config.capPrice) {
      breakdown.push({
        description: `基础租金（${config.dailyRate}元/天 × ${days}天 = ${calculated.toFixed(0)}元，已触发封顶价拦截）`,
        amount: baseRent,
      });
    } else {
      breakdown.push({
        description: `基础租金（${config.dailyRate}元/天 × ${days}天）`,
        amount: baseRent,
      });
    }
  }

  const waterFee = Number((waterUsage * config.waterUnitPrice).toFixed(2));
  breakdown.push({
    description: `水费（${waterUsage}吨 × ${config.waterUnitPrice}元/吨）`,
    amount: waterFee,
  });

  const electricFee = Number((electricUsage * config.electricUnitPrice).toFixed(2));
  breakdown.push({
    description: `电费（${electricUsage}度 × ${config.electricUnitPrice}元/度）`,
    amount: electricFee,
  });

  const sharingFee = Number(
    ((waterFee + electricFee) * (config.sharingRate / 100)).toFixed(2)
  );
  breakdown.push({
    description: `公摊费用（水电合计 × ${config.sharingRate}%）`,
    amount: sharingFee,
  });

  const totalAmount = Number(
    (baseRent + waterFee + electricFee + sharingFee).toFixed(2)
  );

  return {
    rentDays: days,
    baseRent,
    pricingTier,
    waterFee,
    electricFee,
    sharingFee,
    totalAmount,
    breakdown,
  };
}

export function getApprovalStatus(steps: ApprovalStep[]): DepositRequest['status'] {
  const hasRejected = steps.some((s) => s.status === 'rejected');
  if (hasRejected) return 'rejected';

  const allApproved = steps.every((s) => s.status === 'approved');
  if (allApproved) return 'approved';

  const pendingStep = steps.find((s) => s.status === 'pending');
  if (!pendingStep) return 'approved';

  if (pendingStep.role === 'finance') return 'pending_finance';
  if (pendingStep.role === 'manager') return 'pending_manager';

  return 'pending_finance';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function generateId(prefix = ''): string {
  return prefix + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getPricingTierLabel(tier: 'short' | 'medium' | 'long'): string {
  const map = {
    short: '短租（起步价）',
    medium: '中租（按日计）',
    long: '长租（封顶价）',
  };
  return map[tier];
}

export function getBillStatusLabel(status: Bill['status']): string {
  const map = {
    pending: '待支付',
    paid: '已支付',
    overdue: '已逾期',
  };
  return map[status];
}

export function getDepositStatusLabel(status: DepositRequest['status']): string {
  const map = {
    pending_finance: '待财务审核',
    pending_manager: '待主管审批',
    approved: '审批通过',
    rejected: '已否决',
  };
  return map[status];
}

interface Bill {
  status: 'pending' | 'paid' | 'overdue';
}
