import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import QRCode from 'qrcode.react'; // Ensure you have this package installed

const PaymentSuccess = () => {
  const location = useLocation();

  // Extract data from location state
  const {
    paymentId = '',
    bookingId = '',
    qrCodeText = '',
    qrCodeUrl = '',
    amount = '',
    eventName = '',
    email = '',
    phoneNumber = ''
  } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ color: 'black' }} // Ensure title text is black
      >
        Payment Successful
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Payment ID:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {paymentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Booking ID:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {bookingId || 'N/A'} {/* Fallback to 'N/A' if bookingId is not provided */}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Amount:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                ${amount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Event Name:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {eventName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Email:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                Phone Number:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {phoneNumber}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                QR Code Text:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ fontWeight: 'bold', color: 'black' }} // Ensure body text is black and bold
              >
                {qrCodeText}
              </Typography>
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Typography 
                variant="h6" 
                sx={{ color: 'black' }} // Ensure all headers are black
              >
                QR Code:
              </Typography>
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} 
                />
              ) : (
                <QRCode value={qrCodeText} size={128} />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
