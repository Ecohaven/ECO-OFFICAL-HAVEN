import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
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
  const { account } = useContext(AccountContext);

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
          id: booking.id,
          bookingId: booking.id,
          eventName: booking.eventName,
          qrCodeText: booking.qrCodeText,
          qrCodeUrl: booking.qrCodeUrl,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
        }));

        updatedRows.sort((a, b) => {
          if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
          if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
          return b.id - a.id;
        });

        setBookingRows(updatedRows);
        if (response.data.length > 0) {
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

  const handleDownloadQRCode = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      fileSaver.saveAs(blob, 'qrcode.png');
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleAddToCalendar = (eventName, startDate, endDate) => {
    const start = new Date(startDate).toISOString().replace(/-|:|\.\d{3}/g, '');
    const end = new Date(endDate).toISOString().replace(/-|:|\.\d{3}/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(eventName)}&dates=${start}/${end}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <div className="table-container" style={{ marginBottom: '80px' }}>
            <h3 className='header'>Your Booking Records</h3>
            <h4 style={{ textAlign: 'center' }}>Your Active & history of past details for bookings</h4>
            <hr />
            {/* Legend and Add to Calendar Button */}
            <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="20px">
              <Box>
                <h4 style={{ margin: 0 }}>Legend:</h4>
                <p style={{ margin: 0 }}>Active - Ongoing bookings</p>
                <p style={{ margin: 0 }}>Checked - Checked in bookings</p>
                <p style={{ margin: 0 }}>Attended - Attended bookings</p>
                <p style={{ margin: 0 }}>Cancelled - Cancelled bookings</p>
              </Box>
              <Box>
                {bookingRows.length > 0 && bookingRows[0].startDate && bookingRows[0].endDate && (
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCalendar(bookingRows[0].eventName, bookingRows[0].startDate, bookingRows[0].endDate)}
                  >
                    Add to Calendar
                  </Button>
                )}
              </Box>
            </Box>
            {/* Table */}
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
                        {index + 1}
                      </StyledTableCell>
                      <StyledTableCell align="center">{row.bookingId}</StyledTableCell>
                      <StyledTableCell align="center">{row.eventName}</StyledTableCell>
                      <StyledTableCell align="center">
                        {row.status === 'Active' && (
                          <div style={{ opacity: 1 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                          </div>
                        )}
                        {row.status === 'Checked' && (
                          <div style={{ opacity: 0.5 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                          </div>
                        )}
                        {row.status === 'Attended' && (
                          <div style={{ opacity: 0.7 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                          </div>
                        )}
                        {row.status === 'Cancelled' && (
                          <div style={{ opacity: 0.3 }}>
                            <img src={row.qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                          </div>
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">{row.qrCodeText}</StyledTableCell>
                      <StyledTableCell align="center">{row.status}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Button onClick={() => handleDownloadQRCode(row.qrCodeUrl)}>Download QR</Button>
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
