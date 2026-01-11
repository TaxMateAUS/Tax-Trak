import { format } from 'date-fns';
import { Receipt, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS = {
  office_supplies: "Office",
  travel: "Travel",
  meals_entertainment: "Meals",
  utilities: "Utilities",
  software_subscriptions: "Software",
  professional_services: "Services",
  insurance: "Insurance",
  vehicle: "Vehicle",
  home_office: "Home Office",
  medical: "Medical",
  education: "Education",
  charitable: "Charitable",
  other: "Other"
};

const CATEGORY_COLORS = {
  office_supplies: "bg-blue-50 text-blue-700 border-blue-200",
  travel: "bg-violet-50 text-violet-700 border-violet-200",
  meals_entertainment: "bg-pink-50 text-pink-700 border-pink-200",
  utilities: "bg-emerald-50 text-emerald-700 border-emerald-200",
  software_subscriptions: "bg-amber-50 text-amber-700 border-amber-200",
  professional_services: "bg-cyan-50 text-cyan-700 border-cyan-200",
  insurance: "bg-indigo-50 text-indigo-700 border-indigo-200",
  vehicle: "bg-lime-50 text-lime-700 border-lime-200",
  home_office: "bg-orange-50 text-orange-700 border-orange-200",
  medical: "bg-red-50 text-red-700 border-red-200",
  education: "bg-teal-50 text-teal-700 border-teal-200",
  charitable: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function RecentExpenses({ expenses }) {
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentExpenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Expenses</h3>
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Receipt className="w-12 h-12 mb-3 opacity-50" />
          <p>No expenses recorded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Expenses</h3>
      
      <div className="space-y-3">
        {recentExpenses.map((expense) => (
          <div 
            key={expense.id} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                {expense.receipt_url ? (
                  <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                  </a>
                ) : (
                  <Receipt className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{expense.vendor}</p>
                <p className="text-sm text-slate-500">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`text-xs ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}`}
              >
                {CATEGORY_LABELS[expense.category] || expense.category}
              </Badge>
              <span className="font-semibold text-slate-900 min-w-[80px] text-right">
                ${expense.amount?.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}