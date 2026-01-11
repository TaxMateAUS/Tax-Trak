import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

export default function VehicleManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    license_plate: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      setIsOpen(false);
      resetForm();
      toast.success('Vehicle added');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      setIsOpen(false);
      resetForm();
      toast.success('Vehicle updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      toast.success('Vehicle deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      year: '',
      license_plate: '',
      is_active: true
    });
    setEditingVehicle(null);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      license_plate: vehicle.license_plate || '',
      is_active: vehicle.is_active !== false
    });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      year: formData.year ? parseInt(formData.year) : undefined
    };

    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">My Vehicles</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => { resetForm(); setIsOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{vehicle.name}</h4>
                  {vehicle.license_plate && (
                    <p className="text-sm text-slate-500">{vehicle.license_plate}</p>
                  )}
                </div>
              </div>
              {vehicle.is_active !== false && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Active
                </Badge>
              )}
            </div>
            {(vehicle.make || vehicle.model || vehicle.year) && (
              <p className="text-sm text-slate-600 mb-3">
                {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
              </p>
            )}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEdit(vehicle)}
                className="flex-1"
              >
                <Pencil className="w-3 h-3 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDelete(vehicle.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No vehicles added yet</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Honda Civic"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Honda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Civic"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  placeholder="ABC123"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active vehicle</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}