import React from 'react';
import { MunicipalSeal } from './MunicipalSeal';
import { LayoutDashboard, Truck, Fuel, Wrench, Gauge, Database, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'vehicles' | 'fuel' | 'repairs' | 'analytics' | 'backup';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onQuickAdd: (type: 'vehicle' | 'fuel' | 'repair') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onQuickAdd }) => {
  const [quickMenuOpen, setQuickMenuOpen] = React.useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vehicles', label: 'ทะเบียนรถ/เครื่องมือ', icon: <Truck className="w-4 h-4" /> },
    { id: 'fuel', label: 'บันทึกน้ำมัน', icon: <Fuel className="w-4 h-4" /> },
    { id: 'repairs', label: 'ประวัติซ่อม (แบบ 6)', icon: <Wrench className="w-4 h-4" /> },
    { id: 'analytics', label: 'คำนวณ กม./ลิตร', icon: <Gauge className="w-4 h-4" /> },
    { id: 'backup', label: 'สำรองข้อมูล', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <MunicipalSeal size={40} className="shrink-0" />
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                เทศบาลตำบลพระซอง
              </div>
              <div className="text-xs text-slate-500 font-normal leading-none mt-0.5 whitespace-nowrap">
                ระบบควบคุมยานพาหนะ เครื่องจักร และเครื่องมือ
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="relative shrink-0 flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มรายการ</span>
              </button>

              {quickMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setQuickMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-20">
                    <button
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onQuickAdd('vehicle');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>เพิ่มรถยนต์ / เครื่องจักรใหม่</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onQuickAdd('fuel');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Fuel className="w-4 h-4 text-emerald-600" />
                      <span>บันทึกการเบิกจ่ายน้ำมัน</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuickMenuOpen(false);
                        onQuickAdd('repair');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>บันทึกขอซ่อม / ออกแบบ 6</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
