import { useState, useMemo } from 'react';
import {
  Calculator,
  Home,
  Droplets,
  Zap,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { calculateRent, formatCurrency, getPricingTierLabel } from '@/utils';
import type { RentCalculationResult } from '@/types';

const tierColors = {
  short: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  long: 'bg-green-100 text-green-700 border-green-200',
};

export default function RentCalculator() {
  const { rentConfig, addBill } = useAppStore();
  const [days, setDays] = useState(20);
  const [waterUsage, setWaterUsage] = useState(5);
  const [electricUsage, setElectricUsage] = useState(100);
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const result: RentCalculationResult = useMemo(
    () => calculateRent(days, waterUsage, electricUsage, rentConfig),
    [days, waterUsage, electricUsage, rentConfig]
  );

  const handleGenerateBill = () => {
    if (!tenantName || !roomNo) {
      alert('请填写租客姓名和房间号');
      return;
    }
    addBill({
      tenantId: tenantId || 'new',
      tenantName,
      roomNo,
      period: new Date().toISOString().slice(0, 7),
      baseRent: result.baseRent,
      waterFee: result.waterFee,
      waterUsage,
      electricFee: result.electricFee,
      electricUsage,
      sharingFee: result.sharingFee,
      totalAmount: result.totalAmount,
      status: 'pending',
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-serif">租金试算</h1>
        <p className="text-gray-500 text-sm mt-1">输入租期与水电用量，实时计算租金明细</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 font-serif mb-5 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-[#C9A962]" />
              计算参数
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    租客姓名
                  </label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="请输入租客姓名"
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房间号
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="例如：A101"
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  租期：<span className="text-[#0D4F4F] font-bold ml-1">{days} 天</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0D4F4F]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1天（短租）</span>
                  <span className="text-amber-600">{rentConfig.shortTermDays}天起步阈值</span>
                  <span className="text-green-600">{rentConfig.longTermDays}天封顶阈值</span>
                  <span>60天+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Droplets className="w-4 h-4 mr-1 text-blue-400" />
                  用水量（吨）
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={waterUsage}
                  onChange={(e) => setWaterUsage(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">单价：¥{rentConfig.waterUnitPrice}/吨</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                  用电量（度）
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={electricUsage}
                  onChange={(e) => setElectricUsage(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">单价：¥{rentConfig.electricUnitPrice}/度</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 font-serif mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#C9A962]" />
              计费档位说明
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <div className="text-xs text-amber-600 font-medium mb-1">短租</div>
                <div className="text-xl font-bold text-amber-700 font-serif">
                  {formatCurrency(rentConfig.startPrice)}
                </div>
                <div className="text-xs text-amber-600/70 mt-1">≤ {rentConfig.shortTermDays} 天</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">中租</div>
                <div className="text-xl font-bold text-blue-700 font-serif">
                  ¥{rentConfig.dailyRate}/天
                </div>
                <div className="text-xs text-blue-600/70 mt-1">
                  {rentConfig.shortTermDays + 1} ~ {rentConfig.longTermDays - 1} 天
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center">
                <div className="text-xs text-green-600 font-medium mb-1">长租</div>
                <div className="text-xl font-bold text-green-700 font-serif">
                  {formatCurrency(rentConfig.capPrice)}
                </div>
                <div className="text-xs text-green-600/70 mt-1">≥ {rentConfig.longTermDays} 天</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b] p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">预估租金总额</span>
                <span className={`px-3 py-1 rounded-full text-xs border ${tierColors[result.pricingTier]}`}>
                  {getPricingTierLabel(result.pricingTier)}
                </span>
              </div>
              <div className="text-4xl font-bold font-serif tracking-tight">
                {formatCurrency(result.totalAmount)}
              </div>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-500 mb-3">费用明细</h3>
              {result.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 animate-slideUp"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="text-sm text-gray-600">{item.description}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">合计</span>
                  <span className="text-xl font-bold text-[#0D4F4F] font-serif">
                    {formatCurrency(result.totalAmount)}
                  </span>
                </div>
              </div>

              {showSuccess ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-50 text-green-700 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">账单已生成！</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateBill}
                  className="w-full h-12 rounded-lg bg-[#0D4F4F] text-[#C9A962] font-medium hover:bg-[#0a3d3d] transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98]"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  生成账单
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
