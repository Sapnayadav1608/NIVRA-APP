import React, { useState, useEffect } from 'react';

const BiometricAuth = ({ onSuccess, onCancel }) => {
  const [authMethod, setAuthMethod] = useState('fingerprint');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const authenticateFingerprint = async () => {
    setIsAuthenticating(true);
    setError('');
    
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported');
      }

      // Simulate fingerprint authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "NIVRA" },
          user: {
            id: new Uint8Array(16),
            name: "user@nivra.app",
            displayName: "NIVRA User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        onSuccess();
      }
    } catch (err) {
      setError('Fingerprint authentication failed. Please try again.');
      console.error('Biometric auth error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateFace = async () => {
    setIsAuthenticating(true);
    setError('');
    
    try {
      // Request camera access for face recognition
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Simulate face recognition process
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        onSuccess();
        setIsAuthenticating(false);
      }, 2000);
      
    } catch (err) {
      setError('Face authentication failed. Please allow camera access.');
      setIsAuthenticating(false);
    }
  };

  const authenticatePIN = () => {
    const pin = prompt('Enter your 4-digit PIN:');
    const savedPIN = localStorage.getItem('nivra_pin') || '1234';
    
    if (pin === savedPIN) {
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '350px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '24px' }}>
          Secure Authentication
        </h2>
        <p style={{ margin: '0 0 30px 0', color: '#666', fontSize: '14px' }}>
          Choose your preferred authentication method
        </p>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={authenticateFingerprint}
            disabled={isAuthenticating}
            style={{
              background: authMethod === 'fingerprint' ? '#667eea' : '#f5f5f5',
              color: authMethod === 'fingerprint' ? 'white' : '#333',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            👆 {isAuthenticating && authMethod === 'fingerprint' ? 'Authenticating...' : 'Fingerprint'}
          </button>

          <button
            onClick={authenticateFace}
            disabled={isAuthenticating}
            style={{
              background: authMethod === 'face' ? '#667eea' : '#f5f5f5',
              color: authMethod === 'face' ? 'white' : '#333',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            👤 {isAuthenticating && authMethod === 'face' ? 'Scanning...' : 'Face Recognition'}
          </button>

          <button
            onClick={authenticatePIN}
            disabled={isAuthenticating}
            style={{
              background: '#f5f5f5',
              color: '#333',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            🔢 PIN Code
          </button>
        </div>

        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BiometricAuth;