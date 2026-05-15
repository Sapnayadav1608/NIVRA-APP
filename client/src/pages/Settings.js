import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <NivraLogo size={40} />
        <h2 style={{ margin: 0, color: '#8A2BE2' }}>NIVRA Settings</h2>
      </div>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: '#ff3b30',
            color: 'white',
            border: 'none',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;