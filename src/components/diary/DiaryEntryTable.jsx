import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function DiaryEntryTable({ entries, onEdit, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No diary entries yet</p>
        <p className="text-sm text-slate-400 mt-1">Start recording your deductible items</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Description</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Deductible</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-sm text-slate-900">
                {format(new Date(entry.date), 'MMM d, yyyy')}
              </td>
              <td className="py-3 px-4 text-sm text-slate-900">
                <div>{entry.description}</div>
                {entry.notes && (
                  <div className="text-xs text-slate-500 mt-1">{entry.notes}</div>
                )}
              </td>
              <td className="py-3 px-4 text-sm">
                {entry.category ? (
                  <Badge variant="outline" className="bg-slate-50">
                    {entry.category}
                  </Badge>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">
                ${entry.amount.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-center">
                {entry.is_deductible ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50">
                    No
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(entry.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}