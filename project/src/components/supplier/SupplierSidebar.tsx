import React from 'react';
import { Home, Package, ShoppingBag, Users, BarChart3, Settings } from 'lucide-react';

interface SupplierSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function SupplierSidebar({ activeView, setActiveView }: SupplierSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="px-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}