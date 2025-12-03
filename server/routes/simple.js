const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// User schema
const userSchema = new mongoose.Schema({
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
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    
    res.json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ fullName, email, phone, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ success: true, message: 'User created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;