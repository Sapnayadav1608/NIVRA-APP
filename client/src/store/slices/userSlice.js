import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Async thunks
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'user/updateLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await userService.updateLocation(locationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

export const addEmergencyContact = createAsyncThunk(
  'user/addEmergencyContact',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await userService.addEmergencyContact(contactData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add emergency contact');
    }
  }
);

export const updateEmergencyContact = createAsyncThunk(
  'user/updateEmergencyContact',
  async ({ contactId, contactData }, { rejectWithValue }) => {
    try {
      const response = await userService.updateEmergencyContact(contactId, contactData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update emergency contact');
    }
  }
);

export const deleteEmergencyContact = createAsyncThunk(
  'user/deleteEmergencyContact',
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await userService.deleteEmergencyContact(contactId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete emergency contact');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferences);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

const initialState = {
  profile: null,
  location: null,
  emergencyContacts: [],
  preferences: {
    theme: 'light',
    notifications: true,
    voiceAlerts: true,
    shakeDetection: true,
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setEmergencyContacts: (state, action) => {
      state.emergencyContacts = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.location = action.payload.location;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add emergency contact
      .addCase(addEmergencyContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emergencyContacts = action.payload.contacts;
      })
      .addCase(addEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update emergency contact
      .addCase(updateEmergencyContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emergencyContacts = action.payload.contacts;
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete emergency contact
      .addCase(deleteEmergencyContact.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emergencyContacts = action.payload.contacts;
      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.preferences;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setLocation, 
  setProfile, 
  setEmergencyContacts, 
  setPreferences 
} = userSlice.actions;

export default userSlice.reducer;