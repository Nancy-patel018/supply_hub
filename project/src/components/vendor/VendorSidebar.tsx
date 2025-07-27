import React from 'react';
import { Home, ShoppingCart, Package, TrendingUp, Settings, HelpCircle } from 'lucide-react';

interface VendorSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function VendorSidebar({ activeView, setActiveView }: VendorSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Browse Products', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'trends', label: 'Price Trends', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
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
                ? 'bg-green-100 text-green-700'
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