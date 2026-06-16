import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Gauge, TrendingUp, Droplets, Zap, Percent } from 'lucide-react';
import { useAppStore } from '@/store';
import { defaultRentConfig } from '@/data/mockData';
import type { RentConfig as RentConfigType } from '@/types';
import { formatCurrency } from '@/utils';

export default function RentConfigPage() {
  const { rentConfig, setRentConfig } = useAppStore();
  const [form, setForm] = useState<RentConfigType>(rentConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(rentConfig);
  }, [rentConfig]);

  const handleChange = (field: keyof RentConfigType, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (form.startPrice >= form.capPrice) {
      alert('起步价必须低于封顶价');
      return;
    }
    if (form.shortTermDays >= form.longTermDays) {
      alert('短租阈值必须小于长租阈值');
      return;
    }
    setRentConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setForm(defaultRentConfig);
  };

  const InputField = ({
    label,
    icon: Icon,
    field,
    value,
    unit,
    min = 0,
    step = 1,
    hint,
  }: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    field: keyof RentConfigType;
    value: number;
    unit?: string;
    min?: number;
    step?: number | string;
    hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <Icon className="w-4 h-4 mr-2 text-[#C9A962]" />
        {label}
        {unit && <span className="ml-1 text-xs text-gray-400">({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => handleChange(field, Number(e.target.value))}
        className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20 outline-none transition-all font-medium"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-serif">计费规则配置</h1>
        <p className="text-gray-500 text-sm mt-1">设置租金计算的各项参数，实时预览档位规则</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 font-serif mb-5 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#C9A962]" />
              基础租金参数
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="短租起步价"
                icon={Gauge}
                field="startPrice"
                value={form.startPrice}
                unit="元"
                hint="租期≤短租阈值时，统一按此价格计费"
              />
              <InputField
                label="长租封顶价"
                icon={TrendingUp}
                field="capPrice"
                value={form.capPrice}
                unit="元"
                hint="租期≥长租阈值时，统一按此价格计费"
              />
              <InputField
                label="短租阈值"
                icon={Gauge}
                field="shortTermDays"
                value={form.shortTermDays}
                unit="天"
                hint="小于等于此天数按起步价计算"
              />
              <InputField
                label="长租阈值"
                icon={TrendingUp}
                field="longTermDays"
                value={form.longTermDays}
                unit="天"
                hint="大于等于此天数按封顶价计算"
              />
              <div className="md:col-span-2">
                <InputField
                  label="中间档位日单价"
                  icon={TrendingUp}
                  field="dailyRate"
                  value={form.dailyRate}
                  unit="元/天"
                  hint="短租阈值与长租阈值之间的租期，按此单价×天数计算"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 font-serif mb-5 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-[#C9A962]" />
              水电及公摊参数
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="水费单价"
                icon={Droplets}
                field="waterUnitPrice"
                value={form.waterUnitPrice}
                unit="元/吨"
                step="0.1"
              />
              <InputField
                label="电费单价"
                icon={Zap}
                field="electricUnitPrice"
                value={form.electricUnitPrice}
                unit="元/度"
                step="0.1"
              />
              <InputField
                label="公摊比例"
                icon={Percent}
                field="sharingRate"
                value={form.sharingRate}
                unit="%"
                step="1"
                hint="按水电费用合计比例收取"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 h-12 rounded-lg font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#0D4F4F] text-[#C9A962] hover:bg-[#0a3d3d] hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              <Save className="w-5 h-5" />
              {saved ? '已保存' : '保存配置'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 h-12 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              恢复默认
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">当前计费规则预览</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-amber-700 font-medium">短租档位</span>
                  <span className="text-xs text-amber-600">≤ {form.shortTermDays} 天</span>
                </div>
                <div className="text-2xl font-bold text-amber-800 font-serif">
                  {formatCurrency(form.startPrice)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blue-700 font-medium">中租档位</span>
                  <span className="text-xs text-blue-600">
                    {form.shortTermDays + 1} ~ {form.longTermDays - 1} 天
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-800 font-serif">
                  ¥{form.dailyRate} <span className="text-sm font-normal">/天</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-green-700 font-medium">长租档位</span>
                  <span className="text-xs text-green-600">≥ {form.longTermDays} 天</span>
                </div>
                <div className="text-2xl font-bold text-green-800 font-serif">
                  {formatCurrency(form.capPrice)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b] rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-sm font-medium text-white/70 mb-3">费用计算说明</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A962]">•</span>
                基础租金根据租期自动匹配档位
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A962]">•</span>
                水费 = 用水量 × {form.waterUnitPrice}元/吨
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A962]">•</span>
                电费 = 用电量 × {form.electricUnitPrice}元/度
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A962]">•</span>
                公摊费 = (水费+电费) × {form.sharingRate}%
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A962]">•</span>
                总额 = 基础租金 + 水费 + 电费 + 公摊费
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
