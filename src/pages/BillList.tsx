import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getBillStatusLabel } from '@/utils';
import type { Bill } from '@/types';

export default function BillList() {
  const navigate = useNavigate();
  const { bills } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<'all' | Bill['status']>('all');
  const [search, setSearch] = useState('');

  const filteredBills = bills.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        b.tenantName.toLowerCase().includes(s) ||
        b.roomNo.toLowerCase().includes(s) ||
        b.period.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    paid: CheckCircle2,
    overdue: AlertCircle,
  };

  const stats = {
    total: bills.length,
    pending: bills.filter((b) => b.status === 'pending').length,
    paid: bills.filter((b) => b.status === 'paid').length,
    overdue: bills.filter((b) => b.status === 'overdue').length,
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-serif">账单管理</h1>
          <p className="text-gray-500 text-sm mt-1">查看和管理所有租客账单</p>
        </div>
        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#0D4F4F] text-[#C9A962] text-sm font-medium hover:bg-[#0a3d3d] transition-all">
          <Download className="w-4 h-4" />
          导出账单
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '全部账单', value: stats.total, color: 'from-[#0D4F4F] to-[#1a6b6b]' },
          { label: '待支付', value: stats.pending, color: 'from-amber-500 to-amber-600' },
          { label: '已支付', value: stats.paid, color: 'from-green-500 to-green-600' },
          { label: '已逾期', value: stats.overdue, color: 'from-red-500 to-red-600' },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-sm`}
          >
            <div className="text-white/80 text-sm">{s.label}</div>
            <div className="text-3xl font-bold font-serif mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索租客姓名、房间号、账期..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              {(['all', 'pending', 'paid', 'overdue'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 h-9 rounded-lg text-sm transition-all ${
                    statusFilter === st
                      ? 'bg-[#0D4F4F] text-[#C9A962] font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'all' ? '全部' : getBillStatusLabel(st)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  账单信息
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  租客
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  基础租金
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  水电公摊
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  总金额
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  状态
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.map((bill, idx) => {
                const StatusIcon = statusIcons[bill.status];
                return (
                  <tr
                    key={bill.id}
                    className="hover:bg-gray-50 transition-colors animate-slideUp"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0D4F4F]/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#0D4F4F]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{bill.period} 账单</div>
                          <div className="text-xs text-gray-500">{formatDate(bill.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                          <Home className="w-4 h-4 text-[#C9A962]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{bill.tenantName}</div>
                          <div className="text-xs text-gray-500">{bill.roomNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{formatCurrency(bill.baseRent)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {formatCurrency(bill.waterFee + bill.electricFee + bill.sharingFee)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-[#0D4F4F] font-serif">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[bill.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {getBillStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/bills/${bill.id}`)}
                        className="inline-flex items-center gap-1 text-sm text-[#0D4F4F] hover:text-[#C9A962] transition-colors"
                      >
                        详情
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    暂无匹配的账单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
