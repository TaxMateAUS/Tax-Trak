import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  office_supplies: "#3b82f6",
  travel: "#8b5cf6",
  meals_entertainment: "#ec4899",
  utilities: "#10b981",
  software_subscriptions: "#f59e0b",
  professional_services: "#06b6d4",
  insurance: "#6366f1",
  vehicle: "#84cc16",
  home_office: "#f97316",
  medical: "#ef4444",
  education: "#14b8a6",
  charitable: "#a855f7",
  other: "#64748b"
};

const CATEGORY_LABELS = {
  office_supplies: "Office Supplies",
  travel: "Travel",
  meals_entertainment: "Meals & Entertainment",
  utilities: "Utilities",
  software_subscriptions: "Software",
  professional_services: "Professional Services",
  insurance: "Insurance",
  vehicle: "Vehicle",
  home_office: "Home Office",
  medical: "Medical",
  education: "Education",
  charitable: "Charitable",
  other: "Other"
};

export default function CategoryBreakdown({ expenses }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  const data = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: amount,
      category
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Expenses by Category</h3>
        <div className="flex items-center justify-center h-48 text-slate-400">
          No expenses yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Expenses by Category</h3>
      
      <div className="flex items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.category] || "#64748b"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
          {data.slice(0, 5).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || "#64748b" }}
                />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">
                  ${item.value.toFixed(0)}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}