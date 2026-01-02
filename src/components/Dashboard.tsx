'use client';

import { TrendingUp, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export default function Dashboard({
  totalInvoices,
  pendingInvoices,
  paidInvoices,
  overdueInvoices
}: DashboardProps) {
  const stats = [
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      change: '+12%'
    },
    {
      title: 'Pending',
      value: pendingInvoices.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      change: '+3'
    },
    {
      title: 'Paid',
      value: paidInvoices.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      change: '+8%'
    },
    {
      title: 'Overdue',
      value: overdueInvoices.toString(),
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      change: '-2'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
