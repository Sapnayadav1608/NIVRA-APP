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
            text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
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
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#1E293B',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid #334155'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="logo-hover" style={{ margin: '0 auto 15px auto', display: 'inline-block' }}>
            <NivraLogo size={80} />
          </div>
          <h1 className="brand-hover" style={{ margin: '0', color: '#6366F1', fontSize: '32px', fontWeight: '700' }}>NIVRA</h1>
          <p style={{ margin: '5px 0 0 0', color: '#CBD5E1', fontSize: '14px' }}>Join the Safety Community</p>
          <p style={{ margin: '5px 0 0 0', color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>"Your Guardian Angel in Digital Form"</p>
        </div>

        <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', color: '#F8FAFC', fontSize: '24px' }}>
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
              border: '2px solid #334155',
              borderRadius: '12px',
              fontSize: '16px',
              marginBottom: '15px',
              outline: 'none',
              background: '#0F172A',
              color: '#F8FAFC'
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
              border: '2px solid #334155',
              borderRadius: '12px',
              fontSize: '16px',
              marginBottom: '15px',
              outline: 'none',
              background: '#0F172A',
              color: '#F8FAFC'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select
              style={{
                padding: '15px',
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                width: '100px',
                background: '#0F172A',
                color: '#F8FAFC'
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
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#0F172A',
                color: '#F8FAFC'
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
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#0F172A',
                color: '#F8FAFC'
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
                border: '2px solid #334155',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: '#0F172A',
                color: '#F8FAFC'
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
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
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
          <p style={{ color: '#CBD5E1', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#6366F1',
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
    </>
  );
};

export default Register;