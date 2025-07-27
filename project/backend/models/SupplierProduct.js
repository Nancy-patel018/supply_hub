const mongoose = require('mongoose');

const SupplierProductSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  maxOrderQuantity: {
    type: Number,
    default: null
  },
  priceHistory: [{
    price: Number,
    date: { type: Date, default: Date.now },
    reason: String // 'market_change', 'seasonal', 'manual_update'
  }],
  discounts: [{
    type: {
      type: String,
      enum: ['bulk', 'seasonal', 'clearance', 'loyalty']
    },
    minQuantity: Number,
    discount: Number, // percentage
    validFrom: Date,
    validTo: Date,
    isActive: { type: Boolean, default: true }
  }],
  delivery: {
    estimatedTime: {
      min: Number, // in hours
      max: Number
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    freeDeliveryAbove: Number,
    availableAreas: [{
      pincode: String,
      city: String,
      deliveryTime: Number // in hours
    }]
  },
  quality: {
    grade: String,
    certifications: [String], // 'organic', 'iso', 'fssai'
    qualityScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // AI-generated insights
  aiInsights: {
    priceCompetitiveness: String, // 'low', 'average', 'high'
    demandPrediction: String, // 'increasing', 'decreasing', 'stable'
    recommendedAction: String,
    lastUpdated: Date
  },
  // Performance metrics
  metrics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    deliveryRating: { type: Number, default: 0 },
    qualityRating: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound indexes
SupplierProductSchema.index({ supplier: 1, product: 1 }, { unique: true });
SupplierProductSchema.index({ product: 1, price: 1 });
SupplierProductSchema.index({ 
  'delivery.availableAreas.pincode': 1, 
  isAvailable: 1, 
  isActive: 1 
});

// Virtual for price change percentage
SupplierProductSchema.virtual('priceChangePercentage').get(function() {
  if (this.priceHistory.length < 2) return 0;
  
  const current = this.price;
  const previous = this.priceHistory[this.priceHistory.length - 2].price;
  
  return ((current - previous) / previous) * 100;
});

// Method to add price history
SupplierProductSchema.methods.updatePrice = function(newPrice, reason = 'manual_update') {
  this.priceHistory.push({
    price: this.price,
    date: new Date(),
    reason: reason
  });
  this.price = newPrice;
};

// Method to check if bulk discount applies
SupplierProductSchema.methods.getBulkDiscount = function(quantity) {
  const activeDiscounts = this.discounts.filter(d => 
    d.isActive && 
    d.type === 'bulk' && 
    quantity >= d.minQuantity &&
    (!d.validTo || d.validTo > new Date())
  );
  
  if (activeDiscounts.length === 0) return 0;
  
  // Return highest applicable discount
  return Math.max(...activeDiscounts.map(d => d.discount));
};

module.exports = mongoose.model('SupplierProduct', SupplierProductSchema);
