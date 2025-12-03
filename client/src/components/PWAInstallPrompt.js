import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { GetApp, Close, PhoneIphone } from '@mui/icons-material';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay (only if not already installed)
      if (!standalone) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || (!deferredPrompt && !isIOS) || !showInstallPrompt) {
    return null;
  }

  return (
    <Dialog
      open={showInstallPrompt}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PhoneIphone color="primary" sx={{ mr: 1 }} />
            Install NIVRA App
          </Box>
          <IconButton onClick={handleDismiss} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          Install NIVRA on your device for the best experience:
        </Typography>
        
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2" paragraph>
            Quick access from your home screen
          </Typography>
          <Typography component="li" variant="body2" paragraph>
            Works offline for emergency situations
          </Typography>
          <Typography component="li" variant="body2" paragraph>
            Faster loading and better performance
          </Typography>
          <Typography component="li" variant="body2" paragraph>
            Push notifications for safety alerts
          </Typography>
        </Box>

        {isIOS && (
          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mt: 2 }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>iOS Users:</strong> Tap the share button in Safari and select "Add to Home Screen"
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleDismiss} color="inherit">
          Maybe Later
        </Button>
        {!isIOS && (
          <Button
            onClick={handleInstallClick}
            variant="contained"
            startIcon={<GetApp />}
          >
            Install App
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;