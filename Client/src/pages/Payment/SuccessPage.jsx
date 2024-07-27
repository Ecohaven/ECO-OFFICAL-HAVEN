import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Paper, Box } from '@mui/material';
import QRCode from 'qrcode.react';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    formData,
    paymentId,
    amount,
    email,
    phoneNumber,
    eventName,
    bookingId,
    qrCodeText,
    Name,
    numberOfPax,
    paxDetails = [],
    paxQrCodeRecords = []
  } = location.state || {};

  // Send email function
  const sendEmail = async () => {
    try {
      await axios.post('http://localhost:3001/send-email', {
        to: ['ecohaven787@gmail.com', ...paxDetails.map(pax => pax.email)],
        subject: `${eventName} Booking Successful`,
        html: `
          <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f4f4f9; margin: 0; padding: 0;">
              <div style="max-width: 700px; margin: auto; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="text-align: center; color: #4CAF50;">Eco<span style="color: #333;">Haven</span></h1>
                <h2 style="text-align: center; color: #333;">Booking Details</h2>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Event:</strong> ${eventName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                <p><strong>Amount:</strong> ${amount ? `$${amount}` : 'N/A'}</p>
                <p><strong>For location & date details,please login to your account on our website to view </strong> </p>
                ${qrCodeText ? `<div style="text-align: center; margin: 20px 0;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}" alt="QR Code" style="border-radius: 8px;">
                </div>` : ''}
                ${paxQrCodeRecords.length > 0 ? `<div>
                  <h3 style="color: #333;">Your Additional Guest QR Codes</h3>
                  ${paxQrCodeRecords.map(record => `
                    <div style="margin-bottom: 10px;">
                      <p><strong>${record.paxName}</strong> - ${record.paxQrCodeText}</p>
                      <img src="${record.paxQrCodeUrl}" alt="QR Code for ${record.paxName}" style="display: block; margin: auto; border-radius: 8px;">
                    </div>
                  `).join('')}
                </div>` : ''}
                <p style="text-align: center; color: #666;">Please download or remember this QR code text for check-in.</p>
              </div>
            </body>
          </html>
        `
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  useEffect(() => {
    sendEmail();
  }, []);

  const handleRefundClick = () => {
    navigate('/refund', {
      state: { paymentId, Name, email, eventName }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#4CAF50' }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Payment ID:</strong> {paymentId}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Booking ID:</strong> {bookingId}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Amount Paid:</strong> ${amount}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Event:</strong> {eventName}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Email:</strong> {email}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          <strong>Phone Number:</strong> {phoneNumber}
        </Typography>
        {qrCodeText && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <QRCode value={qrCodeText} size={256} />
          </Box>
        )}

        {paxDetails.length > 0 && (
          <>
            <Typography variant="h5" component="h2" align="center" sx={{ my: 4 }}>
              Additional Pax Details
            </Typography>
            <Grid container spacing={2}>
              {paxDetails.map((pax, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        <strong>Name:</strong> {pax.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Email:</strong> {pax.email}
                      </Typography>
                    </CardContent>
                    {paxQrCodeRecords[index] && paxQrCodeRecords[index].paxQrCodeUrl && (
                      <CardMedia>
                        <img src={paxQrCodeRecords[index].paxQrCodeUrl} alt={`QR code for ${pax.name}`} style={{ width: '100%', borderRadius: '8px' }} />
                      </CardMedia>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" sx={{ mr: 2 }} href="/">
            Back to Home
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleRefundClick}>
            Request Refund
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
