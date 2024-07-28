import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material';

const EventCountTable = () => {
  const [eventCounts, setEventCounts] = useState([]);

  useEffect(() => {
    fetchEventCounts();
  }, []);

  const fetchEventCounts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/countByEvent');
      setEventCounts(response.data.counts);
    } catch (error) {
      console.error('Error fetching event counts:', error);
    }
  };

  return (
    <Box sx={{ marginTop: '20px', padding: '0 10px', marginBottom: '40px' }}>
      <TableContainer
        component={Paper}
        sx={{
          display: { xs: 'none', md: 'block' },
          maxWidth: '600px',
          margin: '0 auto',
          marginRight: 'auto', // Position to the left
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      >
        <Table sx={{ minWidth: 250 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'green', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '8px' }}
              >
                Event Name
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'green', color: '#fff', fontWeight: 'bold', fontSize: '1rem', padding: '8px' }}
              >
                No. of bookings
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventCounts.map((event) => (
              <TableRow
                key={event.eventName}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                  '&:hover': { backgroundColor: 'lightgreen' },
                  '& td': { padding: '8px' },
                }}
              >
                <TableCell align="center" sx={{ fontSize: '1rem' }}>{event.eventName}</TableCell>
                <TableCell align="center" sx={{ fontSize: '1rem' }}>{event.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {eventCounts.map((event) => (
          <Card
            key={event.eventName}
            sx={{
              width: '30%', // Adjust the card width for mobile
              margin: '0 10px', // Center the cards
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
            color:'white',
             backgroundColor:'green'
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {event.eventName}
              </Typography>
              <Typography variant="body1" sx={{ marginTop: '8px' }}>
                {event.count} Bookings
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default EventCountTable;
