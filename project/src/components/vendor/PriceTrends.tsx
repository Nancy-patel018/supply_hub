import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

export default function PriceTrends() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedProduct, setSelectedProduct] = useState('onions');

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const products = [
    { id: 'onions', name: 'Onions', currentPrice: 25, change: +5.2, trend: 'up' },
    { id: 'tomatoes', name: 'Tomatoes', currentPrice: 30, change: -3.1, trend: 'down' },
    { id: 'potatoes', name: 'Potatoes', currentPrice: 20, change: +1.8, trend: 'up' },
    { id: 'flour', name: 'Wheat Flour', currentPrice: 45, change: +2.5, trend: 'up' },
    { id: 'oil', name: 'Sunflower Oil', currentPrice: 120, change: -4.2, trend: 'down' },
    { id: 'rice', name: 'Basmati Rice', currentPrice: 80, change: +0.8, trend: 'up' }
  ];

  const marketInsights = [
    {
      title: 'Seasonal Availability',
      description: 'Onion prices expected to rise next month due to seasonal demand',
      type: 'warning',
      action: 'Stock up now to save 15-20%'
    },
    {
      title: 'Best Deals',
      description: 'Tomato prices are 20% lower than average this week',
      type: 'success',
      action: 'Great time to buy in bulk'
    },
    {
      title: 'Supply Update',
      description: 'New supplier added with competitive wheat flour prices',
      type: 'info',
      action: 'Compare and switch to save costs'
    }
  ];

  const priceHistory = {
    onions: [22, 23, 25, 24, 26, 25, 25],
    tomatoes: [32, 31, 30, 29, 31, 30, 30],
    potatoes: [19, 20, 19, 20, 21, 20, 20],
    flour: [43, 44, 45, 44, 45, 46, 45],
    oil: [125, 123, 120, 122, 119, 121, 120],
    rice: [79, 80, 79, 81, 80, 80, 80]
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const selectedHistory = priceHistory[selectedProduct as keyof typeof priceHistory];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Price Trends & Market Insights</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        {marketInsights.map((insight, index) => (
          <div key={index} className={`p-6 rounded-xl border-l-4 ${
            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            insight.type === 'success' ? 'bg-green-50 border-green-400' :
            'bg-blue-50 border-blue-400'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
            <p className={`text-sm font-medium ${
              insight.type === 'warning' ? 'text-yellow-700' :
              insight.type === 'success' ? 'text-green-700' :
              'text-blue-700'
            }`}>
              💡 {insight.action}
            </p>
          </div>
        ))}
      </div>

      {/* Price Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product.id)}
            className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
              selectedProduct === product.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <div className={`flex items-center space-x-1 ${
                product.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                <span className="text-sm font-medium">{Math.abs(product.change)}%</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{product.currentPrice}</div>
                <div className="text-sm text-gray-600">per kg</div>
              </div>
              <div className="w-16 h-8 bg-gray-100 rounded flex items-end justify-center">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Price Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedProductData?.name} Price History
          </h3>
          <div className={`flex items-center space-x-2 ${
            selectedProductData?.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {selectedProductData?.trend === 'up' ? 
              <TrendingUp className="w-5 h-5" /> : 
              <TrendingDown className="w-5 h-5" />
            }
            <span className="font-medium">
              {selectedProductData?.change > 0 ? '+' : ''}{selectedProductData?.change}% this week
            </span>
          </div>
        </div>

        {/* Simple Price Chart */}
        <div className="relative h-64 border border-gray-200 rounded-lg p-4">
          <div className="flex items-end justify-between h-full space-x-2">
            {selectedHistory.map((price, index) => {
              const maxPrice = Math.max(...selectedHistory);
              const minPrice = Math.min(...selectedHistory);
              const height = ((price - minPrice) / (maxPrice - minPrice)) * 200 + 20;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">₹{price}</div>
                  <div
                    className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">
                    {index === 6 ? 'Today' : `${7-index}d ago`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Statistics */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">₹{Math.max(...selectedHistory)}</div>
            <div className="text-sm text-gray-600">Week High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">₹{Math.min(...selectedHistory)}</div>
            <div className="text-sm text-gray-600">Week Low</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ₹{(selectedHistory.reduce((a, b) => a + b, 0) / selectedHistory.length).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
        </div>
      </div>
    </div>
  );
}