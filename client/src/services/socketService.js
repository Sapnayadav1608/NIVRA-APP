import { io } from 'socket.io-client';
import { SERVER_BASE_URL } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = SERVER_BASE_URL;

    
    this.socket = io(serverUrl, {
      auth: {
        token: localStorage.getItem('token'),
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Join user room for personalized notifications
      if (userId) {
        this.socket.emit('join-room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emergency alert events
  onEmergencyBroadcast(callback) {
    if (this.socket) {
      this.socket.on('emergency-broadcast', callback);
    }
  }

  onNearbyEmergency(callback) {
    if (this.socket) {
      this.socket.on('nearby-emergency', callback);
    }
  }

  emitEmergencyAlert(alertData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('emergency-alert', alertData);
    }
  }

  // Location sharing events
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  emitLocationUpdate(locationData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location-update', locationData);
    }
  }

  // Chat events
  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  emitChatMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat-message', messageData);
    }
  }

  // Admin events
  onAdminAlert(callback) {
    if (this.socket) {
      this.socket.on('admin-alert', callback);
    }
  }

  // General notification events
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;