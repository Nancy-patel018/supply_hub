import React from 'react';
import { Home, MapPin, Truck, Clock, DollarSign, Settings } from 'lucide-react';

interface TransporterSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function TransporterSidebar({ activeView, setActiveView }: TransporterSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'routes', label: 'Delivery Routes', icon: MapPin },
    { id: 'vehicle', label: 'Vehicle Status', icon: Truck },
    { id: 'history', label: 'Delivery History', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
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
                ? 'bg-purple-100 text-purple-700'
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