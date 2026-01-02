'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, MoreVertical, Calendar, Building, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  lpoNumber: string;
  supplierName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  fileName: string;
  fileUrl: string;
}

export default function InvoiceContainer() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      lpoNumber: 'LPO-00124',
      supplierName: 'Tech Supplies Ltd',
      date: '2024-01-15',
      amount: 24500.00,
      status: 'pending',
      fileName: 'invoice-001.pdf',
      fileUrl: '/invoices/sample.pdf'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      lpoNumber: 'LPO-00125',
      supplierName: 'Office Depot',
      date: '2024-01-14',
      amount: 12000.50,
      status: 'paid',
      fileName: 'invoice-002.pdf',
      fileUrl: '/invoices/sample.pdf'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      lpoNumber: 'LPO-00126',
      supplierName: 'Global Traders',
      date: '2024-01-12',
      amount: 56780.25,
      status: 'overdue',
      fileName: 'invoice-003.pdf',
      fileUrl: '/invoices/sample.pdf'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Search and filter logic
  useEffect(() => {
    let results = invoices;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.lpoNumber.toLowerCase().includes(query) ||
        invoice.supplierName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      results = results.filter(invoice => invoice.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start) {
      results = results.filter(invoice => invoice.date >= dateRange.start);
    }
    if (dateRange.end) {
      results = results.filter(invoice => invoice.date <= dateRange.end);
    }

    setFilteredInvoices(results);
  }, [searchQuery, statusFilter, dateRange, invoices]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ['Invoice Number', 'LPO Number', 'Supplier', 'Date', 'Amount', 'Status'],
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.lpoNumber,
        inv.supplierName,
        inv.date,
        inv.amount,
        inv.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoice Repository</h2>
            <p className="text-gray-600">Search and manage all supplier invoices</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Invoice #, LPO #, or Supplier..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Paid
            </button>
            <button
              onClick={() => handleStatusFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Overdue
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="From"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="To"
            />
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">LPO: {invoice.lpoNumber}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{invoice.supplierName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {format(new Date(invoice.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.open(invoice.fileUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                      title="View PDF"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = invoice.fileUrl;
                        link.download = invoice.fileName;
                        link.click();
                      }}
                      className="text-gray-600 hover:text-gray-800"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || dateRange.start || dateRange.end
              ? 'Try adjusting your search filters'
              : 'Start by scanning your first invoice'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredInvoices.length}</span> of{' '}
            <span className="font-medium">{invoices.length}</span> invoices
          </div>
          <div className="flex space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
