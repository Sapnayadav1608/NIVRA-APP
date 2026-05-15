import React, { useState, useEffect } from 'react';

const PushNotifications = ({ isDark, onBack }) => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Check if service worker and push manager are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkSubscription();
    }

    // Load notification history
    const savedNotifications = JSON.parse(localStorage.getItem('nivra_notifications') || '[]');
    setNotifications(savedNotifications);
    
    // Load notification settings
    const notifEnabled = localStorage.getItem('nivra_notifications_enabled') !== 'false';
    setNotificationsEnabled(notifEnabled);
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToPush();
        showNotification('🔔 Notifications Enabled', 'You will now receive safety alerts and updates');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID keys (in production, use your actual VAPID keys)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEaQK7wOuOeHzM6j4HSMVvjQBDEZHby2-Tvgqg7XRBSJjBOBKeqx8';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setIsSubscribed(true);
      
      // Send subscription to server (in production)
      console.log('Push subscription:', subscription);
      
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const showNotification = (title, body, data = {}) => {
    if (permission === 'granted' && notificationsEnabled) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'nivra-notification',
        data
      });

      // Save to history
      const newNotification = {
        id: Date.now(),
        title,
        body,
        timestamp: new Date().toLocaleString(),
        read: false
      };
      
      const updatedNotifications = [newNotification, ...notifications.slice(0, 9)];
      setNotifications(updatedNotifications);
      localStorage.setItem('nivra_notifications', JSON.stringify(updatedNotifications));

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const sendTestNotification = () => {
    const testNotifications = [
      {
        title: '🚨 Emergency Alert',
        body: 'Priya Sharma needs help! Location: Connaught Place, Delhi'
      },
      {
        title: '⚠️ Safety Alert',
        body: 'High crime rate reported in your area. Stay alert!'
      },
      {
        title: '🌙 Night Safety Reminder',
        body: 'It\'s getting dark. Share your location with trusted contacts.'
      },
      {
        title: '📍 Location Update',
        body: 'You\'ve entered a safe zone. ML confidence: 92%'
      },
      {
        title: '🔋 Battery Warning',
        body: 'Battery low (15%). Consider charging for emergency features.'
      }
    ];

    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    showNotification(randomNotification.title, randomNotification.body);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('nivra_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('nivra_notifications');
  };

  const theme = {
    bg: '#0F172A',
    cardBg: '#1E293B',
    text: '#F8FAFC',
    subtext: '#CBD5E1',
    border: '#334155'
  };

  return (
    <div style={{ padding: '20px', background: theme.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '10px',
            color: theme.text
          }}
        >←</button>
        <h2 style={{ color: theme.text, margin: 0 }}>
          🔔 Push Notifications
        </h2>
      </div>

      {/* Permission Status */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        border: `1px solid ${theme.border}`
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: theme.text }}>📱 Notification Settings</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: theme.text }}>Permission Status:</span>
            <span style={{
              background: permission === 'granted' ? '#16A34A' : 
                         permission === 'denied' ? '#DC2626' : '#F59E0B',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              textTransform: 'capitalize'
            }}>
              {permission}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: theme.text }}>Push Subscription:</span>
            <span style={{
              background: isSubscribed ? '#16A34A' : '#64748B',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {isSubscribed ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            style={{
              width: '100%',
              background: '#6366F1',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '10px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            🔔 Enable Notifications
          </button>
        )}

        <button
          onClick={() => {
            setNotificationsEnabled(!notificationsEnabled);
            localStorage.setItem('nivra_notifications_enabled', !notificationsEnabled);
          }}
          style={{
            width: '100%',
            background: notificationsEnabled ? '#16A34A' : '#64748B',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {notificationsEnabled ? '🔔 Notifications Enabled' : '🔕 Notifications Disabled'}
        </button>
      </div>

      {/* Notification Types */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        border: `1px solid ${theme.border}`
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: theme.text }}>🔔 Notification Types</h3>
        
        {[
          { icon: '🚨', title: 'Emergency Alerts', desc: 'Immediate help requests from community', key: 'emergency' },
          { icon: '⚠️', title: 'Safety Warnings', desc: 'Location-based safety alerts', key: 'safety' },
          { icon: '📍', title: 'Location Updates', desc: 'ML safety predictions and zone changes', key: 'location' },
          { icon: '🌙', title: 'Time-based Reminders', desc: 'Night safety and check-in reminders', key: 'reminders' },
          { icon: '🔋', title: 'System Alerts', desc: 'Battery, connectivity, and app updates', key: 'system' }
        ].map((type, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            marginBottom: '10px',
            background: theme.bg,
            borderRadius: '10px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '24px', marginRight: '15px' }}>{type.icon}</div>
              <div>
                <div style={{ fontWeight: '600', color: theme.text, marginBottom: '2px' }}>
                  {type.title}
                </div>
                <div style={{ fontSize: '12px', color: theme.subtext }}>
                  {type.desc}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const currentSetting = localStorage.getItem(`nivra_notif_${type.key}`) !== 'false';
                localStorage.setItem(`nivra_notif_${type.key}`, !currentSetting);
                // Force re-render
                setNotifications([...notifications]);
              }}
              style={{
                background: localStorage.getItem(`nivra_notif_${type.key}`) !== 'false' ? '#16A34A' : '#64748B',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              {localStorage.getItem(`nivra_notif_${type.key}`) !== 'false' ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>

      {/* Notification History */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '15px',
        padding: '20px',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: theme.text }}>📋 Recent Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                border: `1px solid ${theme.border}`,
                color: theme.subtext,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: theme.subtext,
            fontSize: '14px'
          }}>
            📭 No notifications yet<br/>
            <small>Enable notifications to receive safety alerts</small>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: notif.read ? theme.bg : '#e3f2fd',
                borderRadius: '10px',
                border: `1px solid ${notif.read ? theme.border : '#2196f3'}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ 
                fontWeight: notif.read ? '500' : '600', 
                color: theme.text, 
                marginBottom: '5px' 
              }}>
                {notif.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: theme.subtext, 
                marginBottom: '8px' 
              }}>
                {notif.body}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: theme.subtext,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{notif.timestamp}</span>
                {!notif.read && (
                  <span style={{
                    background: '#2196f3',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}>
                    NEW
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PushNotifications;