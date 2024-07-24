import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, IconButton, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, amount, email, phoneNumber, eventName } = location.state || {};

  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isQrCodeDownloaded, setIsQrCodeDownloaded] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Fetch booking details from the server
        const response = await axios.post('http://localhost:3001/api/get-booking-details', { paymentId });
        const { bookingId, qrCodeText } = response.data;

        // Set booking ID and QR code URL
        setBookingId(bookingId);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`);
      } catch (error) {
        setError('Failed to fetch booking details. Please try again.');
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [paymentId]);

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleDownloadQrCode = () => {
    if (qrCodeUrl && !isQrCodeDownloaded) {
      saveAs(qrCodeUrl, 'qr-code.png');
      setIsQrCodeDownloaded(true);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" component="p" sx={{ mt: 2 }}>
          Generating QR Code...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Successful
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Payment Details</Typography>
        <Typography variant="body1"><strong>Payment ID:</strong> {paymentId}</Typography>
        <Typography variant="body1"><strong>Amount:</strong> {amount}</Typography>
        <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
        <Typography variant="body1"><strong>Phone Number:</strong> {phoneNumber}</Typography>
        <Typography variant="body1"><strong>Event Name:</strong> {eventName}</Typography>
        {bookingId && (
          <Typography variant="body1"><strong>Booking ID:</strong> {bookingId}</Typography>
        )}
      </Box>
      {qrCodeUrl && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
          <Box sx={{ mt: 2 }}>
            <IconButton onClick={handleDownloadQrCode} color="primary">
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      {error && (
        <Box sx={{ mt: 2, color: 'red', textAlign: 'center' }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      )}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleNavigateHome}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;
