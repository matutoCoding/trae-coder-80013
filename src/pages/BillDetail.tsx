import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Home,
  Droplets,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Printer,
  DollarSign,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getBillStatusLabel } from '@/utils';

export default function BillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bills, updateBillStatus } = useAppStore();

  const bill = bills.find((b) => b.id === id);

  if (!bill) {
    return (
      <div className="text-center py-20 text-gray-500">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p>账单不存在</p>
        <button
          onClick={() => navigate('/bills')}
          className="mt-4 text-[#0D4F4F] hover:underline"
        >
          返回账单列表
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    paid: CheckCircle2,
    overdue: AlertCircle,
  };

  const StatusIcon = statusIcons[bill.status];

  const breakdown = [
    { label: '基础租金', icon: Home, amount: bill.baseRent, color: 'text-[#0D4F4F]', bg: 'bg-[#0D4F4F]/10' },
    { label: `水费（${bill.waterUsage}吨）`, icon: Droplets, amount: bill.waterFee, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: `电费（${bill.electricUsage}度）`, icon: Zap, amount: bill.electricFee, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: '公摊费用', icon: Users, amount: bill.sharingFee, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/bills')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#0D4F4F] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回账单列表
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0D4F4F] to-[#1a6b6b] p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-[#C9A962]" />
                <h1 className="text-2xl font-bold font-serif">{bill.period} 租金账单</h1>
              </div>
              <p className="text-white/70 text-sm">账单编号：{bill.id.toUpperCase()}</p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusColors[bill.status]}`}>
              <StatusIcon className="w-4 h-4" />
              {getBillStatusLabel(bill.status)}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">租客姓名</p>
              <p className="text-base font-medium text-gray-800">{bill.tenantName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">房间号</p>
              <p className="text-base font-medium text-gray-800">{bill.roomNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                账期
              </p>
              <p className="text-base font-medium text-gray-800">{bill.period}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                生成日期
              </p>
              <p className="text-base font-medium text-gray-800">{formatDate(bill.createdAt)}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 font-serif mb-4">费用明细</h2>

          <div className="space-y-3 mb-6">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 animate-slideUp"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.color} font-serif`}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#0D4F4F]/5 to-[#C9A962]/10 border border-[#C9A962]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0D4F4F] flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#C9A962]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">应付总额</p>
                <p className="text-xs text-gray-400">包含基础租金及所有附加费用</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-[#0D4F4F] font-serif tracking-tight">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>

          {bill.status !== 'paid' && (
            <div className="mt-8 flex gap-3 justify-end">
              <button className="flex items-center gap-2 px-5 h-11 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                <Printer className="w-4 h-4" />
                打印账单
              </button>
              <button
                onClick={() => updateBillStatus(bill.id, 'paid')}
                className="flex items-center gap-2 px-6 h-11 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all hover:shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                标记已支付
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
