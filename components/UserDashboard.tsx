'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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

export default function UserDashboard() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
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
                <span className="inline-block w-2 h-2 bg-teal-500 rounded-full"></span>
                Welcome, <span className="font-semibold text-gray-900">{session?.user?.name || session?.user?.email}</span> <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">User</span>
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

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Logs</h2>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View-only access
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <MaintenanceList
            logs={logs}
            onEdit={() => {}}
            onDelete={() => {}}
            canEdit={false}
            canDelete={false}
          />
        )}
      </main>
    </div>
  );
}

