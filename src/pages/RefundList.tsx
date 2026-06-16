import { useState } from 'react';
import {
  Banknote,
  Search,
  Copy,
  Check,
  Landmark,
  CreditCard,
  Smartphone,
  Wallet,
  ChevronRight,
  User,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate } from '@/utils';
import type { RefundMethod } from '@/types';

type RefundRecord = {
  id: string;
  isPending: boolean;
  tenantName: string;
  roomNo: string;
  amount: number;
  requestId: string;
  paymentMethod?: RefundMethod;
  voucherNo?: string;
  paidAt?: string;
  operator?: string;
};

const methodIcons: Record<RefundMethod, React.ComponentType<{ className?: string }>> = {
  bank_transfer: Landmark,
  alipay: CreditCard,
  wechat: Smartphone,
  cash: Wallet,
};

const methodLabels: Record<RefundMethod, string> = {
  bank_transfer: '银行转账',
  alipay: '支付宝',
  wechat: '微信',
  cash: '现金',
};

export default function RefundList() {
  const { depositRequests, refunds, processRefund } = useAppStore();
  const [search, setSearch] = useState('');
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<RefundMethod>('bank_transfer');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const approvedRequests = depositRequests.filter(
    (r) => r.status === 'approved' && !refunds.some((rf) => rf.requestId === r.id)
  );

  const allRecords: RefundRecord[] = [
    ...approvedRequests.map((r) => ({
      id: r.id,
      isPending: true,
      tenantName: r.tenantName,
      roomNo: r.roomNo,
      amount: r.refundAmount,
      requestId: r.id,
    })),
    ...refunds.map((r) => ({
      id: r.id,
      isPending: false,
      tenantName: r.tenantName,
      roomNo: '',
      amount: r.amount,
      paymentMethod: r.paymentMethod,
      voucherNo: r.voucherNo,
      paidAt: r.paidAt,
      operator: r.operator,
      requestId: r.requestId,
    })),
  ];

  const filtered = allRecords.filter((r) => {
    if (!search) return true;
    return r.tenantName.toLowerCase().includes(search.toLowerCase());
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProcessRefund = (requestId: string) => {
    processRefund(requestId, payMethod);
    setShowPayModal(null);
    setPayMethod('bank_transfer');
  };

  const stats = {
    pending: approvedRequests.length,
    completed: refunds.length,
    totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-serif">退款放行</h1>
        <p className="text-gray-500 text-sm mt-1">对审批通过的押金申请执行退款打款</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">待打款</span>
            <Clock className="w-5 h-5 text-white/70" />
          </div>
          <div className="text-3xl font-bold font-serif mt-1">{stats.pending}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">已完成</span>
            <CheckCircle2 className="w-5 h-5 text-white/70" />
          </div>
          <div className="text-3xl font-bold font-serif mt-1">{stats.completed}</div>
        </div>
        <div className="bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b] rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">累计退款</span>
            <Banknote className="w-5 h-5 text-[#C9A962]" />
          </div>
          <div className="text-2xl font-bold font-serif mt-1">{formatCurrency(stats.totalAmount)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索租客姓名..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  租客信息
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  退款金额
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  支付方式
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  凭证号
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
              {filtered.map((record, idx) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors animate-slideUp"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#C9A962]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{record.tenantName}</div>
                        {!record.isPending && record.paidAt && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.paidAt}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-[#0D4F4F] font-serif">
                      {formatCurrency(record.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.isPending ? (
                      <span className="text-gray-400 text-sm">-</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {record.paymentMethod && (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-[#0D4F4F]/10 flex items-center justify-center">
                              {(() => {
                                const Icon = methodIcons[record.paymentMethod];
                                return <Icon className="w-4 h-4 text-[#0D4F4F]" />;
                              })()}
                            </div>
                            <span className="text-sm text-gray-700">
                              {record.paymentMethod && methodLabels[record.paymentMethod]}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.isPending ? (
                      <span className="text-gray-400 text-sm">-</span>
                    ) : (
                      <button
                        onClick={() => record.voucherNo && handleCopy(record.voucherNo, record.id)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0D4F4F] transition-colors font-mono"
                      >
                        {copiedId === record.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {record.voucherNo}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" />
                        待打款
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        已完成
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.isPending ? (
                      <button
                        onClick={() => setShowPayModal(record.requestId)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-white bg-[#0D4F4F] hover:bg-[#0a3d3d] px-4 h-9 rounded-lg transition-all"
                      >
                        <Banknote className="w-4 h-4" />
                        执行打款
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">
                        操作人：{(record as any).operator || '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    暂无退款记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-gray-800 font-serif mb-5 flex items-center">
              <Banknote className="w-6 h-6 mr-2 text-[#C9A962]" />
              执行退款打款
            </h3>

            <div className="p-4 rounded-lg bg-gray-50 mb-5">
              {(() => {
                const req = depositRequests.find((r) => r.id === showPayModal);
                if (!req) return null;
                return (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">租客</span>
                      <span className="text-sm font-medium text-gray-800">
                        {req.tenantName}（{req.roomNo}）
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">退款金额</span>
                      <span className="text-xl font-bold text-[#0D4F4F] font-serif">
                        {formatCurrency(req.refundAmount)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">选择支付方式</label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(methodLabels) as RefundMethod[]).map((method) => {
                  const Icon = methodIcons[method];
                  return (
                    <button
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        payMethod === method
                          ? 'border-[#0D4F4F] bg-[#0D4F4F]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          payMethod === method ? 'bg-[#0D4F4F] text-[#C9A962]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          payMethod === method ? 'text-[#0D4F4F]' : 'text-gray-600'
                        }`}
                      >
                        {methodLabels[method]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayModal(null)}
                className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => handleProcessRefund(showPayModal)}
                className="flex-1 h-11 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                确认打款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
