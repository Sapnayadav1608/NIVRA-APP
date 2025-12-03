import React, { useState, useEffect } from 'react';
import NivraLogo from './NivraLogo.jsx';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Logo */}
      <div style={{
        marginBottom: '20px',
        animation: 'pulse 2s infinite'
      }}>
        <NivraLogo size={80} />
      </div>

      {/* App Name */}
      <h1 style={{
        color: '#8A2BE2',
        fontSize: '48px',
        fontWeight: '700',
        margin: '0 0 10px 0',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px 20px',
        borderRadius: '15px'
      }}>
        NIVRA
      </h1>

      {/* Tagline */}
      <p style={{
        color: 'rgba(255,255,255,0.9)',
        fontSize: '18px',
        margin: '0 0 40px 0',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Your Safety, Our Priority
      </p>

      {/* Progress Bar */}
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'white',
          borderRadius: '2px',
          transition: 'width 0.1s ease'
        }} />
      </div>

      {/* Loading Text */}
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px',
        margin: 0
      }}>
        {progress < 30 ? 'Initializing...' : 
         progress < 60 ? 'Loading Safety Features...' :
         progress < 90 ? 'Connecting to Services...' : 'Ready!'}
      </p>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;