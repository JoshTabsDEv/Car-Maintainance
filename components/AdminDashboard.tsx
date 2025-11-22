'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceList from './MaintenanceList';

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

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setError('Failed to fetch maintenance logs');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLog(null);
    setShowForm(true);
  };

  const handleEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this maintenance log?')) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLogs();
      } else {
        setError('Failed to delete maintenance log');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingLog(null);
    fetchLogs();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Car Maintenance Log
              </h1>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                Welcome, <span className="font-semibold text-gray-900">{session?.user?.name || session?.user?.email}</span> <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Admin</span>
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Logs</h2>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition shadow-lg font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Maintenance Log
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <MaintenanceForm
                log={editingLog}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <MaintenanceList
            logs={logs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={true}
            canDelete={true}
          />
        )}
      </main>
    </div>
  );
}

