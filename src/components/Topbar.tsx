import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, ChevronDown, Shield } from 'lucide-react';
import { useAppStore } from '@/store';

const roleOptions: { role: 'house_manager' | 'finance' | 'manager' | 'admin'; label: string; name: string }[] = [
  { role: 'house_manager', label: '房管', name: '赵强' },
  { role: 'finance', label: '财务', name: '孙丽' },
  { role: 'manager', label: '主管', name: '周总' },
  { role: 'admin', label: '管理员', name: '系统管理员' },
];

export default function Topbar() {
  const { currentUserName, currentRole, setCurrentRole } = useAppStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoleInfo = roleOptions.find((r) => r.role === currentRole);

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

        <div className="relative pl-4 border-l border-gray-200" ref={menuRef}>
          <button
            onClick={() => setShowRoleMenu((v) => !v)}
            className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D4F4F] to-[#1a6b6b] flex items-center justify-center">
              <User className="w-5 h-5 text-[#C9A962]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800">{currentUserName}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {currentRoleInfo?.label}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showRoleMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs text-gray-400 font-medium">切换身份审批</p>
              </div>
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => {
                    setCurrentRole(opt.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    currentRole === opt.role ? 'bg-[#0D4F4F]/5' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentRole === opt.role
                        ? 'bg-[#0D4F4F] text-[#C9A962]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{opt.name}</div>
                    <div className="text-xs text-gray-500">{opt.label}</div>
                  </div>
                  {currentRole === opt.role && (
                    <div className="w-2 h-2 rounded-full bg-[#C9A962]"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
