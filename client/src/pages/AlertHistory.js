import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import NivraLogo from '../components/NivraLogo.jsx';
import {
  ArrowBack,
  Emergency,
  LocationOn,
  AccessTime,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';

import { getEmergencyAlerts, resolveAlert } from '../store/slices/emergencySlice';

const AlertHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { alerts, isLoading, error } = useSelector((state) => state.emergency);
  
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [resolveDialog, setResolveDialog] = useState(false);

  useEffect(() => {
    dispatch(getEmergencyAlerts());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'resolved':
        return 'success';
      case 'false_alarm':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Emergency />;
      case 'resolved':
        return <CheckCircle />;
      case 'false_alarm':
        return <Warning />;
      default:
        return <Emergency />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      manual: 'Manual SOS',
      voice: 'Voice Alert',
      shake: 'Shake Detection',
      panic: 'Panic Button',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setDetailsDialog(true);
  };

  const handleResolveAlert = (alert) => {
    setSelectedAlert(alert);
    setResolveDialog(true);
  };

  const confirmResolve = async () => {
    if (selectedAlert) {
      await dispatch(resolveAlert(selectedAlert._id));
      setResolveDialog(false);
      setSelectedAlert(null);
    }
  };

  if (isLoading && alerts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1, ml: 2 }}>
            <NivraLogo size={32} />
            <Typography variant="h6">
              Alert History
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {alerts.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Emergency sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Emergency Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your emergency alerts will appear here when you trigger them
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emergency Alerts ({alerts.length})
              </Typography>
              <List>
                {alerts.map((alert, index) => (
                  <ListItem
                    key={alert._id}
                    divider={index < alerts.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(alert.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="subtitle1">
                            {getTypeLabel(alert.type)}
                          </Typography>
                          <Chip
                            label={alert.status.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={getStatusColor(alert.status)}
                          />
                          <Chip
                            label={alert.severity.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <AccessTime sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {formatDate(alert.createdAt)}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LocationOn sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {alert.location.address || 
                               `${alert.location.latitude}, ${alert.location.longitude}`}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {alert.message}
                          </Typography>
                          <Box display="flex" gap={1} mt={2}>
                            <Button
                              size="small"
                              onClick={() => handleViewDetails(alert)}
                            >
                              View Details
                            </Button>
                            {alert.status === 'active' && (
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleResolveAlert(alert)}
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Alert Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Type:</strong> {getTypeLabel(selectedAlert.type)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong> {selectedAlert.status.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Severity:</strong> {selectedAlert.severity.toUpperCase()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Time:</strong> {formatDate(selectedAlert.createdAt)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Location:</strong> {selectedAlert.location.address || 
                 `${selectedAlert.location.latitude}, ${selectedAlert.location.longitude}`}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Message:</strong> {selectedAlert.message}
              </Typography>
              
              {selectedAlert.responses && selectedAlert.responses.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Notifications Sent:</strong>
                  </Typography>
                  {selectedAlert.responses.map((response, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {response.responseType.replace('_', ' ')} to {response.contactPhone}
                    </Typography>
                  ))}
                </Box>
              )}
              
              {selectedAlert.resolvedAt && (
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  <strong>Resolved:</strong> {formatDate(selectedAlert.resolvedAt)}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Alert Dialog */}
      <Dialog open={resolveDialog} onClose={() => setResolveDialog(false)}>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this alert as resolved? 
            This will notify your emergency contacts that you are safe.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(false)}>Cancel</Button>
          <Button onClick={confirmResolve} color="success" variant="contained">
            Mark Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertHistory;