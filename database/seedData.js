const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../server/models/User');
const SafetyLocation = require('../server/models/SafetyLocation');

// Sample safety locations data
const safetyLocations = [
  {
    name: 'Central Police Station',
    type: 'police_station',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '1 Police Plaza, New York, NY 10038'
    },
    contact: {
      phone: '+1-911',
      email: 'info@nypd.gov'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 5
  },
  {
    name: 'Mount Sinai Hospital',
    type: 'hospital',
    location: {
      latitude: 40.7903,
      longitude: -73.9527,
      address: '1 Gustave L. Levy Pl, New York, NY 10029'
    },
    contact: {
      phone: '+1-212-241-6500',
      email: 'info@mountsinai.org'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 4
  },
  {
    name: 'Fire Department Station 1',
    type: 'fire_station',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '100 Duane St, New York, NY 10007'
    },
    contact: {
      phone: '+1-911',
      email: 'info@fdny.gov'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 5
  },
  {
    name: 'Women\'s Safe House NYC',
    type: 'safe_house',
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: '123 Safety Ave, New York, NY 10001'
    },
    contact: {
      phone: '+1-800-621-4673',
      email: 'help@safehouse.org'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 5
  },
  {
    name: 'Times Square Public Area',
    type: 'public_place',
    location: {
      latitude: 40.7580,
      longitude: -73.9855,
      address: 'Times Square, New York, NY 10036'
    },
    contact: {
      phone: '+1-311'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 4
  },
  {
    name: 'Brooklyn Police Precinct',
    type: 'police_station',
    location: {
      latitude: 40.6782,
      longitude: -73.9442,
      address: '233 16th St, Brooklyn, NY 11215'
    },
    contact: {
      phone: '+1-911',
      email: 'info@nypd.gov'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 4
  },
  {
    name: 'Queens General Hospital',
    type: 'hospital',
    location: {
      latitude: 40.7282,
      longitude: -73.7949,
      address: '82-68 164th St, Jamaica, NY 11432'
    },
    contact: {
      phone: '+1-718-883-3000',
      email: 'info@queensgeneral.org'
    },
    operatingHours: '24/7',
    verified: true,
    rating: 4
  },
  {
    name: 'Central Park Safety Point',
    type: 'public_place',
    location: {
      latitude: 40.7829,
      longitude: -73.9654,
      address: 'Central Park, New York, NY 10024'
    },
    contact: {
      phone: '+1-311'
    },
    operatingHours: '6:00 AM - 1:00 AM',
    verified: true,
    rating: 4
  }
];

// Sample admin user
const adminUser = {
  fullName: 'NIVRA Administrator',
  email: 'admin@nivra.app',
  phone: '+1234567890',
  password: 'admin123',
  role: 'admin',
  preferences: {
    theme: 'light',
    notifications: true,
    voiceAlerts: true,
    shakeDetection: true
  },
  isActive: true
};

// Sample regular users
const sampleUsers = [
  {
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1234567891',
    password: 'password123',
    role: 'user',
    emergencyContacts: [
      {
        name: 'John Johnson',
        phone: '+1234567892',
        relationship: 'Family'
      },
      {
        name: 'Emma Smith',
        phone: '+1234567893',
        relationship: 'Friend'
      }
    ],
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY',
      lastUpdated: new Date()
    },
    preferences: {
      theme: 'light',
      notifications: true,
      voiceAlerts: true,
      shakeDetection: true
    }
  },
  {
    fullName: 'Maria Garcia',
    email: 'maria@example.com',
    phone: '+1234567894',
    password: 'password123',
    role: 'user',
    emergencyContacts: [
      {
        name: 'Carlos Garcia',
        phone: '+1234567895',
        relationship: 'Family'
      }
    ],
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Manhattan, NY',
      lastUpdated: new Date()
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      voiceAlerts: false,
      shakeDetection: true
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nivra-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SafetyLocation.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const admin = new User({
      ...adminUser,
      password: hashedPassword
    });
    await admin.save();
    console.log('Created admin user');

    // Create sample users
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
    }
    console.log('Created sample users');

    // Create safety locations
    for (const locationData of safetyLocations) {
      const location = new SafetyLocation({
        ...locationData,
        addedBy: admin._id
      });
      await location.save();
    }
    console.log('Created safety locations');

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@nivra.app / admin123');
    console.log('User 1: sarah@example.com / password123');
    console.log('User 2: maria@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, safetyLocations, adminUser, sampleUsers };