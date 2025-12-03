import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, off } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBvOoQ6oQaL9rlvfYwX1Z2nJkL3mN4pQ5r",
  authDomain: "nivra-app.firebaseapp.com",
  projectId: "nivra-app",
  storageBucket: "nivra-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Database helper functions
export const writeAlert = async (userId, alertData) => {
  const alertsRef = ref(db, `alerts/${userId}`);
  return push(alertsRef, {
    ...alertData,
    timestamp: Date.now(),
    status: 'active'
  });
};

export const listenToAlerts = (userId, callback) => {
  const alertsRef = ref(db, `alerts/${userId}`);
  onValue(alertsRef, callback);
  return () => off(alertsRef, 'value', callback);
};

export const updateUserLocation = (userId, location) => {
  const userRef = ref(db, `users/${userId}/location`);
  return set(userRef, {
    ...location,
    lastUpdated: Date.now()
  });
};

export const listenToUserStatus = (userId, callback) => {
  const statusRef = ref(db, `users/${userId}/status`);
  onValue(statusRef, callback);
  return () => off(statusRef, 'value', callback);
};

// Initialize Messaging
export const messaging = getMessaging(app);

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BFkGGzcmQ-_dxHjhfoyS02db5ObGC-28K_abcdef123456'
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;