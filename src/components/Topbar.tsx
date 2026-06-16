import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';

const roleLabels: Record<string, string> = {
  house_manager: '房管',
  finance: '财务',
  manager: '主管',
  admin: '管理员',
};

export default function Topbar() {
  const { currentUserName, currentRole } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索租客、房间、账单..."
            className="w-80 h-10 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#C9A962] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b] flex items-center justify-center">
            <User className="w-5 h-5 text-[#C9A962]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{currentUserName}</span>
            <span className="text-xs text-gray-500">{roleLabels[currentRole]}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
