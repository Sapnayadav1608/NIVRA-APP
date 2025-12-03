import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, Chip, LinearProgress, Button, Alert } from '@mui/material';
import { LocationOn, Security, NetworkCheck, Battery90, AccessTime, People } from '@mui/icons-material';

const LiveTracking = () => {
  const [location, setLocation] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState({ level: 'SAFE', confidence: 87, color: '#4caf50' });
  const [signals, setSignals] = useState({
    gpsAccuracy: 'Good',
    networkStrength: 'Medium',
    battery: 48,
    timeOfDay: 'Night',
    publicDensity: 'High',
    crimeRate: 'Low'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [address, setAddress] = useState('Loading...');
  const mapRef = useRef(null);

  // Simulate ML prediction based on various factors
  const predictSafety = (locationData, deviceSignals) => {
    let safetyScore = 70; // Base score
    
    // Time factor
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) safetyScore -= 15; // Night time
    
    // Network strength
    if (deviceSignals.networkStrength === 'Low') safetyScore -= 10;
    if (deviceSignals.networkStrength === 'High') safetyScore += 5;
    
    // Battery level
    if (deviceSignals.battery < 20) safetyScore -= 5;
    
    // Public density
    if (deviceSignals.publicDensity === 'Low') safetyScore -= 15;
    if (deviceSignals.publicDensity === 'High') safetyScore += 10;
    
    // Crime rate
    if (deviceSignals.crimeRate === 'High') safetyScore -= 20;
    if (deviceSignals.crimeRate === 'Low') safetyScore += 10;
    
    // GPS accuracy
    if (deviceSignals.gpsAccuracy === 'Poor') safetyScore -= 5;
    
    // Determine safety level
    if (safetyScore >= 75) {
      return { level: 'SAFE', confidence: Math.min(safetyScore, 95), color: '#4caf50' };
    } else if (safetyScore >= 50) {
      return { level: 'CAUTION', confidence: safetyScore, color: '#ff9800' };
    } else {
      return { level: 'DANGER', confidence: safetyScore, color: '#f44336' };
    }
  };

  // Get user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(newLocation);
          
          // Update GPS accuracy based on actual accuracy
          const gpsAccuracy = position.coords.accuracy < 10 ? 'Excellent' : 
                             position.coords.accuracy < 50 ? 'Good' : 'Poor';
          
          setSignals(prev => ({ ...prev, gpsAccuracy }));
          
          // Reverse geocoding (mock)
          setAddress('SV Road, Andheri East, Mumbai, Maharashtra');
          
          // Update safety prediction
          const newSafety = predictSafety(newLocation, signals);
          setSafetyStatus(newSafety);
          
          setLastUpdated(new Date());
        },
        (error) => {
          console.error('Location error:', error);
          setAddress('Location access denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  // Simulate device signals
  const updateDeviceSignals = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour >= 6 && hour < 18 ? 'Day' : 'Night';
    
    // Simulate network strength
    const networkStrengths = ['Low', 'Medium', 'High'];
    const networkStrength = networkStrengths[Math.floor(Math.random() * 3)];
    
    // Simulate public density based on time
    const publicDensity = timeOfDay === 'Day' ? 'High' : 'Medium';
    
    // Get battery level
    navigator.getBattery?.().then(battery => {
      setSignals(prev => ({
        ...prev,
        battery: Math.round(battery.level * 100),
        timeOfDay,
        networkStrength,
        publicDensity
      }));
    }).catch(() => {
      setSignals(prev => ({
        ...prev,
        timeOfDay,
        networkStrength,
        publicDensity
      }));
    });
  };

  // Auto-update location every 5 seconds
  useEffect(() => {
    getCurrentLocation();
    updateDeviceSignals();
    
    const locationInterval = setInterval(getCurrentLocation, 5000);
    const signalsInterval = setInterval(updateDeviceSignals, 10000);
    
    return () => {
      clearInterval(locationInterval);
      clearInterval(signalsInterval);
    };
  }, []);

  // Handle danger status
  useEffect(() => {
    if (safetyStatus.level === 'DANGER') {
      // Auto-enable SOS features
      console.log('DANGER DETECTED - Auto-enabling SOS features');
      // Here you would trigger emergency protocols
    }
  }, [safetyStatus.level]);

  const getStatusMessage = () => {
    switch (safetyStatus.level) {
      case 'SAFE':
        return 'You are in a safe area.';
      case 'CAUTION':
        return 'Be alert. This area has moderate risk.';
      case 'DANGER':
        return 'DANGER DETECTED! Stay alert and consider moving to a safer location.';
      default:
        return 'Analyzing safety status...';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        📍 Live Tracking
      </Typography>

      {/* Current Location */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ mr: 1, color: '#2196f3' }} />
          Current Location
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Sapna is here</strong> (Blue Dot on Map)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Address: {address}
        </Typography>
        {location && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </Typography>
        )}
      </Card>

      {/* Safety Status */}
      <Card sx={{ p: 3, mb: 3, border: `2px solid ${safetyStatus.color}` }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1, color: safetyStatus.color }} />
          Safety Status
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={safetyStatus.level}
            sx={{ 
              backgroundColor: safetyStatus.color, 
              color: 'white',
              fontWeight: 'bold',
              mr: 2
            }}
          />
          <Typography variant="body2">
            Confidence Level: {safetyStatus.confidence}%
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={safetyStatus.confidence} 
          sx={{ 
            mb: 2, 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              backgroundColor: safetyStatus.color
            }
          }}
        />
        
        <Alert severity={safetyStatus.level === 'SAFE' ? 'success' : safetyStatus.level === 'CAUTION' ? 'warning' : 'error'}>
          {getStatusMessage()}
        </Alert>
      </Card>

      {/* Signals Used */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📶 Signals Used
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, color: '#4caf50' }} />
            <Box>
              <Typography variant="body2">GPS Accuracy</Typography>
              <Typography variant="caption" color="text.secondary">{signals.gpsAccuracy}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NetworkCheck sx={{ mr: 1, color: '#2196f3' }} />
            <Box>
              <Typography variant="body2">Network Strength</Typography>
              <Typography variant="caption" color="text.secondary">{signals.networkStrength}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, color: '#ff9800' }} />
            <Box>
              <Typography variant="body2">Time</Typography>
              <Typography variant="caption" color="text.secondary">{signals.timeOfDay} ({new Date().toLocaleTimeString()})</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 1, color: '#9c27b0' }} />
            <Box>
              <Typography variant="body2">Public Area Density</Typography>
              <Typography variant="caption" color="text.secondary">{signals.publicDensity}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1, color: '#4caf50' }} />
            <Box>
              <Typography variant="body2">Crime Rate (Area-Based)</Typography>
              <Typography variant="caption" color="text.secondary">{signals.crimeRate}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Battery90 sx={{ mr: 1, color: signals.battery > 20 ? '#4caf50' : '#f44336' }} />
            <Box>
              <Typography variant="body2">Battery</Typography>
              <Typography variant="caption" color="text.secondary">{signals.battery}%</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Live Update Status */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🔄 Live Update
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Last Updated: {Math.floor((new Date() - lastUpdated) / 1000)} seconds ago
        </Typography>
        <Typography variant="body2">
          Battery: {signals.battery}%
        </Typography>
      </Card>

      {/* Map Placeholder */}
      <Card sx={{ p: 3, mb: 3, textAlign: 'center', minHeight: 200 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🗺 Map View
        </Typography>
        <Box 
          ref={mapRef}
          sx={{ 
            height: 150, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            [Real-Time MAP]<br/>
            (Blue dot = user)<br/>
            (Red zones = unsafe areas)<br/>
            (Green zones = safe areas)
          </Typography>
        </Box>
      </Card>

      {/* Emergency Actions */}
      {safetyStatus.level === 'DANGER' && (
        <Card sx={{ p: 3, backgroundColor: '#ffebee', border: '2px solid #f44336' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#f44336' }}>
            ⚠️ Emergency Actions Activated
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            fullWidth 
            sx={{ mb: 2 }}
            onClick={() => console.log('SOS Triggered')}
          >
            🆘 TRIGGER SOS NOW
          </Button>
          <Typography variant="body2" color="text.secondary">
            • SOS auto-arming enabled<br/>
            • Trusted contacts will be notified<br/>
            • Background audio recording started
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default LiveTracking;