const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'grains', 'oils', 'spices', 'dairy', 'meat', 'seafood', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'quintal', 'ton']
  },
  specifications: {
    origin: String,
    variety: String,
    grade: String,
    shelfLife: String,
    storageConditions: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  // Market data for AI insights
  marketData: {
    averagePrice: Number,
    priceHistory: [{
      date: Date,
      price: Number,
      source: String
    }],
    seasonality: {
      peak: [Number], // months (1-12)
      low: [Number]
    },
    demandTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    }
  }
}, {
  timestamps: true
});

// Text search index
ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ 'marketData.averagePrice': 1 });

module.exports = mongoose.model('Product', ProductSchema);
