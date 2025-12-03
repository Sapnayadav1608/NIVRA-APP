const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatbotLog = require('../models/ChatbotLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simple AI responses for safety guidance
const safetyResponses = {
  'safety tips': [
    "Here are some safety tips: 1) Always share your location with trusted contacts 2) Stay in well-lit areas 3) Trust your instincts 4) Keep emergency numbers handy 5) Use the NIVRA app's SOS feature when needed",
    "Safety first! Remember to: Walk confidently, avoid isolated areas, keep your phone charged, and don't hesitate to call for help if you feel unsafe."
  ],
  'emergency help': [
    "In an emergency: 1) Use the SOS button in NIVRA app 2) Call local emergency services (911/112) 3) Share your location 4) Stay calm and follow instructions 5) Contact your emergency contacts",
    "Emergency protocol: Press the SOS button, call emergency services, share your location with trusted contacts, and stay in a safe place if possible."
  ],
  'location help': [
    "For location safety: 1) Enable GPS tracking 2) Share live location with family 3) Use well-lit, populated routes 4) Know nearby safe places 5) Check the safety map in NIVRA app",
    "Location tips: Always let someone know where you're going, use main roads, avoid shortcuts through isolated areas, and check our safety locations feature."
  ],
  'contact help': [
    "Managing emergency contacts: 1) Add up to 5 trusted contacts 2) Include family and close friends 3) Verify phone numbers 4) Update regularly 5) Test the system occasionally",
    "Emergency contacts should be people who can respond quickly and are usually available. Include local contacts who can reach you fast."
  ],
  'general': [
    "I'm here to help with your safety concerns. You can ask me about safety tips, emergency procedures, location safety, or managing your emergency contacts.",
    "How can I assist you today? I can provide safety guidance, help with emergency procedures, or answer questions about using the NIVRA app features."
  ]
};

// Simple intent detection
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('safety') || lowerMessage.includes('tip') || lowerMessage.includes('secure')) {
    return { intent: 'safety tips', confidence: 0.8 };
  }
  if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('danger') || lowerMessage.includes('sos')) {
    return { intent: 'emergency help', confidence: 0.9 };
  }
  if (lowerMessage.includes('location') || lowerMessage.includes('place') || lowerMessage.includes('area') || lowerMessage.includes('where')) {
    return { intent: 'location help', confidence: 0.7 };
  }
  if (lowerMessage.includes('contact') || lowerMessage.includes('family') || lowerMessage.includes('friend') || lowerMessage.includes('number')) {
    return { intent: 'contact help', confidence: 0.7 };
  }
  
  return { intent: 'general', confidence: 0.5 };
}

// Generate response based on intent
function generateResponse(intent) {
  const responses = safetyResponses[intent] || safetyResponses['general'];
  return responses[Math.floor(Math.random() * responses.length)];
}

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Private
router.post('/message', [
  auth,
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('sessionId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, sessionId } = req.body;
    const userId = req.user.id;
    const currentSessionId = sessionId || `session_${Date.now()}_${userId}`;

    // Detect intent
    const { intent, confidence } = detectIntent(message);
    
    // Generate response
    const botResponse = generateResponse(intent);

    // Find or create chat log
    let chatLog = await ChatbotLog.findOne({ 
      userId, 
      sessionId: currentSessionId 
    });

    if (!chatLog) {
      chatLog = new ChatbotLog({
        userId,
        sessionId: currentSessionId,
        messages: [],
        category: intent.replace(' ', '_')
      });
    }

    // Add user message
    chatLog.messages.push({
      sender: 'user',
      message,
      intent,
      confidence
    });

    // Add bot response
    chatLog.messages.push({
      sender: 'bot',
      message: botResponse
    });

    await chatLog.save();

    res.json({
      success: true,
      response: botResponse,
      sessionId: currentSessionId,
      intent,
      confidence
    });

  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { sessionId, limit = 10 } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chatLogs = await ChatbotLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      chatLogs
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

// @route   POST /api/chatbot/feedback
// @desc    Submit chatbot feedback
// @access  Private
router.post('/feedback', [
  auth,
  body('sessionId').isString().withMessage('Session ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, rating, feedback } = req.body;
    const userId = req.user.id;

    const chatLog = await ChatbotLog.findOne({ userId, sessionId });

    if (!chatLog) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatLog.rating = rating;
    chatLog.feedback = feedback || '';
    chatLog.resolved = true;

    await chatLog.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

// @route   GET /api/chatbot/quick-responses
// @desc    Get quick response suggestions
// @access  Private
router.get('/quick-responses', auth, (req, res) => {
  try {
    const quickResponses = [
      { text: "I need safety tips", category: "safety" },
      { text: "What should I do in an emergency?", category: "emergency" },
      { text: "How to stay safe in my area?", category: "location" },
      { text: "How to add emergency contacts?", category: "contacts" },
      { text: "I feel unsafe", category: "emergency" },
      { text: "Safety tips for walking alone", category: "safety" }
    ];

    res.json({
      success: true,
      quickResponses
    });

  } catch (error) {
    console.error('Get quick responses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick responses'
    });
  }
});

module.exports = router;