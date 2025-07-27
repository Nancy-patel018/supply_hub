import React, { useState, useEffect } from 'react';
import Layout from '../shared/Layout';
import TransporterSidebar from './TransporterSidebar';
// import DeliveryRoutes from './DeliveryRoutes';
import { Truck, MapPin, Clock, DollarSign } from 'lucide-react';

interface VendorOrder {
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
  deliveryAddress: string;
  estimatedDelivery: Date;
}

export default function TransporterDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [availableOrders, setAvailableOrders] = useState<VendorOrder[]>([]);
  const [transporterLocation] = useState('Gujarat'); // This would come from user profile

  // Load vendor orders that need transportation
  useEffect(() => {
    const loadAvailableOrders = () => {
      try {
        const vendorOrders: VendorOrder[] = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
        
        // Filter orders that need transportation (pending or processing status)
        const ordersNeedingTransport = vendorOrders.filter(order => 
          order.status === 'pending' || order.status === 'processing'
        );
        
        setAvailableOrders(ordersNeedingTransport);
        console.log('Transporter dashboard loaded orders:', ordersNeedingTransport);
      } catch (error) {
        console.error('Error loading orders for transporter:', error);
      }
    };

    loadAvailableOrders();

    // Listen for new orders
    const handleOrderCreated = () => {
      setTimeout(loadAvailableOrders, 200);
    };

    window.addEventListener('orderCreated', handleOrderCreated);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, []);

  // Calculate dynamic stats based on available orders
  const calculateStats = () => {
    const todayOrders = availableOrders.filter(order => 
      new Date(order.createdAt).toDateString() === new Date().toDateString()
    );
    
    const totalEarnings = availableOrders.reduce((sum, order) => {
      // Calculate estimated transport earnings (10% of order value)
      return sum + (order.total * 0.1);
    }, 0);

    return [
      { 
        label: 'Available Orders', 
        value: availableOrders.length.toString(), 
        icon: Truck, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100' 
      },
      { 
        label: `${transporterLocation} Routes`, 
        value: Math.ceil(availableOrders.length / 3).toString(), 
        icon: MapPin, 
        color: 'text-green-600', 
        bg: 'bg-green-100' 
      },
      { 
        label: 'Today\'s Orders', 
        value: todayOrders.length.toString(), 
        icon: Clock, 
        color: 'text-purple-600', 
        bg: 'bg-purple-100' 
      },
      { 
        label: 'Potential Earnings', 
        value: `₹${Math.round(totalEarnings).toLocaleString()}`, 
        icon: DollarSign, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100' 
      }
    ];
  };

  const stats = calculateStats();

  // Convert vendor orders to delivery format with Gujarat focus
  const activeDeliveries = availableOrders.slice(0, 5).map((order, index) => {
    const gujaratiAreas = [
      'Ahmedabad - Maninagar', 'Surat - Varachha', 'Vadodara - Alkapuri', 
      'Rajkot - Kalawad Road', 'Gandhinagar - Sector 15'
    ];
    
    return {
      id: order.orderNumber,
      vendor: `Vendor ${index + 1}`,
      address: order.deliveryAddress || gujaratiAreas[index % gujaratiAreas.length],
      status: order.status === 'pending' ? 'available' : 'assigned',
      time: new Date(order.createdAt).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      items: order.items.length,
      earnings: `₹${Math.round(order.total * 0.1)}`,
      distance: `${Math.floor(Math.random() * 15) + 5} km`,
      orderValue: `₹${order.total}`,
      priority: order.total > 100 ? 'high' : order.total > 50 ? 'medium' : 'low'
    };
  });

  const renderContent = () => {
    switch (activeView) {
      case 'routes':
        //  return <DeliveryRoutes />;
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
                  onClick={() => setActiveView('routes')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Routes</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
                  <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Update Status</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View History</span>
                </button>
              </div>
            </div>

            {/* Available Orders - Gujarat Region */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Available Orders - {transporterLocation}</h3>
                  <p className="text-sm text-gray-600">Orders from local vendors needing transportation</p>
                </div>
                <button
                  onClick={() => setActiveView('routes')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All Routes
                </button>
              </div>
              
              {availableOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Available</h4>
                  <p className="text-gray-600">New delivery requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-medium text-gray-900">Order #{delivery.id}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.priority === 'high' ? 'bg-red-100 text-red-800' :
                              delivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {delivery.priority} priority
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.status === 'available' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {delivery.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {delivery.address}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{delivery.earnings}</div>
                          <div className="text-xs text-gray-500">Transport Fee</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Order Value:</span>
                          <div className="font-medium">{delivery.orderValue}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <div className="font-medium">{delivery.items} products</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Distance:</span>
                          <div className="font-medium">{delivery.distance}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Placed:</span>
                          <div className="font-medium">{delivery.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Minimum cost route optimized for {transporterLocation} region
                        </div>
                        
                        <div className="flex space-x-2">
                          {delivery.status === 'available' && (
                            <>
                              <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                                Accept Order
                              </button>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                                View Details
                              </button>
                            </>
                          )}
                          {delivery.status === 'assigned' && (
                            <>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                                Start Delivery
                              </button>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                                Call Vendor
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {availableOrders.length > 5 && (
                    <div className="text-center pt-4">
                      <button 
                        onClick={() => setActiveView('routes')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View {availableOrders.length - 5} more orders →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout
      title="Transporter Dashboard"
      sidebar={<TransporterSidebar activeView={activeView} setActiveView={setActiveView} />}
    >
      {renderContent()}
    </Layout>
  );
}