import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Settings,
  FileText,
  FileCheck,
  Banknote,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    group: '概览',
    items: [
      { path: '/dashboard', label: '数据仪表盘', icon: LayoutDashboard },
    ],
  },
  {
    group: '租金管理',
    items: [
      { path: '/rent/calculator', label: '租金试算', icon: Calculator },
      { path: '/rent/config', label: '计费规则配置', icon: Settings },
    ],
  },
  {
    group: '财务管理',
    items: [
      { path: '/bills', label: '账单管理', icon: FileText },
    ],
  },
  {
    group: '押金审批',
    items: [
      { path: '/deposit', label: '押金会签', icon: FileCheck },
      { path: '/refund', label: '退款放行', icon: Banknote },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0D4F4F] min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[#C9A962]/20">
        <Building2 className="w-8 h-8 text-[#C9A962] mr-3" />
        <div>
          <h1 className="text-[#C9A962] font-bold text-lg font-serif">寓管家</h1>
          <p className="text-[#C9A962]/60 text-xs">长租公寓收租系统</p>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="px-6 text-[#C9A962]/50 text-xs font-medium mb-2 uppercase tracking-wider">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-6 py-3 mx-2 rounded-lg text-sm transition-all duration-200 mb-1',
                    isActive
                      ? 'bg-[#C9A962] text-[#0D4F4F] font-medium shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#C9A962]/20">
        <div className="text-[#C9A962]/50 text-xs">v1.0.0</div>
      </div>
    </aside>
  );
}
