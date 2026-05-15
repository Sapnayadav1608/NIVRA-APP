import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  CircularProgress,
  Fab,
} from '@mui/material';
import NivraLogo from '../components/NivraLogo.jsx';
import {
  Send,
  Mic,
  MicOff,
  ArrowBack,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { 
  sendMessage, 
  addUserMessage, 
  getQuickResponses,
  clearMessages 
} from '../store/slices/chatSlice';
import chatService from '../services/chatService';

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const { messages, quickResponses, isSending, currentSessionId } = useSelector(
    (state) => state.chat
  );
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Get quick responses on component mount
    dispatch(getQuickResponses());
    
    // Add welcome message if no messages
    if (messages.length === 0) {
      dispatch(addUserMessage("Hi! I'm NIVRA's AI assistant. How can I help you stay safe today?"));
    }
  }, [dispatch, messages.length]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setInputMessage('');

    // Add user message to UI immediately
    dispatch(addUserMessage(messageText));

    // Send to backend
    await dispatch(sendMessage({
      message: messageText,
      sessionId: currentSessionId,
    }));
  };

  const handleQuickResponse = (responseText) => {
    handleSendMessage(responseText);
  };

  const startVoiceRecognition = () => {
    const recognitionInstance = chatService.startVoiceRecognition(
      (transcript) => {
        setInputMessage(transcript);
        setIsListening(false);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
      }
    );

    if (recognitionInstance) {
      setRecognition(recognitionInstance);
      setIsListening(true);
    } else {
      alert('Voice recognition is not supported in your browser');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition) {
      chatService.stopVoiceRecognition(recognition);
      setIsListening(false);
    }
  };

  const speakMessage = (text) => {
    if (isSpeaking) {
      chatService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const utterance = chatService.speakText(text);
      if (utterance) {
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
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
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1, ml: 2 }}>
            <NivraLogo size={32} />
            <Typography variant="h6">
              NIVRA AI Assistant
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={() => dispatch(clearMessages())}
          >
            Clear Chat
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Messages Container */}
      <Box flex={1} overflow="hidden" display="flex" flexDirection="column">
        <Container maxWidth="md" sx={{ flex: 1, py: 2, overflow: 'auto' }}>
          {/* Quick Responses */}
          {messages.length <= 1 && quickResponses.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Quick questions:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {quickResponses.map((response, index) => (
                  <Chip
                    key={index}
                    label={response.text}
                    onClick={() => handleQuickResponse(response.text)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Messages */}
          <Box>
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                mb={1}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  }}
                >
                  <Typography variant="body1">{message.message}</Typography>
                  {message.sender === 'bot' && (
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <IconButton
                        size="small"
                        onClick={() => speakMessage(message.message)}
                        sx={{ color: 'inherit' }}
                      >
                        {isSpeaking ? <VolumeOff /> : <VolumeUp />}
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
            
            {isSending && (
              <Box display="flex" justifyContent="flex-start" mb={1}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: '20px 20px 20px 4px',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      NIVRA is thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
        </Container>

        {/* Input Area */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="md">
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me about safety tips, emergency procedures..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                multiline
                maxRows={3}
                disabled={isSending}
              />
              
              <IconButton
                color="primary"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isSending}
              >
                {isListening ? <MicOff /> : <Mic />}
              </IconButton>
              
              <IconButton
                color="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isSending}
              >
                <Send />
              </IconButton>
            </Box>
            
            {isListening && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                Listening... Speak now
              </Typography>
            )}
          </Container>
        </Paper>
      </Box>
    </Box>
  );
};

export default Chat;