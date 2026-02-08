import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Filter, Download, Car, TrendingUp, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TripForm from '../components/vehicle/TripForm';
import TripTable from '../components/vehicle/TripTable';
import VehicleManager from '../components/vehicle/VehicleManager';
import StatsCard from '../components/dashboard/StatsCard';
import PullToRefresh from '../components/mobile/PullToRefresh';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "business", label: "Business" },
  { value: "medical", label: "Medical" },
  { value: "moving", label: "Moving" },
  { value: "charitable", label: "Charitable" },
  { value: "other", label: "Other" }
];

export default function VehicleTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
      setIsFormOpen(false);
      toast.success('Trip added successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trip.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
      setIsFormOpen(false);
      setEditingTrip(null);
      toast.success('Trip updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Trip.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
      toast.success('Trip deleted');
    }
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.start_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.end_location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || trip.category === categoryFilter;
    const matchesYear = yearFilter === 'all' || trip.tax_year?.toString() === yearFilter;
    return matchesSearch && matchesCategory && matchesYear;
  });

  const yearTrips = trips.filter(t => t.tax_year?.toString() === yearFilter || (!t.tax_year && yearFilter === new Date().getFullYear().toString()));
  const totalDistance = yearTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0);
  const deductibleTrips = yearTrips.filter(t => t.is_deductible !== false);
  const totalDeductibleDistance = deductibleTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0);

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data) => {
    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'From', 'To', 'Start Odometer', 'End Odometer', 'Purpose', 'Category', 'Distance (km)', 'Deductible'].join(','),
      ...filteredTrips.map(t => [
        t.date,
        `"${t.start_location || ''}"`,
        `"${t.end_location || ''}"`,
        t.start_odometer || '',
        t.end_odometer || '',
        `"${t.purpose}"`,
        t.category,
        t.distance_km,
        t.is_deductible !== false ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-trips-${yearFilter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Trips exported successfully');
  };
  
  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['trips']);
    toast.success('Trips refreshed');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vehicle & Mileage</h1>
          <p className="text-slate-500 mt-2">Track your vehicle trips for tax deductions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={() => { setEditingTrip(null); setIsFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trip
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Distance"
          value={`${totalDistance.toFixed(1)} km`}
          subtitle={`${yearTrips.length} trips`}
          icon={Navigation}
        />
        <StatsCard
          title="Deductible Distance"
          value={`${totalDeductibleDistance.toFixed(1)} km`}
          subtitle={`${deductibleTrips.length} deductible trips`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Average Trip"
          value={`${yearTrips.length > 0 ? (totalDistance / yearTrips.length).toFixed(1) : '0'} km`}
          subtitle={`Per trip`}
          icon={Car}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trips" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search trips..."
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
              <p className="text-sm text-slate-500">Total Distance</p>
              <p className="text-xl font-bold text-slate-900">
                {filteredTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0).toFixed(1)} km
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Deductible Distance</p>
              <p className="text-xl font-bold text-emerald-600">
                {filteredTrips.filter(t => t.is_deductible !== false).reduce((sum, t) => sum + (t.distance_km || 0), 0).toFixed(1)} km
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Trip Count</p>
              <p className="text-xl font-bold text-slate-900">{filteredTrips.length}</p>
            </div>
          </div>

          {/* Table */}
          <TripTable
            trips={filteredTrips}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="vehicles">
          <VehicleManager />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto safe-bottom">
          <DialogHeader>
            <DialogTitle>
              {editingTrip ? 'Edit Trip' : 'Add New Trip'}
            </DialogTitle>
          </DialogHeader>
          <TripForm
            initialData={editingTrip}
            onSave={handleSave}
            onCancel={() => { setIsFormOpen(false); setEditingTrip(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      </div>
    </PullToRefresh>
  );
}