import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError, clearResetState } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, resetEmailSent } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  const handleBackToLogin = () => {
    dispatch(clearResetState());
  };

  if (resetEmailSent) {
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
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ margin: '0 auto 15px auto' }}>
            <NivraLogo size={80} />
          </div>
          <h1 style={{ margin: '0', color: '#ff6b9d', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
          
          <div style={{ margin: '30px 0', fontSize: '48px' }}>📧</div>
          
          <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
            Check Your Email
          </h2>
          
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          
          <Link
            to="/login"
            onClick={handleBackToLogin}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c53975 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333', fontSize: '24px' }}>
          Forgot Password?
        </h2>
        
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '30px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

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
          <div style={{ marginBottom: '25px' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) dispatch(clearError());
              }}
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link
            to="/login"
            onClick={handleBackToLogin}
            style={{
              color: '#ff6b9d',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;