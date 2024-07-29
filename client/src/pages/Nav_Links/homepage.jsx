import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Grid, Typography, Button, Box } from '@mui/material';
import AccountContext from '../../contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HomePage = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const { account } = useContext(AccountContext); // Get account info from context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/eco/product-detail');
        if (Array.isArray(response.data)) {
          // Sort products by creation date (assuming there is a createdAt field)
          const sortedProducts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestProducts(sortedProducts.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching latest items:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/events');
        if (Array.isArray(response.data)) {
          const eventsWithIds = response.data.map((event) => ({
            ...event,
            id: event.eventId,
          }));

          // Sort events by the latest startDate first
          const sortedEvents = eventsWithIds.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setEvents(sortedEvents.slice(0, 4)); // Get the top 4 events
        } else {
          console.error('Expected an array from the API response');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchLatestProducts();
    fetchEvents();
  }, []);

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
      return formattedStartDate; // Display only one date if start and end dates are the same
    } else {
      return `${formattedStartDate} - ${formattedEndDate}`;
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="headbanner">
        <img src="../../src/assets/images/homebanner.jpg" alt="Banner" style={{ width: '100%', marginTop: '20px' }} />
        <h1 style={{ color: 'white' }}>EcoHaven</h1>
      </div>

      {/* Display latest products */}
      <Grid container spacing={2} sx={{ p: 3 }}>
        {latestProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Box
              sx={{
                p: 2,
                border: '1px solid #ccc',
                borderRadius: 5,
                backgroundColor: '#fff',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                {product.name}
              </Typography>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: 'auto', borderRadius: 5 }}
              />
              <Typography variant="body1" color="textSecondary" sx={{ marginTop: 1 }}>
                {product.description}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1 }}>
                ${product.price}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Display events */}
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'green', mb: 2 }}>
        Events & Workshops
      </Typography>

      <Typography variant="p" align="center" gutterBottom sx={{ mb: 2 }}>
        Here are the latest events & workshops happening in Singapore!
      </Typography>

      <Grid container spacing={5} sx={{ p: 3, mb: 8}}>
        {events.map((event, index) => (
          <Grid item key={event.id} xs={6} sm={6} md={6} lg={6}>
            <Box
              sx={{
                p: 2,
                width: '100%',
                maxWidth: 300,
                height: 400, // Fixed height for each event
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2, textAlign: 'center', color: 'black' }}>
                {event.eventName}
              </Typography>
              <img
                src={`http://localhost:3001/api/event-picture/${event.eventId}`}
                alt={event.eventName}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 5 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginTop: 1, textAlign: 'center', color: 'green' }}>
                {formatDateRange(event.startDate, event.endDate)}
              </Typography>
              <Typography variant="body1" sx={{ marginTop: 1, textAlign: 'center', color: 'black' }}>
                Time: {event.time}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  marginTop: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: isEventExpired(event.startDate) ? 'red' : 'green',
                }}
              >
                {isEventExpired(event.startDate) ? 'Event Expired' : 'Active'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleBookNow(event)}
                  disabled={isEventExpired(event.startDate)}
                >
                  Book Now
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Why Us */}
      {/* <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'green', mb: 2 }}>
        Why Us
      </Typography> */}

      {/* Our partners */}
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'green', mb: 2 }}>
        Our Partners
      </Typography>

      <Typography variant="p" align="center" gutterBottom sx={{ mb: 2 }}>
        Special thanks to all!
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {[
          { img: '../../src/assets/images/cc_logo.png'},
          { img: '../../src/assets/images/rc_logo.png'},
          { img: '../../src/assets/images/rn_logo.png'}
        ].map((step, index) => (
          <Grid item key={index} xs={12} sm={6} md={3}>
            <img src={step.img} alt={step.title} style={{ width: '200px', height: 'auto', display: 'block', margin: '0 auto', marginBottom: '50px', marginTop: '30px' }} />
            <div className='desc'>
              <p><b>{step.title}</b></p>
              <p>{step.description}</p>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default HomePage;
