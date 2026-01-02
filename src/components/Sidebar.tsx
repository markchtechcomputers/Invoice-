'use client';

import { Home, Scan, Folder, Settings, BarChart3, HelpCircle, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [active, setActive] = useState('dashboard');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scanner', label: 'Scan Invoice', icon: Scan },
    { id: 'invoices', label: 'All Invoices', icon: Folder },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Scan className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InvoicePro</h1>
            <p className="text-sm text-gray-500">Business Solution</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              active === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="font-semibold text-blue-600">U</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">User Account</p>
            <p className="text-sm text-gray-500">admin@company.com</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <LogOut className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
