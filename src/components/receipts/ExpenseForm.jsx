import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X } from 'lucide-react';

const CATEGORIES = [
  { value: "office_supplies", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "meals_entertainment", label: "Meals & Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "software_subscriptions", label: "Software & Subscriptions" },
  { value: "professional_services", label: "Professional Services" },
  { value: "insurance", label: "Insurance" },
  { value: "vehicle", label: "Vehicle Expenses" },
  { value: "home_office", label: "Home Office" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education & Training" },
  { value: "charitable", label: "Charitable Donations" },
  { value: "other", label: "Other" }
];

export default function ExpenseForm({ initialData, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    tax_year: new Date().getFullYear(),
    notes: '',
    is_deductible: true,
    receipt_url: '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        amount: initialData.amount?.toString() || ''
      }));
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      tax_year: parseInt(formData.tax_year) || new Date().getFullYear()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor / Store Name</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="e.g., Office Depot"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax_year">Tax Year</Label>
          <Select
            value={formData.tax_year.toString()}
            onValueChange={(value) => setFormData({ ...formData, tax_year: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-3 pt-8">
          <Switch
            id="is_deductible"
            checked={formData.is_deductible}
            onCheckedChange={(checked) => setFormData({ ...formData, is_deductible: checked })}
          />
          <Label htmlFor="is_deductible" className="cursor-pointer">Tax Deductible</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      {formData.receipt_url && (
        <div className="p-4 bg-slate-50 rounded-xl">
          <Label className="text-sm text-slate-500">Receipt Attached</Label>
          <a 
            href={formData.receipt_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:underline block mt-1"
          >
            View Receipt Image
          </a>
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}