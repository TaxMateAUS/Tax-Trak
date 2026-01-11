import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TaxCategoryCard from '../components/summary/TaxCategoryCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  office_supplies: "Office Supplies",
  travel: "Travel",
  meals_entertainment: "Meals & Entertainment",
  utilities: "Utilities",
  software_subscriptions: "Software & Subscriptions",
  professional_services: "Professional Services",
  insurance: "Insurance",
  vehicle: "Vehicle Expenses",
  home_office: "Home Office",
  medical: "Medical",
  education: "Education & Training",
  charitable: "Charitable Donations",
  other: "Other"
};

export default function TaxSummary() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 500)
  });

  const yearExpenses = expenses.filter(e => e.tax_year?.toString() === selectedYear);
  const deductibleExpenses = yearExpenses.filter(e => e.is_deductible !== false);
  
  const totalExpenses = yearExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalDeductible = deductibleExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group by category
  const categoryData = deductibleExpenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].amount += expense.amount || 0;
    acc[category].count += 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b.amount - a.amount);

  // Monthly breakdown for chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthExpenses = deductibleExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === i;
    });
    const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      amount: total
    };
  });

  const generateReport = async () => {
    const reportData = {
      year: selectedYear,
      totalExpenses: totalExpenses.toFixed(2),
      totalDeductible: totalDeductible.toFixed(2),
      categories: sortedCategories.map(([cat, data]) => ({
        category: CATEGORY_LABELS[cat] || cat,
        amount: data.amount.toFixed(2),
        count: data.count
      })),
      generatedAt: new Date().toISOString()
    };

    // Create a detailed text report
    let report = `TAX EXPENSE SUMMARY REPORT\n`;
    report += `Tax Year: ${selectedYear}\n`;
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `\n${'='.repeat(50)}\n\n`;
    report += `SUMMARY\n`;
    report += `-`.repeat(30) + '\n';
    report += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    report += `Total Deductible: $${totalDeductible.toFixed(2)}\n`;
    report += `\n${'='.repeat(50)}\n\n`;
    report += `BREAKDOWN BY CATEGORY\n`;
    report += `-`.repeat(30) + '\n';
    
    sortedCategories.forEach(([cat, data]) => {
      report += `${CATEGORY_LABELS[cat] || cat}: $${data.amount.toFixed(2)} (${data.count} items)\n`;
    });

    report += `\n${'='.repeat(50)}\n\n`;
    report += `DETAILED EXPENSES\n`;
    report += `-`.repeat(30) + '\n';

    deductibleExpenses.forEach(e => {
      report += `${e.date} | ${e.vendor} | ${CATEGORY_LABELS[e.category] || e.category} | $${e.amount?.toFixed(2)}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-summary-${selectedYear}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report generated successfully');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tax Summary</h1>
          <p className="text-slate-500 mt-2">Overview of your tax-deductible expenses</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} className="bg-slate-900 hover:bg-slate-800">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Expenses</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mt-2">{yearExpenses.length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-100 uppercase tracking-wide">Tax Deductible</span>
          </div>
          <p className="text-3xl font-bold">${totalDeductible.toFixed(2)}</p>
          <p className="text-sm text-emerald-100 mt-2">{deductibleExpenses.length} deductible items</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Categories</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{sortedCategories.length}</p>
          <p className="text-sm text-slate-500 mt-2">Expense categories used</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Deductible Expenses</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Deductible Expenses by Category</h3>
        {sortedCategories.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No deductible expenses for {selectedYear}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map(([category, data]) => (
              <TaxCategoryCard
                key={category}
                category={category}
                amount={data.amount}
                count={data.count}
                totalAmount={totalDeductible}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}