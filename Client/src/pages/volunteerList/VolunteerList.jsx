import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [editVolunteer, setEditVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/volunteer/getvolunteer');
        setVolunteers(response.data);
      } catch (error) {
        setError('Error fetching volunteers');
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/volunteer/deletevolunteer/${id}`);
      setVolunteers(volunteers.filter(volunteer => volunteer.id !== id));
    } catch (error) {
      setError('Error deleting volunteer');
      console.error('Error deleting volunteer:', error);
    }
  };

  const handleEdit = (volunteer) => {
    setEditVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      interest: volunteer.interest
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/volunteer/updatevolunteer/${editVolunteer.id}`, formData);
      const updatedVolunteers = await axios.get('http://localhost:3001/volunteer/getvolunteer');
      setVolunteers(updatedVolunteers.data);
      setEditVolunteer(null);
      setFormData({ name: '', email: '', phone: '', interest: '' });
      setSuccessMessage('Volunteer updated successfully');
    } catch (error) {
      setError('Error updating volunteer');
      console.error('Error updating volunteer:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        padding: 2, 
        marginLeft: isMobile ? '0' : '280px', 
        marginRight: isMobile ? '0' : 'auto',
        maxWidth: '1200px', // Ensure content width is not too wide
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          textAlign: 'left', 
          fontWeight: 'bold', 
          marginTop: '30px', 
          marginBottom: '20px',
          width: '100%',
        }} 
        gutterBottom
      >
        Volunteer List
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      {volunteers.length === 0 && !loading && !error && !successMessage ? (
        <Typography>No volunteers found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Interest</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volunteers.map(volunteer => (
                <TableRow key={volunteer.id}>
                  <TableCell>{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>{volunteer.phone}</TableCell>
                  <TableCell>{volunteer.interest}</TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row', 
                        gap: 1, 
                        alignItems: isMobile ? 'flex-start' : 'center'
                      }}
                    >
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleEdit(volunteer)}
                        sx={{ marginBottom: isMobile ? '8px' : '0' }} // Margin-bottom for mobile view
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleDelete(volunteer.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editVolunteer && (
        <Box 
          component="form" 
          onSubmit={handleUpdate} 
          sx={{ 
            mt: 3, 
            p: 2, 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            backgroundColor: '#f9f9f9',
            boxShadow: 1,
            width: '100%',
            maxWidth: '600px', // Limit max width for larger screens
            marginLeft: isMobile ? '0' : 'auto',
            marginRight: isMobile ? '0' : 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>Update Volunteer</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Interest"
              value={formData.interest}
              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary">Update Volunteer</Button>
              <Button type="button" variant="outlined" color="secondary" onClick={() => setEditVolunteer(null)}>Cancel</Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VolunteerList;
