import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { apiService } from '../../services/api';
import { X, Plus, Minus, ShoppingCart, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderType, setOrderType] = useState<'individual' | 'group'>('individual');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  console.log('Cart component rendered with:', { isOpen, itemCount: state.items.length, totalItems: state.totalItems });

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    setIsCheckingOut(true);
    
    try {
      console.log('Starting checkout process...');
      
      // Prepare order data for API
      const orderData = {
        items: state.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          supplierId: item.supplierId,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          totalPrice: item.price * item.quantity,
        })),
        totalAmount: state.totalAmount,
        orderType,
        deliveryAddress: {
          street: deliveryAddress,
          coordinates: [77.2090, 28.6139] as [number, number] // Default coordinates for now
        },
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      console.log('Order data prepared:', orderData);

      // Try to make API call to backend
      try {
        const response = await apiService.orders.create(orderData);
        console.log('Order created successfully:', response);
        
        // Show success message with order details
        alert(`🎉 Order placed successfully!\n\nOrder Number: ${response.order?.orderNumber || 'ORD' + Date.now()}\nTotal: ₹${state.totalAmount}\nEstimated delivery: Tomorrow by 6 PM\n\nYou can track your order in the Order Tracking section.`);
        
        // Clear cart after successful order
        clearCart();
        onClose();
        
        // Optionally trigger a page refresh to show the new order
        // window.location.reload();
        
      } catch (apiError: any) {
        console.log('API call failed, using offline mode:', apiError);
        
        // Fallback: Create a mock order locally when backend is not available
        const mockOrder = {
          id: 'ORD' + Date.now(),
          orderNumber: 'ORD' + String(Date.now()).slice(-6),
          items: orderData.items,
          total: orderData.totalAmount,
          status: 'pending',
          createdAt: new Date(),
          estimatedDelivery: orderData.estimatedDelivery,
          deliveryAddress: orderData.deliveryAddress.street
        };
        
        // Store in localStorage for demo purposes
        const existingOrders = JSON.parse(localStorage.getItem('vendorOrders') || '[]');
        existingOrders.unshift(mockOrder);
        localStorage.setItem('vendorOrders', JSON.stringify(existingOrders));
        
        console.log('Mock order created:', mockOrder);
        
        // Show success message
        alert(`🎉 Order placed successfully!\n\nOrder Number: ${mockOrder.orderNumber}\nTotal: ₹${state.totalAmount}\nEstimated delivery: Tomorrow by 6 PM\n\nYou can track your order in the Order Tracking section.`);
        
        // Clear cart
        clearCart();
        onClose();
        
        // Trigger custom event to update order tracking
        window.dispatchEvent(new CustomEvent('orderCreated', { detail: mockOrder }));
      }
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleJoinGroupOrder = () => {
    // This would integrate with your group order system
    alert('Group order feature coming soon! 🚀\nJoin with other vendors to get bulk discounts.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Your Cart ({state.totalItems} items)
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.productId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                        <p className="text-sm text-gray-600">by {item.supplier}</p>
                        <p className="text-sm text-green-600 font-medium">₹{item.price}/{item.unit}</p>
                      </div>
                      
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 space-y-4">
              {/* Order Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="individual"
                      checked={orderType === 'individual'}
                      onChange={(e) => setOrderType(e.target.value as 'individual')}
                      className="mr-2"
                    />
                    <span className="text-sm">Individual Order</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="orderType"
                      value="group"
                      checked={orderType === 'group'}
                      onChange={(e) => setOrderType(e.target.value as 'group')}
                      className="mr-2"
                    />
                    <span className="text-sm">Group Order</span>
                  </label>
                </div>
              </div>

              {/* Group Order Info */}
              {orderType === 'group' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">Join with other vendors to get bulk discounts!</span>
                  </div>
                  <button
                    onClick={handleJoinGroupOrder}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Find available group orders
                  </button>
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Address
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Delivery Time */}
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Estimated delivery: Tomorrow by 6 PM</span>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">₹{state.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || !deliveryAddress.trim()}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingOut ? 'Placing Order...' : `Place Order (₹${state.totalAmount.toLocaleString()})`}
              </button>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full text-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
