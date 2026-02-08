import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, BookOpen } from "lucide-react";
import DiaryEntryForm from "../components/diary/DiaryEntryForm";
import DiaryEntryTable from "../components/diary/DiaryEntryTable";

export default function DiaryEntries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['diary-entries'],
    queryFn: () => base44.entities.DiaryEntry.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create(data),
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['diary-entries'] });
      const previousEntries = queryClient.getQueryData(['diary-entries']);
      queryClient.setQueryData(['diary-entries'], (old = []) => [
        { ...newEntry, id: 'temp-' + Date.now(), created_date: new Date().toISOString() },
        ...old
      ]);
      return { previousEntries };
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(['diary-entries'], context.previousEntries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      setShowForm(false);
      setEditingEntry(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiaryEntry.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['diary-entries'] });
      const previousEntries = queryClient.getQueryData(['diary-entries']);
      queryClient.setQueryData(['diary-entries'], (old = []) =>
        old.map(entry => entry.id === id ? { ...entry, ...data } : entry)
      );
      return { previousEntries };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['diary-entries'], context.previousEntries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      setShowForm(false);
      setEditingEntry(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiaryEntry.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['diary-entries'] });
      const previousEntries = queryClient.getQueryData(['diary-entries']);
      queryClient.setQueryData(['diary-entries'], (old = []) => 
        old.filter(entry => entry.id !== id)
      );
      return { previousEntries };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['diary-entries'], context.previousEntries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
    }
  });

  const handleSave = (data) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || entry.tax_year?.toString() === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  const totalAmount = filteredEntries
    .filter(e => e.is_deductible)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const years = [...new Set(entries.map(e => e.tax_year).filter(Boolean))].sort((a, b) => b - a);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Deduction Diary</h1>
        </div>
        <p className="text-slate-600">Record tax deductible items without receipts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Entries</p>
          <p className="text-2xl font-bold text-slate-900">{filteredEntries.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Deductible Entries</p>
          <p className="text-2xl font-bold text-slate-900">
            {filteredEntries.filter(e => e.is_deductible).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Deductions</p>
          <p className="text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Tax Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingEntry(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : (
          <DiaryEntryTable
            entries={filteredEntries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
          </DialogHeader>
          <DiaryEntryForm
            initialData={editingEntry}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}