const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nivra-app');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      fullName: 'Admin User',
      email: 'admin@nivra.com',
      phone: '+91-9999999999',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const testUser = new User({
      fullName: 'Test User',
      email: 'user@test.com',
      phone: '+91-8888888888',
      password: userPassword,
      role: 'user'
    });
    
    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@nivra.com' });
    const existingUser = await User.findOne({ email: 'user@test.com' });
    
    if (!existingAdmin) {
      await admin.save();
      console.log('✅ Admin user created: admin@nivra.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    if (!existingUser) {
      await testUser.save();
      console.log('✅ Test user created: user@test.com / user123');
    } else {
      console.log('ℹ️ Test user already exists');
    }
    
    console.log('\n🚀 Ready to test the application!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();