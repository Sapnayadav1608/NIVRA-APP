const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emergencyRoutes = require('./routes/emergency');
const communityRoutes = require('./routes/community');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emergency', emergencyRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Import User model
const User = require('./models/User');

// Emergency Alert Schema
const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['manual', 'voice', 'shake', 'longpress'], required: true },
  message: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET || 'secret-key');
    
    res.json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.includes('admin') ? 'admin' : 'user';
    
    const user = new User({ 
      fullName, 
      email, 
      phone, 
      password: hashedPassword,
      role 
    });
    
    await user.save();
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
});

// Admin Login Route
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret-key');
    
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    
    res.json({ 
      totalUsers, 
      activeAlerts, 
      resolvedAlerts, 
      onlineUsers: Math.floor(totalUsers * 0.3) // Simulated online users
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Alerts
app.get('/api/admin/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const formattedAlerts = alerts.map(alert => ({
      _id: alert._id,
      user: { fullName: alert.userId?.fullName || 'Unknown User' },
      type: alert.type.toUpperCase(),
      location: alert.location,
      status: alert.status,
      createdAt: alert.createdAt
    }));
    
    res.json(formattedAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('fullName email phone').limit(10);
    res.json(users.map(u => ({...u.toObject(), isActive: true, lastLogin: new Date()})));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Emergency Alert Route
app.post('/api/emergency/alert', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    const { type, message, location } = req.body;
    
    const alert = new Alert({
      userId: decoded.id,
      type,
      message,
      location
    });
    
    await alert.save();
    res.json({ success: true, message: 'Emergency alert sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send alert' });
  }
});

// Get User Alerts
app.get('/api/emergency/alerts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    
    const alerts = await Alert.find({ userId: decoded.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// Resolve Alert
app.put('/api/admin/alerts/:id/resolve', async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ message: 'Alert resolved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve alert' });
  }
});

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nivra-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database: nivra-app');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});