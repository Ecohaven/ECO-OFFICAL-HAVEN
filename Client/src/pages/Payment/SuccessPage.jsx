import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();

  // Extract data from location state
  const {
    paymentId = '',
    bookingId = '',
    qrCodeText = '',
    amount = '',
    eventName = '',
    email = '',
    phoneNumber = '',
    paxDetails = [] // Use paxDetails instead of paxList
  } = location.state || {};

  const sendBookingEmail = async () => {
    // Generate QR code image URL for the main QR code
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`;

    // Construct QR codes for each pax
    const paxListHtml = paxDetails.length > 0
      ? `<h2>Additional Guests:</h2>` + paxDetails.map(pax => {
          return `
            <div>
              <p><strong>Name:</strong> ${pax.name}</p>
              <p><strong>Email:</strong> ${pax.email}</p>
              <p><strong>QR Code for ${pax.name}:</strong></p>
              <img src="${pax.paxQrCodeUrl}" alt="QR Code for ${pax.name}" style="border-radius: 8px; max-width: 100%; height: auto;" />
            </div>
          `;
        }).join('')
      : '';

    // Construct the email body
    const emailBody = `
      <h1>Booking Confirmation</h1>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Event Name:</strong> ${eventName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>QR Code Text:</strong> ${qrCodeText}</p>
      <p><strong>QR Code:</strong></p>
      <img src="${qrCodeImageUrl}" alt="QR Code" style="border-radius: 8px; max-width: 100%; height: auto;" />
      ${paxListHtml} <!-- Include paxList HTML with individual QR codes here -->
    `;

    try {
      await axios.post('http://localhost:3001/send-email', {
        to: ['ecohaven787@gmail.com'], // Fixed recipient email
        subject: 'Booking Confirmation',
        html: emailBody // Send HTML email body
      });
      console.log('Booking email sent successfully.');
    } catch (error) {
      console.error('Error sending booking email:', error);
    }
  };

  useEffect(() => {
    sendBookingEmail();
  }, []);

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
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`} alt="QR Code" style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto', marginTop: '10px' }} />
            </Grid>
            {paxDetails.length > 0 && (
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ color: 'black', mt: 2 }} // Ensure headers are black and add top margin
                >
                  Additional Guests:
                </Typography>
                {paxDetails.map((pax, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ fontWeight: 'bold', color: 'black' }}
                    >
                      Name: {pax.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ color: 'black' }}
                    >
                      Email: {pax.email}
                    </Typography>
                    <img src={paxQrCodeUrl} alt={`QR Code for ${pax.name}`} style={{ borderRadius: '8px', maxWidth: '100px', height: 'auto', marginTop: '10px' }} />
                  </Box>
                ))}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
