# NIVRA - AI Powered Women Safety App

NIVRA is a comprehensive Progressive Web Application (PWA) designed to enhance women's safety through AI-powered features, real-time emergency alerts, location tracking, and community support.

## 🌟 Features

### Core Safety Features
- **SOS Emergency Alerts**: One-tap emergency button with automatic location sharing
- **Voice Detection**: AI-powered voice command recognition for hands-free alerts
- **Shake Detection**: Automatic alert triggering through device shake detection
- **Real-time Location Tracking**: GPS-based location sharing with trusted contacts
- **Offline Emergency Support**: Works even without internet connection

### AI & Smart Features
- **AI Chatbot**: 24/7 safety guidance and support
- **Predictive Alerts**: Location-based safety suggestions
- **Voice Recognition**: Natural language processing for emergency commands
- **Smart Notifications**: Context-aware safety alerts

### Communication & Community
- **Emergency Contacts Management**: Up to 5 trusted contacts with instant notifications
- **Nearby User Alerts**: Community-based safety network
- **Real-time Messaging**: Socket.io powered instant communication
- **SMS & Call Integration**: Twilio-powered emergency communications

### User Experience
- **Progressive Web App**: Installable on mobile and desktop
- **Dark/Light Theme**: Customizable user interface
- **Responsive Design**: Mobile-first, works on all devices
- **Offline Functionality**: Service worker for offline capabilities

### Admin Features
- **Admin Dashboard**: Comprehensive system monitoring
- **User Management**: User account administration
- **Alert Monitoring**: Real-time emergency alert tracking
- **Analytics**: Usage statistics and safety insights

## 🛠 Technology Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Leaflet** - Interactive maps
- **Web Speech API** - Voice recognition

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Twilio** - SMS/Voice services
- **Bcrypt** - Password hashing

### PWA Features
- **Service Worker** - Offline functionality
- **Web App Manifest** - App installation
- **Push Notifications** - Browser notifications
- **Background Sync** - Offline data sync

## 📁 Project Structure

```
NIVRA-APP/
├── client/                 # Frontend React application
│   ├── public/            # Static assets and PWA files
│   │   ├── manifest.json  # PWA manifest
│   │   ├── service-worker.js # Service worker
│   │   └── index.html     # Main HTML file
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── database/             # Database schemas and seeds
├── .env.example          # Environment variables template
└── README.md            # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NIVRA-APP
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd ../server
   npm run dev
   ```

7. **Start the frontend application**
   ```bash
   cd ../client
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nivra-app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Twilio (Free Tier)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps (Free Tier)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Web Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@example.com

# Client URL
CLIENT_URL=http://localhost:3000
```

### Free API Services Setup

1. **Twilio (SMS/Voice)**
   - Sign up at https://www.twilio.com
   - Get free trial credits
   - Obtain Account SID, Auth Token, and Phone Number

2. **Google Maps (Optional)**
   - Create project at https://console.cloud.google.com
   - Enable Maps JavaScript API
   - Generate API key

3. **MongoDB Atlas (Cloud Database)**
   - Sign up at https://www.mongodb.com/atlas
   - Create free cluster
   - Get connection string

## 📱 PWA Installation

### Mobile Installation
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Follow the installation steps
4. Access NIVRA from your home screen

### Desktop Installation
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the installation prompt
4. Access NIVRA from your desktop

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Code Structure Guidelines
- Use functional components with hooks
- Implement proper error handling
- Follow Material-UI design patterns
- Maintain responsive design principles
- Write comprehensive tests

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers middleware

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Emergency Endpoints
- `POST /api/emergency/alert` - Send emergency alert
- `GET /api/emergency/alerts` - Get user alerts
- `PUT /api/emergency/alerts/:id/resolve` - Resolve alert
- `GET /api/emergency/safety-locations` - Get nearby safety locations

### User Management Endpoints
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/location` - Update user location
- `POST /api/user/emergency-contacts` - Add emergency contact
- `PUT /api/user/preferences` - Update user preferences

### Chatbot Endpoints
- `POST /api/chatbot/message` - Send message to AI
- `GET /api/chatbot/history` - Get chat history
- `POST /api/chatbot/feedback` - Submit feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Twilio for communication services
- OpenStreetMap for mapping services
- All contributors and testers

---

**NIVRA - Empowering Women's Safety Through Technology** 🛡️💪