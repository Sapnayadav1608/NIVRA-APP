import React from 'react';

const NivraLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8A2BE2" />
        <stop offset="100%" stopColor="#FF4FA7" />
      </linearGradient>
    </defs>
    
    {/* Smooth Shield */}
    <path
      d="M50 8 C28 8, 12 18, 12 35 C12 65, 50 92, 50 92 C50 92, 88 65, 88 35 C88 18, 72 8, 50 8 Z"
      fill="url(#shieldGrad)"
      rx="8"
    />
    
    {/* Left N Shape */}
    <path
      d="M25 28 L25 72 L32 72 L32 48 L48 72 L55 72 L55 28 L48 28 L48 52 L32 28 Z"
      fill="#FFFFFF"
    />
    
    {/* Right Wave Lines */}
    <g stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M62 38 Q68 45, 62 52" />
      <path d="M68 35 Q76 45, 68 55" />
      <path d="M74 32 Q84 45, 74 58" />
    </g>
  </svg>
);

export default NivraLogo;