import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const BookNowPage = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/events');
      if (Array.isArray(response.data)) {
        const eventsWithIds = response.data.map((event) => ({
          ...event,
          id: event.eventId,
        }));
        setEvents(eventsWithIds);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleBookNow = (event) => {
    navigate('/BookingForm', { state: { event } });
  };

  const formatDateRange = (startDate, endDate) => {
    const formattedStartDate = format(new Date(startDate), 'dd MMM yyyy');
    const formattedEndDate = format(new Date(endDate), 'dd MMM yyyy');
    if (formattedStartDate === formattedEndDate) {
      return formattedStartDate; // Display only one date if start and end dates are the same
    } else {
      return `${formattedStartDate} - ${formattedEndDate}`;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: 'green',
          mb: 2,
        }}
      >
        Book Now
      </Typography>
      <Grid container spacing={{ xs: 4, md: 3 }}>
        {events.map((event) => (
          <Grid item key={event.id} xs={12} sm={6} md={4}>
            <Box
              sx={{
                p: 3,
                width: '100%',
                maxWidth: 300,
                marginTop: 1,
                mx: 'auto',
                border: '1px solid #ccc',
                borderRadius: 5,
                cursor: 'pointer',
                backgroundColor: '#fff',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-4px)',
                },
                transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2, textAlign: 'center',color:'black' }}>
                {event.eventName}
              </Typography>
              <img
                src={`http://localhost:3001/api/event-picture/${event.id}`}
                alt={event.eventName}
                style={{ width: 300, height: 200, objectFit: 'cover', borderRadius: 10 }}
              />
              <Typography variant="body1" color="black" sx={{ fontWeight: 'bold', mt: 2 }}>
                Date: {formatDateRange(event.startDate, event.endDate)}
              </Typography>
              <Typography variant="body1" color="black" sx={{ fontWeight: 'bold', mt: 2 }}>
                {event.status === 'Paid' ? 'Price' : 'Admission: Free'}
                {event.status === 'Paid' && (
                  <>: ${event.amount}</>
                )}
              </Typography>
              <Typography variant="body2" color="black" sx={{ fontWeight: 'bold', mt: 2 }}>
                Time: {event.time}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: 'green',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'darkgreen',
                    },
                  }}
                  onClick={() => handleBookNow(event)}
                >
                  Book Now
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookNowPage;
