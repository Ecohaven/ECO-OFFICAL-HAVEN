import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import RecyclingIcon from '@mui/icons-material/Recycling';
import BuildIcon from '@mui/icons-material/Build';
import WorkshopIcon from '@mui/icons-material/Construction';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import bannerImage from '../../assets/images/Eco-Banner.jpg';
import mobileBannerImage from '../../assets/images/Eco-Banner.jpg';

const BookNowPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsByCategory();
  }, [events, selectedCategory]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/events');
      if (Array.isArray(response.data)) {
        const eventsWithIds = response.data.map((event) => ({
          ...event,
          id: event.eventId,
        }));

        const sortedEvents = eventsWithIds.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setEvents(sortedEvents);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filterEventsByCategory = () => {
    if (selectedCategory === 'All') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  };

  const handleBookNow = (event) => {
    if (isEventExpired(event.startDate)) return;
    navigate('/BookingForm', { state: { event } });
  };

  const isEventExpired = (startDate) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const eventDate = new Date(startDate).setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const formatDateRange = (startDate, endDate) => {
    const formattedStartDate = format(new Date(startDate), 'dd MMM yyyy');
    const formattedEndDate = format(new Date(endDate), 'dd MMM yyyy');
    if (formattedStartDate === formattedEndDate) {
      return formattedStartDate;
    } else {
      return `${formattedStartDate} - ${formattedEndDate}`;
    }
  };

  const ResponsiveBanner = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small or below

    return (
      <Box sx={{ p: 2 }}>
        {isMobile ? (
          <Box
            sx={{
              width: '90%',
              height: '100px',
              backgroundColor: 'lightgreen', // Background color for the text element
              color: '#000', 
              backgroundImage: `url(${mobileBannerImage})`, // Background image for the text element
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px', // Padding for better spacing
              textAlign: 'center', // Center align text
            }}
          >
          </Box>
        ) : (
          <Box
            component="img"
            src={bannerImage}
            alt="Banner"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: { xs: 400, sm: 400, md: 400 },
              objectFit: 'cover',
              display: 'block',
              marginTop: '10px',
            }}
          />
        )}
        <Stack direction="row" spacing={2} sx={{ mb: 5, justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <Grid container spacing={1} justifyContent="center">
            <Grid item>
              <Button
                variant={selectedCategory === 'All' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('All')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'All' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'All' ? 'green' : 'transparent',
                }}
                startIcon={<AllInclusiveIcon />}
              >
                All
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'recycling' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('recycling')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'recycling' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'recycling' ? 'green' : 'transparent',
                }}
                startIcon={<RecyclingIcon />}
              >
                Recycling
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'Upcycling' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('Upcycling')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'Upcycling' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'Upcycling' ? 'green' : 'transparent',
                }}
                startIcon={<BuildIcon />}
              >
                Upcycling
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'Workshop' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('Workshop')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'Workshop' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'Workshop' ? 'green' : 'transparent',
                }}
                startIcon={<WorkshopIcon />}
              >
                Workshop
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'Garden Walk' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('Garden Walk')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'Garden Walk' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'Garden Walk' ? 'green' : 'transparent',
                }}
                startIcon={<LocalFloristIcon />}
              >
                Garden Walk
              </Button>
            </Grid>
          </Grid>
        </Stack>

        {filteredEvents.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: 'center', color: 'red' }}>
            No available events in this category at the moment
          </Typography>
        ) : (
          <Grid container spacing={{ xs: 4, md: 3 }}>
            {filteredEvents.map((event) => (
              <Grid item key={event.id} xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 3,
                    width: '100%',
                    maxWidth: 300,
                    marginTop: 1,
                    marginBottom: 2,
                    mx: 'auto',
                    border: '5px solid green',
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2, textAlign: 'center', color: 'black' }}>
                    {event.eventName}
                  </Typography>
                  <img
                    src={`http://localhost:3001/api/event-picture/${event.id}`}
                    alt={event.eventName}
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }}
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
                    Time: {event.startTime} - {event.endTime}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleBookNow(event)}
                    disabled={isEventExpired(event.startDate)}
                    sx={{
                      mt: 2,
                      width: '100%',
                      bgcolor: 'green',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'darkgreen',
                      },
                    }}
                  >
                    {isEventExpired(event.startDate) ? 'Event Expired' : 'Book Now'}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <ResponsiveBanner />
    </Box>
  );
};

export default BookNowPage;
