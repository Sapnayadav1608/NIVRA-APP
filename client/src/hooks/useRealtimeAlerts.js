import { useState, useEffect } from 'react';
import { writeAlert, listenToAlerts, updateUserLocation } from '../firebase/config';

export const useRealtimeAlerts = (userId) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Listen to alerts
    const unsubscribe = listenToAlerts(userId, (snapshot) => {
      if (snapshot.exists()) {
        const alertsData = snapshot.val();
        const alertsList = Object.keys(alertsData).map(key => ({
          id: key,
          ...alertsData[key]
        }));
        setAlerts(alertsList.reverse()); // Latest first
        setIsConnected(true);
      } else {
        setAlerts([]);
        setIsConnected(true);
      }
    });

    return unsubscribe;
  }, [userId]);

  const sendAlert = async (alertData) => {
    try {
      await writeAlert(userId, alertData);
      return true;
    } catch (error) {
      console.error('Error sending alert:', error);
      return false;
    }
  };

  const updateLocation = async (location) => {
    try {
      await updateUserLocation(userId, location);
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  };

  return {
    alerts,
    isConnected,
    sendAlert,
    updateLocation
  };
};