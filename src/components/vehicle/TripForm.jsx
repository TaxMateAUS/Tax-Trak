import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X } from 'lucide-react';

const DEFAULT_RATE = 0.68; // Standard rate per km

const CATEGORIES = [
  { value: "business", label: "Business" },
  { value: "medical", label: "Medical" },
  { value: "moving", label: "Moving" },
  { value: "charitable", label: "Charitable" },
  { value: "other", label: "Other" }
];

export default function TripForm({ initialData, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle_id: '',
    vehicle_name: '',
    start_location: '',
    end_location: '',
    purpose: '',
    distance_km: '',
    category: 'business',
    rate_per_km: DEFAULT_RATE,
    tax_year: new Date().getFullYear(),
    notes: '',
    is_deductible: true,
    ...initialData
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ is_active: true })
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        distance_km: initialData.distance_km?.toString() || '',
        rate_per_km: initialData.rate_per_km?.toString() || DEFAULT_RATE.toString()
      }));
    }
  }, [initialData]);

  const calculateTotal = () => {
    const distance = parseFloat(formData.distance_km) || 0;
    const rate = parseFloat(formData.rate_per_km) || 0;
    return (distance * rate).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const distance = parseFloat(formData.distance_km) || 0;
    const rate = parseFloat(formData.rate_per_km) || 0;
    
    onSave({
      ...formData,
      distance_km: distance,
      rate_per_km: rate,
      total_amount: distance * rate,
      tax_year: parseInt(formData.tax_year) || new Date().getFullYear()
    });
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setFormData({
      ...formData,
      vehicle_id: vehicleId,
      vehicle_name: vehicle?.name || ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Label htmlFor="vehicle">Vehicle</Label>
          <Select
            value={formData.vehicle_id}
            onValueChange={handleVehicleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No vehicle specified</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_location">From</Label>
          <Input
            id="start_location"
            value={formData.start_location}
            onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
            placeholder="Starting location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_location">To</Label>
          <Input
            id="end_location"
            value={formData.end_location}
            onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
            placeholder="Ending location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance_km">Distance (km)</Label>
          <Input
            id="distance_km"
            type="number"
            step="0.1"
            value={formData.distance_km}
            onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            placeholder="0.0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate_per_km">Rate per km ($)</Label>
          <Input
            id="rate_per_km"
            type="number"
            step="0.01"
            value={formData.rate_per_km}
            onChange={(e) => setFormData({ ...formData, rate_per_km: e.target.value })}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose / Description</Label>
        <Input
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="e.g., Client meeting, Site visit"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
        <Switch
          id="is_deductible"
          checked={formData.is_deductible}
          onCheckedChange={(checked) => setFormData({ ...formData, is_deductible: checked })}
        />
        <Label htmlFor="is_deductible" className="cursor-pointer">Tax Deductible</Label>
        <div className="ml-auto text-right">
          <p className="text-sm text-slate-500">Estimated Claim</p>
          <p className="text-xl font-bold text-slate-900">${calculateTotal()}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Trip'}
        </Button>
      </div>
    </form>
  );
}