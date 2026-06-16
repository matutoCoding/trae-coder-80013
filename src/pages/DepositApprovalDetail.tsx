import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Home,
  UserCheck,
  Users,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDate, getDepositStatusLabel, getApprovalStatus } from '@/utils';

export default function DepositApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { depositRequests, approveStep, rejectStep, currentRole } = useAppStore();
  const [comment, setComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const request = depositRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="text-center py-20 text-gray-500">
        <FileCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p>申请不存在</p>
        <button
          onClick={() => navigate('/deposit')}
          className="mt-4 text-[#0D4F4F] hover:underline"
        >
          返回申请列表
        </button>
      </div>
    );
  }

  const overallStatus = getApprovalStatus(request.steps);
  const isRejected = request.status === 'rejected' || overallStatus === 'rejected';
  const isApproved = request.status === 'approved' || overallStatus === 'approved';

  const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    house_manager: Home,
    finance: UserCheck,
    manager: Users,
  };

  const myPendingStep = request.steps.find(
    (s) =>
      s.status === 'pending' &&
      (currentRole === 'admin' ||
        (currentRole === 'finance' && s.role === 'finance') ||
        (currentRole === 'manager' && s.role === 'manager') ||
        (currentRole === 'house_manager' && s.role === 'house_manager'))
  );

  const canApprove = !isRejected && !isApproved && !!myPendingStep;

  const handleApprove = () => {
    if (!myPendingStep) return;
    approveStep(request.id, myPendingStep.id, comment || '同意退还');
    setComment('');
  };

  const handleReject = () => {
    if (!myPendingStep || !rejectReason.trim()) return;
    rejectStep(request.id, myPendingStep.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const statusColors: Record<string, string> = {
    pending_finance: 'bg-blue-100 text-blue-700 border-blue-200',
    pending_manager: 'bg-purple-100 text-purple-700 border-purple-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/deposit')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#0D4F4F] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回申请列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-[#C9A962]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 font-serif">
                      押金退还申请 #{request.id.toUpperCase()}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.createdAt)} · {request.createdBy}
                    </p>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border ${statusColors[request.status]}`}
              >
                {isRejected ? (
                  <XCircle className="w-4 h-4" />
                ) : isApproved ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {getDepositStatusLabel(request.status)}
              </span>
            </div>

            {isRejected && (
              <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">申请已被否决</p>
                  <p className="text-sm text-red-600 mt-0.5">
                    否决原因：
                    {request.steps.find((s) => s.status === 'rejected')?.comment || '未填写'}
                  </p>
                </div>
              </div>
            )}

            {isApproved && (
              <div className="mb-5 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700">审批已全部通过</p>
                  <p className="text-sm text-green-600 mt-0.5">该申请可进入退款放行环节</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-y border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">租客姓名</p>
                <p className="text-base font-medium text-gray-800">{request.tenantName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">房间号</p>
                <p className="text-base font-medium text-gray-800">{request.roomNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">押金金额</p>
                <p className="text-base font-medium text-gray-500 line-through">
                  {formatCurrency(request.depositAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">应退金额</p>
                <p className="text-lg font-bold text-[#0D4F4F] font-serif">
                  {formatCurrency(request.refundAmount)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">扣款说明</p>
                <p className="text-sm text-gray-700">{request.deductionReason || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">退租原因</p>
                <p className="text-sm text-gray-700">{request.reason || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 font-serif mb-5 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#C9A962]" />
              审批流程
            </h2>

            <div className="relative">
              {request.steps.map((step, idx) => {
                const StepIcon = roleIcons[step.role] || User;
                const isLast = idx === request.steps.length - 1;
                const isDone = step.status !== 'pending';
                const isCurrent = step.status === 'pending' && !isRejected;
                const isRejectedStep = step.status === 'rejected';

                return (
                  <div key={step.id} className="flex gap-4 relative pb-6 last:pb-0">
                    {!isLast && (
                      <div
                        className={`absolute left-5 top-12 w-0.5 h-[calc(100%-2rem)] ${
                          isDone && !isRejectedStep ? 'bg-green-300' : isRejectedStep ? 'bg-red-300' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isRejectedStep
                          ? 'bg-red-500 text-white'
                          : isDone
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-[#0D4F4F] text-white ring-4 ring-[#C9A962]/30 animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === 'rejected' ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{step.roleName}</span>
                        <span className="text-sm text-gray-500">· {step.approver}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isRejectedStep
                              ? 'bg-red-100 text-red-700'
                              : isDone
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {step.status === 'approved'
                            ? '已通过'
                            : step.status === 'rejected'
                            ? '已否决'
                            : '待审批'}
                        </span>
                      </div>
                      {isDone && (
                        <>
                          <p className="text-sm text-gray-600 mb-1">
                            {isRejectedStep ? (
                              <span className="text-red-600">否决意见：{step.comment}</span>
                            ) : (
                              <span>审批意见：{step.comment}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {step.approvedAt}
                          </p>
                        </>
                      )}
                      {isCurrent && (
                        <p className="text-sm text-[#0D4F4F]">等待审批中...</p>
                      )}
                    </div>

                    {idx < request.steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 mt-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            {canApprove ? (
              <>
                <h3 className="text-base font-bold text-gray-800 font-serif mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-[#C9A962]" />
                  我的审批操作
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    审批意见
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="请输入审批意见（选填）"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#C9A962] outline-none resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-all"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    否决
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center justify-center gap-2 h-11 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all hover:shadow-lg"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    通过
                  </button>
                </div>
              </>
            ) : isRejected ? (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <p className="font-medium text-red-600">流程已终止</p>
                <p className="text-sm text-gray-500 mt-1">该申请已被否决</p>
              </div>
            ) : isApproved ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p className="font-medium text-green-600">全票通过</p>
                <p className="text-sm text-gray-500 mt-1">可前往退款放行执行打款</p>
                <button
                  onClick={() => navigate('/refund')}
                  className="mt-4 w-full h-10 rounded-lg bg-[#0D4F4F] text-[#C9A962] text-sm font-medium hover:bg-[#0a3d3d] transition-all"
                >
                  前往退款放行
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">等待上一级审批</p>
                <p className="text-sm text-gray-500 mt-1">请耐心等待</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ThumbsDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 font-serif">否决申请</h3>
                <p className="text-sm text-gray-500">否决后流程将立即终止</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                否决原因 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="请详细说明否决原因..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-red-400 outline-none resize-none text-sm"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 h-11 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认否决
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
