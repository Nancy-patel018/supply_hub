# Supply Hub - Street Food Vendor Platform

A comprehensive platform connecting street food vendors with customers and transportation services, featuring AI-powered insights and location-based optimization for Gujarat region.

## 🚀 Features

### For Vendors
- **Product Management**: Add, edit, and manage street food inventory
- **Order Processing**: Real-time order management with status tracking
- **AI Insights**: Gemini AI-powered recommendations for pricing and inventory
- **Cart System**: Complete shopping cart with localStorage persistence
- **Dashboard Analytics**: Sales tracking and performance metrics

### For Transporters
- **Gujarat-focused Routes**: Optimized delivery routes for Ahmedabad, Surat, and Vadodara
- **Real-time Orders**: Live vendor orders needing transportation
- **Cost Optimization**: Minimum cost route calculation and earnings estimation
- **Order Status Management**: Accept, pickup, and delivery status updates
- **Location-based Filtering**: Show only relevant orders based on transporter location

### For Customers/Buyers
- **Product Discovery**: Browse available street food items
- **Order Placement**: Simple ordering system with real-time updates
- **Order Tracking**: Track order status from vendor to delivery

### For System Administrators
- **User Management**: Manage vendors, transporters, and customers
- **System Analytics**: Platform-wide performance metrics
- **Content Moderation**: Oversee platform operations

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **JSON Web Tokens (JWT)** for authentication
- **Google Gemini AI** for intelligent insights
- **Email/SMS integration** for notifications

### Key Libraries
- `cors` for cross-origin requests
- `bcryptjs` for password hashing
- `mongoose` for MongoDB operations
- `nodemailer` for email services

## 📁 Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── shared/         # Shared UI components
│   │   │   ├── supplier/       # Supplier/Vendor components
│   │   │   ├── transporter/    # Transportation components
│   │   │   └── vendor/         # Vendor-specific components
│   │   ├── contexts/           # React Context providers
│   │   ├── services/           # API service functions
│   │   └── main.tsx           # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── config/                 # Database configuration
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── utils/                  # Utility functions (AI, email, SMS)
│   └── server.js              # Backend entry point
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🌟 Key Features Explained

### Gujarat Transportation Integration
- **Location-based Filtering**: Transporters see only orders from their region
- **Route Optimization**: Intelligent routing for Ahmedabad, Surat, and Vadodara
- **Cost Calculation**: Automatic transport fee calculation (10% of order value)
- **Real-time Updates**: Live order status synchronization between vendors and transporters

### AI-Powered Insights
- **Google Gemini Integration**: Smart recommendations for vendors
- **Pricing Optimization**: AI-suggested pricing based on market trends
- **Inventory Management**: Intelligent stock level recommendations

### Real-time Order Flow
1. **Vendor** adds products and receives orders
2. **Order Creation** triggers automatic transporter notification
3. **Transporter** views Gujarat-specific orders with optimized routes
4. **Status Updates** flow back to vendor and customer in real-time

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Vendors
- `GET /api/vendors` - Get vendor information
- `POST /api/vendors` - Register as vendor

## 🎯 Usage Scenarios

### Street Food Vendor Workflow
1. Register as vendor and login
2. Add street food items (samosa, pav bhaji, etc.)
3. Receive customer orders through the platform
4. Update order status and notify transporters
5. Track earnings and performance

### Transporter Workflow
1. Login and access transporter dashboard
2. View available orders in Gujarat region
3. Accept orders with optimized routes
4. Update pickup and delivery status
5. Earn transport fees based on order value

### Customer Experience
1. Browse available street food vendors
2. Add items to cart and place order
3. Track order status from preparation to delivery
4. Receive notifications at each stage

## 🌍 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Railway/Heroku)
```bash
# Set environment variables in your hosting platform
# Deploy the backend/ folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nancy Patel** - Initial work - [Nancy-patel018](https://github.com/Nancy-patel018)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent insights
- Gujarat street food vendors for inspiration
- React and Vite communities for excellent tools
- MongoDB for reliable data storage

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Note**: This platform is designed specifically for Gujarat region transportation optimization, but can be extended to other regions by modifying the location data in the transporter components.
