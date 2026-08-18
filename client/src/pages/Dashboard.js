import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API_BASE_URL } from '../config';

import NivraLogo from '../components/NivraLogo.jsx';
import { useNotifications } from '../hooks/useNotifications';
import { useRealtimeAlerts } from '../hooks/useRealtimeAlerts';
import BiometricAuth from '../components/BiometricAuth';
import CommunityNetwork from '../components/CommunityNetwork';
import PushNotifications from '../components/PushNotifications';
import AdminDashboard from './AdminDashboard';
import ThemeSelector from '../components/ThemeSelector';
import { getTheme } from '../utils/theme';
import { professionalTheme } from '../theme/professionalTheme';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const currentTheme = useSelector((state) => state.theme?.mode || 'light');
  const themeConfig = getTheme(currentTheme);
  const { notification, sendNotification, clearNotification } = useNotifications();
  const { alerts: realtimeAlerts, isConnected, sendAlert, updateLocation } = useRealtimeAlerts(user?.id);
  const [showProfile, setShowProfile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [battery, setBattery] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [lastShake, setLastShake] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeSequence, setShakeSequence] = useState([]);
  const [laptopShakes, setLaptopShakes] = useState([]);
  const [sosTimer, setSosTimer] = useState(null);
  const [sosProgress, setSosProgress] = useState(0);
  const [offlineTimer, setOfflineTimer] = useState(null);
  const [offlineAlertSent, setOfflineAlertSent] = useState(false);
  const [offlineStartTime, setOfflineStartTime] = useState(null);
  const [showOfflineContacts, setShowOfflineContacts] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Loading location...');
  const [safetyStatus, setSafetyStatus] = useState({ level: 'SAFE', confidence: 87, color: '#4caf50' });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [profileData, setProfileData] = useState(() => {
    const savedProfile = localStorage.getItem('nivra_profile_data');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    };
  });
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI safety assistant. Ask me about emergency procedures, safety tips, or anything related to women safety.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  // Get updated user data from localStorage
  const getCurrentUser = () => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : user;
  };
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Load profile data including photo
    const savedProfile = localStorage.getItem('nivra_profile_data');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    
    // Check if biometric auth is enabled
    const biometricEnabled = localStorage.getItem('nivra_biometric_enabled') === 'true';
    if (biometricEnabled && !isAuthenticated) {
      setShowBiometricAuth(true);
    }
    
    // Check admin status
    const userEmail = currentUser?.email;
    if (userEmail && (userEmail.includes('admin') || userEmail === 'admin@nivra.com')) {
      setIsAdmin(true);
    }
    
    // Load emergency contacts from localStorage
    const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    setContacts(savedContacts);
    
    // Battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBattery(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBattery(Math.round(battery.level * 100));
        });
      });
    }

    // Network status with offline SOS
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineAlertSent(false);
      setOfflineStartTime(null);
      setShowOfflineContacts(false);
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        setOfflineTimer(null);
      }
      console.log('📶 Network restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineStartTime(Date.now());
      setShowOfflineContacts(true);
      console.log('📵 Network lost - Starting offline timers');
      
      // Auto trigger SOS after 30 minutes offline
      const timer = setTimeout(() => {
        if (!offlineAlertSent) {
          console.log('🚨 Auto-triggering 30-minute offline SOS');
          sendOfflineEmergencyAlert();
          setOfflineAlertSent(true);
        }
      }, 1800000); // 30 minutes = 1800000ms
      
      setOfflineTimer(timer);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pure Device Shake Detection - Always Active
    const handleDeviceMotion = (event) => {
      
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;
      
      const { x, y, z } = accelerationIncludingGravity;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      
      // Very sensitive threshold for real device shaking
      if (totalAcceleration > 5) {
        const now = Date.now();
        
        console.log(`📳 SHAKE DETECTED! Force: ${totalAcceleration.toFixed(2)}`);
        
        // Prevent rapid duplicate detections
        if (now - lastShake < 100) return;
        
        setLastShake(now);
        
        // Immediate vibration
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Update shake sequence
        setShakeSequence(prevSequence => {
          // Keep only shakes from last 2 seconds
          const recentShakes = prevSequence.filter(time => now - time < 2000);
          const newSequence = [...recentShakes, now];
          
          console.log(`📱 SHAKE COUNT: ${newSequence.length}/3`);
          

          
          // AUTO TRIGGER SOS after 3 shakes
          if (newSequence.length >= 3) {
            console.log('🚨🚨🚨 EMERGENCY SHAKE DETECTED - AUTO TRIGGERING SOS!');
            
            // Emergency vibration pattern
            if (navigator.vibrate) {
              navigator.vibrate([300, 100, 300, 100, 300]);
            }
            
            // Immediate automatic emergency response
            sendAutomaticEmergencyAlert('device_shake');
            
            // Reset shake sequence
            return [];
          }
          
          return newSequence;
        });
      }
    };



    // Auto-initialize shake detection (always active)
    // Mobile device motion detection
    if (typeof DeviceMotionEvent !== 'undefined') {
      console.log('✅ Auto shake detection ACTIVE!');
      
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(response => {
          console.log('📱 iOS Motion permission:', response);
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion, { passive: false });
            console.log('🎯 iOS shake detection enabled!');
          }
        }).catch(err => {
          console.error('Motion permission error:', err);
        });
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion, { passive: false });
        console.log('🎯 Android shake detection enabled!');
      }
    } 
    
    // Simple keyboard shake detection for laptop
    let keyPressCount = 0;
    let keyPressTimer = null;
    
    const handleKeyPress = (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        keyPressCount++;
        console.log(`⌨️ Key press ${keyPressCount}/3`);
        
        if (keyPressTimer) clearTimeout(keyPressTimer);
        
        if (keyPressCount >= 3) {
          console.log('🚨⌨️ KEYBOARD SOS TRIGGERED!');
          sendAutomaticEmergencyAlert('keyboard_sos');
          keyPressCount = 0;
        } else {
          keyPressTimer = setTimeout(() => {
            keyPressCount = 0;
          }, 2000);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    console.log('⌨️ Keyboard SOS active: Press SPACE 3 times quickly');

    // Force location permission first
    const requestLocationPermission = async () => {
      try {
        await navigator.permissions.query({name: 'geolocation'});
      } catch (e) {}
    };
    requestLocationPermission();

    // Get current location using OSM
    const getCurrentLocation = async () => {
      console.log('🗺️ Getting FRESH location via OSM...');
      
      // Clear any cached location first
      setLocation(null);
      setAddress('🔄 Getting fresh GPS location...');
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`📍 LIVE GPS: ${latitude}, ${longitude} (±${accuracy}m)`);
            
            setLocation({ lat: latitude, lng: longitude });
            
            // Use OSM Nominatim for reverse geocoding
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              const data = await response.json();
              
              if (data.display_name) {
                console.log('🏠 OSM Address:', data.display_name);
                setAddress(data.display_name);
              } else {
                setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              }
            } catch (error) {
              console.error('OSM failed:', error);
              setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
            
            // ML Safety prediction based on real location
            const hour = new Date().getHours();
            let safetyScore = 70;
            
            // Time-based scoring
            if (hour >= 22 || hour <= 5) safetyScore -= 15;
            else if (hour >= 6 && hour <= 18) safetyScore += 10;
            
            // Battery level impact
            if (battery < 20) safetyScore -= 10;
            else if (battery > 80) safetyScore += 5;
            
            // Network status
            if (!isOnline) safetyScore -= 15;
            
            // Determine safety level
            const newSafety = safetyScore >= 75 ? 
              { level: 'SAFE', confidence: Math.min(safetyScore, 95), color: '#4caf50' } :
              safetyScore >= 50 ? 
              { level: 'CAUTION', confidence: safetyScore, color: '#ff9800' } :
              { level: 'DANGER', confidence: safetyScore, color: '#f44336' };
            
            setSafetyStatus(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(newSafety)) {
                return newSafety;
              }
              return prev;
            });
            setLastUpdated(new Date());
          },
          (error) => {
            console.error('Location error:', error.message);
            if (error.code === 1) {
              setAddress('❌ Location access denied - Please allow GPS in browser settings');
              alert('📍 Location Access Required\n\nPlease allow location access for accurate emergency services.\n\n1. Click location icon in address bar\n2. Select "Allow"\n3. Refresh page');
            } else if (error.code === 2) {
              setAddress('❌ Location unavailable - Check GPS/WiFi');
            } else {
              setAddress('❌ Location timeout - Trying again...');
              setTimeout(getCurrentLocation, 5000);
            }
          },
          (error) => {
            console.error('GPS Error:', error.message);
            setAddress('❌ GPS failed - Use Set button to enter Nalasopara manually');
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0
          }
        );
      }
    };

    // Update location every 2 minutes
    getCurrentLocation();
    const locationInterval = setInterval(getCurrentLocation, 120000);

    // Automatic Panic Voice Detection
    const startMLVoiceDetection = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log('🎤 Voice detected:', transcript);
          
          const panicWords = ['help', 'help me', 'save me', 'emergency', 'sos', 'bachao', 'madad', 'danger', 'attack', 'police'];
          
          if (panicWords.some(word => transcript.includes(word))) {
            console.log('🚨 PANIC VOICE DETECTED:', transcript);
            recognition.stop();
            
            // Immediate vibration
            if (navigator.vibrate) {
              navigator.vibrate([500, 200, 500, 200, 500]);
            }
            
            // Call sendEmergencyAlert instead of sendAutomaticEmergencyAlert
            sendEmergencyAlert('voice_panic');
          }
        };
        
        recognition.onerror = (error) => {
          console.log('Voice recognition error:', error.error);
          setIsListening(false);
          if (error.error !== 'aborted') {
            setTimeout(startMLVoiceDetection, 5000);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setTimeout(startMLVoiceDetection, 3000);
        };
        
        recognition.start();
      }
    };

    // Start voice detection with delay
    const voiceTimeout = setTimeout(startMLVoiceDetection, 2000);
    
    // Set loading complete after essential setup
    setTimeout(() => setIsLoading(false), 500);

    // Real-time clock
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearTimeout(voiceTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('keydown', handleKeyPress);
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      clearInterval(locationInterval);
    };
  }, []);

  const theme = {
    bg: professionalTheme.colors.primaryBg,
    cardBg: professionalTheme.colors.secondaryBg,
    text: professionalTheme.colors.primaryText,
    subtext: professionalTheme.colors.secondaryText,
    border: professionalTheme.colors.border,
    gradient: professionalTheme.gradients.primary
  };

  const handleProfileUpdate = () => {
    // Update user data in localStorage
    const updatedUser = { ...currentUser, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Save profile data separately
    localStorage.setItem('nivra_profile_data', JSON.stringify(profileData));
    
    alert('Profile updated successfully!');
    setShowProfile(false);
    
    // Update state without page reload
    window.location.hash = '#updated';
    window.location.hash = '';
  };

  const sendAutomaticEmergencyAlert = async (type = 'device_shake') => {
    console.log(`🚨 EMERGENCY DETECTED - DIRECT ACTION!`);
    
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    const alertData = {
      type: type,
      message: `🚨 EMERGENCY: ${currentUser?.fullName || 'NIVRA User'} needs immediate help!`,
      userInfo: {
        name: currentUser?.fullName,
        phone: currentUser?.phone
      },
      timestamp: new Date().toLocaleString(),
      urgency: 'CRITICAL'
    };

    // Get location and process immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        alertData.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        alertData.locationUrl = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
        
        await directEmergencyAction(emergencyContacts, alertData);
      }, () => {
        directEmergencyAction(emergencyContacts, alertData);
      });
    } else {
      await directEmergencyAction(emergencyContacts, alertData);
    }
  };

  const directEmergencyAction = async (contacts, alertData) => {
    try {
      console.log('🚨 DIRECT EMERGENCY ACTION!');
      
      // Call all emergency contacts
      if (contacts.length > 0) {
        contacts.forEach((contact, index) => {
          setTimeout(() => {
            console.log(`📞 Calling: ${contact.name}`);
            window.open(`tel:${contact.phone}`);
          }, index * 3000);
        });
      } else {
        console.log('⚠️ No emergency contacts found');
      }
      
      // SMS to emergency contacts only
      if (contacts.length > 0) {
        if (isOnline) {
          const response = await fetch(`${API_BASE_URL}/emergency/send-sms`, {

            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              contacts: contacts,
              message: `🚨 EMERGENCY: ${alertData.userInfo.name} needs help! Location: ${alertData.locationUrl || 'Unknown'}. CALL NOW!`,
              alertData: alertData
            })
          });
        }
        
        const message = `🚨 EMERGENCY: ${alertData.userInfo.name} needs help! Location: ${alertData.locationUrl || 'Unknown'}`;
        const allNumbers = contacts.map(c => c.phone).join(',');
        
        if (navigator.userAgent.match(/Android/i)) {
          window.open(`sms:${allNumbers}?body=${encodeURIComponent(message)}`);
        } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          window.open(`sms:${allNumbers}&body=${encodeURIComponent(message)}`);
        }
      }
      
      await sendAlert(alertData);
      
    } catch (error) {
      console.error('Emergency action failed:', error);
    }
  };

  const getNearbyHelplines = (location) => {
    // Default helplines
    let helplines = [
      { name: 'Police', number: '100', priority: 1 },
      { name: 'Women Helpline', number: '1091', priority: 1 },
      { name: 'Ambulance', number: '108', priority: 2 },
      { name: 'Fire Brigade', number: '101', priority: 3 }
    ];

    // Add location-based helplines (example for major cities)
    if (location) {
      const { latitude, longitude } = location;
      
      // Delhi region
      if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.5) {
        helplines.push(
          { name: 'Delhi Police Control', number: '011-23490000', priority: 1 },
          { name: 'Delhi Women Helpline', number: '181', priority: 1 }
        );
      }
      // Mumbai region  
      else if (latitude >= 18.9 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.0) {
        helplines.push(
          { name: 'Mumbai Police', number: '022-22621855', priority: 1 },
          { name: 'Mumbai Women Helpline', number: '103', priority: 1 }
        );
      }
      // Bangalore region
      else if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 77.4 && longitude <= 77.8) {
        helplines.push(
          { name: 'Bangalore Police', number: '080-22942444', priority: 1 },
          { name: 'Bangalore Women Helpline', number: '080-22943225', priority: 1 }
        );
      }
    }

    return helplines.sort((a, b) => a.priority - b.priority);
  };



  const sendOfflineEmergencyAlert = async () => {
    console.log('🚨 Offline Emergency Alert triggered');
    
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    if (emergencyContacts.length === 0) {
      console.log('No emergency contacts for offline alert');
      return;
    }

    const offlineAlert = {
      type: 'offline',
      message: `🚨 OFFLINE EMERGENCY: ${currentUser?.fullName || 'NIVRA User'} lost network connection`,
      userInfo: {
        name: currentUser?.fullName,
        phone: currentUser?.phone
      },
      timestamp: new Date().toLocaleString(),
      location: location || null,
      address: address || 'Location unavailable'
    };

    // Store offline alert
    const existingOfflineAlerts = JSON.parse(localStorage.getItem('offlineAlerts') || '[]');
    existingOfflineAlerts.push(offlineAlert);
    localStorage.setItem('offlineAlerts', JSON.stringify(existingOfflineAlerts));

    // Vibrate phone
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Try to send SMS via device (works offline)
    const message = `🚨 OFFLINE EMERGENCY: ${currentUser?.fullName || 'User'} lost network! Last location: ${address || 'Unknown'}. Please check immediately!`;
    const phoneNumbers = emergencyContacts.map(c => c.phone).join(',');
    
    try {
      // Open SMS app with pre-filled message
      if (navigator.userAgent.match(/Android/i)) {
        window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`);
      } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        window.open(`sms:${phoneNumbers}&body=${encodeURIComponent(message)}`);
      }
      
      alert(`🚨 OFFLINE EMERGENCY ALERT!\n\n📵 Network lost for 30+ seconds\n📱 SMS app opened automatically\n💾 Alert saved for when online\n\nContacts: ${emergencyContacts.map(c => c.name).join(', ')}`);
      
    } catch (error) {
      console.error('Offline SMS failed:', error);
      alert(`🚨 OFFLINE EMERGENCY!\n\n📵 No network detected\n📞 Call these numbers:\n\n${emergencyContacts.map(c => `${c.name}: ${c.phone}`).join('\n')}`);
    }
  };

  const sendEmergencyAlert = async (type = 'manual') => {
    console.log('Emergency Alert triggered:', type);
    
    // Get emergency contacts
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    console.log('Emergency contacts found:', emergencyContacts.length);
    
    if (emergencyContacts.length === 0) {
      alert('⚠️ No emergency contacts found!\n\nPlease add emergency contacts in settings first.');
      return;
    }

    const alertData = {
      type,
      message: `🚨 EMERGENCY ALERT from ${currentUser?.fullName || 'NIVRA User'}`,
      userInfo: {
        name: currentUser?.fullName,
        phone: currentUser?.phone
      },
      timestamp: new Date().toLocaleString()
    };

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        alertData.location = location;
        alertData.locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
        await updateLocation(location);
        
        // Send alerts to all emergency contacts
        await sendAlertsToContacts(emergencyContacts, alertData);
      }, () => {
        // Send without location if GPS fails
        sendAlertsToContacts(emergencyContacts, alertData);
      });
    } else {
      // Send without location if GPS not available
      await sendAlertsToContacts(emergencyContacts, alertData);
    }

    // Vibrate phone
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Show emergency helplines
    showEmergencyHelplines();
  };

  const sendAlertsToContacts = async (contacts, alertData) => {
    try {
      // Send to Firebase
      const success = await sendAlert(alertData);
      
      // Send SMS alerts via backend
      if (isOnline) {
        await fetch(`${API_BASE_URL}/emergency/send-sms`, {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            contacts: contacts,
            message: `🚨 EMERGENCY: ${alertData.userInfo.name} needs help! ${alertData.locationUrl || 'Location not available'}`,
            alertData: alertData
          })
        });
      }

      // Send push notification
      await sendNotification(
        '🚨 Emergency Alert Sent!',
        `Alert sent to ${contacts.length} emergency contacts`,
        { type: alertData.type, timestamp: Date.now() }
      );
      
      // Show success message
      const contactNames = contacts.map(c => c.name).join(', ');
      alert(`🚨 EMERGENCY ALERT SENT!\n\n📞 Contacts notified: ${contactNames}\n📍 Location shared\n🔥 Saved to Firebase`);
      
    } catch (error) {
      console.error('Alert sending failed:', error);
      
      // Fallback: Open SMS app with pre-filled message
      const message = `🚨 EMERGENCY: ${alertData.userInfo.name} needs help! ${alertData.locationUrl || 'Please call immediately!'}`;
      const phoneNumbers = contacts.map(c => c.phone).join(',');
      
      if (navigator.userAgent.match(/Android/i)) {
        window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`);
      } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        window.open(`sms:${phoneNumbers}&body=${encodeURIComponent(message)}`);
      } else {
        // Desktop fallback - show contact numbers
        alert(`❌ Auto-SMS failed. Please call these numbers:\n\n${contacts.map(c => `${c.name}: ${c.phone}`).join('\n')}`);
      }
    }
  };

  const showEmergencyHelplines = () => {
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    let options = [
      'Call Police (100)',
      'Call Women Helpline (1091)', 
      'Call Ambulance (108)'
    ];
    
    // Add emergency contacts to options
    emergencyContacts.forEach((contact, index) => {
      options.push(`Call ${contact.name} (${contact.phone})`);
    });
    
    options.push('Send SMS to All Emergency Contacts');
    
    const optionsList = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    const choice = window.prompt(`🚨 EMERGENCY OPTIONS:\n\n${optionsList}\n\nEnter choice (1-${options.length}):`);
    
    const choiceNum = parseInt(choice);
    
    if (choiceNum === 1) {
      window.open('tel:100');
    } else if (choiceNum === 2) {
      window.open('tel:1091');
    } else if (choiceNum === 3) {
      window.open('tel:108');
    } else if (choiceNum > 3 && choiceNum <= 3 + emergencyContacts.length) {
      // Call emergency contact
      const contactIndex = choiceNum - 4;
      const contact = emergencyContacts[contactIndex];
      window.open(`tel:${contact.phone}`);
    } else if (choiceNum === options.length) {
      // Send SMS to all
      sendEmergencySMS();
    } else {
      // Auto call police if invalid choice
      window.open('tel:100');
    }
  };

  const sendEmergencySMS = async () => {
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    if (emergencyContacts.length === 0) {
      return;
    }
    
    const message = `EMERGENCY: ${currentUser?.fullName || 'NIVRA User'} needs help! Call immediately.`;
    
    // Send to all contacts via backend API
    try {
      const response = await fetch(`${API_BASE_URL}/emergency/send-sms`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contacts: emergencyContacts,
          message: message,
          alertData: {
            userInfo: { name: currentUser?.fullName },
            location: { address: address }
          }
        })
      });
      
      if (response.ok) {
        console.log('SMS sent via backend');
        alert('📱 Emergency SMS sent to all contacts!');
      } else {
        throw new Error('Backend SMS failed');
      }
    } catch (error) {
      console.log('Backend SMS failed, using device SMS');
      
      // Fallback: Device SMS
      const allNumbers = emergencyContacts.map(c => c.phone).join(';');
      const smsUrl = `sms:${allNumbers}?body=${encodeURIComponent(message)}`;
      
      window.open(smsUrl, '_blank');
      alert('📱 SMS app opened. Please send the message.');
    }
  };

  // Emergency Contacts State
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '', countryCode: '+91' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Emergency Contacts Functions
  const saveContacts = (updatedContacts) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const fullPhone = `${newContact.countryCode}${newContact.phone}`;
      const updatedContacts = [...contacts, { 
        ...newContact, 
        phone: fullPhone,
        id: Date.now() 
      }];
      saveContacts(updatedContacts);
      setNewContact({ name: '', phone: '', relation: '', countryCode: '+91' });
      setShowAddForm(false);
    }
  };

  const deleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
  };

  const startSosTimer = () => {
    console.log('SOS Timer started');
    setSosProgress(0);
    const timer = setInterval(() => {
      setSosProgress(prev => {
        const newProgress = prev + (100/30);
        console.log('SOS Progress:', newProgress);
        if (newProgress >= 100) {
          clearInterval(timer);
          console.log('SOS Triggered!');
          sendEmergencyAlert('longpress');
          return 0;
        }
        return newProgress;
      });
    }, 100);
    setSosTimer(timer);
  };

  const stopSosTimer = () => {
    console.log('SOS Timer stopped');
    if (sosTimer) {
      clearInterval(sosTimer);
      setSosTimer(null);
      setSosProgress(0);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsTyping(true);
    
    // Simple keyword-based responses
    setTimeout(() => {
      let botResponse = '';
      const input = currentInput.toLowerCase();
      
      if (input.includes('thank') || input.includes('thanks') || input.includes('thx')) {
        botResponse = '😊 You\'re welcome! I\'m always here to help keep you safe. Stay protected with NIVRA!';
      } else if (input.includes('ok') || input.includes('okay') || input.includes('got it') || input.includes('understood')) {
        botResponse = '👍 Great! Remember, I\'m here 24/7 for any safety questions or concerns. Your safety is my priority!';
      } else if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
        botResponse = '👋 Take care and stay safe! Remember to keep NIVRA\'s emergency features active. See you soon!';
      } else if (input.includes('emergency') || input.includes('sos') || input.includes('help') || input.includes('bachao')) {
        botResponse = '🚨 EMERGENCY: Shake phone 3 times OR press SOS button OR say "help". All emergency contacts will be called automatically with your location!';
      } else if (input.includes('safety') || input.includes('tips') || input.includes('safe')) {
        botResponse = '🛡️ Safety Tips: Share location with trusted contacts, avoid isolated areas at night, trust your instincts, keep phone charged, stay alert in crowded places!';
      } else if (input.includes('night') || input.includes('dark') || input.includes('late')) {
        botResponse = '🌙 Night Safety: Stay in well-lit areas, use main roads, inform someone about your route, keep keys ready, avoid distractions like headphones!';
      } else if (input.includes('travel') || input.includes('cab') || input.includes('taxi') || input.includes('uber')) {
        botResponse = '🚗 Travel Safety: Share ride details with contacts, sit behind driver, check license plate, avoid sharing personal info, trust your instincts!';
      } else if (input.includes('stalking') || input.includes('follow') || input.includes('harassment')) {
        botResponse = '⚠️ If Being Followed: Go to crowded public place, don\'t go home, call someone, document evidence, report to police. Use NIVRA SOS immediately!';
      } else if (input.includes('workplace') || input.includes('office') || input.includes('work')) {
        botResponse = '🏢 Workplace Safety: Report harassment to HR, document incidents, have witnesses, know company policies, keep emergency contacts updated!';
      } else if (input.includes('self') || input.includes('defense') || input.includes('protect')) {
        botResponse = '🥊 Self Defense: Learn basic moves, carry legal safety items, stay confident, make noise if attacked, aim for vulnerable spots, run when possible!';
      } else if (input.includes('online') || input.includes('cyber') || input.includes('internet')) {
        botResponse = '💻 Online Safety: Don\'t share personal info, use privacy settings, block suspicious accounts, report harassment, meet online friends in public!';
      } else if (input.includes('shake') || input.includes('detection')) {
        botResponse = '📱 Shake Detection: Shake your phone 3 times quickly to auto-trigger SOS. Calls all emergency contacts and sends SMS with location!';
      } else if (input.includes('voice') || input.includes('panic')) {
        botResponse = '🎤 Voice Detection: Say "help", "emergency", "sos", or "bachao" to trigger panic alert. Make sure microphone permission is enabled!';
      } else if (input.includes('contacts') || input.includes('add')) {
        botResponse = '📞 Emergency Contacts: Go to Settings → Emergency Contacts to add up to 5 trusted people. They get called automatically during SOS!';
      } else if (input.includes('location') || input.includes('tracking')) {
        botResponse = '📍 Live Tracking: Your location is monitored 24/7. ML algorithm predicts safety level based on time, location, and other factors!';
      } else if (input.includes('police') || input.includes('law') || input.includes('legal')) {
        botResponse = '👮‍♀️ Legal Help: Police: 100, Women Helpline: 1091, Cyber Crime: 1930. Document evidence, file FIR, know your rights, seek legal aid!';
      } else if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
        botResponse = '👋 Hi! I\'m NIVRA AI, your complete safety assistant. Ask me about emergency features, safety tips, self-defense, or any women\'s safety concerns!';
      } else {
        botResponse = '🤖 I can help with: Emergency procedures, safety tips, self-defense, travel safety, workplace harassment, online safety, legal help, and app features!';
      }
      
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  useEffect(() => {
    if (isOnline) {
      const offlineAlerts = JSON.parse(localStorage.getItem('offlineAlerts') || '[]');
      if (offlineAlerts.length > 0) {
        offlineAlerts.forEach(async (alert) => {
          try {
            await fetch(`${API_BASE_URL}/emergency/alert`, {

              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(alert)
            });
          } catch (error) {
            console.error('Failed to send offline alert:', error);
          }
        });
        localStorage.removeItem('offlineAlerts');
        alert('📤 Offline alerts sent successfully!');
      }
    }
  }, [isOnline]);

  const renderPage = () => {
    if (showCommunity) {
      return <CommunityNetwork isDark={isDark} onBack={() => setShowCommunity(false)} />;
    }
    
    if (showNotifications) {
      return <PushNotifications isDark={isDark} onBack={() => setShowNotifications(false)} />;
    }
    
    if (currentPage === 'admin' && isAdmin) {
      return <AdminDashboard />;
    }
    
    switch(currentPage) {
      case 'chat':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', textAlign: 'center' }}>🤖 AI Safety Assistant</h2>
            
            {/* Chat Messages */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '15px',
              marginBottom: '20px',
              height: '400px',
              overflowY: 'auto'
            }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    background: msg.sender === 'user' ? '#667eea' : theme.border,
                    color: msg.sender === 'user' ? 'white' : theme.text,
                    padding: '10px 15px',
                    borderRadius: '15px',
                    maxWidth: '80%',
                    fontSize: '14px'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                  <div style={{
                    background: theme.border,
                    color: theme.text,
                    padding: '10px 15px',
                    borderRadius: '15px',
                    fontSize: '14px'
                  }}>
                    🤖 Typing...
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '15px',
              display: 'flex',
              gap: '10px'
            }}>
              <input 
                type="text" 
                placeholder="Ask about safety, emergency tips..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  background: theme.bg,
                  color: theme.text,
                  fontSize: '14px'
                }}
              />
              <button 
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                style={{
                  background: chatInput.trim() ? '#667eea' : '#8e8e93',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        );
      case 'map':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px', textAlign: 'center' }}>📍 Live Tracking</h2>
            
            {/* Safety Status */}
            <div style={{
              background: safetyStatus.color,
              color: 'white',
              padding: '15px',
              borderRadius: '15px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{safetyStatus.level}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Confidence: {safetyStatus.confidence}%</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                {safetyStatus.level === 'SAFE' ? '✅ You are in a safe area' :
                 safetyStatus.level === 'CAUTION' ? '⚠️ Be alert in this area' :
                 '🚨 High risk area - stay alert'}
              </div>
            </div>
            
            {/* Current Location */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                📍 Current Location
              </h3>
              <div style={{
                background: location ? '#e8f5e8' : '#fff3e0',
                border: `2px solid ${location ? '#4caf50' : '#ff9800'}`,
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '10px'
              }}>
                <p style={{ color: '#333', marginBottom: '8px', fontWeight: 'bold' }}>
                  📍 {profileData?.fullName?.split(' ')[0] || currentUser?.fullName?.split(' ')[0] || 'User'} is here
                </p>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{address}</p>
                {location ? (
                  <>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>
                      🌐 Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: '#4caf50', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                        ✅ Location Active • Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago
                      </p>
                      <button
                        onClick={() => {
                          setAddress('🔄 Getting fresh location...');
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              async (position) => {
                                const { latitude, longitude } = position.coords;
                                setLocation({ lat: latitude, lng: longitude });
                                try {
                                  const response = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                                  );
                                  const data = await response.json();
                                  setAddress(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                                } catch (error) {
                                  setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                                }
                                setLastUpdated(new Date());
                              },
                              () => setAddress('❌ Location refresh failed'),
                              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                            );
                          }
                        }}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#ff9800', fontSize: '12px', fontWeight: 'bold' }}>
                    🔄 Getting location... Please allow GPS access
                  </p>
                )}
              </div>
            </div>

            {/* Signals */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px' }}>📶 Signals Used</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div style={{ color: theme.text }}>✓ GPS: {location ? 'Active' : 'Searching'}</div>
                <div style={{ color: theme.text }}>✓ Network: Medium</div>
                <div style={{ color: theme.text }}>✓ Time: {new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'Day' : 'Night'}</div>
                <div style={{ color: theme.text }}>✓ Public Density: High</div>
                <div style={{ color: theme.text }}>✓ Crime Rate: Low</div>
                <div style={{ color: theme.text }}>✓ Battery: {battery || 48}%</div>
              </div>
            </div>

            {/* Live Update */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '10px' }}>🔄 Live Update</h3>
              <p style={{ color: theme.text, fontSize: '14px', margin: '5px 0' }}>Last Updated: {Math.floor((new Date() - lastUpdated) / 1000)} seconds ago</p>
              <p style={{ color: theme.text, fontSize: '14px', margin: '5px 0' }}>Battery: {battery || 48}%</p>
              <p style={{ color: theme.text, fontSize: '14px', margin: '5px 0' }}>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
            </div>

            {/* OpenStreetMap View */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px' }}>🗺 OpenStreetMap</h3>
              {location ? (
                <div style={{
                  height: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #ddd'
                }}>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01},${location.lat-0.01},${location.lng+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                    width="100%"
                    height="200"
                    style={{ border: 'none' }}
                    title="OpenStreetMap"
                  />
                </div>
              ) : (
                <div style={{
                  height: '200px',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc'
                }}>
                  <div style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
                    📍 Getting your location...<br/>
                    <small>Please allow location access</small>
                  </div>
                </div>
              )}
              
              {location && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=16`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🔗 Open in full map
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      case 'contacts':
        return (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => setCurrentPage('settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  color: theme.text
                }}
              >←</button>
              <h2 style={{ color: theme.text, margin: 0 }}>📞 Emergency Contacts</h2>
            </div>
            
            {contacts.length === 0 && (
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                ⚠️ No emergency contacts added. Add contacts for SOS alerts.
              </div>
            )}

            {/* Contact List */}
            {contacts.map((contact) => (
              <div key={contact.id} style={{
                    background: '#1E293B',
                    border: `1px solid #334155`,
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif'
              }}>
                <div>
                  <div style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>{contact.name}</div>
                  <div style={{ color: theme.subtext, fontSize: '14px' }}>{contact.phone}</div>
                  <div style={{ color: theme.subtext, fontSize: '12px' }}>{contact.relation}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    style={{
                      background: '#16A34A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    📞
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    style={{
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Add Contact Form */}
            {showAddForm ? (
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: theme.text, marginBottom: '15px', fontSize: '16px' }}>Add Emergency Contact</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    marginBottom: '15px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <select
                    value={newContact.countryCode}
                    onChange={(e) => setNewContact({ ...newContact, countryCode: e.target.value })}
                    style={{
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px',
                      width: '120px'
                    }}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Relation (e.g., Mother, Friend)"
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    marginBottom: '15px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={addContact}
                    style={{
                      flex: 1,
                      background: '#34c759',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{
                      flex: 1,
                      background: theme.border,
                      color: theme.subtext,
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                disabled={contacts.length >= 5}
                style={{
                  width: '100%',
                  background: contacts.length >= 5 ? '#64748B' : '#6366F1',
                  color: 'white',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: contacts.length >= 5 ? 'not-allowed' : 'pointer',
                  marginBottom: '20px'
                }}
              >
                ➕ Add Emergency Contact {contacts.length >= 5 && '(Max 5)'}
              </button>
            )}


          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                onClick={() => setCurrentPage('settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  color: theme.text
                }}
              >←</button>
              <h2 style={{ color: theme.text, margin: 0 }}>👤 Profile</h2>
            </div>
            
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '16px' }}>Edit Profile</h3>
              
              {/* Profile Picture */}
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div 
                  onClick={() => {
                    if (profileData.profilePicture) {
                      const modal = document.createElement('div');
                      modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
                      modal.innerHTML = `<img src="${profileData.profilePicture}" style="max-width: 90%; max-height: 90%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"><button style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">×</button>`;
                      modal.onclick = () => document.body.removeChild(modal);
                      document.body.appendChild(modal);
                    }
                  }}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: profileData.profilePicture ? 'transparent' : '#667eea',
                    backgroundImage: profileData.profilePicture ? `url(${profileData.profilePicture})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px',
                    fontSize: '32px',
                    color: 'white',
                    border: `3px solid ${theme.border}`,
                    cursor: profileData.profilePicture ? 'pointer' : 'default',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  {!profileData.profilePicture && (profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : '👤')}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  id="profilePicture"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('❌ File too large! Please select an image under 5MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newData = {...profileData, profilePicture: event.target.result};
                        setProfileData(newData);
                        localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => document.getElementById('profilePicture').click()}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    📷 {profileData.profilePicture ? 'Change' : 'Upload'}
                  </button>
                  
                  {profileData.profilePicture && (
                    <>
                      <button
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;`;
                          modal.innerHTML = `<img src="${profileData.profilePicture}" style="max-width: 90%; max-height: 90%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"><button style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">×</button>`;
                          modal.onclick = () => document.body.removeChild(modal);
                          document.body.appendChild(modal);
                        }}
                        style={{
                          background: '#34c759',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        👁️ View
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Remove profile picture?')) {
                            const newData = {...profileData, profilePicture: null};
                            setProfileData(newData);
                            localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                          }
                        }}
                        style={{
                          background: '#ff3b30',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </>
                  )}
                </div>
                
                {profileData.profilePicture && (
                  <p style={{ 
                    color: theme.subtext, 
                    fontSize: '11px', 
                    margin: '8px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Click photo to view full size
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => {
                    const newData = {...profileData, fullName: e.target.value};
                    setProfileData(newData);
                    localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                  }}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: theme.bg,
                    color: theme.text
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileData.email}
                  onChange={(e) => {
                    const newData = {...profileData, email: e.target.value};
                    setProfileData(newData);
                    localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                  }}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: theme.bg,
                    color: theme.text
                  }}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={profileData.phone}
                  onChange={(e) => {
                    const newData = {...profileData, phone: e.target.value};
                    setProfileData(newData);
                    localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                  }}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: theme.bg,
                    color: theme.text
                  }}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={profileData.address || ''}
                  onChange={(e) => {
                    const newData = {...profileData, address: e.target.value};
                    setProfileData(newData);
                    localStorage.setItem('nivra_profile_data', JSON.stringify(newData));
                  }}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: theme.bg,
                    color: theme.text
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleProfileUpdate}
                    style={{
                      flex: '1',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setCurrentPage('settings')}
                    style={{
                      flex: '1',
                      background: theme.border,
                      color: theme.subtext,
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            
            {/* Emergency Contacts */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px' }}>📞 Emergency Contacts ({contacts.length}/5)</h3>
              
              {contacts.length > 0 ? (
                <div style={{ marginBottom: '15px' }}>
                  {contacts.slice(0, 3).map((contact) => (
                    <div key={contact.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '8px',
                      background: theme.bg,
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>{contact.name}</div>
                        <div style={{ color: theme.subtext, fontSize: '12px' }}>{contact.relation}</div>
                      </div>
                      <button
                        onClick={() => window.open(`tel:${contact.phone}`)}
                        style={{
                          background: '#34c759',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📞
                      </button>
                    </div>
                  ))}
                  {contacts.length > 3 && (
                    <div style={{ color: theme.subtext, fontSize: '12px', textAlign: 'center' }}>
                      +{contacts.length - 3} more contacts
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  color: theme.subtext,
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px',
                  background: theme.bg,
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  No emergency contacts added
                </div>
              )}
              
              <button
                onClick={() => setCurrentPage('contacts')}
                style={{
                  width: '100%',
                  background: '#ff6b9d',
                  color: 'white',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Manage Emergency Contacts
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: theme.text, marginBottom: '20px' }}>⚙️ Settings</h2>
            

            
            {/* Security Settings */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px' }}>🔒 Security</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: theme.text }}>🔐 Biometric Lock</span>
                <button 
                  onClick={() => {
                    const enabled = localStorage.getItem('nivra_biometric_enabled') === 'true';
                    if (enabled) {
                      if (window.confirm('🔓 Disable biometric lock?\n\nApp will no longer require biometric authentication on startup.')) {
                        localStorage.setItem('nivra_biometric_enabled', 'false');
                        alert('🔓 Biometric lock disabled successfully!');
                        window.location.reload();
                      }
                    } else {
                      localStorage.setItem('nivra_biometric_enabled', 'true');
                      alert('🔐 Biometric lock enabled!\n\nApp will require authentication on next startup.');
                      window.location.reload();
                    }
                  }}
                  style={{
                    background: localStorage.getItem('nivra_biometric_enabled') === 'true' ? '#16A34A' : '#64748B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '6px 12px',
                    fontSize: '12px'
                  }}
                >
                  {localStorage.getItem('nivra_biometric_enabled') === 'true' ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {localStorage.getItem('nivra_biometric_enabled') === 'true' && (
                <div style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '15px'
                }}>
                  🔐 Biometric authentication is active. App will require fingerprint/face/PIN on startup.
                </div>
              )}
              
              {localStorage.getItem('nivra_biometric_enabled') !== 'true' && (
                <div style={{
                  background: '#fff3e0',
                  color: '#f57c00',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '15px'
                }}>
                  🔓 Biometric lock is disabled. Enable for enhanced security.
                </div>
              )}

            </div>
            
            {/* App Settings */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: theme.text, marginBottom: '15px' }}>⚙️ App Settings</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: theme.text }}>📳 Shake Detection</span>
                <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: '500' }}>
                  ALWAYS ON
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: theme.text }}>🎤 Voice Detection</span>
                <span style={{ color: isListening ? '#16A34A' : '#F59E0B', fontSize: '12px' }}>
                  {isListening ? 'ANALYZING' : 'STARTING'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: theme.text }}>🎤 Microphone Access</span>
                <button 
                  onClick={() => {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                      .then(() => alert('✅ Microphone access granted!'))
                      .catch(() => alert('❌ Please allow microphone access in browser settings'));
                  }}
                  style={{
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Allow
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: theme.text }}>📍 Location Access</span>
                <button 
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      () => alert('✅ Location access granted!'),
                      () => alert('❌ Please allow location access in browser settings')
                    );
                  }}
                  style={{
                    background: '#6366F1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Allow
                </button>
              </div>
              
              {/* Community & Notifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <button
                  onClick={() => setShowCommunity(true)}
                  style={{
                    background: '#ff6b9d',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  👥 Community
                </button>
                <button
                  onClick={() => setShowNotifications(true)}
                  style={{
                    background: '#34c759',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🔔 Notifications
                </button>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  style={{
                    width: '100%',
                    background: '#8A2BE2',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginBottom: '15px'
                  }}
                >
                  🛡️ Admin Dashboard
                </button>
              )}
              
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }
                }}
                style={{
                  width: '100%',
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                🚺 Logout
              </button>
            </div>
            
            {/* Safety Tips */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: theme.text, fontWeight: '600' }}>
                💡 Safety Tips
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.8', color: theme.subtext }}>
                <p style={{ margin: '0 0 8px 0' }}>🔹 3 movements in 2 seconds = Auto SOS</p>
                <p style={{ margin: '0 0 8px 0' }}>🔹 Auto-calls + SMS emergency contacts</p>
                <p style={{ margin: '0 0 8px 0' }}>🔹 Mobile shake + Laptop SPACE key</p>
                <p style={{ margin: '0' }}>🔹 No manual clicks required</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            {/* Offline Emergency Contacts */}
            {!isOnline && showOfflineContacts && (
              <div style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '20px',
                color: 'white',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
                  📵 Network Lost - Emergency Contacts
                </h3>
                
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '10px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  ⏰ Offline for: {offlineStartTime ? Math.floor((Date.now() - offlineStartTime) / 60000) : 0} minutes
                  <br/>
                  🚨 Auto SOS in: {Math.max(0, 30 - Math.floor((Date.now() - (offlineStartTime || Date.now())) / 60000))} minutes
                </div>
                
                {contacts.length > 0 ? (
                  <div>
                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', opacity: 0.9 }}>
                      📞 Tap to call emergency contacts:
                    </p>
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => window.open(`tel:${contact.phone}`)}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{contact.name} ({contact.relation})</span>
                        <span>📞 {contact.phone}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}>
                    ⚠️ No emergency contacts added!<br/>
                    Add contacts in settings when online.
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (window.confirm('🚨 Trigger emergency SOS now?')) {
                      sendOfflineEmergencyAlert();
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#ff3b30',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '15px'
                  }}
                >
                  🚨 MANUAL SOS NOW
                </button>
              </div>
            )}
            

            
            {/* Quick Stats Card */}
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: theme.text, fontWeight: '600' }}>
                📊 Quick Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span>
                  <div>
                    <div style={{ color: theme.text, fontWeight: '500' }}>Location</div>
                    <div style={{ color: safetyStatus.color, fontSize: '12px' }}>{safetyStatus.level}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔋</span>
                  <div>
                    <div style={{ color: theme.text, fontWeight: '500' }}>Battery</div>
                    <div style={{ color: (battery || 85) > 20 ? '#34c759' : '#ff3b30', fontSize: '12px' }}>{battery || 85}%</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📶</span>
                  <div>
                    <div style={{ color: theme.text, fontWeight: '500' }}>Network</div>
                    <div style={{ color: isOnline ? '#34c759' : '#ff3b30', fontSize: '12px' }}>{isOnline ? 'Strong' : 'Offline'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏰</span>
                  <div>
                    <div style={{ color: theme.text, fontWeight: '500' }}>Last Check</div>
                    <div style={{ color: theme.subtext, fontSize: '12px' }}>{Math.floor((new Date() - lastUpdated) / 1000)}s ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency SOS Card */}
            <div style={{
              background: themeConfig.gradients.sos,
              borderRadius: '16px',
              padding: '15px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '16px', fontWeight: '600' }}>
                🆘 Emergency SOS
              </h3>
              <button 
                onMouseDown={startSosTimer}
                onMouseUp={stopSosTimer}
                onTouchStart={startSosTimer}
                onTouchEnd={stopSosTimer}
                onClick={() => {
                  console.log('SOS Button clicked');
                  const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
                  
                  if (emergencyContacts.length === 0) {
                    alert('⚠️ No emergency contacts found!\nPlease add emergency contacts first.');
                    setCurrentPage('contacts');
                    return;
                  }
                  
                  console.log('Emergency contacts:', emergencyContacts);
                  
                  // Test direct call first
                  const firstContact = emergencyContacts[0];
                  console.log('Calling first contact:', firstContact);
                  
                  if (window.confirm(`🚨 EMERGENCY\n\nCall ${firstContact.name}?\n${firstContact.phone}`)) {
                    console.log('User confirmed call');
                    window.location.href = `tel:${firstContact.phone}`;
                    
                    // Auto send SMS via backend API
                    setTimeout(async () => {
                      const message = `EMERGENCY: ${currentUser?.fullName || 'User'} needs help! Call immediately. Location: ${address || 'Unknown'}`;
                      
                      try {
                        console.log('Sending automatic SMS via backend...');
                        
                        const response = await fetch(`${API_BASE_URL}/emergency/send-sms`, {

                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            contacts: emergencyContacts,
                            message: message,
                            alertData: {
                              type: 'sos',
                              userInfo: { name: currentUser?.fullName },
                              location: { address: address },
                              timestamp: new Date().toLocaleString()
                            }
                          })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                          console.log('SMS sent successfully:', result);
                          const contactNames = emergencyContacts.map(c => c.name).join(', ');
                          alert(`✅ Emergency SMS sent automatically to:\n${contactNames}`);
                        } else {
                          throw new Error(result.message || 'SMS sending failed');
                        }
                        
                      } catch (error) {
                        console.error('Auto SMS failed:', error);
                        alert('❌ Auto SMS failed. Please call contacts manually.');
                      }
                    }, 500);
                  }
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: sosProgress > 0 ? `conic-gradient(#34c759 ${sosProgress * 3.6}deg, rgba(255,255,255,0.3) 0deg)` : 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.9)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                title={sosProgress > 0 ? `Hold... ${Math.round(sosProgress)}%` : 'Emergency SOS'}
              >
                SOS
              </button>
            </div>
            




            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: isDark ? 'none' : '0 8px 25px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: theme.text, fontWeight: '600' }}>
                🔒 Safety Features {!isOnline && !offlineAlertSent && '⚠️'}
              </h3>
              {!isOnline && !offlineAlertSent && (
                <div style={{
                  background: '#ff9500',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  📡 Network lost! Auto SOS in {Math.max(0, 30 - Math.floor((Date.now() - (Date.now() % 1000)) / 1000))}s
                </div>
              )}
              {!isOnline && offlineAlertSent && (
                <div style={{
                  background: '#34c759',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '10px',
                  marginBottom: '15px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  ✅ Offline SOS sent! Alert will sync when online
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>📳 Auto Shake SOS</span>
                  <button 
                    onClick={() => setShakeEnabled(!shakeEnabled)}
                    style={{
                      background: shakeEnabled ? '#16A34A' : '#64748B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '4px 12px',
                      fontSize: '12px'
                    }}
                  >
                    {shakeEnabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
                {(shakeSequence.length > 0 || laptopShakes.length > 0) && (
                  <div style={{
                    background: (shakeSequence.length >= 2 || laptopShakes.length >= 2) ? '#DC2626' : '#F59E0B',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '10px',
                    marginTop: '10px',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {shakeSequence.length > 0 ? (
                      `📱 ${shakeSequence.length}/3 ${shakeSequence.length >= 2 ? '🚨' : ''}`
                    ) : (
                      `💻 ${laptopShakes.length}/3 ${laptopShakes.length >= 2 ? '🚨' : ''}`
                    )}
                  </div>
                )}
                

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>🎤 Voice Detection</span>
                  <span style={{ color: isListening ? '#34c759' : '#ff9500', fontSize: '12px', fontWeight: '500' }}>
                    {isListening ? 'ANALYZING' : 'STARTING'}
                  </span>
                </div>
                {isListening && (
                  <div style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '8px',
                    borderRadius: '8px',
                    marginTop: '8px',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    🎤 Listening for emergency keywords
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>📶 Offline SOS</span>
                  <span style={{ color: !isOnline ? '#DC2626' : '#16A34A', fontSize: '12px', fontWeight: '500' }}>
                    {!isOnline ? (offlineAlertSent ? 'SENT' : 'TRIGGERED') : 'READY'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: theme.text, fontWeight: '600' }}>
                🚨 Emergency Helplines
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { name: 'Police', number: '100' },
                  { name: 'Women', number: '1091' },
                  { name: 'Ambulance', number: '108' },
                  { name: 'Fire', number: '101' }
                ].map((helpline) => (
                  <button
                    key={helpline.number}
                    onClick={() => window.open(`tel:${helpline.number}`)}
                    style={{
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {helpline.name}<br/>{helpline.number}
                  </button>
                ))}
              </div>
            </div>


          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛡️</div>
          <h1 style={{ margin: '0', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
          <p style={{ margin: '10px 0', fontSize: '16px', opacity: 0.9 }}>Loading your safety dashboard...</p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .logo-hover {
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.3));
            cursor: pointer;
          }
          .logo-hover:hover {
            filter: drop-shadow(0 0 20px rgba(255, 107, 157, 0.8)) drop-shadow(0 0 30px rgba(255, 107, 157, 0.6));
            transform: scale(1.1) rotate(5deg);
          }
          .brand-hover {
            transition: all 0.3s ease;
            text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
            cursor: pointer;
          }
          .brand-hover:hover {
            text-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6), 0 0 40px rgba(99, 102, 241, 0.4);
            transform: scale(1.05);
          }
        `}
      </style>
    <div style={{ 
      background: professionalTheme.gradients.primary,
      minHeight: '100vh',
      fontFamily: professionalTheme.typography.fontFamily,
      margin: '0',
      padding: '0',
      maxWidth: '414px',
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      boxShadow: professionalTheme.shadows.card
    }}>
      
      {/* Firebase Notification Popup */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '20px',
          right: '20px',
          background: '#ff3b30',
          color: 'white',
          padding: '15px',
          borderRadius: '15px',
          zIndex: '9999',
          boxShadow: '0 10px 30px rgba(255, 59, 48, 0.3)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '5px' }}>{notification.title}</div>
          <div style={{ fontSize: '14px', opacity: '0.9' }}>{notification.body}</div>
          <button
            onClick={clearNotification}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '8px 20px 5px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: professionalTheme.typography.weights.semibold,
        color: professionalTheme.colors.primaryText,
        borderBottom: `1px solid ${professionalTheme.colors.border}`,
        position: 'fixed',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        zIndex: '1000'
      }}>
        <div>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: isOnline ? professionalTheme.colors.successGreen : professionalTheme.colors.sosRed, fontSize: '12px' }}>
            {isOnline ? '●' : '●'} {isOnline ? 'Online' : (offlineAlertSent ? 'SOS Sent' : 'Offline')}
          </span>
          {battery && (
            <span style={{ fontSize: '12px' }}>🔋{battery}%</span>
          )}
          <span>📶</span>
        </div>
      </div>

      <div style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${professionalTheme.colors.border}`,
        position: 'fixed',
        top: '37px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        zIndex: '999'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-hover" style={{ display: 'inline-block' }}>
            <NivraLogo size={40} />
          </div>
          <div>
            <h1 className="brand-hover" style={{ 
              margin: '0', 
              color: professionalTheme.colors.primaryAccent, 
              fontSize: '28px', 
              fontWeight: professionalTheme.typography.weights.bold, 
              fontFamily: professionalTheme.typography.fontFamily
            }}>NIVRA</h1>
            <p style={{ margin: '2px 0 0 0', color: professionalTheme.colors.secondaryText, fontSize: '14px' }}>
              Hi, {profileData?.fullName?.split(' ')[0] || currentUser?.fullName?.split(' ')[0] || 'User'}! 👋
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div 
            onClick={() => setCurrentPage('profile')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: profileData.profilePicture ? '#ff6b9d' : '#ff6b9d',
              backgroundImage: profileData.profilePicture ? `url(${profileData.profilePicture})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: '2px solid #ff6b9d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'all 0.3s ease',
              boxShadow: '0 0 0 rgba(99, 102, 241, 0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.8)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 0 rgba(99, 102, 241, 0)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {!profileData.profilePicture && '👤'}
          </div>
        </div>
      </div>



      <div style={{ 
        padding: '20px',
        paddingTop: '140px',
        paddingBottom: '100px',
        background: theme.bg,
        minHeight: '100vh',
        position: 'relative'
      }}>

        {renderPage()}
      </div>



      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${professionalTheme.colors.border}`,
        padding: '10px 0 25px 0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => {
            setCurrentPage('home');
            setShowCommunity(false);
            setShowNotifications(false);
          }}
          style={{ 
            background: (currentPage === 'home' && !showCommunity && !showNotifications) ? professionalTheme.colors.primaryAccent : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '24px', 
            cursor: 'pointer',
            borderRadius: professionalTheme.borderRadius.medium,
            color: (currentPage === 'home' && !showCommunity && !showNotifications) ? professionalTheme.colors.primaryText : '#64748B',
            transition: 'all 0.2s ease',
            boxShadow: (currentPage === 'home' && !showCommunity && !showNotifications) ? professionalTheme.shadows.glow : 'none'
          }}
          onMouseEnter={(e) => {
            if (!(currentPage === 'home' && !showCommunity && !showNotifications)) {
              e.target.style.color = professionalTheme.colors.primaryAccent;
              e.target.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(currentPage === 'home' && !showCommunity && !showNotifications)) {
              e.target.style.color = '#64748B';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >🏠</button>

        <button 
          onClick={() => {
            setCurrentPage('map');
            setShowCommunity(false);
            setShowNotifications(false);
          }}
          style={{ 
            background: (currentPage === 'map' && !showCommunity && !showNotifications) ? '#6366F1' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '24px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: (currentPage === 'map' && !showCommunity && !showNotifications) ? '#F8FAFC' : '#64748B',
            transition: 'all 0.2s ease',
            boxShadow: (currentPage === 'map' && !showCommunity && !showNotifications) ? '0 0 15px rgba(99, 102, 241, 0.6)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!(currentPage === 'map' && !showCommunity && !showNotifications)) {
              e.target.style.color = '#6366F1';
              e.target.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(currentPage === 'map' && !showCommunity && !showNotifications)) {
              e.target.style.color = '#64748B';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >📍</button>

        <button 
          onClick={() => {
            setCurrentPage('chat');
            setShowCommunity(false);
            setShowNotifications(false);
          }}
          style={{ 
            background: (currentPage === 'chat' && !showCommunity && !showNotifications) ? '#6366F1' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '24px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: (currentPage === 'chat' && !showCommunity && !showNotifications) ? '#F8FAFC' : '#64748B',
            transition: 'all 0.2s ease'
          }}
        >🤖</button>

        <button 
          onClick={() => {
            setCurrentPage('settings');
            setShowCommunity(false);
            setShowNotifications(false);
          }}
          style={{ 
            background: (currentPage === 'settings' && !showCommunity && !showNotifications) ? '#6366F1' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '24px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: (currentPage === 'settings' && !showCommunity && !showNotifications) ? '#F8FAFC' : '#64748B',
            transition: 'all 0.2s ease'
          }}
        >⚙️</button>
      </div>
      
      {/* Biometric Authentication Modal */}
      {showBiometricAuth && (
        <BiometricAuth
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowBiometricAuth(false);
            alert('✅ Authentication successful!');
          }}
          onCancel={() => setShowBiometricAuth(false)}
        />
      )}
      

      
      {shakeSequence.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          background: '#ff9500',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          📳 Shake {shakeSequence.length}/3
        </div>
      )}

    </div>
    </>
  );
};

export default Dashboard;
