import React, { useState } from 'react';
import Layout from '../shared/Layout';
import AdminSidebar from './AdminSidebar';
import UserManagement from './UserManagement';
import SystemAnalytics from './SystemAnalytics';
import { Users, Package, Truck, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const stats = [
    { label: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', change: '+12%' },
    { label: 'Active Orders', value: '156', icon: Package, color: 'text-green-600', bg: 'bg-green-100', change: '+8%' },
    { label: 'Transporters', value: '42', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', change: '+3%' },
    { label: 'Monthly Revenue', value: '₹12.5L', icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100', change: '+24%' }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High demand for onions in North Delhi area', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'New supplier registration pending approval', time: '4 hours ago' },
    { id: 3, type: 'error', message: 'Payment gateway timeout issues reported', time: '6 hours ago' }
  ];

  const recentActivity = [
    { id: 1, action: 'New vendor registered', user: 'Raj Kumar', time: '10 mins ago', type: 'user' },
    { id: 2, action: 'Order completed', user: 'Green Valley Farms → Street Delights', time: '25 mins ago', type: 'order' },
    { id: 3, action: 'Supplier updated inventory', user: 'Fresh Harvest Co.', time: '1 hour ago', type: 'inventory' },
    { id: 4, action: 'Transporter completed delivery', user: 'Express Delivery', time: '2 hours ago', type: 'delivery' }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <SystemAnalytics />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className={`text-sm mt-1 ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* System Alerts */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'error' ? 'bg-red-50 border-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${
                          alert.type === 'error' ? 'text-red-500' :
                          alert.type === 'warning' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Vendors</span>
                    <span className="font-semibold text-gray-900">1,024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Suppliers</span>
                    <span className="font-semibold text-gray-900">182</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Orders</span>
                    <span className="font-semibold text-gray-900">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Approvals</span>
                    <span className="font-semibold text-red-600">7</span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'delivery' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveView('users')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Users</span>
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Analytics</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Monitor Orders</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center">
                  <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Track Deliveries</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      title="Admin Dashboard"
      sidebar={<AdminSidebar activeView={activeView} setActiveView={setActiveView} />}
    >
      {renderContent()}
    </Layout>
  );
}