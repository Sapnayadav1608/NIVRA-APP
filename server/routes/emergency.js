const express = require('express');
const twilio = require('twilio');
const router = express.Router();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// Send SMS alerts to emergency contacts
router.post('/send-sms', async (req, res) => {
  try {
    const { contacts, message, alertData } = req.body;
    
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No emergency contacts provided'
      });
    }

    const results = [];
    
    // Send SMS to each contact
    for (const contact of contacts) {
      try {
        if (client && twilioPhone) {
          // Send via Twilio if configured
          const smsResult = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: contact.phone
          });
          
          results.push({
            contact: contact.name,
            phone: contact.phone,
            status: 'sent',
            sid: smsResult.sid
          });
        } else {
          // Fallback: Log the message (for development)
          console.log(`SMS to ${contact.name} (${contact.phone}): ${message}`);
          results.push({
            contact: contact.name,
            phone: contact.phone,
            status: 'logged',
            message: 'Twilio not configured - message logged'
          });
        }
      } catch (error) {
        console.error(`Failed to send SMS to ${contact.name}:`, error);
        results.push({
          contact: contact.name,
          phone: contact.phone,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    // Save alert to database (if you have a model)
    // await Alert.create(alertData);
    
    res.json({
      success: true,
      message: `SMS alerts processed for ${contacts.length} contacts`,
      results: results,
      alertData: alertData
    });
    
  } catch (error) {
    console.error('Emergency SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency SMS',
      error: error.message
    });
  }
});

// Get nearby emergency services
router.get('/nearby-services', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Mock nearby emergency services (in real app, use Google Places API)
    const services = [
      {
        name: 'City Police Station',
        type: 'police',
        phone: '100',
        distance: '0.5 km',
        address: 'Main Road, City Center'
      },
      {
        name: 'Women Police Station',
        type: 'women_police',
        phone: '1091',
        distance: '1.2 km',
        address: 'Women Safety Complex'
      },
      {
        name: 'City Hospital',
        type: 'hospital',
        phone: '108',
        distance: '0.8 km',
        address: 'Hospital Road'
      },
      {
        name: 'Fire Station',
        type: 'fire',
        phone: '101',
        distance: '1.5 km',
        address: 'Fire Brigade Road'
      }
    ];
    
    res.json({
      success: true,
      services: services,
      location: { lat, lng }
    });
    
  } catch (error) {
    console.error('Nearby services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby services'
    });
  }
});

// Emergency alert endpoint
router.post('/alert', async (req, res) => {
  try {
    const alertData = req.body;
    
    // Log the alert
    console.log('🚨 EMERGENCY ALERT RECEIVED:', {
      user: alertData.userInfo?.name,
      type: alertData.type,
      location: alertData.location,
      timestamp: alertData.timestamp
    });
    
    // In a real app, save to database and notify authorities
    // await Alert.create(alertData);
    
    res.json({
      success: true,
      message: 'Emergency alert received and processed',
      alertId: Date.now(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process emergency alert'
    });
  }
});

module.exports = router;