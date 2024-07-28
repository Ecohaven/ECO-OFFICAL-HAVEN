import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import fileSaver from 'file-saver'; 
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

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: status === 'Cancelled' ? '#ff6666' : status === 'Attended' ? '#ADD8E6' : '#91E1A3',
  },
  '&:nth-of-type(even)': {
    backgroundColor: status === 'Cancelled' ? '#ff6666' : status === 'Attended' ? '#B0E0E6' : theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  backgroundColor: status === 'Cancelled' ? '#ff6666' : status === 'Attended' ? '#ADD8E6' : 'inherit',
}));

function Account_Profile_Bookings() {
  const [bookingRows, setBookingRows] = useState([]);
  const [bookingDetail, setBookingDetail] = useState({});
  const { account } = useContext(AccountContext); // Use context to get the account details

  useEffect(() => {
    if (account && account.name) {
      fetchBookingRows(account.name);
    }
  }, [account]);

  const fetchBookingRows = async (accountName) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Account Access token not found');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/bookings/account/${accountName}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        const updatedRows = response.data.map((booking, index) => ({
          id: booking.id, // Use booking.id to sort by booking ID
          bookingId: booking.id,
          eventName: booking.eventName,
          qrCodeText: booking.qrCodeText,
          qrCodeUrl: booking.qrCodeUrl,
          status: booking.status,
        }));

        // Sort the updatedRows array so that 'Cancelled' statuses appear after 'Active', 'Checked', and 'Attended' statuses
        updatedRows.sort((a, b) => {
          if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
          if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
          return b.id - a.id; // Sort by booking ID in descending order
        });

        setBookingRows(updatedRows);

        if (response.data.length > 0) {
          // Fetch details for the first booking in the list
          fetchBookingDetail(response.data[0].id);
        }
      } else {
        console.error('Expected an array from the API response');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBookingDetail = async (bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('Access token not found');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        const detail = response.data;
        setBookingDetail({
          bookingId: detail.id,
          eventName: detail.eventName,
          qrCodeText: detail.qrCodeText,
          qrCodeUrl: detail.qrCodeUrl,
          status: detail.status,
        });
      } else {
        console.error('Expected an object with booking detail from the API response');
      }
    } catch (error) {
      console.error('Error fetching booking detail:', error);
    }
  };

  // Function to handle download of QR code image
  const handleDownloadQRCode = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      fileSaver.saveAs(blob, 'qrcode.png'); // Save the blob as a file with name 'qrcode.png'
    } catch (error) {
      console.error('Error downloading QR code:', error);
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
            {/* Bookings */}
            <h3 className='header'>Your Event bookings</h3>
            <h4 style={{ textAlign: 'center' }}>Your Active bookings for events and history of past details for bookings</h4>
            <hr />
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700, marginBottom: '30px', height: 'auto' }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>No.</StyledTableCell>
                    <StyledTableCell align="center">Booking ID</StyledTableCell>
                    <StyledTableCell align="center">Event Name</StyledTableCell>
                    <StyledTableCell align="center">QR Code</StyledTableCell>
                    <StyledTableCell align="center">QR Code Text</StyledTableCell>
                    <StyledTableCell align="center">Status</StyledTableCell>
                    <StyledTableCell align="center"></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingRows.map((row, index) => (
                    <StyledTableRow key={row.id} status={row.status}>
                      <StyledTableCell component="th" scope="row">
                        {index + 1} {/* Use index + 1 for the row number */}
                      </StyledTableCell>
                      <StyledTableCell align="center">{row.bookingId}</StyledTableCell>
                      <StyledTableCell align="center">{row.eventName}</StyledTableCell>
                      <StyledTableCell align="center">
                        {/* Adjusted styling for QR code based on status */}
                        {row.status === 'Active' && (
                          <div style={{ opacity: 1 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                          </div>
                        )}
                        {row.status === 'Checked' && (
                          <div style={{ opacity: 0.5 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px', backgroundColor: 'transparent' }} />
                          </div>
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">{row.qrCodeText}</StyledTableCell>
                      <StyledTableCell align="center">
                        {/* Apply styles based on status */}
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: row.status === 'Cancelled' ? 'white' : row.status === 'Attended' ? 'blue' : row.status === 'Active' ? 'green' : 'inherit',
                          }}
                        >
                          {row.status}
                        </span>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {/* Conditional rendering for Download button */}
                        {row.status !== 'Checked' && row.status !== 'Cancelled' && row.status !== 'Attended' && (
                          <Button variant="contained" onClick={() => handleDownloadQRCode(row.qrCodeUrl)}>
                            Download
                          </Button>
                        )}
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

export default Account_Profile_Bookings;
