import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import NivraLogo from '../components/NivraLogo.jsx';
import { professionalTheme } from '../theme/professionalTheme';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeAlerts: 3,
    resolvedAlerts: 47,
    todayAlerts: 8,
    responseTime: '2.3 min',
    uptime: '99.8%',
    systemHealth: 'Excellent'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState('overview');
  const [mlPredictions, setMlPredictions] = useState({
    totalPredictions: 1247,
    safeUsers: 1089,
    cautionUsers: 142,
    dangerUsers: 16,
    avgRiskScore: 23.4,
    mlAccuracy: 94.2,
    autoAlertsGenerated: 47,
    riskThreshold: 75
  });
  const [liveTracking, setLiveTracking] = useState({});
  const [reports, setReports] = useState({
    dailyIncidents: 8,
    monthlyIncidents: 156,
    sosSuccessRate: 98.7,
    peakDangerTime: '22:00-02:00',
    userGrowth: '+12%',
    areaRiskAnalysis: 'Mumbai: High, Delhi: Medium'
  });
  const [communityData, setCommunityData] = useState({
    totalReports: 23,
    pendingComplaints: 5,
    resolvedComplaints: 18,
    fakeAlerts: 2,
    spamReports: 1
  });
  const [securityData, setSecurityData] = useState({
    activeAdmins: 3,
    activeModerators: 7,
    loginAttempts: 156,
    failedLogins: 12,
    dataEncryption: 'AES-256',
    gdprCompliance: 'Active'
  });
  const [emergencyNumbers, setEmergencyNumbers] = useState({
    police: '100',
    fire: '101',
    ambulance: '102',
    women: '1091'
  });
  const [adminList, setAdminList] = useState([
    { id: 1, name: 'John Doe', email: 'john@nivra.com', role: 'Super Admin', status: 'Active', lastLogin: '2024-01-15 10:30' },
    { id: 2, name: 'Jane Smith', email: 'jane@nivra.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15 09:15' },
    { id: 3, name: 'Mike Johnson', email: 'mike@nivra.com', role: 'Moderator', status: 'Inactive', lastLogin: '2024-01-14 18:45' }
  ]);
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, time: '2024-01-15 10:30', user: 'Admin', action: 'User Management', details: 'Blocked user john@example.com', type: 'warning' },
    { id: 2, time: '2024-01-15 10:25', user: 'Admin', action: 'Alert Resolution', details: 'Resolved emergency alert #1234', type: 'success' },
    { id: 3, time: '2024-01-15 10:20', user: 'Admin', action: 'Settings Update', details: 'Updated emergency numbers configuration', type: 'info' },
    { id: 4, time: '2024-01-15 10:15', user: 'Admin', action: 'System Login', details: 'Successful login from 192.168.1.1', type: 'info' },
    { id: 5, time: '2024-01-15 10:10', user: 'System', action: 'Backup Complete', details: 'Daily system backup completed successfully', type: 'success' }
  ]);
  const [complaints, setComplaints] = useState([
    { id: 1, user: 'Sarah Wilson', email: 'sarah@example.com', complaint: 'App not responding during emergency situation', status: 'Pending', priority: 'High', date: '2024-01-15', category: 'Technical' },
    { id: 2, user: 'Mike Brown', email: 'mike@example.com', complaint: 'False alert was triggered without any emergency', status: 'Pending', priority: 'Medium', date: '2024-01-14', category: 'False Alert' },
    { id: 3, user: 'Lisa Davis', email: 'lisa@example.com', complaint: 'Location tracking is not accurate in my area', status: 'Pending', priority: 'Low', date: '2024-01-14', category: 'Location' },
    { id: 4, user: 'Tom Wilson', email: 'tom@example.com', complaint: 'Emergency contacts not receiving notifications', status: 'Under Review', priority: 'High', date: '2024-01-13', category: 'Notifications' }
  ]);
  const [fakeAlerts, setFakeAlerts] = useState([
    { id: 1, user: 'Anonymous User', location: 'Mumbai, MH', time: '2024-01-15 09:30', reason: 'Testing app functionality', status: 'Unverified', reportedBy: 'System AI' },
    { id: 2, user: 'Test Account', location: 'Delhi, DL', time: '2024-01-14 15:20', reason: 'Accidental trigger', status: 'Verified Fake', reportedBy: 'User Report' }
  ]);
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: 'Happy User', rating: 5, feedback: 'Excellent app! Saved my life during emergency.', date: '2024-01-15', category: 'Positive' },
    { id: 2, user: 'Concerned Citizen', rating: 4, feedback: 'Good app but needs better location accuracy.', date: '2024-01-14', category: 'Suggestion' },
    { id: 3, user: 'Regular User', rating: 3, feedback: 'App is okay but sometimes slow to respond.', date: '2024-01-13', category: 'Performance' }
  ]);
  const [notificationPermission, setNotificationPermission] = useState('denied');
  const [pushSubscription, setPushSubscription] = useState('Inactive');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadAdminData();
    loadLiveTracking();
    const interval = setInterval(loadAdminData, 30000);
    const liveInterval = setInterval(loadLiveTracking, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  const loadLiveTracking = async () => {
    try {
      const liveData = await adminService.getLiveTracking();
      setLiveTracking(liveData);
    } catch (error) {
      console.error('Error loading live tracking:', error);
    }
  };

  const loadAdminData = async () => {
    if (!refreshing) setRefreshing(true);
    
    try {
      // Load all data using admin service
      const [usersData, alertsData, statsData, healthData] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getAlerts(),
        adminService.getStats(),
        adminService.getSystemHealth()
      ]);
      
      // Process results
      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
        localStorage.setItem('adminUsers', JSON.stringify(usersData.value));
      }
      
      if (alertsData.status === 'fulfilled') {
        setAlerts(alertsData.value);
        localStorage.setItem('adminAlerts', JSON.stringify(alertsData.value));
      }
      
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      
      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value);
      }
      
      // Update user activity
      await adminService.updateUserActivity();
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await adminService.updateAlertStatus(alertId, 'Resolved');
      await loadAdminData();
      alert('✅ Alert resolved successfully!');
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('❌ Failed to resolve alert');
    }
  };
  
  const blockUser = async (userId) => {
    try {
      await adminService.updateUserStatus(userId, 'Blocked');
      await loadAdminData();
      alert('✅ User blocked successfully!');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('❌ Failed to block user');
    }
  };
  
  const unblockUser = async (userId) => {
    try {
      await adminService.updateUserStatus(userId, 'Active');
      await loadAdminData();
      alert('✅ User unblocked successfully!');
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('❌ Failed to unblock user');
    }
  };
  
  const deleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await adminService.deleteAlert(alertId);
        await loadAdminData();
        alert('✅ Alert deleted successfully!');
      } catch (error) {
        console.error('Error deleting alert:', error);
        alert('❌ Failed to delete alert');
      }
    }
  };
  
  const exportData = async (type) => {
    try {
      await adminService.exportData(type);
      alert('✅ Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('❌ Failed to export data');
    }
  };
  
  const updateEmergencyNumbers = () => {
    setCurrentPage('emergency-numbers');
  };
  
  const saveEmergencyNumbers = () => {
    alert('✅ Emergency numbers updated successfully!');
    setCurrentPage('system-settings');
  };
  
  const configureAlertThreshold = () => {
    setCurrentPage('alert-threshold');
  };
  
  const adjustRiskThreshold = () => {
    setCurrentPage('ml-threshold');
  };
  
  const toggleVoiceRecognition = () => {
    setCurrentPage('voice-recognition');
  };
  
  const manageAdminAccess = () => {
    setCurrentPage('admin-access');
  };
  
  const addNewAdmin = () => {
    const name = prompt('Enter admin name:');
    const email = prompt('Enter admin email:');
    if (name && email) {
      const newAdmin = {
        id: adminList.length + 1,
        name,
        email,
        role: 'Admin',
        status: 'Active',
        lastLogin: 'Never'
      };
      setAdminList([...adminList, newAdmin]);
      alert('✅ New admin added successfully!');
    }
  };
  
  const changePassword = () => {
    setCurrentPage('change-password');
  };
  
  const updatePassword = () => {
    alert('✅ Password changed successfully!');
    setCurrentPage('system-settings');
  };
  
  const viewActivityLogs = () => {
    setCurrentPage('activity-logs');
  };
  
  const reviewComplaints = () => {
    setCurrentPage('review-complaints');
  };
  
  const resolveComplaint = (id) => {
    setComplaints(complaints.map(c => 
      c.id === id ? { ...c, status: 'Resolved' } : c
    ));
    alert('✅ Complaint resolved successfully!');
  };
  
  const contactUser = (complaint) => {
    alert(`📞 Contacting ${complaint.user} at ${complaint.email}`);
  };
  
  const verifyFakeAlerts = () => {
    setCurrentPage('verify-alerts');
  };
  
  const verifyAlert = (id, isReal) => {
    setFakeAlerts(fakeAlerts.map(a => 
      a.id === id ? { ...a, status: isReal ? 'Real Alert' : 'Verified Fake' } : a
    ));
    alert(`✅ Alert ${isReal ? 'verified as real' : 'marked as fake'}!`);
  };
  
  const manageFeedback = () => {
    setCurrentPage('manage-feedback');
  };
  
  const respondToFeedback = (id) => {
    const response = prompt('Enter your response:');
    if (response) {
      alert('✅ Response sent to user!');
    }
  };
  
  const manageAppVersion = () => {
    setCurrentPage('app-version');
  };
  
  const systemBackup = () => {
    setCurrentPage('system-backup');
  };
  
  const startBackup = () => {
    if (window.confirm('Start system backup? This may take a few minutes.')) {
      alert('🔄 System backup started successfully!');
      setCurrentPage('system-settings');
    }
  };
  
  const notificationSettings = () => {
    setCurrentPage('notification-settings');
  };
  
  const theme = {
    bg: professionalTheme.colors.primaryBg,
    cardBg: professionalTheme.colors.secondaryBg,
    text: professionalTheme.colors.primaryText,
    subtext: professionalTheme.colors.secondaryText,
    border: professionalTheme.colors.border,
    primary: professionalTheme.colors.primaryAccent,
    success: professionalTheme.colors.successGreen,
    warning: professionalTheme.colors.warningAmber,
    danger: professionalTheme.colors.sosRed,
    info: professionalTheme.colors.info
  };

  if (isLoading) {
    return (
      <div style={{
        background: professionalTheme.gradients.primary,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: professionalTheme.typography.fontFamily,
        maxWidth: '414px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', color: professionalTheme.colors.primaryText }}>
          <div style={{ marginBottom: '20px' }}>
            <NivraLogo size={60} />
          </div>
          <div style={{ fontSize: '18px', color: professionalTheme.colors.primaryText }}>Loading Admin Dashboard...</div>
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
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    <div style={{
      background: professionalTheme.gradients.primary,
      minHeight: '100vh',
      fontFamily: professionalTheme.typography.fontFamily,
      maxWidth: '414px',
      margin: '0 auto',
      position: 'relative',
      boxShadow: professionalTheme.shadows.card
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '15px 20px',
        borderBottom: `1px solid ${professionalTheme.colors.border}`,
        boxShadow: professionalTheme.shadows.button,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-hover" style={{ display: 'inline-block' }}>
              <NivraLogo size={35} />
            </div>
            <div>
              <h1 className="brand-hover" style={{
                color: professionalTheme.colors.primaryAccent,
                fontSize: '20px',
                fontWeight: professionalTheme.typography.weights.bold,
                margin: '0',
                fontFamily: professionalTheme.typography.fontFamily
              }}>
                NIVRA Admin
              </h1>
              <p style={{ margin: '2px 0 0 0', color: theme.subtext, fontSize: '11px' }}>
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                setCurrentPage('system-settings');
                setActiveTab('system-settings');
              }}
              style={{
                background: currentPage === 'system-settings' ? professionalTheme.colors.primaryAccent : 'rgba(99, 102, 241, 0.1)',
                color: currentPage === 'system-settings' ? 'white' : professionalTheme.colors.primaryAccent,
                border: `1px solid ${professionalTheme.colors.primaryAccent}`,
                padding: '8px 12px',
                borderRadius: professionalTheme.borderRadius.xl,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: professionalTheme.typography.weights.medium,
                minWidth: '70px'
              }}
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: '15px', paddingBottom: '100px' }}>
        {currentPage === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: theme.success, trend: '+12%' },
                { title: 'Active Alerts', value: stats.activeAlerts, icon: '🚨', color: theme.danger, trend: '-5%' },
                { title: 'ML Accuracy', value: `${mlPredictions.mlAccuracy}%`, icon: '🤖', color: theme.info, trend: '+2.1%' },
                { title: 'Response Time', value: liveTracking.avgResponseTime, icon: '⚡', color: theme.warning, trend: '-15%' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: theme.cardBg,
                  padding: '20px 15px',
                  borderRadius: professionalTheme.borderRadius.medium,
                  border: `1px solid ${theme.border}`,
                  textAlign: 'center',
                  boxShadow: professionalTheme.shadows.button,
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '9px',
                    color: stat.trend.startsWith('+') ? theme.success : theme.danger,
                    fontWeight: professionalTheme.typography.weights.semibold
                  }}>
                    {stat.trend}
                  </div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.subtext, fontWeight: professionalTheme.typography.weights.medium }}>{stat.title}</div>
                </div>
              ))}
            </div>
            
            {/* ML Predictions Overview */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '16px', fontWeight: professionalTheme.typography.weights.semibold }}>🤖 ML Safety Predictions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: theme.success, fontSize: '18px', fontWeight: 'bold' }}>{mlPredictions.safeUsers}</div>
                  <div style={{ color: theme.subtext }}>Safe Users</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: theme.warning, fontSize: '18px', fontWeight: 'bold' }}>{mlPredictions.cautionUsers}</div>
                  <div style={{ color: theme.subtext }}>Caution</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: theme.danger, fontSize: '18px', fontWeight: 'bold' }}>{mlPredictions.dangerUsers}</div>
                  <div style={{ color: theme.subtext }}>High Risk</div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentPage === 'users' && (
          <div>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>👥 Users ({users.length})</h3>
              <button
                onClick={() => exportData('users')}
                style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                📊
              </button>
            </div>
            
            {users.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: theme.subtext,
                background: theme.cardBg,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>No Users Found</div>
                <div style={{ fontSize: '14px' }}>Users will appear here once they register</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map((user) => (
                  <div key={user.id} style={{
                    background: theme.cardBg,
                    padding: '15px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: theme.text, fontSize: '16px', marginBottom: '3px' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '5px' }}>
                          {user.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: theme.subtext }}>
                          <span>Last seen: {user.lastSeen}</span>
                          <span>•</span>
                          <span>Joined: {user.joinDate}</span>
                        </div>
                      </div>
                      <span style={{
                        background: user.status === 'Active' || user.status === 'active' ? theme.success : 
                                   user.status === 'Blocked' || user.status === 'blocked' ? theme.danger : theme.warning,
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        {user.status === 'active' ? 'Online' : 
                         user.status === 'inactive' ? 'Offline' :
                         user.status === 'blocked' ? 'Blocked' : user.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowUserDetails(user)}
                        style={{
                          flex: 1,
                          background: theme.info,
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => user.status === 'Active' ? blockUser(user.id) : unblockUser(user.id)}
                        style={{
                          flex: 1,
                          background: user.status === 'Active' ? theme.danger : theme.success,
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'alerts' && (
          <div style={{
            background: theme.cardBg,
            borderRadius: '15px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: theme.text }}>🚨 Emergency Alerts ({alerts.length})</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  background: theme.bg,
                  color: theme.text,
                  fontSize: '14px'
                }}>
                  <option>All Alerts</option>
                  <option>Active Only</option>
                  <option>Resolved Only</option>
                  <option>High Priority</option>
                </select>
                <button
                  onClick={() => exportData('alerts')}
                  style={{
                    background: theme.info,
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Export
                </button>
              </div>
            </div>
            
            {alerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: theme.subtext,
                background: theme.bg,
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>No Emergency Alerts</div>
                <div style={{ fontSize: '14px', marginTop: '5px' }}>All users are safe!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {alerts.map((alert) => (
                  <div key={alert.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: alert.status === 'Active' ? '#fff3cd' : theme.bg,
                    borderRadius: '12px',
                    border: `1px solid ${alert.status === 'Active' ? '#ffeaa7' : theme.border}`,
                    boxShadow: alert.status === 'Active' ? '0 2px 10px rgba(255, 193, 7, 0.2)' : 'none'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{
                          background: alert.type === 'SOS' ? theme.danger : alert.type === 'shake' ? theme.warning : theme.info,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {alert.type?.toUpperCase()}
                        </span>
                        <span style={{
                          background: alert.status === 'Active' ? theme.danger : theme.success,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {alert.status}
                        </span>
                      </div>
                      <div style={{ fontWeight: '600', color: theme.text, fontSize: '16px', marginBottom: '5px' }}>
                        {alert.user}
                      </div>
                      <div style={{ fontSize: '14px', color: theme.subtext, marginBottom: '5px' }}>
                        📍 {alert.location}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.subtext }}>
                        🕒 {alert.time}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        style={{
                          background: theme.info,
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </button>
                      {alert.status === 'Active' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          style={{
                            background: theme.success,
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            marginRight: '8px'
                          }}
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        style={{
                          background: theme.danger,
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'live-tracking' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>📍 Live Tracking & Location Analytics</h3>
            
            {/* Live Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { title: 'Active Users', value: liveTracking.activeUsers || 0, icon: '👥', color: theme.success },
                { title: 'High Risk Zones', value: liveTracking.highRiskZones || 0, icon: '⚠️', color: theme.danger },
                { title: 'Emergency Alerts', value: liveTracking.emergencyAlerts || 0, icon: '🚨', color: theme.warning },
                { title: 'Response Time', value: liveTracking.avgResponseTime || 'N/A', icon: '⚡', color: theme.info }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: theme.cardBg,
                  padding: '15px',
                  borderRadius: professionalTheme.borderRadius.medium,
                  border: `1px solid ${theme.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: stat.color, marginBottom: '3px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.subtext }}>{stat.title}</div>
                </div>
              ))}
            </div>
            
            {/* Location Heatmap */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: theme.text }}>🗺️ Location Heatmap</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: theme.success, fontSize: '12px' }}>🔄 Live Update</div>
                  <div style={{ color: theme.subtext, fontSize: '10px' }}>Last Updated: 48 seconds ago</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ color: theme.text, fontSize: '12px' }}>Battery: 89%</div>
                  <div style={{ color: theme.success, fontSize: '12px' }}>Status: 🟢 Online</div>
                </div>
              </div>
              
              <div style={{
                background: theme.bg,
                height: '250px',
                borderRadius: professionalTheme.borderRadius.small,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${theme.border}`,
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', color: theme.subtext }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>User Locations</div>
                  <div style={{ fontSize: '12px', marginBottom: '15px' }}>Real-time tracking</div>
                  
                  {/* Real user locations */}
                  <div style={{ position: 'relative', width: '200px', height: '120px', margin: '0 auto', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                    {users.slice(0, 5).map((user, index) => (
                      <div 
                        key={user.id}
                        title={`${user.name} - ${user.location || 'Location unknown'}`}
                        style={{ 
                          position: 'absolute', 
                          top: `${20 + (index * 15)}px`, 
                          left: `${30 + (index * 25)}px`, 
                          width: '8px', 
                          height: '8px', 
                          background: user.status === 'active' ? theme.success : theme.warning, 
                          borderRadius: '50%', 
                          animation: 'pulse 2s infinite',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                  
                  <button style={{
                    background: theme.primary,
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: professionalTheme.borderRadius.small,
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '15px',
                    fontWeight: '500'
                  }}>
                    🔗 Open in full map
                  </button>
                </div>
              </div>
            </div>
            
            {/* Movement Analysis */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>📊 Movement Analysis</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Current Locations</span>
                  <span style={{ color: theme.info, fontSize: '14px', fontWeight: 'bold' }}>{liveTracking.currentLocations || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Signal Strength</span>
                  <span style={{ color: theme.success, fontSize: '14px', fontWeight: 'bold' }}>{liveTracking.signalStrength || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Network Coverage</span>
                  <span style={{ color: theme.success, fontSize: '14px', fontWeight: 'bold' }}>98.7%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'system-settings' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>⚙️ System Settings & Security</h3>
            
            {/* Emergency Configuration */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>🚨 Emergency Configuration</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Emergency Numbers</span>
                  <button onClick={updateEmergencyNumbers} style={{
                    background: theme.danger,
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: professionalTheme.borderRadius.small,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>Update</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Response Time Target</span>
                  <span style={{ color: theme.subtext, fontSize: '12px' }}>{'< 3 minutes'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Auto-Alert Threshold</span>
                  <button onClick={configureAlertThreshold} style={{
                    background: theme.warning,
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: professionalTheme.borderRadius.small,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>Configure</button>
                </div>
              </div>
            </div>
            
            {/* ML Configuration */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>🤖 ML Sensitivity Control</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Risk Sensitivity</span>
                  <select style={{
                    padding: '6px 10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: professionalTheme.borderRadius.small,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '12px'
                  }}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Voice Recognition</span>
                  <button onClick={toggleVoiceRecognition} style={{
                    background: theme.success,
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: professionalTheme.borderRadius.small,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>Enabled</button>
                </div>
              </div>
            </div>
            
            {/* Security Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { title: 'Active Admins', value: securityData.activeAdmins, icon: '👨💼', color: theme.success },
                { title: 'Failed Logins', value: securityData.failedLogins, icon: '❌', color: theme.danger },
                { title: 'Data Encryption', value: 'AES-256', icon: '🛡️', color: theme.info },
                { title: 'GDPR Status', value: 'Active', icon: '✅', color: theme.success }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: theme.cardBg,
                  padding: '15px',
                  borderRadius: professionalTheme.borderRadius.medium,
                  border: `1px solid ${theme.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: stat.color, marginBottom: '3px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.subtext }}>{stat.title}</div>
                </div>
              ))}
            </div>
            
            {/* Security & Access Control */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>🔒 Security & Access Control</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={manageAdminAccess} style={{
                  background: theme.success,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>👨💼 Manage Admin Access</button>
                <button onClick={changePassword} style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>🔑 Change Password</button>
                <button onClick={viewActivityLogs} style={{
                  background: theme.warning,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📊 Activity Logs</button>
              </div>
            </div>
            
            {/* Reports & Analytics */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>📊 Reports & Analytics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => exportData('daily')} style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📅 Daily Report</button>
                <button onClick={() => exportData('monthly')} style={{
                  background: theme.success,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📊 Monthly Report</button>
                <button onClick={() => exportData('analytics')} style={{
                  background: theme.warning,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📈 Analytics Report</button>
              </div>
            </div>
            
            {/* Community & Complaint Management */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              marginBottom: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>🧑💬 Community & Complaints</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={reviewComplaints} style={{
                  background: theme.warning,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>⏳ Review Pending Complaints ({communityData.pendingComplaints})</button>
                <button onClick={verifyFakeAlerts} style={{
                  background: theme.danger,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>❌ Verify Fake Alerts ({communityData.fakeAlerts})</button>
                <button onClick={manageFeedback} style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📝 Manage Feedback</button>
              </div>
            </div>
            
            {/* App & System Management */}
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text }}>📱 App & System Management</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={manageAppVersion} style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>📱 App Version: v2.1.3</button>
                <button onClick={systemBackup} style={{
                  background: theme.success,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>🔄 System Backup & Recovery</button>
                <button onClick={notificationSettings} style={{
                  background: theme.warning,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: professionalTheme.borderRadius.small,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: professionalTheme.typography.weights.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>🔔 Notification Settings</button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }
                  }}
                  style={{
                    background: theme.danger,
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: professionalTheme.borderRadius.small,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: professionalTheme.typography.weights.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'emergency-numbers' && (
          <div>
            <button onClick={() => setCurrentPage('system-settings')} style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>← Back</button>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>🚨 Emergency Numbers Configuration</h3>
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Police</label>
                <input 
                  type="text" 
                  value={emergencyNumbers.police}
                  onChange={(e) => setEmergencyNumbers({...emergencyNumbers, police: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: professionalTheme.borderRadius.small,
                    background: theme.bg,
                    color: theme.text
                  }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Fire Department</label>
                <input 
                  type="text" 
                  value={emergencyNumbers.fire}
                  onChange={(e) => setEmergencyNumbers({...emergencyNumbers, fire: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: professionalTheme.borderRadius.small,
                    background: theme.bg,
                    color: theme.text
                  }} 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Ambulance</label>
                <input 
                  type="text" 
                  value={emergencyNumbers.ambulance}
                  onChange={(e) => setEmergencyNumbers({...emergencyNumbers, ambulance: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: professionalTheme.borderRadius.small,
                    background: theme.bg,
                    color: theme.text
                  }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Women Helpline</label>
                <input 
                  type="text" 
                  value={emergencyNumbers.women}
                  onChange={(e) => setEmergencyNumbers({...emergencyNumbers, women: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: professionalTheme.borderRadius.small,
                    background: theme.bg,
                    color: theme.text
                  }} 
                />
              </div>
              <button onClick={saveEmergencyNumbers} style={{
                background: theme.success,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: professionalTheme.borderRadius.small,
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}>Save Changes</button>
            </div>
          </div>
        )}

        {currentPage === 'admin-access' && (
          <div>
            <button onClick={() => setCurrentPage('system-settings')} style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>← Back</button>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>👨💼 Admin Access Management</h3>
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, marginBottom: '15px' }}>Current Admins ({adminList.length})</h4>
              <div style={{ marginBottom: '20px' }}>
                {adminList.map((admin) => (
                  <div key={admin.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    background: theme.bg,
                    borderRadius: professionalTheme.borderRadius.small,
                    marginBottom: '10px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: theme.text, fontWeight: 'bold', marginBottom: '3px' }}>{admin.name}</div>
                      <div style={{ color: theme.subtext, fontSize: '12px', marginBottom: '2px' }}>{admin.email}</div>
                      <div style={{ color: theme.subtext, fontSize: '11px' }}>{admin.role} • Last login: {admin.lastLogin}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: admin.status === 'Active' ? theme.success : theme.warning,
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>{admin.status}</span>
                      <button style={{
                        background: theme.danger,
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addNewAdmin} style={{
                background: theme.primary,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: professionalTheme.borderRadius.small,
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '500'
              }}>+ Add New Admin</button>
            </div>
          </div>
        )}

        {currentPage === 'change-password' && (
          <div>
            <button onClick={() => setCurrentPage('system-settings')} style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>← Back</button>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>🔑 Change Password</h3>
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Current Password</label>
                <input type="password" placeholder="Enter current password" style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: professionalTheme.borderRadius.small,
                  background: theme.bg,
                  color: theme.text
                }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>New Password</label>
                <input type="password" placeholder="Enter new password" style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: professionalTheme.borderRadius.small,
                  background: theme.bg,
                  color: theme.text
                }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: theme.text, fontSize: '14px', display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: professionalTheme.borderRadius.small,
                  background: theme.bg,
                  color: theme.text
                }} />
              </div>
              <div style={{ marginBottom: '15px', padding: '10px', background: theme.bg, borderRadius: professionalTheme.borderRadius.small }}>
                <div style={{ color: theme.text, fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Password Requirements:</div>
                <div style={{ color: theme.subtext, fontSize: '11px' }}>
                  • At least 8 characters long<br/>
                  • Include uppercase and lowercase letters<br/>
                  • Include at least one number<br/>
                  • Include at least one special character
                </div>
              </div>
              <button onClick={updatePassword} style={{
                background: theme.info,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: professionalTheme.borderRadius.small,
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '500'
              }}>Update Password</button>
            </div>
          </div>
        )}

        {currentPage === 'activity-logs' && (
          <div>
            <button onClick={() => setCurrentPage('system-settings')} style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>← Back</button>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>📊 Activity Logs</h3>
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: theme.text, fontWeight: 'bold' }}>Recent Activities ({activityLogs.length})</span>
                <select style={{
                  padding: '6px 10px',
                  border: `1px solid ${theme.border}`,
                  borderRadius: professionalTheme.borderRadius.small,
                  background: theme.bg,
                  color: theme.text,
                  fontSize: '12px'
                }}>
                  <option>All Activities</option>
                  <option>Login Events</option>
                  <option>System Changes</option>
                  <option>User Actions</option>
                </select>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} style={{
                    padding: '15px',
                    background: theme.bg,
                    borderRadius: professionalTheme.borderRadius.small,
                    marginBottom: '10px',
                    borderLeft: `4px solid ${
                      log.type === 'success' ? theme.success :
                      log.type === 'warning' ? theme.warning :
                      log.type === 'error' ? theme.danger : theme.info
                    }`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: theme.text, fontWeight: 'bold', fontSize: '14px' }}>{log.action}</span>
                      <span style={{ color: theme.subtext, fontSize: '11px' }}>{log.time}</span>
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '13px', marginBottom: '3px' }}>{log.details}</div>
                    <div style={{ color: theme.subtext, fontSize: '11px' }}>By: {log.user}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'review-complaints' && (
          <div>
            <button onClick={() => setCurrentPage('system-settings')} style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>← Back</button>
            <h3 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '18px' }}>⏳ Review Pending Complaints</h3>
            <div style={{
              background: theme.cardBg,
              borderRadius: professionalTheme.borderRadius.medium,
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: theme.text, fontWeight: 'bold' }}>Total Complaints: {complaints.length}</span>
                <span style={{ color: theme.warning, fontSize: '12px' }}>Pending: {complaints.filter(c => c.status === 'Pending').length}</span>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {complaints.map((complaint) => (
                  <div key={complaint.id} style={{
                    padding: '15px',
                    background: theme.bg,
                    borderRadius: professionalTheme.borderRadius.small,
                    marginBottom: '15px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: theme.text, fontWeight: 'bold', fontSize: '14px' }}>#{complaint.id} - {complaint.user}</span>
                        <div style={{ color: theme.subtext, fontSize: '11px', marginTop: '2px' }}>{complaint.email} • {complaint.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <span style={{
                          background: complaint.priority === 'High' ? theme.danger : complaint.priority === 'Medium' ? theme.warning : theme.info,
                          color: 'white',
                          padding: '3px 6px',
                          borderRadius: '8px',
                          fontSize: '9px',
                          fontWeight: '500'
                        }}>{complaint.priority}</span>
                        <span style={{
                          background: complaint.status === 'Pending' ? theme.warning : theme.info,
                          color: 'white',
                          padding: '3px 6px',
                          borderRadius: '8px',
                          fontSize: '9px',
                          fontWeight: '500'
                        }}>{complaint.status}</span>
                      </div>
                    </div>
                    <div style={{ color: theme.text, marginBottom: '8px', fontSize: '13px' }}>
                      <strong>Category:</strong> {complaint.category}
                    </div>
                    <div style={{ color: theme.subtext, marginBottom: '12px', fontSize: '13px', lineHeight: '1.4' }}>
                      {complaint.complaint}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => resolveComplaint(complaint.id)}
                        disabled={complaint.status === 'Resolved'}
                        style={{
                          background: complaint.status === 'Resolved' ? theme.border : theme.success,
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: professionalTheme.borderRadius.small,
                          fontSize: '11px',
                          cursor: complaint.status === 'Resolved' ? 'not-allowed' : 'pointer',
                          opacity: complaint.status === 'Resolved' ? 0.6 : 1
                        }}
                      >
                        {complaint.status === 'Resolved' ? 'Resolved' : 'Resolve'}
                      </button>
                      <button 
                        onClick={() => contactUser(complaint)}
                        style={{
                          background: theme.info,
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: professionalTheme.borderRadius.small,
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Contact User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
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
            setCurrentPage('overview');
            setActiveTab('overview');
          }}
          style={{ 
            background: currentPage === 'overview' ? professionalTheme.colors.primaryAccent : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: professionalTheme.borderRadius.medium,
            color: currentPage === 'overview' ? 'white' : professionalTheme.colors.secondaryText
          }}
        >📊</button>

        <button 
          onClick={() => {
            setCurrentPage('users');
            setActiveTab('users');
          }}
          style={{ 
            background: currentPage === 'users' ? '#8A2BE2' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: currentPage === 'users' ? 'white' : theme.text
          }}
        >👥</button>

        <button 
          onClick={() => {
            setCurrentPage('alerts');
            setActiveTab('alerts');
          }}
          style={{ 
            background: currentPage === 'alerts' ? '#8A2BE2' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: currentPage === 'alerts' ? 'white' : theme.text
          }}
        >🚨</button>

        <button 
          onClick={() => {
            setCurrentPage('live-tracking');
            setActiveTab('live-tracking');
          }}
          style={{ 
            background: currentPage === 'live-tracking' ? professionalTheme.colors.primaryAccent : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: professionalTheme.borderRadius.medium,
            color: currentPage === 'live-tracking' ? 'white' : professionalTheme.colors.secondaryText
          }}
        >📍</button>

      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: theme.cardBg,
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: theme.text }}>🚨 Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.subtext
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>User:</strong> {selectedAlert.user}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Type:</strong> 
                <span style={{
                  background: selectedAlert.type === 'SOS' ? theme.danger : theme.warning,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}>
                  {selectedAlert.type?.toUpperCase()}
                </span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Location:</strong> {selectedAlert.location}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Time:</strong> {selectedAlert.time}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Status:</strong>
                <span style={{
                  background: selectedAlert.status === 'Active' ? theme.danger : theme.success,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}>
                  {selectedAlert.status}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedAlert.status === 'Active' && (
                <button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  style={{
                    background: theme.success,
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Resolve Alert
                </button>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  background: theme.border,
                  color: theme.text,
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: theme.cardBg,
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: theme.text }}>👤 User Details</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.subtext
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Name:</strong> {showUserDetails.name}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Email:</strong> {showUserDetails.email}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Status:</strong>
                <span style={{
                  background: showUserDetails.status === 'Active' ? theme.success : theme.warning,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginLeft: '10px'
                }}>
                  {showUserDetails.status}
                </span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Last Seen:</strong> {showUserDetails.lastSeen}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Join Date:</strong> {showUserDetails.joinDate}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: theme.text }}>Emergency Contacts:</strong> {showUserDetails.emergencyContacts || 0}
              </div>
            </div>
            
            <button
              onClick={() => setShowUserDetails(null)}
              style={{
                background: theme.primary,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminDashboard;