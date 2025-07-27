import React, { useState } from 'react';
import { Check, X, Truck, Phone, MapPin, Clock } from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      vendor: { name: 'Raj Kumar', phone: '+91 9876543210', address: 'Shop 15, Food Street, Delhi' },
      items: [
        { name: 'Fresh Onions', quantity: 10, unit: 'kg', price: 25 },
        { name: 'Red Tomatoes', quantity: 5, unit: 'kg', price: 30 }
      ],
      total: 400,
      status: 'pending',
      date: '2025-01-13',
      time: '10:30 AM',
      transporter: null
    },
    {
      id: 'ORD002',
      vendor: { name: 'Priya Foods', phone: '+91 9876543211', address: 'Shop 22, Market Square, Delhi' },
      items: [
        { name: 'Fresh Potatoes', quantity: 15, unit: 'kg', price: 20 }
      ],
      total: 300,
      status: 'confirmed',
      date: '2025-01-13',
      time: '11:15 AM',
      transporter: 'Express Delivery'
    },
    {
      id: 'ORD003',
      vendor: { name: 'Street Delights', phone: '+91 9876543212', address: 'Shop 8, Food Junction, Delhi' },
      items: [
        { name: 'Wheat Flour', quantity: 8, unit: 'kg', price: 45 },
        { name: 'Sunflower Oil', quantity: 2, unit: 'liter', price: 120 }
      ],
      total: 600,
      status: 'shipped',
      date: '2025-01-12',
      time: '02:45 PM',
      transporter: 'Quick Transport'
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length }
  ];

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>

      {/* Order Status Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold">{filter.count}</div>
              <div className="text-sm font-medium">{filter.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order {order.id}</h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{order.date} at {order.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{order.items.length} items</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{order.vendor.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{order.vendor.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{order.vendor.address}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} ({item.quantity} {item.unit})</span>
                        <span className="font-medium">₹{(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transporter Info */}
              {order.transporter && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Assigned to: {order.transporter}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4">
                {order.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Order</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'rejected')}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Order</span>
                    </button>
                  </div>
                )}
                
                {order.status === 'confirmed' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Mark as Shipped</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span>Assign Transporter</span>
                    </button>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Order shipped successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}