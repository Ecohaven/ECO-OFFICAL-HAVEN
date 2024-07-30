import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import AccountContext from '../../contexts/AccountContext';
import '../../style/rewards/rewardsprofile.css';
import dayjs from 'dayjs';

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

const StyledTableRow = styled(TableRow)(({ theme, highlight }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: highlight ? 'rgba(255, 0, 0, 0.2)' : '#91E1A3',
  },
  '&:nth-of-type(even)': {
    backgroundColor: highlight ? 'rgba(255, 0, 0, 0.2)' : '#fff',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  ...(highlight && {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  }),
}));

function Account_Profile_Payments() {
  const [payments, setPayments] = useState([]);
  const { account } = useContext(AccountContext); // Use context to get the account details
  const navigate = useNavigate();

  useEffect(() => {
    if (account && account.email) {
      fetchPayments(account.email);
    }
  }, [account]);

  const fetchPayments = async (email) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      // Construct query parameters
      const query = new URLSearchParams();
      if (email) query.append('email', email);

      const response = await axios.get(`http://localhost:3001/pay/by-contact?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleRefund = (payment) => {
    const currentDate = dayjs();
    const eventDate = dayjs(payment.eventdate); // Assuming eventDate is available in the payment object

    if (eventDate.diff(currentDate, 'date')>= 1) {
      alert('Refunds are only allowed up to one day before the event date.');
      return;
    }

    navigate('/refund', {
      state: {
        paymentId: payment.id,
        Name: account.name,
        eventName: payment.eventName,
        email: payment.email,
        eventdate: payment.eventdate, // Ensure eventdate is passed to the refund form
      }
    });
  };

  const isRefundAllowed = (eventDate) => {
    const currentDate = dayjs();
    return dayjs(eventDate).diff(currentDate, 'day') <= 1;
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <div className="table-container" style={{ marginBottom: '80px' }}>
            {/* Payments */}
            <h3 className='header'>Payments</h3>
            <hr />
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700, marginBottom: '30px', height: 'auto' }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">Payment ID</StyledTableCell>
                    <StyledTableCell align="center">Status</StyledTableCell>
                    <StyledTableCell align="center">Event Name</StyledTableCell>
                    <StyledTableCell align="center">Amount</StyledTableCell>
                    <StyledTableCell align="center">Email Address</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <StyledTableRow key={payment.id} highlight={payment.status === 'Refunded'}>
                      <StyledTableCell component="th" scope="row" align='center'>
                        {payment.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">{payment.status}</StyledTableCell>
                      <StyledTableCell align="center">{payment.eventName}</StyledTableCell>
                      <StyledTableCell align="center">{payment.amount}</StyledTableCell>
                      <StyledTableCell align="center">{payment.email}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRefund(payment)}
                          disabled={payment.status === 'Refunded' || !isRefundAllowed(payment.eventdate)}
                        >
                          Refund
                        </Button>
                      </StyledTableCell>
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

export default Account_Profile_Payments;
