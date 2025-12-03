import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(message, sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const getChatHistory = createAsyncThunk(
  'chat/getHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'chat/submitFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await chatService.submitFeedback(feedbackData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const getQuickResponses = createAsyncThunk(
  'chat/getQuickResponses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getQuickResponses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quick responses');
    }
  }
);

const initialState = {
  messages: [],
  currentSessionId: null,
  quickResponses: [],
  isLoading: false,
  isSending: false,
  error: null,
  chatHistory: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentSessionId = null;
    },
    setSessionId: (state, action) => {
      state.currentSessionId = action.payload;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        sender: 'user',
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    addBotMessage: (state, action) => {
      state.messages.push({
        sender: 'bot',
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.currentSessionId = action.payload.sessionId;
        // Add bot response
        state.messages.push({
          sender: 'bot',
          message: action.payload.response,
          timestamp: new Date().toISOString(),
          intent: action.payload.intent,
          confidence: action.payload.confidence,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      // Get chat history
      .addCase(getChatHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatHistory = action.payload.chatLogs;
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get quick responses
      .addCase(getQuickResponses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuickResponses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quickResponses = action.payload.quickResponses;
      })
      .addCase(getQuickResponses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  addMessage, 
  clearMessages, 
  setSessionId, 
  addUserMessage, 
  addBotMessage 
} = chatSlice.actions;

export default chatSlice.reducer;