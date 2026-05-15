import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NivraLogo from '../components/NivraLogo.jsx';
import { professionalTheme } from '../theme/professionalTheme';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Admin login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
    <Box sx={{ 
      minHeight: '100vh', 
      background: professionalTheme.gradients.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      fontFamily: professionalTheme.typography.fontFamily
    }}>
      <Paper elevation={10} sx={{ 
        p: 4, 
        maxWidth: 400, 
        width: '100%', 
        borderRadius: professionalTheme.borderRadius.large,
        backgroundColor: professionalTheme.colors.secondaryBg,
        border: `1px solid ${professionalTheme.colors.border}`,
        boxShadow: professionalTheme.shadows.card
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box className="logo-hover" sx={{ mx: 'auto', mb: 2, display: 'inline-block' }}>
            <NivraLogo size={80} />
          </Box>
          <Typography className="brand-hover" variant="h4" fontWeight="bold" sx={{ 
            color: professionalTheme.colors.primaryAccent,
            fontFamily: professionalTheme.typography.fontFamily,
            fontWeight: professionalTheme.typography.weights.bold
          }}>
            NIVRA ADMIN
          </Typography>
          <Typography variant="body2" sx={{ 
            mt: 1,
            color: professionalTheme.colors.secondaryText
          }}>
            Administrative Control Panel
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Admin Email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: professionalTheme.colors.primaryBg,
                '& fieldset': {
                  borderColor: professionalTheme.colors.border,
                },
                '&:hover fieldset': {
                  borderColor: professionalTheme.colors.primaryAccent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: professionalTheme.colors.primaryAccent,
                }
              },
              '& .MuiInputLabel-root': {
                color: professionalTheme.colors.secondaryText,
              },
              '& .MuiOutlinedInput-input': {
                color: professionalTheme.colors.primaryText,
              }
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: professionalTheme.colors.primaryBg,
                '& fieldset': {
                  borderColor: professionalTheme.colors.border,
                },
                '&:hover fieldset': {
                  borderColor: professionalTheme.colors.primaryAccent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: professionalTheme.colors.primaryAccent,
                }
              },
              '& .MuiInputLabel-root': {
                color: professionalTheme.colors.secondaryText,
              },
              '& .MuiOutlinedInput-input': {
                color: professionalTheme.colors.primaryText,
              }
            }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
              )
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              py: 1.5,
              background: professionalTheme.gradients.accent,
              borderRadius: professionalTheme.borderRadius.medium,
              fontWeight: professionalTheme.typography.weights.semibold,
              '&:hover': {
                background: professionalTheme.gradients.accent,
                opacity: 0.9
              }
            }}
          >
            {loading ? 'Signing In...' : 'Admin Login'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: professionalTheme.colors.secondaryText }}>
            User access?{' '}
            <Button
              component="a"
              href="/login"
              sx={{
                color: professionalTheme.colors.primaryAccent,
                textDecoration: 'none',
                fontWeight: professionalTheme.typography.weights.semibold,
                textTransform: 'none',
                minWidth: 'auto',
                p: 0
              }}
            >
              User Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
    </>
  );
};

export default AdminLogin;