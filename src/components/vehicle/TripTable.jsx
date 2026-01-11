import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Car, Navigation } from 'lucide-react';

const CATEGORY_COLORS = {
  business: "bg-blue-50 text-blue-700 border-blue-200",
  medical: "bg-red-50 text-red-700 border-red-200",
  moving: "bg-purple-50 text-purple-700 border-purple-200",
  charitable: "bg-emerald-50 text-emerald-700 border-emerald-200",
  other: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function TripTable({ trips, onEdit, onDelete }) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Car className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No trips found</p>
        <p className="text-sm">Start tracking your vehicle trips</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Route</TableHead>
            <TableHead className="font-semibold">Purpose</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold text-right">Odometer</TableHead>
            <TableHead className="font-semibold text-right">Distance</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="text-slate-600">
                {format(new Date(trip.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="text-sm">
                    {trip.start_location && trip.end_location ? (
                      <>
                        <div className="font-medium text-slate-900">{trip.start_location}</div>
                        <div className="text-slate-500">→ {trip.end_location}</div>
                      </>
                    ) : trip.start_location || trip.end_location ? (
                      <div className="text-slate-600">{trip.start_location || trip.end_location}</div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                {trip.purpose}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`${CATEGORY_COLORS[trip.category] || CATEGORY_COLORS.other} capitalize`}
                >
                  {trip.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-slate-600">
                {trip.start_odometer && trip.end_odometer ? (
                  <div>
                    <div>{trip.start_odometer.toFixed(0)}</div>
                    <div className="text-slate-400">→ {trip.end_odometer.toFixed(0)}</div>
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-900">
                {trip.distance_km?.toFixed(1)} km
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(trip)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(trip.id)}
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