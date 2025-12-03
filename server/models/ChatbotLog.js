const mongoose = require('mongoose');

const chatbotLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: String, // Detected intent from AI
    confidence: Number // Confidence score
  }],
  category: {
    type: String,
    enum: ['safety_tips', 'emergency_help', 'general_inquiry', 'location_help', 'contact_help'],
    default: 'general_inquiry'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

chatbotLogSchema.index({ userId: 1, createdAt: -1 });
chatbotLogSchema.index({ sessionId: 1 });

module.exports = mongoose.model('ChatbotLog', chatbotLogSchema);