import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Grid,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';

import { updateProfile } from '../store/slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error } = useSelector((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phone)) {
      errors.phone = 'Phone number must include country code (e.g., +1234567890)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Profile
          </Typography>
          {!isEditing && (
            <IconButton color="inherit" onClick={() => setIsEditing(true)}>
              <Edit />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Avatar */}
            <Box display="flex" justifyContent="center" mb={4}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 36,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(formData.fullName)
                )}
              </Avatar>
            </Box>

            {/* Profile Form */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!validationErrors.fullName}
                  helperText={validationErrors.fullName}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone || 'Include country code (e.g., +1234567890)'}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>

              {/* Account Info */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Account Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Type"
                  value={user?.role === 'admin' ? 'Administrator' : 'User'}
                  disabled
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Member Since"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  disabled
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Login"
                  value={user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  disabled
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Status"
                  value={user?.isActive ? 'Active' : 'Inactive'}
                  disabled
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {isEditing && (
              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Profile;