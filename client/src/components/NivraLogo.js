import React from 'react';

const NivraLogo = ({ size = 80 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c53975 100%)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.5,
      boxShadow: '0 8px 32px rgba(255, 107, 157, 0.3)'
    }}>
      🛡️
    </div>
  );
};

export default NivraLogo;