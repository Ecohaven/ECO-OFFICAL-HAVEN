import React, { useState, useEffect } from 'react';
import { Grid, Typography, Modal, Box, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { format, isSameDay, isBefore, startOfDay, parseISO } from 'date-fns';

const EventDataTable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [events, setEvents] = useState([]);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        
        // Sort events by end date in descending order
        const sortedEvents = eventsWithIds.sort((a, b) => {
          const dateA = parseISO(a.endDate);
          const dateB = parseISO(b.endDate);
          return dateB - dateA;  // Latest date first
        });

        setEvents(sortedEvents);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleOpenEventModal = (event) => {
    setSelectedEvent(event);
    setOpenEventModal(true);
  };

  const handleCloseEventModal = () => {
    setOpenEventModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'd MMMM yyyy');
  };

  const formatDatesRange = (startDateString, endDateString) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (isSameDay(startDate, endDate)) {
      return formatDate(startDateString);
    } else {
      return `${formatDate(startDateString)} - ${formatDate(endDateString)}`;
    }
  };

  // Check if the event has expired, excluding today
  const isEventExpired = (endDateString) => {
    const endDate = parseISO(endDateString);
    const today = new Date();
    // Get start of today
    const startOfToday = startOfDay(today);
    // Event is expired if end date is strictly before start of today
    return isBefore(endDate, startOfToday);
  };

  return (
    <>
      <Typography variant="h4" style={{ textAlign: 'center', marginBottom: 20, marginTop: '10px', fontWeight: 'bold' }}>
        Events
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {events.map((event) => {
          const expired = isEventExpired(event.endDate);
          return (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <Box
                sx={{
                  p: 2,
                  width: '100%',
                  maxWidth: 400,
                  marginLeft: '20px',
                  border: '1px solid #ccc',
                  borderRadius: 5,
                  cursor: expired ? 'not-allowed' : 'pointer',
                  backgroundColor: expired ? 'rgba(0, 0, 0, 0.1)' : 'white',
                  opacity: expired ? 0.5 : 1,
                  '&:hover': !expired && {
                    backgroundColor: 'lightgreen',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                  },
                  transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
                }}
                onClick={() => !expired && handleOpenEventModal(event)}
              >
                <img
                  src={`http://localhost:3001/api/event-picture/${event.id}`}
                  alt={event.eventName}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }}
                />
                <Typography variant="h7" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'black', fontSize: '20px' }}>
                  {event.eventName}
                </Typography>
                <Typography variant="body1" color="black" sx={{ mb: 2, mt: 1 }}>
                  {event.description}
                </Typography>
                <Typography variant="h7" color="black">
                  <strong>Date: {formatDatesRange(event.startDate, event.endDate)}</strong>
                </Typography>
                <Typography variant="body1" color="black">
                  <strong>Time: {event.time}</strong>
                </Typography>
                {event.status === 'Free' ? (
                  <Typography variant="body1" color="black">
                    <strong>Admission: </strong> Free
                  </Typography>
                ) : (
                  <Typography variant="body1" color="black">
                    <strong>Amount: </strong> ${event.amount}
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Event Details Modal */}
      <Modal
        open={openEventModal}
        onClose={handleCloseEventModal}
        aria-labelledby="event-modal-title"
        aria-describedby="event-modal-description"
        style={{
          backdropFilter: 'blur(1px)',  // Adds a blur effect to the background
          backgroundColor: 'rgba(0, 0, 0, 0.8)',  // Dark semi-transparent background
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: isMobile ? '90vw' : 800,
            bgcolor: 'white',
            boxShadow: 24,
            p: 4,
            borderRadius: 5,
            outline: 'none',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
          }}
        >
          {selectedEvent && (
            <>
              <img
                src={`http://localhost:3001/api/event-picture/${selectedEvent.id}`}
                alt={selectedEvent.eventName}
                style={{ width: isMobile ? '100%' : '40%', minWidth: isMobile ? '100%' : 300, height: 300, objectFit: 'cover', borderRadius: 16, marginRight: isMobile ? 0 : 20 }}
              />
              <Box style={{ width: isMobile ? '100%' : '60%' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                  {selectedEvent.eventName}
                </Typography>
                <Typography variant="body1" color={'black'} gutterBottom>
                  {selectedEvent.description}
                </Typography>
                <Typography variant="body1" color={'black'}>
                  <strong>Location:</strong> {selectedEvent.location}
                </Typography>
                <Typography variant="body1" color={'black'}>
                  <strong>Date:</strong> {formatDatesRange(selectedEvent.startDate, selectedEvent.endDate)}
                </Typography>
                <Typography variant="body1" color={'black'}>
                  <strong>Time:</strong> {selectedEvent.time}
                </Typography>
                <Typography variant="body1" color={'black'}>
                  <strong>Leaf Points:</strong> {selectedEvent.leafPoints}
                </Typography>
                <Typography variant="body1" color={'black'}>
                  <strong>Admission:</strong> {selectedEvent.status}
                </Typography>
                {selectedEvent.status !== 'Free' && (
                  <Typography variant="body1">
                    <strong>Amount:</strong> {selectedEvent.amount}
                  </Typography>
                )}
                <Button variant="contained" onClick={handleCloseEventModal} sx={{ mt: 2, fontWeight: 'bold', bgcolor: 'green', color: 'white' }}>
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default EventDataTable;
