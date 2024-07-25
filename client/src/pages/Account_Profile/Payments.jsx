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

function Account_Profile_Payments() {
  const [payments, setPayments] = useState([]);
  const { account } = useContext(AccountContext); // Use context to get the account details

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
                    <StyledTableCell align="center">Event Name</StyledTableCell>
                    <StyledTableCell align="center">Amount</StyledTableCell>
                    <StyledTableCell align="center">Email Address</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <StyledTableRow key={payment.id}>
                      <StyledTableCell component="th" scope="row">
                        {payment.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">{payment.eventName}</StyledTableCell>
                      <StyledTableCell align="center">{payment.amount}</StyledTableCell>
                      <StyledTableCell align="center">{payment.email}</StyledTableCell>
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
