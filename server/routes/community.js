const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock database - In production, use MongoDB
let users = [];
let safetyReports = [];
let emergencyAlerts = [];

// Get nearby users
router.post('/nearby-users', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000 } = req.body;
    const currentUserId = req.user.id;
    
    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    };

    // Update current user location
    const userIndex = users.findIndex(u => u.id === currentUserId);
    if (userIndex >= 0) {
      users[userIndex] = {
        ...users[userIndex],
        latitude,
        longitude,
        lastSeen: new Date(),
        status: 'safe'
      };
    } else {
      users.push({
        id: currentUserId,
        name: req.user.fullName || 'Anonymous User',
        latitude,
        longitude,
        lastSeen: new Date(),
        status: 'safe'
      });
    }

    // Find nearby users (excluding current user)
    const nearbyUsers = users
      .filter(user => user.id !== currentUserId)
      .map(user => {
        const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
        return {
          ...user,
          distance: Math.round(distance)
        };
      })
      .filter(user => user.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Limit to 10 users
      .map(user => ({
        id: user.id,
        name: user.name.split(' ')[0] + ' ' + user.name.split(' ')[1]?.charAt(0) + '.' || 'Anonymous User',
        distance: user.distance < 1000 ? `${user.distance}m` : `${(user.distance/1000).toFixed(1)}km`,
        status: user.status,
        lastSeen: getTimeAgo(user.lastSeen)
      }));

    res.json(nearbyUsers);
  } catch (error) {
    console.error('Error getting nearby users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safety reports
router.get('/safety-reports', auth, async (req, res) => {
  try {
    const reportsWithTimeAgo = safetyReports
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20) // Limit to 20 reports
      .map(report => ({
        ...report,
        time: getTimeAgo(report.timestamp),
        location: report.location || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`
      }));

    res.json(reportsWithTimeAgo);
  } catch (error) {
    console.error('Error getting safety reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit safety report
router.post('/safety-reports', auth, async (req, res) => {
  try {
    const { type, description, latitude, longitude, anonymous } = req.body;
    
    const newReport = {
      id: Date.now(),
      type,
      description,
      latitude,
      longitude,
      location: await getLocationName(latitude, longitude),
      timestamp: new Date(),
      votes: 1,
      userId: anonymous ? null : req.user.id,
      userName: anonymous ? 'Anonymous' : req.user.fullName
    };

    safetyReports.push(newReport);

    // Return formatted report
    const formattedReport = {
      ...newReport,
      time: 'Just now',
      location: newReport.location || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    };

    res.status(201).json(formattedReport);
  } catch (error) {
    console.error('Error submitting safety report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send community emergency alert
router.post('/emergency-alert', auth, async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    const currentUserId = req.user.id;

    // Find nearby users within 1km
    const nearbyUsers = users.filter(user => {
      if (user.id === currentUserId) return false;
      
      const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
      return distance <= 1000; // 1km radius
    });

    // Create emergency alert
    const alert = {
      id: Date.now(),
      userId: currentUserId,
      userName: req.user.fullName,
      message,
      latitude,
      longitude,
      timestamp: new Date(),
      notifiedUsers: nearbyUsers.length
    };

    emergencyAlerts.push(alert);

    // In production, send push notifications to nearby users here
    console.log(`Emergency alert sent to ${nearbyUsers.length} nearby users`);

    res.json({
      success: true,
      notifiedUsers: nearbyUsers.length,
      alertId: alert.id
    });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
  return `${Math.floor(diffInSeconds / 86400)} day ago`;
};

const getLocationName = async (latitude, longitude) => {
  try {
    // In production, use a geocoding service
    return `Location ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
  } catch (error) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

module.exports = router;