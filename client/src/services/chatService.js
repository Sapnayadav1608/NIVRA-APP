import api from './api';

const chatService = {
  // Send message to chatbot
  sendMessage: async (message, sessionId) => {
    const response = await api.post('/chatbot/message', {
      message,
      sessionId,
    });
    return response;
  },

  // Get chat history
  getChatHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/chatbot/history?${queryString}`);
    return response;
  },

  // Submit feedback for chat session
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/chatbot/feedback', feedbackData);
    return response;
  },

  // Get quick response suggestions
  getQuickResponses: async () => {
    const response = await api.get('/chatbot/quick-responses');
    return response;
  },

  // Generate session ID
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Process voice input (using Web Speech API)
  startVoiceRecognition: (onResult, onError) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError(new Error('Speech recognition not supported'));
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
    return recognition;
  },

  // Stop voice recognition
  stopVoiceRecognition: (recognition) => {
    if (recognition) {
      recognition.stop();
    }
  },

  // Text-to-speech for bot responses
  speakText: (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Use a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.gender === 'female'
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
      return utterance;
    }
    return null;
  },

  // Stop text-to-speech
  stopSpeaking: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },
};

export default chatService;