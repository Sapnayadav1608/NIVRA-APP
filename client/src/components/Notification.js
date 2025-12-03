import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import socketService from '../services/socketService';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for various notification types
    socketService.onEmergencyBroadcast((data) => {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Emergency Alert',
        message: `${data.userName} needs help nearby!`,
        duration: 10000,
      });
    });

    socketService.onNearbyEmergency((data) => {
      addNotification({
        id: Date.now() + 1,
        type: 'warning',
        title: 'Nearby Emergency',
        message: data.message,
        duration: 8000,
      });
    });

    socketService.onNotification((data) => {
      addNotification({
        id: Date.now() + 2,
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message,
        duration: data.duration || 6000,
      });
    });

    return () => {
      socketService.off('emergency-broadcast');
      socketService.off('nearby-emergency');
      socketService.off('notification');
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            top: `${80 + index * 80}px !important`,
            zIndex: 9999,
          }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
            sx={{ minWidth: 300 }}
          >
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default Notification;