import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import VendorSidebar from './VendorSidebar';
import ProductListing from './ProductListing';
import OrderTracking from './OrderTracking';
import PriceTrends from './PriceTrends';
import { ShoppingCart, TrendingUp, Package, Star } from 'lucide-react';

interface StoredOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: Date;
  deliveryAddress?: string;
}

export default function VendorDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [recentOrders, setRecentOrders] = useState([
    { id: 'ORD001', supplier: 'Green Valley Farms', items: 'Onions, Tomatoes', status: 'Delivered', date: '2025-01-10', amount: '₹1,200' },
    { id: 'ORD002', supplier: 'Fresh Harvest Co.', items: 'Potatoes, Carrots', status: 'In Transit', date: '2025-01-12', amount: '₹800' },
    { id: 'ORD003', supplier: 'Organic Fields', items: 'Flour, Oil', status: 'Processing', date: '2025-01-13', amount: '₹2,100' }
  ]);
  const [stats, setStats] = useState([
    { label: 'Active Orders', value: '12', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Spent', value: '₹45,600', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Avg Rating', value: '4.8', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Savings', value: '₹8,200', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' }
  ]);

  // Calculate actual stats from orders
  const calculateStats = (orders: StoredOrder[]) => {
    // Combine stored orders with some default historical data for realistic totals
    const defaultHistoricalSpending = 42500; // Previous orders total
    const defaultHistoricalSavings = 7800;   // Previous savings
    
    const activeOrders = orders.filter(order => 
      order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit'
    ).length;
    
    const totalFromNewOrders = orders.reduce((sum, order) => sum + order.total, 0);
    const totalSpent = defaultHistoricalSpending + totalFromNewOrders;
    
    // Calculate average rating (simulated based on order completion)
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const totalOrders = orders.length + 8; // Add some historical orders
    const avgRating = totalOrders > 0 ? (4.6 + (deliveredOrders * 0.2)).toFixed(1) : '4.8';
    
    // Calculate savings (roughly 15% of total spent as market comparison savings)
    const newSavings = Math.round(totalFromNewOrders * 0.15);
    const totalSavings = defaultHistoricalSavings + newSavings;

    return [
      { 
        label: 'Active Orders', 
        value: (activeOrders + 8).toString(), // Add some base active orders
        icon: Package, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100' 
      },
      { 
        label: 'Total Spent', 
        value: `₹${totalSpent.toLocaleString()}`, 
        icon: ShoppingCart, 
        color: 'text-green-600', 
        bg: 'bg-green-100' 
      },
      { 
        label: 'Avg Rating', 
        value: avgRating, 
        icon: Star, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100' 
      },
      { 
        label: 'Savings', 
        value: `₹${totalSavings.toLocaleString()}`, 
        icon: TrendingUp, 
        color: 'text-purple-600', 
        bg: 'bg-purple-100' 
      }
    ];
  };

  // Load and listen for new orders
  useEffect(() => {
    const loadRecentOrders = () => {
      try {
        const storedOrders: StoredOrder[] = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
        
        // Update stats based on actual orders
        const newStats = calculateStats(storedOrders);
        setStats(newStats);
        
        // Convert stored orders to the format expected by the dashboard
        const formattedStoredOrders = storedOrders.slice(0, 3).map(order => ({
          id: order.orderNumber,
          supplier: 'Your Order', // Since these are user's own orders
          items: order.items.map(item => item.productName).join(', '),
          status: order.status === 'pending' ? 'Processing' : 
                 order.status === 'delivered' ? 'Delivered' : 
                 order.status === 'in_transit' ? 'In Transit' : 'Processing',
          date: new Date(order.createdAt).toLocaleDateString(),
          amount: `₹${order.total.toLocaleString()}`
        }));

        // Combine with default orders, showing stored orders first
        const defaultOrders = [
          { id: 'ORD001', supplier: 'Green Valley Farms', items: 'Onions, Tomatoes', status: 'Delivered', date: '2025-01-10', amount: '₹1,200' },
          { id: 'ORD002', supplier: 'Fresh Harvest Co.', items: 'Potatoes, Carrots', status: 'In Transit', date: '2025-01-12', amount: '₹800' },
          { id: 'ORD003', supplier: 'Organic Fields', items: 'Flour, Oil', status: 'Processing', date: '2025-01-13', amount: '₹2,100' }
        ];

        const allOrders = [...formattedStoredOrders, ...defaultOrders].slice(0, 3);
        setRecentOrders(allOrders);
        
        console.log('Dashboard updated - Orders:', allOrders.length, 'Stats:', newStats);
      } catch (error) {
        console.error('Error loading recent orders:', error);
      }
    };

    // Load initially
    loadRecentOrders();

    // Listen for new orders
    const handleOrderCreated = () => {
      console.log('Dashboard detected new order, refreshing...');
      setTimeout(loadRecentOrders, 100); // Small delay to ensure localStorage is updated
    };

    window.addEventListener('orderCreated', handleOrderCreated);
    
    // Also listen for storage changes (in case user has multiple tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'vendorOrders') {
        loadRecentOrders();
      }
    });

    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
      window.removeEventListener('storage', loadRecentOrders);
    };
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return <ProductListing />;
      case 'orders':
        return <OrderTracking />;
      case 'trends':
        return <PriceTrends />;
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
                  onClick={() => setActiveView('products')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Browse Products</span>
                </button>
                <button
                  onClick={() => setActiveView('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Track Orders</span>
                </button>
                <button
                  onClick={() => setActiveView('trends')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
                >
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Price Trends</span>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => setActiveView('orders')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Supplier</th>
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
                        <td className="py-3 text-sm text-gray-600">{order.supplier}</td>
                        <td className="py-3 text-sm text-gray-600">{order.items}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
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
      title="Vendor Dashboard"
      sidebar={<VendorSidebar activeView={activeView} setActiveView={setActiveView} />}
    >
      {renderContent()}
    </Layout>
  );
}