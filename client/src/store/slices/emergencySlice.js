import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emergencyService from '../../services/emergencyService';

// Async thunks
export const sendEmergencyAlert = createAsyncThunk(
  'emergency/sendAlert',
  async (alertData, { rejectWithValue }) => {
    try {
      const response = await emergencyService.sendAlert(alertData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send alert');
    }
  }
);

export const getEmergencyAlerts = createAsyncThunk(
  'emergency/getAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await emergencyService.getAlerts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'emergency/resolveAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      const response = await emergencyService.resolveAlert(alertId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve alert');
    }
  }
);

export const getSafetyLocations = createAsyncThunk(
  'emergency/getSafetyLocations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await emergencyService.getSafetyLocations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch safety locations');
    }
  }
);

const initialState = {
  alerts: [],
  safetyLocations: [],
  currentAlert: null,
  isLoading: false,
  isSendingAlert: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAlert: (state, action) => {
      state.currentAlert = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
    },
    updateAlert: (state, action) => {
      const index = state.alerts.findIndex(alert => alert._id === action.payload._id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send emergency alert
      .addCase(sendEmergencyAlert.pending, (state) => {
        state.isSendingAlert = true;
        state.error = null;
      })
      .addCase(sendEmergencyAlert.fulfilled, (state, action) => {
        state.isSendingAlert = false;
        state.currentAlert = action.payload.alert;
        state.alerts.unshift(action.payload.alert);
      })
      .addCase(sendEmergencyAlert.rejected, (state, action) => {
        state.isSendingAlert = false;
        state.error = action.payload;
      })
      // Get emergency alerts
      .addCase(getEmergencyAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmergencyAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = action.payload.alerts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getEmergencyAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Resolve alert
      .addCase(resolveAlert.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.alerts.findIndex(alert => alert._id === action.payload.alert._id);
        if (index !== -1) {
          state.alerts[index] = action.payload.alert;
        }
        if (state.currentAlert && state.currentAlert._id === action.payload.alert._id) {
          state.currentAlert = action.payload.alert;
        }
      })
      .addCase(resolveAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get safety locations
      .addCase(getSafetyLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSafetyLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.safetyLocations = action.payload.locations;
      })
      .addCase(getSafetyLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setCurrentAlert, 
  addAlert, 
  updateAlert, 
  clearAlerts 
} = emergencySlice.actions;

export default emergencySlice.reducer;