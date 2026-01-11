import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Receipt, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 100)
  });

  const yearExpenses = expenses.filter(e => e.tax_year === currentYear);
  const totalExpenses = yearExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const deductibleExpenses = yearExpenses.filter(e => e.is_deductible !== false);
  const totalDeductible = deductibleExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const thisMonth = new Date().getMonth();
  const monthExpenses = yearExpenses.filter(e => new Date(e.date).getMonth() === thisMonth);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2">Track your expenses and tax deductions for {currentYear}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          subtitle={`${yearExpenses.length} transactions`}
          icon={DollarSign}
        />
        <StatsCard
          title="Tax Deductible"
          value={`$${totalDeductible.toFixed(2)}`}
          subtitle={`${deductibleExpenses.length} deductible items`}
          icon={TrendingUp}
        />
        <StatsCard
          title="This Month"
          value={`$${monthTotal.toFixed(2)}`}
          subtitle={`${monthExpenses.length} transactions`}
          icon={Calendar}
        />
        <StatsCard
          title="Receipts"
          value={expenses.filter(e => e.receipt_url).length}
          subtitle="Receipts uploaded"
          icon={Receipt}
        />
      </div>

      {/* Charts and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown expenses={yearExpenses} />
        <RecentExpenses expenses={expenses} />
      </div>
    </div>
  );
}