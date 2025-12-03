const API_BASE_URL = 'http://localhost:5000/api';

class AdminService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Get authorization headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
    };
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Get all users
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get user details
  async getUserDetails(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  // Update user status (block/unblock)
  async updateUserStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Get all alerts
  async getAlerts() {
    const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
      headers: this.getHeaders()
    });
    return await this.handleResponse(response);
  }

  // Update alert status
  async updateAlertStatus(alertId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  // Delete alert
  async deleteAlert(alertId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  // Get system statistics
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get system health
  async getSystemHealth() {
    const response = await fetch(`${API_BASE_URL}/admin/health`, {
      headers: this.getHeaders()
    });
    return await this.handleResponse(response);
  }

  // Get analytics data
  async getAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return fallback data
      return this.getFallbackAnalytics();
    }
  }

  // Create new alert (for testing)
  async createAlert(alertData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(alertData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Update user activity
  async updateUserActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/activity`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user activity:', error);
      // Ignore error for activity updates
    }
  }

  // Fallback data methods
  getFallbackUsers() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return [
      {
        id: 1,
        name: currentUser.fullName || 'Demo User',
        email: currentUser.email || 'demo@nivra.com',
        phone: '+91 9876543210',
        role: 'user',
        status: 'Active',
        lastSeen: 'Just now',
        joinDate: new Date().toLocaleDateString(),
        emergencyContacts: 2
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+91 9876543211',
        role: 'user',
        status: 'Active',
        lastSeen: '5 min ago',
        joinDate: new Date(Date.now() - 86400000).toLocaleDateString(),
        emergencyContacts: 3
      },
      {
        id: 3,
        name: 'Admin User',
        email: 'admin@nivra.com',
        phone: '+91 9876543212',
        role: 'admin',
        status: 'Active',
        lastSeen: '2 min ago',
        joinDate: new Date(Date.now() - 172800000).toLocaleDateString(),
        emergencyContacts: 5
      }
    ];
  }

  getFallbackAlerts() {
    return [
      {
        id: 1,
        user: 'Sarah Johnson',
        userId: 2,
        type: 'SOS',
        message: 'Emergency SOS triggered',
        location: 'Connaught Place, New Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        status: 'Active',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000),
        time: '5 min ago'
      },
      {
        id: 2,
        user: 'Demo User',
        userId: 1,
        type: 'shake',
        message: 'Shake detection alert',
        location: 'India Gate, New Delhi',
        latitude: 28.6129,
        longitude: 77.2295,
        status: 'Resolved',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000),
        time: '1 hour ago',
        resolvedAt: new Date(Date.now() - 3300000)
      }
    ];
  }

  getFallbackStats() {
    return {
      totalUsers: 3,
      activeAlerts: 1,
      resolvedAlerts: 1,
      todayAlerts: 2,
      responseTime: '2.3 min',
      uptime: '99.9%',
      systemHealth: 'Excellent'
    };
  }

  getFallbackHealth() {
    return {
      database: 'Mock Mode',
      firebase: 'Active',
      sms: 'Active',
      location: 'Active',
      ai: 'Active',
      uptime: '99.9%',
      lastCheck: new Date(),
      server: {
        status: 'Operational',
        cpu: '15%',
        memory: '800MB / 4GB',
        uptime: '7 days'
      },
      api: {
        responseTime: '65ms',
        requestsPerMin: 85,
        errorRate: '0.05%'
      },
      alerts: {
        total: 2,
        active: 1,
        resolved: 1
      },
      users: {
        total: 3,
        active: 3
      }
    };
  }

  getFallbackAnalytics() {
    return {
      alertTypes: {
        sos: { count: 45, percentage: 45 },
        shake: { count: 30, percentage: 30 },
        voice: { count: 15, percentage: 15 },
        panic: { count: 10, percentage: 10 }
      },
      responseMetrics: {
        averageResponse: '2.3 minutes',
        fastestResponse: '45 seconds',
        successRate: '98.7%',
        under5Minutes: '95%'
      },
      peakHours: {
        evening: 35,
        night: 25,
        earlyMorning: 15,
        day: 25
      },
      geographic: {
        urban: 70,
        suburban: 20,
        rural: 10,
        highRiskZones: 12
      }
    };
  }

  // Utility methods
  formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  }

  // Check if user is admin
  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email && (user.email.includes('admin') || user.role === 'admin');
  }

  // Export data (for reports)
  async exportData(type = 'all') {
    try {
      const data = {};
      
      if (type === 'all' || type === 'users') {
        data.users = await this.getUsers();
      }
      
      if (type === 'all' || type === 'alerts') {
        data.alerts = await this.getAlerts();
      }
      
      if (type === 'all' || type === 'stats') {
        data.stats = await this.getStats();
        data.analytics = await this.getAnalytics();
      }
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nivra-admin-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;