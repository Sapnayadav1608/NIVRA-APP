import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NivraLogo from '../components/NivraLogo.jsx';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Registration successful! Please login.');
        window.location.href = '/login';
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
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
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Join the Safety Community</p>
          <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '12px', fontStyle: 'italic' }}>"Your Guardian Angel in Digital Form"</p>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', color: '#333', fontSize: '24px' }}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #f0f0f0',
              borderRadius: '12px',
              fontSize: '16px',
              marginBottom: '15px',
              outline: 'none'
            }}
          />

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
              marginBottom: '15px',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select
              style={{
                padding: '15px',
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                width: '100px'
              }}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
            </select>
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{
                flex: '1',
                padding: '15px',
                border: '2px solid #f0f0f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
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

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c53975 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#ff6b9d',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;