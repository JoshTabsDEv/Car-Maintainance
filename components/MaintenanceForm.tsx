'use client';

import { useState, useEffect } from 'react';

interface MaintenanceLog {
  id: number;
  carMake: string;
  carModel: string;
  serviceType: string;
  serviceDate: string;
  mileage: number | null;
  cost: number | null;
  notes: string | null;
}

interface MaintenanceFormProps {
  log?: MaintenanceLog | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function MaintenanceForm({ log, onSubmit, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    carMake: '',
    carModel: '',
    serviceType: '',
    serviceDate: '',
    mileage: '',
    cost: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (log) {
      // Format date for HTML date input (YYYY-MM-DD)
      const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        carMake: log.carMake || '',
        carModel: log.carModel || '',
        serviceType: log.serviceType || '',
        serviceDate: formatDate(log.serviceDate) || '',
        mileage: log.mileage?.toString() || '',
        cost: log.cost?.toString() || '',
        notes: log.notes || '',
      });
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = log ? `/api/maintenance/${log.id}` : '/api/maintenance';
      const method = log ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carMake: formData.carMake,
          carModel: formData.carModel,
          serviceType: formData.serviceType,
          serviceDate: formData.serviceDate,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        onSubmit();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save maintenance log');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {log ? 'Edit Maintenance Log' : 'Add Maintenance Log'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {log ? 'Update the maintenance record details' : 'Fill in the details for the new maintenance record'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="carMake" className="block text-sm font-semibold text-gray-700 mb-2">
              Car Make <span className="text-red-500">*</span>
            </label>
            <input
              id="carMake"
              type="text"
              value={formData.carMake}
              onChange={(e) => setFormData({ ...formData, carMake: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g., Toyota"
              required
            />
          </div>

          <div>
            <label htmlFor="carModel" className="block text-sm font-semibold text-gray-700 mb-2">
              Car Model <span className="text-red-500">*</span>
            </label>
            <input
              id="carModel"
              type="text"
              value={formData.carModel}
              onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g., Camry"
              required
            />
          </div>

          <div>
            <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceType"
              type="text"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g., Oil Change, Tire Rotation"
              required
            />
          </div>

          <div>
            <label htmlFor="serviceDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Date <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceDate"
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-semibold text-gray-700 mb-2">
              Mileage
            </label>
            <input
              id="mileage"
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g., 50000"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-semibold text-gray-700 mb-2">
              Cost ($)
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g., 150.00"
              min="0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            rows={4}
            placeholder="Additional notes or comments..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : log ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

