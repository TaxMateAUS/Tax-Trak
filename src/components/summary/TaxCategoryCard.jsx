import { cn } from "@/lib/utils";
import { ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  office_supplies: "bg-blue-500",
  travel: "bg-violet-500",
  meals_entertainment: "bg-pink-500",
  utilities: "bg-emerald-500",
  software_subscriptions: "bg-amber-500",
  professional_services: "bg-cyan-500",
  insurance: "bg-indigo-500",
  vehicle: "bg-lime-500",
  home_office: "bg-orange-500",
  medical: "bg-red-500",
  education: "bg-teal-500",
  charitable: "bg-purple-500",
  other: "bg-slate-500"
};

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

export default function TaxCategoryCard({ category, amount, count, totalAmount }) {
  const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
  
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full", CATEGORY_COLORS[category] || "bg-slate-500")} />
          <span className="font-medium text-slate-900">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900">${amount.toFixed(2)}</p>
          <p className="text-sm text-slate-500 mt-1">{count} expense{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-slate-600">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", CATEGORY_COLORS[category] || "bg-slate-500")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}