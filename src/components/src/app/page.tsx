'use client';

import { useState } from 'react';
import Scanner from '@/components/Scanner';
import InvoiceContainer from '@/components/InvoiceContainer';
import Dashboard from '@/components/Dashboard';
import { Plus, Upload } from 'lucide-react';

// Sample data
const sampleInvoices = [
  { id: '1', status: 'pending' as const },
  { id: '2', status: 'paid' as const },
  { id: '3', status: 'overdue' as const },
  { id: '4', status: 'paid' as const },
  { id: '5', status: 'pending' as const },
];

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'invoices'>('scanner');

  const handleScanComplete = (data: any) => {
    console.log('Scan completed:', data);
    // Here you would save to database/backend
    alert('Invoice scanned successfully! Data saved.');
    setActiveTab('invoices');
  };

  const stats = {
    totalInvoices: sampleInvoices.length,
    pendingInvoices: sampleInvoices.filter(i => i.status === 'pending').length,
    paidInvoices: sampleInvoices.filter(i => i.status === 'paid').length,
    overdueInvoices: sampleInvoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-2">Scan, store, and manage supplier invoices</p>
        </div>
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => {
              setShowScanner(true);
              setActiveTab('scanner');
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Scan New Invoice
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <Dashboard {...stats} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scanner'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invoice Scanner
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invoice Repository
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'scanner' ? (
          <Scanner onScanComplete={handleScanComplete} />
        ) : (
          <InvoiceContainer />
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Storage Used:</span>
            <span className="text-blue-900 font-medium ml-2">125 MB / 1 GB</span>
          </div>
          <div>
            <span className="text-blue-700">Last Scan:</span>
            <span className="text-blue-900 font-medium ml-2">Today, 10:30 AM</span>
          </div>
          <div>
            <span className="text-blue-700">Total Scans This Month:</span>
            <span className="text-blue-900 font-medium ml-2">47 invoices</span>
          </div>
        </div>
      </div>
    </div>
  );
          }
