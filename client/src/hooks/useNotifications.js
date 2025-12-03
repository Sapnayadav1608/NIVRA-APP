import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../firebase/config';

export const useNotifications = () => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Request permission and get token
    const getToken = async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        setToken(fcmToken);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    getToken();

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data
        });
      })
      .catch((err) => console.log('Failed to receive message: ', err));
  }, []);

  const sendNotification = async (title, body, data = {}) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'emergency-alert',
          requireInteraction: true,
          data,
          actions: [
            {
              action: 'view',
              title: 'View Alert'
            }
          ]
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  return {
    token,
    notification,
    sendNotification,
    clearNotification: () => setNotification(null)
  };
};