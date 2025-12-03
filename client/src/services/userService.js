import api from './api';

const userService = {
  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response;
  },

  // Update user location
  updateLocation: async (locationData) => {
    const response = await api.put('/user/location', locationData);
    return response;
  },

  // Add emergency contact
  addEmergencyContact: async (contactData) => {
    const response = await api.post('/user/emergency-contacts', contactData);
    return response;
  },

  // Update emergency contact
  updateEmergencyContact: async (contactId, contactData) => {
    const response = await api.put(`/user/emergency-contacts/${contactId}`, contactData);
    return response;
  },

  // Delete emergency contact
  deleteEmergencyContact: async (contactId) => {
    const response = await api.delete(`/user/emergency-contacts/${contactId}`);
    return response;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/user/preferences', preferences);
    return response;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/user/stats');
    return response;
  },
};

export default userService;