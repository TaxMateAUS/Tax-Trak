import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  PieChart, 
  Menu, 
  X,
  LogOut,
  ScanLine,
  Car,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SubscriptionCheck from './components/SubscriptionCheck';
import BottomTabs from './components/mobile/BottomTabs';

const navigation = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Scan Receipt', href: 'ScanReceipt', icon: ScanLine },
  { name: 'Expenses', href: 'Expenses', icon: Receipt },
  { name: 'Vehicle & Mileage', href: 'VehicleTracking', icon: Car },
  { name: 'Deduction Diary', href: 'DiaryEntries', icon: FileText },
  { name: 'Tax Summary', href: 'TaxSummary', icon: PieChart },
];

const childPages = ['Expenses', 'VehicleTracking', 'DiaryEntries', 'TaxSummary', 'ScanReceipt'];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout();
  };
  
  const handleDeleteAccount = async () => {
    try {
      const user = await base44.auth.me();
      await base44.entities.User.delete(user.id);
      base44.auth.logout();
    } catch (error) {
      alert('Failed to delete account. Please contact support.');
    }
  };
  
  const handleBack = () => {
    navigate(createPageUrl('Dashboard'));
  };
  
  const showBackButton = childPages.includes(currentPageName);

  // Skip subscription check for the subscription page itself
  const isSubscriptionPage = currentPageName === 'Subscription';

  const content = (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 safe-top safe-bottom safe-left",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full pt-[env(safe-area-inset-top)]">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">TaxTracker</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-slate-900 dark:bg-slate-700 text-white shadow-sm" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 pb-[env(safe-area-inset-bottom)]">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Account
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 lg:hidden safe-top">
          <div className="flex items-center gap-2 pt-[env(safe-area-inset-top)]">
            {showBackButton ? (
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            ) : (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">TaxTracker</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageName}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Bottom Tabs - Mobile Only */}
        <BottomTabs />
      </div>
      
      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="safe-bottom">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isSubscriptionPage) {
    return content;
  }

  return <SubscriptionCheck>{content}</SubscriptionCheck>;
}