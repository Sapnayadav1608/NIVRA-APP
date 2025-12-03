const mongoose = require('mongoose');

const safetyLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['police_station', 'hospital', 'fire_station', 'safe_house', 'public_place'],
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  operatingHours: {
    type: String,
    default: '24/7'
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
safetyLocationSchema.index({ "location.latitude": 1, "location.longitude": 1 });
safetyLocationSchema.index({ type: 1 });

module.exports = mongoose.model('SafetyLocation', safetyLocationSchema);