import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Receipt } from 'lucide-react';

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

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Receipt className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No expenses found</p>
        <p className="text-sm">Start by scanning a receipt or adding an expense manually</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Vendor</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold text-center">Receipt</TableHead>
            <TableHead className="font-semibold text-center">Deductible</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="text-slate-600">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                {expense.vendor}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}`}
                >
                  {CATEGORY_LABELS[expense.category] || expense.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-900">
                ${expense.amount?.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                {expense.receipt_url ? (
                  <a 
                    href={expense.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </a>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {expense.is_deductible !== false ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold">✓</span>
                ) : (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">✗</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(expense)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}