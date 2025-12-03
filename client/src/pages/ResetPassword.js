import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword, clearError, clearResetState } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { isLoading, error, passwordResetSuccess } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    const result = await dispatch(resetPassword({ token, password: formData.password }));
    if (result.type === 'auth/resetPassword/fulfilled') {
      setTimeout(() => {
        dispatch(clearResetState());
        navigate('/login');
      }, 3000);
    }
  };

  if (passwordResetSuccess) {
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
          
          <div style={{ margin: '30px 0', fontSize: '48px' }}>✅</div>
          
          <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '15px' }}>
            Password Reset Successful!
          </h2>
          
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
            Your password has been successfully reset. You will be redirected to login page shortly.
          </p>
          
          <Link
            to="/login"
            onClick={() => dispatch(clearResetState())}
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
            Go to Login
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
          Reset Password
        </h2>
        
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '30px' }}>
          Enter your new password below.
        </p>

        {(error || validationError) && (
          <div style={{
            background: '#ffe6e6',
            color: '#d63384',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (error) dispatch(clearError());
                if (validationError) setValidationError('');
              }}
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

          <div style={{ marginBottom: '25px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (error) dispatch(clearError());
                if (validationError) setValidationError('');
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link
            to="/login"
            onClick={() => dispatch(clearResetState())}
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

export default ResetPassword;