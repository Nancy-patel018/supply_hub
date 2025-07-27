import React from 'react';
import { Home, Users, BarChart3, Package, Truck, Settings, Shield } from 'lucide-react';

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function AdminSidebar({ activeView, setActiveView }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Order Monitoring', icon: Package },
    { id: 'deliveries', label: 'Delivery Tracking', icon: Truck },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: Settings }
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
                ? 'bg-red-100 text-red-700'
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