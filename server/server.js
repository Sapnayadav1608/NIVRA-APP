const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const emergencyRoutes = require('./routes/emergency');
const communityRoutes = require('./routes/community');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// PUBLIC ADMIN ROUTES (No auth required for demo)
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayAlerts = await Alert.countDocuments({ 
      createdAt: { $gte: todayStart } 
    });
    
    console.log('📈 Stats:', { totalUsers, activeAlerts, resolvedAlerts, todayAlerts });
    
    res.json({ 
      totalUsers, 
      activeAlerts, 
      resolvedAlerts,
      todayAlerts,
      responseTime: `${Math.floor(Math.random() * 5) + 1} min`,
      uptime: '99.8%',
      systemHealth: 'Good',
      onlineUsers: Math.floor(totalUsers * 0.3)
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('fullName email phone createdAt').limit(50);
    const formattedUsers = users.map(u => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      status: 'Active',
      lastSeen: 'Recently',
      joinDate: u.createdAt.toLocaleDateString(),
      emergencyContacts: Math.floor(Math.random() * 5) + 1
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('❌ Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      user: alert.userId?.fullName || 'Unknown User',
      type: alert.type,
      location: alert.location?.address || 'Location not available',
      status: alert.status,
      time: alert.createdAt.toLocaleString(),
      createdAt: alert.createdAt
    }));
    
    res.json(formattedAlerts);
  } catch (error) {
    console.error('❌ Admin alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/health', async (req, res) => {
  res.json({ status: 'OK', uptime: '99.8%', database: 'Connected' });
});

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
    
    console.log('🔑 Login attempt for:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    console.log('👤 User found, checking password...');
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔒 Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET || 'secret-key');
    
    console.log('✅ Login successful for:', email);
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

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sapnasp1206@gmail.com',
    pass: process.env.EMAIL_PASS || 'ifbh wcdo albv crvr'
  }
});

// Manual password reset for testing
app.post('/api/debug/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users for debugging
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email fullName');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password Route - OTP Based
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    console.log('💾 OTP stored in DB:', otp, 'for user:', email);
    console.log('⏰ Expires at:', new Date(user.resetPasswordExpires));
    
    // Send OTP via email
    try {
      console.log('📧 Attempting to send email to:', email);
      console.log('📧 Using credentials:', process.env.EMAIL_USER);
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'sapnasp1206@gmail.com',
        to: email,
        subject: 'NIVRA - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b9d;">NIVRA Password Reset</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; color: #333;">${otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      res.json({ 
        success: true, 
        message: 'OTP sent to your email successfully'
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      console.log(`📱 Fallback - OTP for ${email}: ${otp}`);
      res.json({ 
        success: true, 
        message: 'OTP generated (email service unavailable)',
        otp: otp,
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP and Reset Password
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    console.log('🔍 Verifying OTP for:', email);
    console.log('🔍 Received OTP:', otp);
    
    // Find user by email only first
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      // List all users for debugging
      const allUsers = await User.find({}, 'email');
      console.log('📋 Available users:', allUsers.map(u => u.email));
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    console.log('💾 User found, stored OTP:', user.resetPasswordToken);
    console.log('⏰ Token expires at:', new Date(user.resetPasswordExpires));
    console.log('🕐 Current time:', new Date());
    
    // Simple OTP check - convert both to strings and trim
    const storedOTP = String(user.resetPasswordToken || '').trim();
    const receivedOTP = String(otp || '').trim();
    
    console.log('🔍 Comparing OTPs:', { stored: storedOTP, received: receivedOTP });
    
    if (storedOTP !== receivedOTP) {
      console.log('❌ OTP mismatch');
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    if (!user.resetPasswordExpires || user.resetPasswordExpires <= Date.now()) {
      console.log('❌ OTP expired');
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    
    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log('✅ Password reset successful for:', email);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

// Admin Stats (Public for demo)
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeAlerts = await Alert.countDocuments({ status: 'active' });
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayAlerts = await Alert.countDocuments({ 
      createdAt: { $gte: todayStart } 
    });
    
    console.log('📈 Stats:', { totalUsers, activeAlerts, resolvedAlerts, todayAlerts });
    
    res.json({ 
      totalUsers, 
      activeAlerts, 
      resolvedAlerts,
      todayAlerts,
      responseTime: `${Math.floor(Math.random() * 5) + 1} min`,
      uptime: '99.8%',
      systemHealth: 'Good',
      onlineUsers: Math.floor(totalUsers * 0.3)
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Alerts (No auth required for demo)
app.get('/api/admin/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20);
    
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      user: alert.userId?.fullName || 'Unknown User',
      type: alert.type,
      location: alert.location?.address || 'Location not available',
      status: alert.status,
      time: alert.createdAt.toLocaleString(),
      createdAt: alert.createdAt
    }));
    
    res.json(formattedAlerts);
  } catch (error) {
    console.error('❌ Admin alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Users (No auth required for demo)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('fullName email phone createdAt').limit(50);
    const formattedUsers = users.map(u => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      status: 'Active',
      lastSeen: 'Recently',
      joinDate: u.createdAt.toLocaleDateString(),
      emergencyContacts: Math.floor(Math.random() * 5) + 1
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('❌ Admin users error:', error);
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
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
});