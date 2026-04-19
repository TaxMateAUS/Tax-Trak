import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateTaxPDF } from '../lib/taxPdfGenerator';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

export default function TaxReports() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());
  const [generating, setGenerating] = useState(false);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 1000),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-date', 1000),
  });

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ['diary-entries'],
    queryFn: () => base44.entities.DiaryEntry.list('-date', 1000),
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const yearExpenses = expenses.filter(e => e.tax_year?.toString() === selectedYear);
  const yearTrips = trips.filter(t => t.tax_year?.toString() === selectedYear);
  const yearDiary = diaryEntries.filter(d => d.tax_year?.toString() === selectedYear);

  const totalExpenses = yearExpenses.filter(e => e.is_deductible !== false).reduce((s, e) => s + (e.amount || 0), 0);
  const totalMileage = yearTrips.filter(t => t.is_deductible !== false).reduce((s, t) => s + (t.distance_km || 0), 0);
  const totalDiary = yearDiary.filter(d => d.is_deductible !== false).reduce((s, d) => s + (d.amount || 0), 0);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      await generateTaxPDF({
        year: selectedYear,
        user,
        expenses: yearExpenses,
        trips: yearTrips,
        diaryEntries: yearDiary,
      });
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tax Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Generate accountant-ready PDF summaries by tax year</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tax Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => (
                <SelectItem key={y} value={y.toString()}>{y} Tax Year</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            {generating ? 'Generating…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          label="Receipt Expenses"
          count={yearExpenses.filter(e => e.is_deductible !== false).length}
          total={totalExpenses}
          color="emerald"
        />
        <SummaryCard
          label="Mileage (km)"
          count={yearTrips.filter(t => t.is_deductible !== false).length + ' trips'}
          total={totalMileage}
          isMileage
          color="blue"
        />
        <SummaryCard
          label="Diary Deductions"
          count={yearDiary.filter(d => d.is_deductible !== false).length}
          total={totalDiary}
          color="violet"
        />
      </div>

      {/* Preview Table */}
      <ReportPreview
        year={selectedYear}
        expenses={yearExpenses}
        trips={yearTrips}
        diaryEntries={yearDiary}
      />
    </div>
  );
}

function SummaryCard({ label, count, total, isMileage, color }) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900',
    blue: 'bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900',
    violet: 'bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-900',
  };
  const textColors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    violet: 'text-violet-600 dark:text-violet-400',
  };
  return (
    <div className={`rounded-2xl border p-6 ${colors[color]}`}>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>
        {isMileage ? `${total.toFixed(0)} km` : `$${total.toFixed(2)}`}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{count} deductible items</p>
    </div>
  );
}

function ReportPreview({ year, expenses, trips, diaryEntries }) {
  const deductibleExpenses = expenses.filter(e => e.is_deductible !== false);
  const deductibleTrips = trips.filter(t => t.is_deductible !== false);
  const deductibleDiary = diaryEntries.filter(d => d.is_deductible !== false);

  const grandTotal =
    deductibleExpenses.reduce((s, e) => s + (e.amount || 0), 0) +
    deductibleDiary.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <FileText className="w-5 h-5 text-slate-400" />
        <h2 className="font-semibold text-slate-900 dark:text-white">{year} Tax Year — Report Preview</h2>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* Expenses */}
        <Section title="Expense Deductions" items={deductibleExpenses} renderRow={(e) => (
          <Row key={e.id} label={e.vendor} sub={formatCategory(e.category)} date={e.date} amount={e.amount} />
        )} />

        {/* Trips */}
        <Section title="Mileage Deductions" items={deductibleTrips} renderRow={(t) => (
          <Row key={t.id} label={t.purpose} sub={`${t.start_location || ''} → ${t.end_location || ''}`} date={t.date} amount={null} mileage={t.distance_km} />
        )} />

        {/* Diary */}
        <Section title="Diary Entries" items={deductibleDiary} renderRow={(d) => (
          <Row key={d.id} label={d.description} sub={d.category} date={d.date} amount={d.amount} />
        )} />
      </div>

      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Total Deductible Amount</span>
        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

function Section({ title, items, renderRow }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title} ({items.length})</p>
      </div>
      {items.map(renderRow)}
    </div>
  );
}

function Row({ label, sub, date, amount, mileage }) {
  return (
    <div className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{label}</p>
        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        {amount != null && <p className="text-sm font-semibold text-slate-900 dark:text-white">${amount.toFixed(2)}</p>}
        {mileage != null && <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{mileage.toFixed(1)} km</p>}
        <p className="text-xs text-slate-400">{date}</p>
      </div>
    </div>
  );
}

const CATEGORY_LABELS = {
  office_supplies: 'Office Supplies', travel: 'Travel', meals_entertainment: 'Meals & Entertainment',
  utilities: 'Utilities', software_subscriptions: 'Software', professional_services: 'Professional Services',
  insurance: 'Insurance', vehicle: 'Vehicle', home_office: 'Home Office', medical: 'Medical',
  education: 'Education', charitable: 'Charitable', other: 'Other',
};
function formatCategory(cat) { return CATEGORY_LABELS[cat] || cat || ''; }