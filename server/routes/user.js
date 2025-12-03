const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('fullName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^\+[1-9]\d{1,14}$/),
  body('email').optional().isEmail().normalizeEmail()
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

    const { fullName, phone, email } = req.body;
    const userId = req.user.id;

    // Check if email or phone already exists for other users
    if (email || phone) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone number already exists'
        });
      }
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   PUT /api/user/location
// @desc    Update user location
// @access  Private
router.put('/location', [
  auth,
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('address').optional().isString()
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

    const { latitude, longitude, address } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          latitude,
          longitude,
          address: address || '',
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: user.location
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// @route   POST /api/user/emergency-contacts
// @desc    Add emergency contact
// @access  Private
router.post('/emergency-contacts', [
  auth,
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('phone').matches(/^\+[1-9]\d{1,14}$/),
  body('relationship').isIn(['Family', 'Friend', 'Colleague', 'Other'])
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

    const { name, phone, relationship } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    // Check if contact already exists
    const existingContact = user.emergencyContacts.find(
      contact => contact.phone === phone
    );

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }

    // Limit to 5 emergency contacts
    if (user.emergencyContacts.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 emergency contacts allowed'
      });
    }

    user.emergencyContacts.push({ name, phone, relationship });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      contacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add emergency contact'
    });
  }
});

// @route   PUT /api/user/emergency-contacts/:contactId
// @desc    Update emergency contact
// @access  Private
router.put('/emergency-contacts/:contactId', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^\+[1-9]\d{1,14}$/),
  body('relationship').optional().isIn(['Family', 'Friend', 'Colleague', 'Other'])
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

    const { name, phone, relationship } = req.body;
    const { contactId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const contact = user.emergencyContacts.id(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (relationship) contact.relationship = relationship;

    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      contacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact'
    });
  }
});

// @route   DELETE /api/user/emergency-contacts/:contactId
// @desc    Delete emergency contact
// @access  Private
router.delete('/emergency-contacts/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const contact = user.emergencyContacts.id(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    user.emergencyContacts.pull(contactId);
    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully',
      contacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact'
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('theme').optional().isIn(['light', 'dark']),
  body('notifications').optional().isBoolean(),
  body('voiceAlerts').optional().isBoolean(),
  body('shakeDetection').optional().isBoolean()
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

    const { theme, notifications, voiceAlerts, shakeDetection } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (typeof notifications === 'boolean') updateData['preferences.notifications'] = notifications;
    if (typeof voiceAlerts === 'boolean') updateData['preferences.voiceAlerts'] = voiceAlerts;
    if (typeof shakeDetection === 'boolean') updateData['preferences.shakeDetection'] = shakeDetection;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

module.exports = router;