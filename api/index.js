const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb+srv://demo:demo123@cluster0.mongodb.net/nivra?retryWrites=true&w=majority')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user._id }, 'nivra-secret-key');
    
    res.json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, phone, password: hashedPassword });
    
    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'NIVRA Backend working!' });
});

module.exports = app;