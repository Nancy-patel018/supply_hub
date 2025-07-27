# Street Food Vendor Platform - Backend API

🍛 **A comprehensive backend system for connecting street food vendors with suppliers through a digital supply chain platform.**

## 🚀 Features

### 👨‍🍳 Vendor Flow
- **Simple Authentication**: Email/Phone and password login
- **Product Discovery**: Browse products from nearby suppliers
- **Supplier Comparison**: Compare prices, ratings, and availability
- **AI-Powered Insights**: Get intelligent price predictions using Gemini AI
- **Group Orders**: Join group orders to get bulk discounts
- **Real-time Tracking**: Track orders from placement to delivery
- **Analytics Dashboard**: View order history and business insights

### 🏪 Supplier Management
- **Inventory Management**: Manage product catalog and stock levels
- **Order Processing**: Process and fulfill vendor orders
- **Price Management**: Set competitive pricing with bulk discounts
- **Analytics**: Track sales, popular products, and vendor relationships

### 🚛 Transportation & Logistics
- **Route Optimization**: Efficient delivery route planning
- **Real-time Tracking**: GPS-based order tracking
- **Delivery Management**: Manage delivery schedules and assignments

### 🤖 AI & Intelligence
- **Price Prediction**: Gemini AI-based price forecasting
- **Market Analysis**: Supply-demand analytics
- **Quality Scoring**: AI-powered supplier rating system
- **Personalized Recommendations**: Tailored product suggestions using Gemini AI

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with simple email/password login
- **Real-time**: Socket.IO for live updates
- **AI Services**: Google Gemini AI for insights
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer with validation
- **Environment**: dotenv configuration

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Gemini API key (optional, for AI features)

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following required variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/streetfood_vendor_platform
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Optional for AI features
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "role": "vendor",
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "securepassword123"
}
```

### 🛍 Product Endpoints

#### Browse Products
```http
GET /api/products?latitude=28.6139&longitude=77.2090&radius=10&category=vegetables
Authorization: Bearer <token>
```

#### Get Product with AI Insights
```http
GET /api/products/:id/insights
Authorization: Bearer <token>
```

#### Compare Suppliers
```http
GET /api/products/:id/suppliers?latitude=28.6139&longitude=77.2090
Authorization: Bearer <token>
```

### 📋 Order Management

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "supplierId": "supplier_id",
      "quantity": 10,
      "unit": "kg"
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "coordinates": [77.2090, 28.6139]
  },
  "orderType": "individual"
}
```

#### Track Order
```http
GET /api/orders/:id/track
Authorization: Bearer <token>
```

#### Join Group Order
```http
POST /api/orders/:id/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 5,
      "unit": "kg"
    }
  ]
}
```

### 👨‍🍳 Vendor Endpoints

#### Get Dashboard Stats
```http
GET /api/vendors/dashboard
Authorization: Bearer <token>
```

#### Find Nearby Vendors
```http
GET /api/vendors/nearby?latitude=28.6139&longitude=77.2090&radius=5
Authorization: Bearer <token>
```

#### Get Order Analytics
```http
GET /api/vendors/analytics?period=month
Authorization: Bearer <token>
```

## 🏗 Project Structure

```
backend/
├── models/                 # Database models
│   ├── User.js            # User authentication & profiles
│   ├── Product.js         # Product catalog
│   ├── SupplierProduct.js # Supplier-specific products
│   └── Order.js           # Order management
├── routes/                # API routes
│   ├── auth.js           # Authentication endpoints
│   ├── products.js       # Product management
│   ├── orders.js         # Order processing
│   └── vendors.js        # Vendor-specific features
├── middleware/           # Custom middleware
│   └── auth.js          # JWT authentication & authorization
├── utils/               # Utility modules
│   ├── sms.js          # SMS notifications via Twilio
│   ├── whatsapp.js     # WhatsApp messaging
│   ├── email.js        # Email notifications
│   ├── ai.js           # AI insights & predictions
│   └── notifications.js # Real-time notifications
├── server.js           # Main server setup
├── start.js           # Startup script with validation
└── package.json       # Dependencies & scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes |
| `EMAIL_USER` | SMTP email address | Yes |
| `EMAIL_PASS` | SMTP password | Yes |
| `FRONTEND_URL` | Frontend application URL | No |

### Database Indexes

The system automatically creates the following indexes for optimal performance:
- **Users**: Geospatial index on location, unique indexes on phone/email
- **Products**: Text index on name/description, category index
- **Orders**: Compound indexes on user+status, creation date
- **SupplierProducts**: Geospatial index on supplier location

## 🚀 Real-time Features

The system uses Socket.IO for real-time communication:

### Client Events
- `join_room` - Join user-specific room for notifications
- `order_update` - Listen for order status changes
- `group_order_invitation` - Receive group order invites

### Server Events
- `order_status_changed` - Order status updates
- `group_order_created` - New group order available
- `price_alert` - Price change notifications

## 🤖 AI Features

### Price Prediction
- Historical price analysis
- Seasonal trend detection
- Market demand forecasting
- Supply chain disruption alerts

### Smart Recommendations
- Personalized product suggestions
- Optimal order timing
- Supplier recommendations
- Bulk purchase opportunities

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request filtering
- **Helmet Security**: HTTP security headers
- **OTP Verification**: Multi-channel OTP security

## 📊 Monitoring & Logging

- **Request Logging**: All API requests logged with timestamps
- **Error Tracking**: Comprehensive error logging and handling
- **Performance Monitoring**: Response time and usage analytics
- **Database Monitoring**: Connection pool and query performance

## 🧪 Testing

```bash
# Install test dependencies
npm install --dev

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB cluster
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure log rotation
- [ ] Set up automated backups

### Docker Deployment
```bash
# Build image
docker build -t streetfood-backend .

# Run container
docker run -p 5000:5000 --env-file .env streetfood-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support and questions:
- 📧 Email: support@streetfoodvendor.com
- 💬 Slack: #streetfood-platform
- 📚 Documentation: [API Docs](docs/api.md)

---

**Built with ❤️ for the street food vendor community**
