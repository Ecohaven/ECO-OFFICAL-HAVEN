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
    eventdate,
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
      // Send email to the main email address with full booking details
      await axios.post('http://localhost:3001/send-email', {
        to: ['ecohaven787@gmail.com', formData.email],
        subject: `${eventName} Booking Successful`,
        html: `
    <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 700px;
      margin: auto;
      padding: 20px;
      border-radius: 8px;
      background-color: #e0f7f4;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      position: relative;
    }
    h1 {
      text-align: center;
      color: #4CAF50;
      margin-top: 10px;
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
    }
    h2 {
      text-align: center;
      color: #333;
      margin-top: 60px; /* Adjusted to make space for the header */
      font-size: 24px;
      font-weight: bold;
    }
    p {
      color: #333;
      margin: 10px 0;
      font-size: 16px;
    }
    .qr-code-container {
      margin: 20px 0;
      padding: 10px;
      border: 2px solid #004d40;
      border-radius: 8px;
      background-color: #ffffff;
      display: inline-block;
    }
    .qr-code-container img {
      display: block;
      margin: auto;
      border-radius: 8px;
      width: 150px; /* Adjust the size if needed */
      height: 150px; /* Adjust the size if needed */
    }
    .footer {
      color: #666;
      margin-top: 20px;
      font-size: 14px;
    }
    .eco-logo {
      width: 100px;
      height: auto;
      margin-top: 20px;
    }
    .eco-text {
      color: #004d40;
      font-size: 18px;
      font-weight: bold;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Eco<span style="color: #333;">Haven</span></h1>
    <div>
      <h2>Booking Details</h2>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Event Date:</strong> ${eventdate}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Amount:</strong> ${amount ? `$${amount}` : 'N/A'}</p>
      <p><strong>For location & date details, please log in to your account on our website to view.</strong></p>
      ${qrCodeText ? `<div class="qr-code-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}" alt="QR Code">
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
      <p class="footer">Please download or remember this QR code text for check-in.</p>
    </div>
  </div>
</body>
</html>
      `
      });

      // Send a single email to all pax emails with only event name and QR code
      const paxEmails = paxQrCodeRecords.map(record => record.paxEmail);
      if (paxEmails.length > 0) {
        await axios.post('http://localhost:3001/send-email', {
          to: paxEmails,
          subject: `${eventName} Booking Successful`,
          html: `
          <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background-color: #f4f4f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 700px;
      margin: auto;
      padding: 20px;
      border-radius: 8px;
      background-color: #e0f7f4;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      position: relative;
    }
    h1 {
      text-align: center;
      color: #4CAF50;
      margin-top: 10px;
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
    }
    h2 {
      text-align: center;
      color: #333;
      margin-top: 60px; /* Adjusted to make space for the header */
      font-size: 24px;
      font-weight: bold;
    }
    p {
      color: #333;
      margin: 10px 0;
      font-size: 16px;
    }
    .qr-code-container {
      margin: 20px 0;
      padding: 10px;
      border: 2px solid #004d40;
      border-radius: 8px;
      background-color: #ffffff;
      display: inline-block;
    }
    .qr-code-container img {
      display: block;
      margin: auto;
      border-radius: 8px;
      width: 150px; /* Adjust the size if needed */
      height: 150px; /* Adjust the size if needed */
    }
    .footer {
      color: #666;
      margin-top: 20px;
      font-size: 14px;
    }
    .eco-logo {
      width: 100px;
      height: auto;
      margin-top: 20px;
    }
    .eco-text {
      color: #004d40;
      font-size: 18px;
      font-weight: bold;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Eco<span style="color: #333;">Haven</span></h1>
    <div>
      <h2>Booking Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Event Date:</strong> ${eventdate}</p>
      ${paxQrCodeRecords.map(record => `
        <div class="qr-code-container">
          <p><strong>${record.paxName}</strong> - ${record.paxQrCodeText}</p>
          <img src="${record.paxQrCodeUrl}" alt="QR Code for ${record.paxName}">
        </div>
      `).join('')}
      <p class="footer">Please download or remember this QR code text for check-in.</p>
    </div>
  </div>
</body>
</html>
        `
        });

        await Promise.all(paxEmailPromises);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };



  useEffect(() => {
    sendEmail();
  }, []);


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>
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

        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
