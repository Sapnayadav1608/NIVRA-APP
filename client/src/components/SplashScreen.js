import React, { useState, useEffect } from 'react';
import NivraLogo from './NivraLogo.jsx';
import { professionalTheme } from '../theme/professionalTheme';

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
      background: professionalTheme.gradients.primary,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: professionalTheme.typography.fontFamily
    }}>
      {/* Logo */}
      <div className="logo-hover" style={{
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <NivraLogo size={80} />
      </div>

      {/* App Name */}
      <h1 className="brand-hover" style={{
        color: professionalTheme.colors.primaryAccent,
        fontSize: '48px',
        fontWeight: professionalTheme.typography.weights.bold,
        margin: '0 0 10px 0',
        background: `rgba(${professionalTheme.colors.secondaryBg.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.9)`,
        padding: '10px 20px',
        borderRadius: professionalTheme.borderRadius.large
      }}>
        NIVRA
      </h1>

      {/* Tagline */}
      <p style={{
        color: professionalTheme.colors.primaryText,
        fontSize: '18px',
        margin: '0 0 40px 0',
        textAlign: 'center',
        fontWeight: professionalTheme.typography.weights.medium
      }}>
        Your Safety, Our Priority
      </p>

      {/* Progress Bar */}
      <div style={{
        width: '200px',
        height: '4px',
        background: `rgba(${professionalTheme.colors.border.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`,
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: professionalTheme.colors.primaryAccent,
          borderRadius: '2px',
          transition: 'width 0.1s ease'
        }} />
      </div>

      {/* Loading Text */}
      <p style={{
        color: professionalTheme.colors.secondaryText,
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
      `}</style>
    </div>
  );
};

export default SplashScreen;