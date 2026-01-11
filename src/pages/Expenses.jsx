import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Filter, Download, FileJson } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseForm from '../components/receipts/ExpenseForm';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "meals_entertainment", label: "Meals & Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "software_subscriptions", label: "Software" },
  { value: "professional_services", label: "Professional Services" },
  { value: "insurance", label: "Insurance" },
  { value: "vehicle", label: "Vehicle" },
  { value: "home_office", label: "Home Office" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "charitable", label: "Charitable" },
  { value: "other", label: "Other" }
];

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setIsFormOpen(false);
      toast.success('Expense added successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setIsFormOpen(false);
      setEditingExpense(null);
      toast.success('Expense updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense deleted');
    }
  });

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesYear = yearFilter === 'all' || expense.tax_year?.toString() === yearFilter;
    return matchesSearch && matchesCategory && matchesYear;
  });

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Vendor', 'Category', 'Amount', 'Tax Year', 'Deductible', 'Notes'].join(','),
      ...filteredExpenses.map(e => [
        e.date,
        `"${e.vendor}"`,
        e.category,
        e.amount,
        e.tax_year,
        e.is_deductible !== false ? 'Yes' : 'No',
        `"${e.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${yearFilter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Expenses exported successfully');
  };

  const handleExportJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      taxYear: yearFilter,
      totalExpenses: filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      totalDeductible: filteredExpenses.filter(e => e.is_deductible !== false).reduce((sum, e) => sum + (e.amount || 0), 0),
      expenses: filteredExpenses.map(e => ({
        id: e.id,
        date: e.date,
        vendor: e.vendor,
        category: e.category,
        amount: e.amount,
        taxYear: e.tax_year,
        isDeductible: e.is_deductible !== false,
        notes: e.notes || '',
        receiptUrl: e.receipt_url || '',
        createdDate: e.created_date,
        updatedDate: e.updated_date
      }))
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${yearFilter}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('JSON file exported successfully');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-slate-500 mt-2">Manage and track all your expenses</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Bar */}
      <div className="bg-slate-50 rounded-xl p-4 flex flex-wrap gap-6">
        <div>
          <p className="text-sm text-slate-500">Total Expenses</p>
          <p className="text-xl font-bold text-slate-900">
            ${filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Deductible</p>
          <p className="text-xl font-bold text-emerald-600">
            ${filteredExpenses.filter(e => e.is_deductible !== false).reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Count</p>
          <p className="text-xl font-bold text-slate-900">{filteredExpenses.length}</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initialData={editingExpense}
            onSave={handleSave}
            onCancel={() => { setIsFormOpen(false); setEditingExpense(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}