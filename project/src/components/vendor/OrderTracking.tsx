import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date?: string;
  supplier?: string;
  transporter?: string;
  items: Array<{
    name?: string;
    productName?: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  total: number;
  totalAmount?: number;
  status: string;
  tracking?: Array<{
    status: string;
    time: string;
    date: string;
    completed: boolean;
  }>;
  deliveryLocation?: string;
  deliveryAddress?: string;
  transporterPhone?: string;
  createdAt?: Date;
  estimatedDelivery?: Date;
}

export default function OrderTracking() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage and listen for new orders
  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
      const defaultOrders = [
        {
          id: 'ORD001',
          orderNumber: 'ORD001',
          date: '2025-01-10',
          supplier: 'Green Valley Farms',
          transporter: 'Express Delivery',
          items: [
            { name: 'Fresh Onions', quantity: 10, unit: 'kg', price: 25 },
            { name: 'Red Tomatoes', quantity: 5, unit: 'kg', price: 30 }
          ],
          total: 400,
          status: 'delivered',
          tracking: [
            { status: 'Order Placed', time: '10:30 AM', date: '2025-01-10', completed: true },
            { status: 'Confirmed by Supplier', time: '11:15 AM', date: '2025-01-10', completed: true },
            { status: 'Picked by Transporter', time: '02:30 PM', date: '2025-01-10', completed: true },
            { status: 'Out for Delivery', time: '09:00 AM', date: '2025-01-11', completed: true },
            { status: 'Delivered', time: '11:45 AM', date: '2025-01-11', completed: true }
          ],
          deliveryLocation: 'Shop 15, Food Street, Delhi',
          transporterPhone: '+91 9876543210'
        },
        {
          id: 'ORD002',
          orderNumber: 'ORD002',
          date: '2025-01-12',
          supplier: 'Fresh Harvest Co.',
          transporter: 'Quick Transport',
          items: [
            { name: 'Fresh Potatoes', quantity: 8, unit: 'kg', price: 20 },
            { name: 'Carrots', quantity: 3, unit: 'kg', price: 35 }
          ],
          total: 265,
          status: 'in_transit',
          tracking: [
            { status: 'Order Placed', time: '09:15 AM', date: '2025-01-12', completed: true },
            { status: 'Confirmed by Supplier', time: '10:00 AM', date: '2025-01-12', completed: true },
            { status: 'Picked by Transporter', time: '03:20 PM', date: '2025-01-12', completed: true },
            { status: 'Out for Delivery', time: '08:30 AM', date: '2025-01-13', completed: true },
            { status: 'Delivered', time: 'Expected 12:00 PM', date: '2025-01-13', completed: false }
          ],
          deliveryLocation: 'Shop 22, Market Square, Delhi',
          transporterPhone: '+91 9876543211'
        }
      ];
      
      // Combine stored orders with default orders, with stored orders first
      const allOrders = [...storedOrders, ...defaultOrders];
      setOrders(allOrders);
    };

    loadOrders();

    // Listen for new orders
    const handleOrderCreated = (event: CustomEvent) => {
      console.log('New order received:', event.detail);
      loadOrders();
    };

    window.addEventListener('orderCreated', handleOrderCreated as EventListener);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated as EventListener);
    };
  }, []);

  const getOrderTotal = (order: Order) => {
    return order.total || order.totalAmount || 0;
  };

  const getOrderItems = (order: Order) => {
    return order.items.map(item => ({
      name: item.name || item.productName || 'Product',
      quantity: item.quantity,
      unit: item.unit,
      price: item.price
    }));
  };

  const getOrderDate = (order: Order) => {
    if (order.date) return order.date;
    if (order.createdAt) return new Date(order.createdAt).toLocaleDateString();
    return new Date().toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Your orders will appear here once you place them.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order {order.orderNumber}</h3>
                      <p className="text-gray-600">Placed on {getOrderDate(order)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">₹{getOrderTotal(order).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{order.items.length} items</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                    <div className="space-y-2">
                      {getOrderItems(order).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} ({item.quantity} {item.unit})</span>
                          <span className="font-medium">₹{(item.quantity * item.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{order.deliveryLocation || order.deliveryAddress || 'Address not specified'}</span>
                      </div>
                      {order.transporter && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{order.transporter}</span>
                        </div>
                      )}
                      {order.transporterPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{order.transporterPhone}</span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">
                            Expected: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {order.tracking && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Tracking Progress</h4>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                    
                    {selectedOrder === order.id && (
                      <div className="space-y-4">
                        {order.tracking.map((track, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                              track.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  track.completed ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {track.status}
                                </p>
                                <p className={`text-xs ${
                                  track.completed ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                  {track.time} • {track.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Simple status for new orders without tracking */}
                {!order.tracking && (
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-gray-900">Order placed successfully</span>
                      <span className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}