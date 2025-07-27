const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    supplierProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierProduct',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: String,
    contactPerson: String,
    contactPhone: String
  },
  status: {
    type: String,
    enum: [
      'pending',        // Order placed, waiting for supplier confirmation
      'confirmed',      // Supplier confirmed the order
      'processing',     // Supplier is preparing the order
      'ready',          // Order is ready for pickup/delivery
      'dispatched',     // Order has been dispatched
      'in_transit',     // Order is being delivered
      'delivered',      // Order delivered successfully
      'cancelled',      // Order cancelled
      'rejected',       // Supplier rejected the order
      'refunded'        // Order refunded
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'card', 'wallet', 'net_banking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    gateway: String,
    paidAt: Date,
    failureReason: String
  },
  delivery: {
    type: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'delivery'
    },
    estimatedTime: Date,
    actualTime: Date,
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    trackingNumber: String,
    deliveryInstructions: String
  },
  // Group order information
  groupOrder: {
    isGroupOrder: { type: Boolean, default: false },
    groupId: String,
    participants: [{
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      quantity: Number,
      status: {
        type: String,
        enum: ['joined', 'confirmed', 'cancelled'],
        default: 'joined'
      }
    }],
    discount: Number,
    minQuantity: Number,
    currentQuantity: Number,
    expiresAt: Date
  },
  notes: {
    vendor: String,
    supplier: String,
    internal: String
  },
  feedback: {
    vendor: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date
    },
    supplier: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date
    }
  },
  // AI-generated insights
  aiInsights: {
    deliveryOptimization: String,
    priceAlert: String,
    qualityPrediction: String,
    riskAssessment: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
OrderSchema.index({ vendor: 1, createdAt: -1 });
OrderSchema.index({ 'items.supplier': 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'groupOrder.groupId': 1 });

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order created'
    });
  }
  next();
});

// Method to update status
OrderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
};

// Virtual for order age
OrderSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Method to calculate estimated delivery time
OrderSchema.methods.calculateEstimatedDelivery = function() {
  // Logic to calculate delivery time based on supplier location, vendor location, etc.
  const baseTime = 2; // 2 hours base time
  const processingTime = 1; // 1 hour processing time
  
  return new Date(Date.now() + (baseTime + processingTime) * 60 * 60 * 1000);
};

module.exports = mongoose.model('Order', OrderSchema);
