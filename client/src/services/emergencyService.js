import api from './api';

const emergencyService = {
  // Send emergency alert
  sendAlert: async (alertData) => {
    const response = await api.post('/emergency/alert', alertData);
    return response;
  },

  // Get user's emergency alerts
  getAlerts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/emergency/alerts?${queryString}`);
    return response;
  },

  // Resolve emergency alert
  resolveAlert: async (alertId) => {
    const response = await api.put(`/emergency/alerts/${alertId}/resolve`);
    return response;
  },

  // Get nearby safety locations
  getSafetyLocations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/emergency/safety-locations?${queryString}`);
    return response;
  },

  // Send offline emergency alert (for PWA)
  sendOfflineAlert: async (alertData) => {
    try {
      // Try to send immediately
      return await emergencyService.sendAlert(alertData);
    } catch (error) {
      // If offline, store in cache for later sync
      if ('caches' in window) {
        const cache = await caches.open('nivra-offline-alerts');
        const request = new Request('/offline-alert', {
          method: 'POST',
          body: JSON.stringify({
            data: alertData,
            token: localStorage.getItem('token'),
            timestamp: Date.now(),
          }),
        });
        await cache.put(request, new Response(JSON.stringify(alertData)));
        
        // Register background sync if available
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('emergency-alert');
        }
        
        return { success: true, offline: true };
      }
      throw error;
    }
  },

  // Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },

  // Watch location changes
  watchLocation: (callback, errorCallback) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  },

  // Stop watching location
  stopWatchingLocation: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  // Reverse geocoding (get address from coordinates)
  reverseGeocode: async (latitude, longitude) => {
    try {
      // Using free OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${latitude}, ${longitude}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude}, ${longitude}`;
    }
  },
};

export default emergencyService;