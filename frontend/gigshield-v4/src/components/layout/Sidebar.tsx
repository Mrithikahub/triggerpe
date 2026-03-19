'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Shield, FileText, History, Cloud, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface SidebarProps { workerId: string; workerName?: string; }

export function Sidebar({ workerId, workerName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: `/dashboard/${workerId}`, label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-100' },
    { href: `/premium/${workerId}`, label: 'Premium Calculator', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
    { href: `/policies/create?workerId=${workerId}`, label: 'Buy Policy', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
    { href: `/claims/create?workerId=${workerId}`, label: 'File Claim', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { href: `/claims/history?workerId=${workerId}`, label: 'Claim History', icon: History, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { href: `/weather/${workerId}`, label: 'Weather Alerts', icon: Cloud, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const isActive = (href: string) => pathname === href.split('?')[0];

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {menuItems.map(({ href, label, icon: Icon, color, bg }) => (
        <Link key={href} href={href} onClick={onClick}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(href) ? `${bg} ${color}` : 'text-gray-600 hover:bg-gray-50'} ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? label : undefined}>
          <Icon className={`h-5 w-5 flex-shrink-0 ${color} ${!collapsed ? 'mr-3' : ''}`} />
          {!collapsed && label}
        </Link>
      ))}
    </nav>
  );

  const UserInfo = () => (
    <div className={`border-t border-gray-200 p-4 ${collapsed ? 'text-center' : ''}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
        <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{workerName || 'Worker'}</p>
            <p className="text-xs text-gray-400 truncate">{workerId}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200">
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">GigShield</span>
              </div>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <NavItems onClick={() => setMobileOpen(false)} />
            <UserInfo />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${collapsed ? 'justify-center' : ''}`}>
          <Shield className="h-7 w-7 text-blue-600 flex-shrink-0" />
          {!collapsed && <span className="ml-2 text-xl font-bold text-gray-900">GigShield</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10">
          {collapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
        </button>
        <NavItems />
        <UserInfo />
      </div>
    </>
  );
}
