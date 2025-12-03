const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// Simple User schema
const User = mongoose.model('User', new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  password: String,
  role: { type: String, default: 'user' },
  emergencyContacts: [],
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    voiceAlerts: { type: Boolean, default: true },
    shakeDetection: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));

// Simple login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    console.log('User found:', user.email);
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;