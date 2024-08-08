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
  const [selectedCategory, setSelectedCategory] = useState('All'); // Initialize to 'All'
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

        // Filter out expired events
        const today = new Date().setHours(0, 0, 0, 0);
        const validEvents = eventsWithIds.filter(event => new Date(event.startDate).setHours(0, 0, 0, 0) >= today);

        const sortedEvents = validEvents.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
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
      setFilteredEvents(events.filter(event => event.category.toLowerCase() === selectedCategory.toLowerCase()));
    }
  };

  const handleBookNow = (event) => {
    if (isEventExpired(event.startDate)) return;
    // check if user is logged in
    if (!localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }
    else {
      navigate('/BookingForm', { state: { event } });
    }
  };

  const isEventExpired = (startDate) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const eventDate = new Date(startDate).setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const formatDateRange = (startDate, endDate) => {
    const formattedStartDate = format(new Date(startDate), 'dd MMM yyyy');
    const formattedEndDate = format(new Date(endDate), 'dd MMM yyyy');
    return formattedStartDate === formattedEndDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;
  };

  const ResponsiveBanner = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <Box>
        {isMobile ? (
          <Box
            sx={{
              width: '90%',
              height: '100px',
              backgroundColor: 'lightgreen',
              color: '#000',
              backgroundImage: `url(${mobileBannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              textAlign: 'center',
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
                variant={selectedCategory === 'upcycling' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('upcycling')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'upcycling' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'upcycling' ? 'green' : 'transparent',
                }}
                startIcon={<BuildIcon />}
              >
                Upcycling
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'workshop' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('workshop')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'workshop' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'workshop' ? 'green' : 'transparent',
                }}
                startIcon={<WorkshopIcon />}
              >
                Workshop
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={selectedCategory === 'garden-walk' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('garden-walk')}
                sx={{
                  borderColor: '#ddd',
                  color: selectedCategory === 'garden-walk' ? 'white' : '#333',
                  backgroundColor: selectedCategory === 'garden-walk' ? 'green' : 'transparent',
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
                  <Typography variant="body1" color="black" sx={{ fontWeight: 'bold', marginTop: 2, textAlign: 'left' }}>
                    Date: {formatDateRange(event.startDate, event.endDate)}
                  </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'left', color: 'black' }}>
                    Time: {event.time}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold',  textAlign: 'left', color: 'black' }}>
                    Location:{event.location}
                  </Typography>
<Typography variant="body1" sx={{ textAlign: 'left', marginTop: 2 ,fontWeight:'bold'}}>
                    {event.status === 'Paid' ? `Admission: $${event.amount}` : 'Free Admission'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2, display: 'block', mx: 'auto' }}
                    onClick={() => handleBookNow(event)}
                    disabled={isEventExpired(event.startDate)}
                  >
                    {isEventExpired(event.startDate) ? 'Expired' : 'Book Now'}
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
    <div>
      <ResponsiveBanner />
    </div>
  );
};

export default BookNowPage;
