import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Button, TextField, IconButton, Alert } from '@mui/material';
import { Add, Delete, Phone, Message } from '@mui/icons-material';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '', countryCode: '+91' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load saved contacts
    const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    setContacts(savedContacts);
  }, []);

  const saveContacts = (updatedContacts) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const fullPhone = `${newContact.countryCode}${newContact.phone}`;
      const updatedContacts = [...contacts, { 
        ...newContact, 
        phone: fullPhone,
        id: Date.now() 
      }];
      saveContacts(updatedContacts);
      setNewContact({ name: '', phone: '', relation: '', countryCode: '+91' });
      setShowAddForm(false);
    }
  };

  const deleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        📞 Emergency Contacts
      </Typography>

      {contacts.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No emergency contacts added. Add contacts for SOS alerts.
        </Alert>
      )}

      {/* Contact List */}
      {contacts.map((contact) => (
        <Card key={contact.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{contact.name}</Typography>
            <Typography variant="body2" color="text.secondary">{contact.phone}</Typography>
            <Typography variant="caption" color="text.secondary">{contact.relation}</Typography>
          </Box>
          <Box>
            <IconButton color="primary" href={`tel:${contact.phone}`}>
              <Phone />
            </IconButton>
            <IconButton color="error" onClick={() => deleteContact(contact.id)}>
              <Delete />
            </IconButton>
          </Box>
        </Card>
      ))}

      {/* Add Contact Form */}
      {showAddForm ? (
        <Card sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add Emergency Contact</Typography>
          <TextField
            fullWidth
            label="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              select
              label="Code"
              value={newContact.countryCode || '+91'}
              onChange={(e) => setNewContact({ ...newContact, countryCode: e.target.value })}
              sx={{ width: '120px' }}
              SelectProps={{ native: true }}
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+966">🇸🇦 +966</option>
              <option value="+65">🇸🇬 +65</option>
            </TextField>
            <TextField
              fullWidth
              label="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              placeholder="9876543210"
            />
          </Box>
          <TextField
            fullWidth
            label="Relation (e.g., Mother, Friend)"
            value={newContact.relation}
            onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={addContact}>Add Contact</Button>
            <Button variant="outlined" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </Box>
        </Card>
      ) : (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddForm(true)}
          sx={{ mb: 3 }}
          disabled={contacts.length >= 5}
        >
          Add Emergency Contact {contacts.length >= 5 && '(Max 5)'}
        </Button>
      )}

      {/* Helpline Numbers */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>🚨 Emergency Helplines</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Police</Typography>
            <Button variant="outlined" size="small" href="tel:100">100</Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Women Helpline</Typography>
            <Button variant="outlined" size="small" href="tel:1091">1091</Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Ambulance</Typography>
            <Button variant="outlined" size="small" href="tel:108">108</Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Fire Brigade</Typography>
            <Button variant="outlined" size="small" href="tel:101">101</Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default EmergencyContacts;