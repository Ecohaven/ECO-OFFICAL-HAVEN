import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, Button, Paper, IconButton, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AccountContext from '../../contexts/AccountContext'; // Adjust path as needed
import { saveAs } from 'file-saver';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, setAccount } = useContext(AccountContext); // Use the context

  const { paymentData, formData } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isQrCodeDownloaded, setIsQrCodeDownloaded] = useState(false);
  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = 'exampleUser'; // Replace with dynamic username if available
        const response = await axios.get(`http://localhost:3001/account/${username}`);
        const userData = response.data.user;

        setAccount({
          name: userData.name,
          email: userData.email,
          phone_no: userData.phone_no
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error if needed
      }
    };

    if (!account) {
      fetchUserData();
    }
  }, [account, setAccount]);

  useEffect(() => {
    const createBooking = async () => {
      try {
        if (formData && !bookingCreated) {
          const bookingResponse = await axios.post('http://localhost:3001/api/bookings', formData);

          if (bookingResponse.data.id && bookingResponse.data.qrCodeText) {
            const { id, qrCodeText } = bookingResponse.data;

            // Trigger email sending
            await sendEmail(formData, id, qrCodeText);

            // Set booking details and QR code URL
            setBookingDetails({ id, qrCodeText });
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`);
            setBookingCreated(true); // Mark booking as created
          } else {
            throw new Error('Booking ID or QR code text not received');
          }
        }

        setLoading(false);
      } catch (error) {
        setError('Failed to create booking. Please try again.');
        console.error('Failed to create booking:', error);
      }
    };

    createBooking();
  }, [formData, bookingCreated]);

 const sendEmail = async (formData, bookingId, qrCodeText, paxQrCodeRecords) => {
    try {
      await axios.post('http://localhost:3001/send-email', {
        to: ['ecohaven787@gmail.com'],
        subject: `${formData.eventName} Booking Successful`,
        html: `
          <html>
            <head>
              <style>
                /* Your email styling */
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Eco<span style="color:black;">Haven</span></h1>
              </div>
              <div class="content">
                <h2>Here is a copy of your booking details</h2>
                ${bookingId ? `<p>Booking Successful: <strong>${bookingId}</strong></p>` : ''}
                <h4>Greetings <strong>${account.name}</strong>! Thank you for signing up for our event! Please find the below information as your booking details. We're thrilled to see you there!</h4>
                <p>Event: <strong>${formData.eventName}</strong></p>
                <p>Email: <strong>${account.email}</strong></p>
                <p>Phone Number: <strong>${account.phone_no}</strong></p>
                <p>Date: <strong>${formData.bookingDate ? new Date(formData.bookingDate).toLocaleDateString('en-GB') : 'N/A'}</strong></p>
                <p>Number of Pax: <strong>${formData.numberOfPax}</strong></p>
                <p>Location: ${formData.location}</p>
                ${qrCodeText ? `<div class="qr-code">
                                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}" alt="QR Code">
                                </div>` : ''}
                ${paxQrCodeRecords.length > 0 ? `<div class="qr-code">
                                                  <h3>Your Additional Guest QR Codes</h3>
                                                  ${paxQrCodeRecords.map(record => `
                                                    <div>
                                                      <p>${record.paxName} - ${record.paxQrCodeText}</p>
                                                      <img src="${record.paxQrCodeUrl}" alt="QR Code for Pax Name ${record.paxName}">
                                                    </div>
                                                  `).join('')}
                                                </div>` : ''}
                <p>Please download the generated QR code from our website or remember this QR code text; it will be needed for check-in. You can view the QR Code image from your account's profile page (events).</p>
              </div>
              <div class="footer">
                <i><b>This email is auto-generated by ECOHAVEN.</b></i>
              </div>
            </body>
          </html>
        `
      });
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };


  const handleNavigateHome = () => {
    navigate('/');
  };

 // Assuming you have bookingDetails with the required fields
const handleRequestRefund = () => {
  if (paymentData) {
    const { paymentId, name, email, eventName } = paymentData; // Adjust field names as necessary

    // Redirect to /refund page with the necessary data in the state
    navigate('/refund', {
      state: {
        paymentId,
        name,
        email,
        event: eventName, // Ensure this matches the key in the RefundForm component
      },
    });
  }
};

  const handleDownloadQrCode = () => {
    if (qrCodeUrl && !isQrCodeDownloaded) {
      saveAs(qrCodeUrl, 'qr-code.png'); // Use file-saver to download the QR code
      setIsQrCodeDownloaded(true); // Ensure QR code can only be downloaded once
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" component="p" sx={{ mt: 2 }}>
          Processing Payment...
        </Typography>
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
            <Typography variant="h6" style={{ color: 'black' }} gutterBottom>
              Booking ID: <strong>{bookingDetails?.id || 'N/A'}</strong>
            </Typography>
            <Typography variant="h6" style={{ color: 'black' }} gutterBottom>
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
              </>
            ) : (
              <Typography variant="body1">Payment details are not available.</Typography>
            )}
            {qrCodeUrl && (
              <Box textAlign="center" mt={2}>
                <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                <Box mt={2}>
                  <IconButton onClick={handleDownloadQrCode} color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
            <Box mt={4} textAlign="center">
              <Button variant="contained" color="primary" onClick={handleNavigateHome}>
                Back to Home
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleRequestRefund} sx={{ ml: 2 }}>
                Request Refund
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
