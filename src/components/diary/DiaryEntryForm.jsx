import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function DiaryEntryForm({ initialData, onSave, onCancel, isSaving }) {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: '',
    amount: '',
    tax_year: currentYear,
    notes: '',
    is_deductible: true,
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount?.toString() || '',
        tax_year: initialData.tax_year || currentYear
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      tax_year: parseInt(formData.tax_year)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Monthly internet for home office"
          required
          disabled={isSaving}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Phone & Internet, Home Office"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_year">Tax Year</Label>
          <Input
            id="tax_year"
            type="number"
            value={formData.tax_year}
            onChange={(e) => setFormData({ ...formData, tax_year: e.target.value })}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          disabled={isSaving}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_deductible"
          checked={formData.is_deductible}
          onCheckedChange={(checked) => setFormData({ ...formData, is_deductible: checked })}
          disabled={isSaving}
        />
        <Label htmlFor="is_deductible">Tax Deductible</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : initialData ? 'Update Entry' : 'Add Entry'}
        </Button>
      </div>
    </form>
  );
}