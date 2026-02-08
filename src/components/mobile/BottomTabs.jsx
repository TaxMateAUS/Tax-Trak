import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { cn } from "@/lib/utils";
import { LayoutDashboard, ScanLine, Receipt, Car } from 'lucide-react';

const tabs = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Scan', href: 'ScanReceipt', icon: ScanLine },
  { name: 'Expenses', href: 'Expenses', icon: Receipt },
  { name: 'Vehicle', href: 'VehicleTracking', icon: Car },
];

export default function BottomTabs() {
  const location = useLocation();
  
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    return path || 'Dashboard';
  };
  
  const currentPage = getCurrentPage();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-40 safe-bottom">
      <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.href;
          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "text-slate-900 dark:text-white")} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}