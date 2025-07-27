import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  unit: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    rating: number;
    totalReviews: number;
    availability: 'in-stock' | 'low-stock' | 'out-of-stock';
    distance: number;
    minOrder: number;
    bulkDiscount?: {
      minQuantity: number;
      discount: number;
    };
  }[];
}

export interface AIInsights {
  priceAnalysis: {
    currentPrice: {
      average: number;
      minimum: number;
      maximum: number;
      variability: number;
    };
    trend: {
      trend: string;
      forecast: string;
      confidence: number;
      factors: string[];
      advice: string;
    };
    bestDeal: any;
    priceComparison: any[];
  };
  demandPrediction: {
    score: number;
    level: string;
    factors: any;
    prediction: any;
  };
  qualityScore: {
    averageScore: number;
    topSupplier: any;
    allScores: any[];
    recommendation: string;
  };
  recommendations: {
    count: number;
    items: Array<{
      type: string;
      title: string;
      description: string;
      priority: string;
      action: string;
    }>;
    summary: string;
  };
  marketTrends: {
    count: number;
    trends: any[];
    overall: string;
  };
  riskAssessment: {
    overallRisk: string;
    riskScore: number;
    risks: any[];
    recommendation: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  supplierId: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  orderType: 'individual' | 'group';
  deliveryAddress: {
    street: string;
    coordinates: [number, number];
  };
  estimatedDelivery?: Date;
}

export interface Order {
  _id: string;
  orderNumber: string;
  vendor: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderType: 'individual' | 'group';
  deliveryAddress: any;
  estimatedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Methods
export const apiService = {
  // Authentication
  auth: {
    login: async (identifier: string, password: string) => {
      const response = await api.post('/auth/login', { identifier, password });
      return response.data;
    },
    
    register: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    
    getProfile: async () => {
      const response = await api.get('/auth/profile');
      return response.data;
    },
    
    updateProfile: async (userData: any) => {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    },
  },

  // Products
  products: {
    getAll: async (params?: {
      latitude?: number;
      longitude?: number;
      radius?: number;
      category?: string;
      search?: string;
    }) => {
      const response = await api.get('/products', { params });
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    
    getInsights: async (id: string) => {
      const response = await api.get(`/products/${id}/insights`);
      return response.data;
    },
    
    getSuppliers: async (id: string, params?: {
      latitude?: number;
      longitude?: number;
    }) => {
      const response = await api.get(`/products/${id}/suppliers`, { params });
      return response.data;
    },
  },

  // Orders
  orders: {
    create: async (orderData: CreateOrderRequest) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    
    getAll: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    
    track: async (id: string) => {
      const response = await api.get(`/orders/${id}/track`);
      return response.data;
    },
    
    cancel: async (id: string) => {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    },
    
    joinGroup: async (id: string, items: OrderItem[]) => {
      const response = await api.post(`/orders/${id}/join`, { items });
      return response.data;
    },
  },

  // Vendors
  vendors: {
    getDashboard: async () => {
      const response = await api.get('/vendors/dashboard');
      return response.data;
    },
    
    getNearby: async (params: {
      latitude: number;
      longitude: number;
      radius?: number;
    }) => {
      const response = await api.get('/vendors/nearby', { params });
      return response.data;
    },
    
    getAnalytics: async (period?: string) => {
      const response = await api.get('/vendors/analytics', { 
        params: { period } 
      });
      return response.data;
    },
  },
};

export default api;
