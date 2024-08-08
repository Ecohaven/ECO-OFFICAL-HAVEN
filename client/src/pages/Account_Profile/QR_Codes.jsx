import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Account_Nav from './Account_Nav';
import { tableCellClasses } from '@mui/material/TableCell';
import fileSaver from 'file-saver'; 
import AccountContext from '../../contexts/AccountContext';
import '../../style/rewards/rewardsprofile.css';

// Styled components
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

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#14772B',
  color: theme.palette.common.white,
  padding: '8px 16px',
  fontSize: '1rem',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#0c5e1a',
  },
}));

const LegendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const LegendItem = styled(Box)(({ color }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
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

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Account_Nav />
        </Grid>
        <Grid item xs={12} md={9}>
          <div className="table-container" style={{ marginBottom: '80px' }}>
            <h3 className='header'>Booking Records</h3>
            <h4 style={{ textAlign: 'center' }}>Your Active & history of past details for bookings</h4>
            <hr />
            {/* Legend */}
            <LegendContainer>
  <LegendItem color="#91E1A3">
    <Box className="color-box" sx={{ width: '20px', height: '20px',marginRight:'12px', backgroundColor: '#91E1A3' }} />
    <Typography style={{color:'black'}}>Active</Typography>
  </LegendItem>
  <LegendItem color="#ADD8E6">
    <Box className="color-box" sx={{ width: '20px', height: '20px',marginRight:'12px',backgroundColor: '#ADD8E6' }} />
    <Typography style={{color:'black'}}>Attended</Typography>
  </LegendItem>
  <LegendItem color="#ff6666">
    <Box className="color-box" sx={{ width: '20px', height: '20px',marginRight:'12px', backgroundColor: '#ff6666' }} />
    <Typography style={{color:'black'}}>Cancelled</Typography>
  </LegendItem>
</LegendContainer>

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
                        {row.status === 'Active' && (
                          <StyledButton onClick={() => handleDownloadQRCode(row.qrCodeUrl)}>Download</StyledButton>
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
