import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NivraLogo from '../components/NivraLogo.jsx';

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
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper elevation={10} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ mx: 'auto', mb: 2 }}>
            <NivraLogo size={80} />
          </Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            NIVRA ADMIN
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            sx={{ mb: 3 }}
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {loading ? 'Signing In...' : 'Admin Login'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            User access?{' '}
            <Button
              component="a"
              href="/login"
              sx={{
                color: '#ff6b9d',
                textDecoration: 'none',
                fontWeight: 600,
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
  );
};

export default AdminLogin;