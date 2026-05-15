import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';
import { professionalTheme } from '../theme/professionalTheme';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser(formData));
      if (result.type === 'auth/login/fulfilled') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
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
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: professionalTheme.gradients.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: professionalTheme.typography.fontFamily
      }}>
      <div style={{
        background: professionalTheme.colors.secondaryBg,
        borderRadius: professionalTheme.borderRadius.large,
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: professionalTheme.shadows.card,
        border: `1px solid ${professionalTheme.colors.border}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="logo-hover" style={{ margin: '0 auto 15px auto' }}>
            <NivraLogo size={80} />
          </div>
          <h1 className="brand-hover" style={{ 
            margin: '0', 
            color: professionalTheme.colors.primaryAccent, 
            fontSize: '32px', 
            fontWeight: professionalTheme.typography.weights.bold
          }}>NIVRA</h1>
          <p style={{ margin: '5px 0 0 0', color: professionalTheme.colors.secondaryText, fontSize: '14px' }}>AI Powered Women Safety App</p>
          <p style={{ margin: '5px 0 0 0', color: professionalTheme.colors.mutedText, fontSize: '12px', fontStyle: 'italic' }}>"Your Guardian Angel in Digital Form"</p>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', color: professionalTheme.colors.primaryText, fontSize: '24px' }}>
          Welcome Back
        </h2>

        {error && (
          <div style={{
            background: '#ffe6e6',
            color: '#d63384',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {isLoading && (
          <div style={{
            background: '#e3f2fd',
            color: '#1976d2',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #1976d2',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Signing you in...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#0F172A',
                color: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px', position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '15px 50px 15px 15px',
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#0F172A',
                color: '#F8FAFC'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: professionalTheme.gradients.accent,
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: professionalTheme.borderRadius.medium,
              fontSize: '16px',
              fontWeight: professionalTheme.typography.weights.semibold,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/forgot-password"
            style={{
              color: professionalTheme.colors.primaryAccent,
              textDecoration: 'none',
              fontWeight: professionalTheme.typography.weights.semibold,
              fontSize: '14px'
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ color: professionalTheme.colors.secondaryText, fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: professionalTheme.colors.primaryAccent,
                textDecoration: 'none',
                fontWeight: professionalTheme.typography.weights.semibold
              }}
            >
              Sign Up
            </Link>
          </p>
          <p style={{ color: professionalTheme.colors.secondaryText, fontSize: '14px', marginTop: '10px' }}>
            Admin access?{' '}
            <Link
              to="/admin/login"
              style={{
                color: professionalTheme.colors.primaryAccent,
                textDecoration: 'none',
                fontWeight: professionalTheme.typography.weights.semibold
              }}
            >
              Admin Login
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: professionalTheme.colors.mutedText, fontSize: '12px' }}>
            Your safety is our priority. Stay protected with NIVRA.
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;