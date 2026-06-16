import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Clock,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getBillStatusLabel, getDepositStatusLabel } from '@/utils';

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    const startValue = display;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startValue + (value - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

function StatCard({
  title,
  value,
  prefix,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${gradient}`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm">{title}</span>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-bold font-serif tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { getDashboardStats, bills, depositRequests } = useAppStore();
  const stats = getDashboardStats();

  const recentBills = [...bills].slice(0, 5);
  const pendingDeposits = depositRequests
    .filter((d) => d.status === 'pending_finance' || d.status === 'pending_manager')
    .slice(0, 5);

  const billStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const depositStatusColors: Record<string, string> = {
    pending_finance: 'bg-blue-100 text-blue-700',
    pending_manager: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-serif">数据概览</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="本月应收总额"
          value={stats.totalReceivable}
          prefix="¥"
          icon={Wallet}
          gradient="bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b]"
        />
        <StatCard
          title="已收金额"
          value={stats.totalReceived}
          prefix="¥"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-[#27AE60] to-[#2ecc71]"
        />
        <StatCard
          title="待收金额"
          value={stats.totalPending}
          prefix="¥"
          icon={Clock}
          gradient="bg-gradient-to-br from-[#f39c12] to-[#e67e22]"
        />
        <StatCard
          title="待审批押金"
          value={stats.pendingApprovals}
          icon={FileCheck}
          gradient="bg-gradient-to-br from-[#8e44ad] to-[#9b59b6]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 font-serif">近期账单</h2>
            <button
              onClick={() => navigate('/bills')}
              className="text-sm text-[#0D4F4F] hover:text-[#C9A962] flex items-center transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentBills.map((bill, idx) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-slideUp"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#0D4F4F]/10 flex items-center justify-center">
                    <span className="text-[#0D4F4F] font-bold text-sm">{bill.roomNo}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{bill.tenantName}</div>
                    <div className="text-xs text-gray-500">
                      {bill.period} · {formatDate(bill.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{formatCurrency(bill.totalAmount)}</div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${billStatusColors[bill.status]}`}
                  >
                    {getBillStatusLabel(bill.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 font-serif">待审批押金</h2>
            <button
              onClick={() => navigate('/deposit')}
              className="text-sm text-[#0D4F4F] hover:text-[#C9A962] flex items-center transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingDeposits.length === 0 ? (
              <div className="text-center py-10 text-gray-400">暂无待审批申请</div>
            ) : (
              pendingDeposits.map((req, idx) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/deposit/${req.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer animate-slideUp"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-[#C9A962]/20 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-[#C9A962]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {req.tenantName} - {req.roomNo}
                      </div>
                      <div className="text-xs text-gray-500">
                        发起人：{req.createdBy} · {formatDate(req.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0D4F4F]">
                      {formatCurrency(req.refundAmount)}
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${depositStatusColors[req.status]}`}
                    >
                      {getDepositStatusLabel(req.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
