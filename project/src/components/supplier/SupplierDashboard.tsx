import React, { useState } from 'react';
import Layout from '../shared/Layout';
import SupplierSidebar from './SupplierSidebar';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function SupplierDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const stats = [
    { label: 'Total Products', value: '24', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Orders', value: '18', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Customers', value: '156', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Monthly Revenue', value: '₹2,45,600', icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100' }
  ];

  const recentOrders = [
    { id: 'ORD001', vendor: 'Raj Kumar', items: 'Onions (10kg), Tomatoes (5kg)', status: 'Pending', date: '2025-01-13', amount: '₹400' },
    { id: 'ORD002', vendor: 'Priya Foods', items: 'Potatoes (15kg)', status: 'Confirmed', date: '2025-01-13', amount: '₹300' },
    { id: 'ORD003', vendor: 'Street Delights', items: 'Flour (8kg), Oil (2L)', status: 'Shipped', date: '2025-01-12', amount: '₹600' }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
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
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bg}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveView('inventory')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Manage Inventory</span>
                </button>
                <button
                  onClick={() => setActiveView('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Orders</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Customer Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => setActiveView('orders')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Vendor</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="py-3 text-sm text-gray-600">{order.vendor}</td>
                        <td className="py-3 text-sm text-gray-600">{order.items}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">{order.date}</td>
                        <td className="py-3 text-sm font-medium text-gray-900">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      title="Supplier Dashboard"
      sidebar={<SupplierSidebar activeView={activeView} setActiveView={setActiveView} />}
    >
      {renderContent()}
    </Layout>
  );
}