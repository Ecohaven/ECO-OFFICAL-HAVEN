import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Account_Nav from './Account_Nav';
import AccountContext from '../../contexts/AccountContext';
import '../../style/rewards/rewardsprofile.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: '#14772B', 
    color: theme.palette.common.white,
    fontSize: '1.2rem',
  },
  '&.MuiTableCell-body': {
    fontSize: '1rem',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f5f5f5',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const CalendarContainer = styled('div')(({ theme }) => ({
  margin: '20px 0',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #dcdcdc',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const CalendarHeader = styled('div')(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '10px',
}));

const CustomCalendar = styled(Calendar)(({ theme }) => ({
  '.react-calendar__tile': {
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
  '.react-calendar__tile:hover': {
    backgroundColor: 'lightgreen', // Hover light green
    color: '#ffffff',
  },
  '.react-calendar__tile--active': {
    backgroundColor: '#FF5722', // Different color for active (orange example)
    color: '#ffffff',
  },
  '.react-calendar__tile--highlighted': {
    backgroundColor: '#14772B', // Green for booked/clicked
    color: 'white',
  },
  '.react-calendar__tile--today': {
    backgroundColor: 'navy',
    color: '#ffffff',
  },
  '.react-calendar__month-view__days__day': {
    fontSize: '0.9rem',
  },
  '.react-calendar__navigation button': {
    backgroundColor: '#14772B', // Standardized green color for navigation buttons
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px',
    margin: '0 2px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
  '.react-calendar__navigation button:hover': {
    backgroundColor: 'lightgreen', // Hover light green for navigation buttons
  },
  '.react-calendar__navigation button:disabled': {
    backgroundColor: '#dcdcdc',
    color: '#888888',
  },
  '.react-calendar__navigation button:disabled:hover': {
    backgroundColor: '#dcdcdc', // Maintain disabled color on hover
  },
}));

const LegendContainer = styled('div')(({ theme }) => ({
  margin: '20px 0',
  padding: '10px',
  border: '1px solid #dcdcdc',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  width: 'fit-content',
  textAlign: 'left',
}));

const LegendItem = styled('div')(({ color, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '5px',
  '&:last-child': {
    marginBottom: 0,
  },
  '& .color-box': {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: color,
    marginRight: '8px',
  },
}));



function Account_Profile_Events() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [value, setValue] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState(new Set());
  const { account } = useContext(AccountContext);

  useEffect(() => {
    if (account && account.name) {
      fetchBookedEvents(account.name);
    }
  }, [account]);

  const fetchBookedEvents = async (accountName) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/account/${accountName}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setEvents(response.data);
        const dates = new Set(response.data.map(event => new Date(event.startDate).toDateString()));
        setHighlightedDates(dates);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching booked events:', error);
    }
  };

  const handleDateChange = (date) => {
    setValue(date);
    setSelectedDate(date);
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toDateString();
    if (highlightedDates.has(dateStr)) {
      return 'react-calendar__tile--highlighted';
    }
    if (dateStr === new Date().toDateString()) {
      return 'react-calendar__tile--today';
    }
    return null;
  };
  const filteredEvents = events.filter(event => 
    new Date(event.startDate).toDateString() === new Date(selectedDate).toDateString() &&
    new Date(event.endDate) >= new Date() // Ensure event is not expired
  );

  const addToGoogleCalendar = (event) => {
    const startDate = new Date(event.startDate).toISOString().slice(0, 10).replace(/-/g, '');
    const endDate = new Date(event.endDate).toISOString().slice(0, 10).replace(/-/g, '');
    const eventTime = event.time;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.eventName
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      `\nTime: ${eventTime}\n${event.description || ''}`
    )}&location=${encodeURIComponent(event.location || '')}&sf=true&output=xml`;
    window.open(googleCalendarUrl, '_blank');
  };


  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <div className="table-container" style={{ marginBottom: '80px' }}>
            {/* Booked Events */}
            <h3 className='header'>Upcoming Events</h3>
            <h4>You will not be able to see current same date event in here,only upcoming events</h4>
            <hr />
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <CalendarContainer>
                  <CalendarHeader>Event Calendar</CalendarHeader>
                  <CustomCalendar
                    onChange={handleDateChange}
                    value={value}
                    tileClassName={tileClassName}
                    next2Label={null}
                    prev2Label={null}
                  />
                </CalendarContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <LegendContainer>
                  <Typography variant="h6">Legend</Typography>
                  <LegendItem color="navy">
                    <div className="color-box" />
                    Today
                  </LegendItem>
                  <LegendItem color="green">
                    <div className="color-box" />
                    Booked Events
                  </LegendItem>
                <LegendItem color="#3399ff">
                    <div className="color-box" />
                    Selected
                  </LegendItem>
                  {/* Add to Google Calendar Button */}
                  {filteredEvents.length > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => addToGoogleCalendar(filteredEvents[0])} // Add the first event in the list to Google Calendar
                      style={{ marginTop: '20px' }}
                    >
                      Add to Google Calendar
                    </Button>
                  )}
                </LegendContainer>
              </Grid>
            </Grid>
           <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">No.</StyledTableCell>
                    <StyledTableCell align="center">Picture</StyledTableCell>
                    <StyledTableCell align="center">Event Name</StyledTableCell>
                    <StyledTableCell align="center">Organiser</StyledTableCell>
                    <StyledTableCell align="center">Leaf Points</StyledTableCell>
                    <StyledTableCell align="right">Amount</StyledTableCell>
                    <StyledTableCell align="center">Event Date</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                      <StyledTableRow key={event._id}>
                        <StyledTableCell align="center">{index + 1}</StyledTableCell>
                        <StyledTableCell align="center">
                          <img
                            src={`http://localhost:3001/api/event-picture/${event.eventId}`}
                            alt={event.eventName}
                            style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">{event.eventName}</StyledTableCell>
                        <StyledTableCell align="center">{event.organiser}</StyledTableCell>
                        <StyledTableCell align="center">{event.leafPoints}</StyledTableCell>
                        <StyledTableCell align="right">${event.amount}</StyledTableCell>
                        <StyledTableCell align="center">
                          {new Date(event.startDate).toLocaleDateString()}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <StyledTableRow>
                      <StyledTableCell colSpan={7} align="center">
                        No events for the selected date
                      </StyledTableCell>
                    </StyledTableRow>
                  )}
                </TableBody>
              </Table>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Events;

