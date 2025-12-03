const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['manual', 'voice', 'shake', 'panic'],
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
      default: ''
    }
  },
  message: {
    type: String,
    default: 'Emergency alert triggered'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  responses: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactPhone: String,
    responseType: {
      type: String,
      enum: ['sms_sent', 'call_made', 'acknowledged', 'help_on_way']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  audioRecording: {
    type: String, // URL to audio file
    default: ''
  },
  images: [{
    url: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nearbyUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    distance: Number, // in meters
    notified: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
emergencyAlertSchema.index({ "location.latitude": 1, "location.longitude": 1 });
emergencyAlertSchema.index({ userId: 1, createdAt: -1 });
emergencyAlertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);