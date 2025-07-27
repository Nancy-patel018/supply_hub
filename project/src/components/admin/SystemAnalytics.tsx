import React, { useState } from 'react';
import { Calendar, TrendingUp, Users, Package, Truck, DollarSign } from 'lucide-react';

export default function SystemAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const analyticsData = {
    overview: [
      { label: 'Total Revenue', value: '₹12,45,600', change: '+24%', icon: DollarSign, color: 'text-green-600' },
      { label: 'Total Orders', value: '2,456', change: '+18%', icon: Package, color: 'text-blue-600' },
      { label: 'Active Users', value: '1,248', change: '+12%', icon: Users, color: 'text-purple-600' },
      { label: 'Deliveries', value: '2,234', change: '+15%', icon: Truck, color: 'text-orange-600' }
    ],
    userGrowth: [120, 150, 180, 200, 250, 300, 350, 400, 480, 520, 580, 650, 720, 800, 900, 1000, 1100, 1200, 1248],
    orderVolume: [45, 52, 48, 61, 55, 67, 59, 68, 62, 71, 65, 74, 69, 78, 72, 82, 76, 85, 89],
    revenueData: [15000, 18000, 22000, 19000, 25000, 28000, 32000, 29000, 35000, 38000, 42000, 39000, 45000, 48000, 52000, 49000, 55000, 58000, 62000]
  };

  const topPerformers = {
    vendors: [
      { name: 'Raj Kumar', orders: 156, revenue: '₹45,600' },
      { name: 'Priya Foods', orders: 142, revenue: '₹38,900' },
      { name: 'Street Delights', orders: 128, revenue: '₹35,200' }
    ],
    suppliers: [
      { name: 'Green Valley Farms', orders: 89, revenue: '₹2,15,600' },
      { name: 'Fresh Harvest Co.', orders: 76, revenue: '₹1,98,400' },
      { name: 'Organic Fields', orders: 64, revenue: '₹1,76,800' }
    ],
    transporters: [
      { name: 'Express Delivery', deliveries: 245, rating: 4.8 },
      { name: 'Quick Transport', deliveries: 198, rating: 4.6 },
      { name: 'City Logistics', deliveries: 167, rating: 4.7 }
    ]
  };

  const SimpleChart = ({ data, color = 'bg-blue-500' }: { data: number[], color?: string }) => (
    <div className="flex items-end justify-between h-32 space-x-1">
      {data.slice(-12).map((value, index) => {
        const maxValue = Math.max(...data);
        const height = (value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full ${color} rounded-t-sm transition-all duration-300 hover:opacity-80`}
              style={{ height: `${height}%` }}
            ></div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.overview.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <SimpleChart data={analyticsData.userGrowth} color="bg-blue-500" />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">+18%</div>
            <div className="text-sm text-gray-600">Growth this month</div>
          </div>
        </div>

        {/* Order Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Volume</h3>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <SimpleChart data={analyticsData.orderVolume} color="bg-green-500" />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-600">Orders today</div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <DollarSign className="w-5 h-5 text-yellow-500" />
          </div>
          <SimpleChart data={analyticsData.revenueData} color="bg-purple-500" />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-900">₹62K</div>
            <div className="text-sm text-gray-600">Revenue today</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Vendors */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
          <div className="space-y-4">
            {topPerformers.vendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{vendor.name}</div>
                  <div className="text-sm text-gray-600">{vendor.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{vendor.revenue}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-4">
            {topPerformers.suppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-600">{supplier.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{supplier.revenue}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Transporters */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Transporters</h3>
          <div className="space-y-4">
            {topPerformers.transporters.map((transporter, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{transporter.name}</div>
                  <div className="text-sm text-gray-600">{transporter.deliveries} deliveries</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{transporter.rating}⭐</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">342</div>
            <div className="text-sm text-gray-600">North Delhi</div>
            <div className="text-xs text-gray-500">28% of total orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">298</div>
            <div className="text-sm text-gray-600">South Delhi</div>
            <div className="text-xs text-gray-500">24% of total orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">256</div>
            <div className="text-sm text-gray-600">Central Delhi</div>
            <div className="text-xs text-gray-500">21% of total orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">189</div>
            <div className="text-sm text-gray-600">East Delhi</div>
            <div className="text-xs text-gray-500">15% of total orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}