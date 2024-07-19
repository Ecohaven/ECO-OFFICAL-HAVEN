import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import AccountContext from '../../contexts/AccountContext';
import '../../style/rewards/rewardsprofile.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#14772B',
    color: theme.palette.common.white,
    fontSize: '1.2rem',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '1.2rem',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#91E1A3',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function Account_Profile_Events() {
  const [events, setEvents] = useState([]);
  const { account } = useContext(AccountContext); // Use context to get the account details

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
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching booked events:', error);
    }
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
            <h3 className='header'>Booked Events</h3>
            <hr />
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700, marginBottom: '30px', height: 'auto' }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">No.</StyledTableCell>
                    <StyledTableCell align="center">Picture</StyledTableCell>
                    <StyledTableCell align="center">Event Name</StyledTableCell>
                    <StyledTableCell align="center">Organiser</StyledTableCell>
                    <StyledTableCell align="center">Leaf Points</StyledTableCell>
                    <StyledTableCell align="right">Amount</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event, index) => (
                    <StyledTableRow key={event.eventId}>
                      <StyledTableCell component="th" scope="row">
                        {index + 1}
                      </StyledTableCell>
  <StyledTableCell align="center">
                        <img src={`http://localhost:3001/api/event-picture/${event.eventId}`} alt={event.eventName} style={{ width: '100px', height: 'auto' }} />
                      </StyledTableCell>
                      <StyledTableCell align="center">{event.eventName}</StyledTableCell>
                      <StyledTableCell align="center">{event.organiser}</StyledTableCell>
                      <StyledTableCell align="center">{event.leafPoints}</StyledTableCell>
                      <StyledTableCell align="center">{event.amount}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Account_Profile_Events;
