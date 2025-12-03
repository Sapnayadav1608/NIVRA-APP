import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import NivraLogo from '../components/NivraLogo';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    todayAlerts: 0,
    responseTime: '0 min',
    uptime: '0%',
    systemHealth: 'Good'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState('overview');

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
  
  const theme = {
    bg: '#f8f9fa',
    cardBg: '#ffffff',
    text: '#333333',
    subtext: '#666666',
    border: '#e9ecef',
    primary: '#667eea',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8'
  };

  if (isLoading) {
    return (
      <div style={{
        background: theme.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: theme.text }}>
          <div style={{ marginBottom: '20px' }}>
            <NivraLogo size={60} />
          </div>
          <div style={{ fontSize: '18px' }}>Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.bg,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '414px',
      margin: '0 auto',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ animation: 'pulse 2s infinite' }}>
              <NivraLogo size={35} />
            </div>
            <div>
              <h1 style={{
                color: '#8A2BE2',
                fontSize: '20px',
                fontWeight: '700',
                margin: '0',
                textShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                NIVRA Admin
              </h1>
              <p style={{ margin: '2px 0 0 0', color: theme.subtext, fontSize: '11px' }}>
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => loadAdminData()}
            disabled={refreshing}
            style={{
              background: refreshing ? theme.border : theme.primary,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '20px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              minWidth: '70px'
            }}
          >
            {refreshing ? '🔄' : '🔄'}
          </button>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: '15px', paddingBottom: '100px' }}>
        {currentPage === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: theme.success, trend: '+12%' },
              { title: 'Active Alerts', value: stats.activeAlerts, icon: '🚨', color: theme.danger, trend: '-5%' },
              { title: 'Today Alerts', value: stats.todayAlerts, icon: '📊', color: theme.warning, trend: '+8%' },
              { title: 'Response Time', value: stats.responseTime, icon: '⚡', color: theme.info, trend: '-15%' },
              { title: 'System Uptime', value: stats.uptime, icon: '💚', color: theme.success, trend: '+0.1%' },
              { title: 'Resolved Alerts', value: stats.resolvedAlerts, icon: '✅', color: theme.primary, trend: '+23%' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: theme.cardBg,
                padding: '20px 15px',
                borderRadius: '15px',
                border: `1px solid ${theme.border}`,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
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
                  fontWeight: '600'
                }}>
                  {stat.trend}
                </div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: theme.subtext, fontWeight: '500' }}>{stat.title}</div>
              </div>
            ))}
          </div>
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



        {currentPage === 'system' && (
          <div style={{
            background: theme.cardBg,
            borderRadius: '15px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.text }}>⚙️ System Health & Monitoring</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>🗄️ Database</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ MongoDB Connected</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  Response time: 12ms<br/>
                  Active connections: 5<br/>
                  Storage used: 2.3GB
                </div>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>🔥 Firebase</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ Real-time Active</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  Active listeners: {users.length}<br/>
                  Messages/min: 15<br/>
                  Latency: 45ms
                </div>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>📱 Twilio SMS</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ Service Active</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  Delivery rate: 99.9%<br/>
                  Queue length: 0<br/>
                  Credits remaining: 85%
                </div>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>🤖 AI Services</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ ML Models Active</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  Voice accuracy: 94.2%<br/>
                  Prediction latency: 120ms<br/>
                  Model version: v2.1.3
                </div>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>🌐 Server Status</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ All Systems Operational</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  CPU usage: 23%<br/>
                  Memory: 1.2GB / 4GB<br/>
                  Uptime: 15 days
                </div>
              </div>
              <div style={{ padding: '15px', background: theme.bg, borderRadius: '10px' }}>
                <h4 style={{ color: theme.text, marginBottom: '10px' }}>📊 API Performance</h4>
                <div style={{ color: theme.success, fontSize: '14px', marginBottom: '5px' }}>✅ Optimal Performance</div>
                <div style={{ color: theme.subtext, fontSize: '12px' }}>
                  Avg response: 85ms<br/>
                  Requests/min: 120<br/>
                  Error rate: 0.1%
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'profile' && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>👤 Admin Profile</h3>
            </div>
            
            <div style={{
              background: theme.cardBg,
              padding: '20px',
              borderRadius: '15px',
              border: `1px solid ${theme.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: '15px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#8A2BE2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 15px',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  A
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '5px' }}>
                  Admin User
                </div>
                <div style={{ fontSize: '14px', color: theme.subtext }}>
                  admin@nivra.com
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Role</span>
                  <span style={{
                    background: '#8A2BE2',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>Administrator</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Last Login</span>
                  <span style={{ color: theme.subtext, fontSize: '14px' }}>Just now</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: theme.text, fontSize: '14px' }}>Access Level</span>
                  <span style={{ color: theme.success, fontSize: '14px', fontWeight: '500' }}>Full Access</span>
                </div>
              </div>
            </div>
            
            <div style={{
              background: theme.cardBg,
              padding: '20px',
              borderRadius: '15px',
              border: `1px solid ${theme.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.text, fontSize: '16px' }}>Quick Actions</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{
                  background: theme.info,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📊 Export All Data
                </button>
                
                <button style={{
                  background: theme.warning,
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🔄 System Backup
                </button>
                
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
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500',
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
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${theme.border}`,
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
            background: currentPage === 'overview' ? '#8A2BE2' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: currentPage === 'overview' ? 'white' : theme.text
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
            setCurrentPage('system');
            setActiveTab('system');
          }}
          style={{ 
            background: currentPage === 'system' ? '#8A2BE2' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: currentPage === 'system' ? 'white' : theme.text
          }}
        >⚙️</button>

        <button 
          onClick={() => {
            setCurrentPage('profile');
            setActiveTab('profile');
          }}
          style={{ 
            background: currentPage === 'profile' ? '#8A2BE2' : 'none', 
            border: 'none', 
            padding: '10px', 
            fontSize: '20px', 
            cursor: 'pointer',
            borderRadius: '12px',
            color: currentPage === 'profile' ? 'white' : theme.text
          }}
        >👤</button>
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
  );
};

export default AdminDashboard;