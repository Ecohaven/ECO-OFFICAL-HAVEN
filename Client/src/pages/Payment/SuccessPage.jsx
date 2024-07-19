import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, Button, Paper } from '@mui/material';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { paymentData, response, formData } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const createBooking = async () => {
      try {
        // Create booking
        const bookingResponse = await axios.post('http://localhost:3001/api/bookings', formData);

        if (bookingResponse.data.id && bookingResponse.data.qrCodeText) {
          const { id, qrCodeText } = bookingResponse.data;

          // // Optionally: Trigger email sending
          // sendEmail(formData, id, qrCodeText);

          setBookingDetails({ id, qrCodeText });
          navigate('/confirmation', { state: { bookingId: id, qrCodeText } });
        } else {
          throw new Error('Booking ID or QR code text not received');
        }
      } catch (error) {
        setError('Failed to create booking. Please try again.');
        console.error('Failed to create booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (formData) {
      createBooking();
    }
  }, [formData, navigate]);

  const handleNavigateHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Processing Payment...
        </Typography>
        {/* Optionally, display a loading spinner or message */}
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Payment Successful
        </Typography>
        {error ? (
          <Box sx={{ color: 'red', textAlign: 'center' }}>
            <Typography variant="h6">{error}</Typography>
          </Box>
        ) : (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Payment Details:
            </Typography>
            {paymentData ? (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>Event Name:</strong> {paymentData.eventName || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Amount:</strong> ${paymentData.amount || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {paymentData.email || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Phone Number:</strong> {paymentData.phoneNumber || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Home Address:</strong> {paymentData.homeAddress || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Postal Code:</strong> {paymentData.postalCode || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Payment Method:</strong> {paymentData.paymentMethod || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Cardholder Name:</strong> {paymentData.cardholderName || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Card Number:</strong> {paymentData.cardNumber || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Expiry Date:</strong> {paymentData.expiryDate || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>CVV:</strong> {paymentData.cvv || 'N/A'}
                </Typography>
                {bookingDetails && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      <strong>Booking ID:</strong> {bookingDetails.id || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>QR Code Text:</strong> {bookingDetails.qrCodeText || 'N/A'}
                    </Typography>
                  </>
                )}
              </>
            ) : (
              <Typography variant="body1">
                No payment data available.
              </Typography>
            )}
          </Box>
        )}
        <Box mt={4} textAlign="center">
          <Button variant="contained" color="primary" onClick={handleNavigateHome}>
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
