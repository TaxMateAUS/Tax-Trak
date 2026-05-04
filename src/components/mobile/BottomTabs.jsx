import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { LayoutDashboard, ScanLine, Receipt, Car } from 'lucide-react';

const tabs = [
  { name: 'Dashboard', path: '/Dashboard', icon: LayoutDashboard },
  { name: 'Scan', path: '/ScanReceipt', icon: ScanLine },
  { name: 'Expenses', path: '/Expenses', icon: Receipt },
  { name: 'Vehicle', path: '/VehicleTracking', icon: Car },
];

/**
 * Preserves tab history stacks — each tab remembers the last path visited within it.
 * Navigation just pushes/restores those stored paths, keeping scroll & state intact
 * via React Router's existing keep-alive behavior.
 */
export default function BottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  // Map of tab path → last visited full path
  const tabHistory = useRef({});

  // Track the current path per tab root
  useEffect(() => {
    const currentTab = tabs.find(t =>
      location.pathname === t.path || location.pathname.startsWith(t.path + '/')
    );
    if (currentTab) {
      tabHistory.current[currentTab.path] = location.pathname + location.search;
    }
  }, [location]);

  const activeTab = tabs.find(t =>
    location.pathname === t.path || location.pathname.startsWith(t.path + '/')
  ) || (location.pathname === '/' ? tabs[0] : null);

  const handleTabPress = (tab) => {
    if (activeTab?.path === tab.path) return; // already on this tab
    // Restore last visited path in this tab, or fall back to root
    const dest = tabHistory.current[tab.path] || tab.path;
    navigate(dest);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-40">
      <div
        className="flex justify-around items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab?.path === tab.path;
          return (
            <button
              key={tab.name}
              onClick={() => handleTabPress(tab)}
              // Minimum 44×44px touch target (WCAG 2.5.5)
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors",
                "min-h-[56px] min-w-[44px]",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500 active:text-slate-700 dark:active:text-slate-300"
              )}
              aria-label={tab.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "text-slate-900 dark:text-white")} />
              <span className="text-xs font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}