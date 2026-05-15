# NIVRA - AI Powered Women Safety App 🛡️

![NIVRA Banner](https://img.shields.io/badge/NIVRA-Women%20Safety%20App-ff6b9d?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

> **Your Safety, Our Priority** — A comprehensive AI-powered women safety application with real-time emergency response, location tracking, and intelligent threat detection.

---

## 📱 Features

### 🆘 Emergency System
- **Auto Shake Detection** — 3 quick shakes trigger automatic SOS
- **Voice Recognition** — AI detects panic words ("help", "emergency", "bachao")
- **One-Touch SOS** — Emergency button with countdown timer
- **Offline SOS** — Works without internet connection
- **Auto-Call & SMS** — Automatically calls and messages emergency contacts

### 📍 Live Tracking
- **Real-time GPS** — Continuous location monitoring
- **OpenStreetMap** — Accurate location display
- **ML Safety Prediction** — AI analyzes area safety (Safe / Caution / Danger)
- **Location Sharing** — Share live location with emergency contacts

### 🤖 AI Assistant
- **24/7 Chat Support** — AI safety assistant
- **Safety Tips** — Personalized recommendations
- **Emergency Guidance** — Step-by-step emergency procedures
- **Multi-language** — Hindi & English support

### 👥 Community Features
- **Community Network** — Connect with nearby users
- **Safety Reports** — Report unsafe areas anonymously
- **Community Alerts** — Alert nearby NIVRA users

### 🔒 Security
- **Biometric Authentication** — Fingerprint/Face unlock
- **JWT Authentication** — Secure login system
- **Data Encryption** — AES-256 encryption
- **GDPR Compliant** — Privacy-first approach

### 👨‍💼 Admin Dashboard
- **User Management** — View, block, unblock users
- **Alert Monitoring** — Track emergency alerts in real-time
- **Live Tracking** — Real-time user locations
- **ML Analytics** — Safety prediction dashboard
- **System Configuration** — Emergency numbers, settings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Redux Toolkit, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| Real-time | Firebase, Socket.io |
| Maps | OpenStreetMap, Nominatim API, Leaflet.js |
| AI/ML | Web Speech API, Device Motion API, Geolocation API |
| PWA | Service Workers, Web App Manifest |

---

## 📁 Project Structure

```
NIVRA-APP/
├── client/                 # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── service-worker.js
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # App pages
│       ├── store/          # Redux store
│       ├── services/       # API services
│       ├── hooks/          # Custom hooks
│       ├── theme/          # Theme configuration
│       └── utils/          # Utility functions
├── server/                 # Node.js Backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Email service
│   └── server.js           # Entry point
├── database/
│   └── seedData.js         # Sample data
└── api/                    # Additional API
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Firebase account (for push notifications)

### 1. Clone Repository
```bash
git clone https://github.com/xSapna/NIVRA-APP.git
cd NIVRA-APP
```

### 2. Setup Client
```bash
cd client
npm install
```

### 3. Setup Server
```bash
cd ../server
npm install
```

### 4. Environment Variables

Create `.env` in `/server`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=3001
```

Create `.env` in `/client`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 5. Seed Database (Optional)
```bash
cd database
node seedData.js
```

### 6. Run Application

**Start Server:**
```bash
cd server
npm start
```

**Start Client:**
```bash
cd client
npm start
```

App will run at `http://localhost:3000`

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| User | User accounts with roles (user/admin) |
| EmergencyAlert | Emergency incidents and responses |
| SafetyLocation | Safe places (police, hospitals, etc.) |
| ChatbotLog | AI chat conversation history |

---

## 📱 PWA Installation

NIVRA can be installed as a Progressive Web App:

1. Open app in Chrome/Safari
2. Click **"Add to Home Screen"**
3. App works offline with service workers

---

## 🚨 Emergency Features Guide

| Trigger | Action |
|---------|--------|
| Shake phone 3 times | Auto SOS triggered |
| Say "help" / "bachao" | Voice panic detection |
| Press SOS button | Manual emergency alert |
| Offline 30+ minutes | Auto offline SOS |
| Press SPACE 3 times | Keyboard SOS (laptop) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Developer

**Sapna** — [@xSapna](https://github.com/xSapna)

---

<div align="center">
  <strong>🛡️ NIVRA — Your Safety, Our Priority 🛡️</strong>
</div>
