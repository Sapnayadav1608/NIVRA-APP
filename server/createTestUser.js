const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User schema
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
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nivra-app');
    console.log('Connected to MongoDB');

    // Delete existing test user
    await User.deleteOne({ email: 'test@nivra.app' });

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = new User({
      fullName: 'Test User',
      email: 'test@nivra.app',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'user'
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Login: test@nivra.app / test123');

    // Create admin user
    await User.deleteOne({ email: 'admin@nivra.app' });
    
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@nivra.app',
      phone: '+1234567891',
      password: adminPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Login: admin@nivra.app / admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();