import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';

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
    const result = await dispatch(loginUser(formData));
    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '25px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ margin: '0 auto 15px auto' }}>
            <NivraLogo size={80} />
          </div>
          <h1 style={{ margin: '0', color: '#ff6b9d', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>AI Powered Women Safety App</p>
          <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '12px', fontStyle: 'italic' }}>"Your Guardian Angel in Digital Form"</p>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', color: '#333', fontSize: '24px' }}>
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
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
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
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
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
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c53975 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
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
              color: '#ff6b9d',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#ff6b9d',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign Up
            </Link>
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
            Admin access?{' '}
            <Link
              to="/admin/login"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Admin Login
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#999', fontSize: '12px' }}>
            Your safety is our priority. Stay protected with NIVRA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;