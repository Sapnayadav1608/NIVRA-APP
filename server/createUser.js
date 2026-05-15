const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nivra-app');
    console.log('Connected to MongoDB');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = new User({
      fullName: 'Demo User',
      email: 'demo@nivra.com',
      phone: '+91 9876543210',
      password: hashedPassword,
      role: 'user'
    });

    await demoUser.save();
    console.log('✅ Demo user created: demo@nivra.com / demo123');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      fullName: 'Admin User',
      email: 'admin@nivra.com',
      phone: '+91 9876543211',
      password: adminPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created: admin@nivra.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();