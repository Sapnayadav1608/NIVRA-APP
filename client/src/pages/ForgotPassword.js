import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, verifyOTP, clearError, clearResetState } from '../store/slices/authSlice';
import NivraLogo from '../components/NivraLogo.jsx';
import { professionalTheme } from '../theme/professionalTheme';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, otpSent, generatedOTP, passwordResetSuccess } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP+Password
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSubmittedEmail(email);
    setCurrentEmail(email);
    localStorage.setItem('resetEmail', email); // Store in localStorage
    console.log('Sending OTP to email:', email);
    dispatch(forgotPassword(email));
  };

  // Auto move to step 2 when OTP is received
  React.useEffect(() => {
    if (otpSent) {
      setStep(2);
    }
  }, [otpSent]);

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const emailToUse = localStorage.getItem('resetEmail') || currentEmail || submittedEmail || email;
    console.log('Submitting OTP with email:', emailToUse);
    console.log('Available emails:', { 
      localStorage: localStorage.getItem('resetEmail'),
      currentEmail, 
      submittedEmail, 
      email 
    });
    const result = await dispatch(verifyOTP({ email: emailToUse, otp, newPassword }));
    console.log('OTP Result:', result);
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('resetEmail'); // Clean up
    dispatch(clearResetState());
  };

  if (passwordResetSuccess) {
    return (
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
          borderRadius: professionalTheme.borderRadius.xl,
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: professionalTheme.shadows.card,
          border: `1px solid ${professionalTheme.colors.border}`
        }}>
          <div className="logo-hover" style={{ margin: '0 auto 15px auto', display: 'inline-block' }}>
            <NivraLogo size={80} />
          </div>
          <h1 className="brand-hover" style={{ margin: '0', color: '#ff6b9d', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
          
          <div style={{ margin: '30px 0', fontSize: '48px' }}>📧</div>
          
          <h2 style={{ color: professionalTheme.colors.primaryText, fontSize: '24px', marginBottom: '15px' }}>
            Password Reset Successful!
          </h2>
          
          <p style={{ color: professionalTheme.colors.secondaryText, fontSize: '16px', marginBottom: '30px' }}>
            Your password has been updated successfully.
          </p>
          
          <Link
            to="/login"
            onClick={handleBackToLogin}
            style={{
              display: 'inline-block',
              background: professionalTheme.gradients.accent,
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: professionalTheme.borderRadius.medium,
              fontSize: '16px',
              fontWeight: professionalTheme.typography.weights.semibold
            }}
          >
            Back to Login
          </Link>
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
            text-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: professionalTheme.colors.secondaryBg,
        borderRadius: professionalTheme.borderRadius.xl,
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: professionalTheme.shadows.card,
        border: `1px solid ${professionalTheme.colors.border}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="logo-hover" style={{ margin: '0 auto 15px auto', display: 'inline-block' }}>
            <NivraLogo size={80} />
          </div>
          <h1 className="brand-hover" style={{ margin: '0', color: '#ff6b9d', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: professionalTheme.colors.primaryText, fontSize: '24px' }}>
          {step === 1 ? 'Forgot Password?' : 'Enter OTP & New Password'}
        </h2>
        
        <p style={{ textAlign: 'center', color: professionalTheme.colors.secondaryText, fontSize: '14px', marginBottom: '30px' }}>
          {step === 1 ? 'Enter your email address to receive OTP.' : `OTP sent to ${currentEmail || submittedEmail || email}. Check your email inbox.`}
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

        {/* OTP Notification */}
        {otpSent && (
          <div style={{
            background: '#e8f5e8',
            border: '2px solid #4caf50',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>📧 OTP Sent!</div>
            <div style={{ fontSize: '14px' }}>Check your email for the OTP code</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Valid for 5 minutes</div>
          </div>
        )}

        <form onSubmit={step === 1 ? handleEmailSubmit : handleOTPSubmit}>
          {step === 1 && !otpSent && (
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
                  border: `2px solid ${professionalTheme.colors.border}`,
                  borderRadius: professionalTheme.borderRadius.medium,
                  fontSize: '16px',
                  outline: 'none',
                  background: professionalTheme.colors.primaryBg,
                  color: professionalTheme.colors.primaryText
                }}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  maxLength="6"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    letterSpacing: '3px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <div style={{ marginBottom: '25px' }}>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            </>
          )}

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
            {isLoading ? (step === 1 ? 'Sending OTP...' : 'Resetting...') : (step === 1 ? 'Send OTP' : 'Reset Password')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link
            to="/login"
            onClick={handleBackToLogin}
            style={{
              color: professionalTheme.colors.primaryAccent,
              textDecoration: 'none',
              fontWeight: professionalTheme.typography.weights.semibold,
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default ForgotPassword;