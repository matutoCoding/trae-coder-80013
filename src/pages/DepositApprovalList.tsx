import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Home,
  UserCheck,
  Users,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getDepositStatusLabel } from '@/utils';
import type { DepositRequest } from '@/types';

export default function DepositApprovalList() {
  const navigate = useNavigate();
  const { depositRequests, addDepositRequest } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<'all' | DepositRequest['status']>('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    tenantName: '',
    roomNo: '',
    tenantId: '',
    depositAmount: 0,
    refundAmount: 0,
    deductionReason: '',
    reason: '',
    createdBy: '房管-赵强',
  });

  const filtered = depositRequests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.tenantName.toLowerCase().includes(s) ||
        r.roomNo.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    pending_finance: 'bg-blue-100 text-blue-700',
    pending_manager: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const getApprovalProgress = (steps: DepositRequest['steps']) => {
    const done = steps.filter((s) => s.status !== 'pending').length;
    return { done, total: steps.length, percent: Math.round((done / steps.length) * 100) };
  };

  const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    house_manager: Home,
    finance: UserCheck,
    manager: Users,
  };

  const handleCreateRequest = () => {
    if (!newForm.tenantName || !newForm.roomNo) {
      alert('请填写租客姓名和房间号');
      return;
    }
    addDepositRequest(newForm);
    setShowNewModal(false);
    setNewForm({
      tenantName: '',
      roomNo: '',
      tenantId: '',
      depositAmount: 0,
      refundAmount: 0,
      deductionReason: '',
      reason: '',
      createdBy: '房管-赵强',
    });
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-serif">押金会签</h1>
          <p className="text-gray-500 text-sm mt-1">管理押金退还申请，多人会签审批流程</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 h-11 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          发起退还申请
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索租客姓名、房间号..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            {(['all', 'pending_finance', 'pending_manager', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 h-9 rounded-lg text-sm transition-all ${
                  statusFilter === st
                    ? 'bg-[#0D4F4F] text-[#C9A962] font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'all' ? '全部' : getDepositStatusLabel(st)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  申请人信息
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  押金/退款金额
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  审批进度
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  状态
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  发起时间
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req, idx) => {
                const progress = getApprovalProgress(req.steps);
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition-colors animate-slideUp cursor-pointer"
                    style={{ animationDelay: `${idx * 30}ms` }}
                    onClick={() => navigate(`/deposit/${req.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#C9A962]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{req.tenantName}</div>
                          <div className="text-xs text-gray-500">
                            {req.roomNo} · {req.createdBy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-through">
                        押金: {formatCurrency(req.depositAmount)}
                      </div>
                      <div className="text-lg font-bold text-[#0D4F4F] font-serif">
                        退: {formatCurrency(req.refundAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {req.steps.map((step) => {
                          const StepIcon = roleIcons[step.role] || User;
                          const color =
                            step.status === 'approved'
                              ? 'bg-green-500 text-white'
                              : step.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-400';
                          return (
                            <div
                              key={step.id}
                              className={`w-7 h-7 rounded-full flex items-center justify-center ${color} transition-all`}
                              title={`${step.roleName} - ${step.status}`}
                            >
                              {step.status === 'approved' ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : step.status === 'rejected' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0D4F4F] to-[#C9A962] rounded-full transition-all"
                          style={{ width: `${progress.percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {progress.done}/{progress.total} 已审批
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}
                      >
                        <FileCheck className="w-3 h-3" />
                        {getDepositStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/deposit/${req.id}`)}
                        className="inline-flex items-center gap-1 text-sm text-[#0D4F4F] hover:text-[#C9A962] transition-colors"
                      >
                        审批
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    暂无申请记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-gray-800 font-serif mb-5 flex items-center">
              <FileCheck className="w-6 h-6 mr-2 text-[#C9A962]" />
              发起押金退还申请
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">租客姓名</label>
                  <input
                    type="text"
                    value={newForm.tenantName}
                    onChange={(e) => setNewForm({ ...newForm, tenantName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">房间号</label>
                  <input
                    type="text"
                    value={newForm.roomNo}
                    onChange={(e) => setNewForm({ ...newForm, roomNo: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">押金金额（元）</label>
                  <input
                    type="number"
                    value={newForm.depositAmount}
                    onChange={(e) =>
                      setNewForm({ ...newForm, depositAmount: Number(e.target.value) })
                    }
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">应退金额（元）</label>
                  <input
                    type="number"
                    value={newForm.refundAmount}
                    onChange={(e) =>
                      setNewForm({ ...newForm, refundAmount: Number(e.target.value) })
                    }
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">扣款说明</label>
                <input
                  type="text"
                  value={newForm.deductionReason}
                  onChange={(e) => setNewForm({ ...newForm, deductionReason: e.target.value })}
                  placeholder="如无扣款填'无'"
                  className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">退租原因</label>
                <textarea
                  value={newForm.reason}
                  onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreateRequest}
                className="flex-1 h-11 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
