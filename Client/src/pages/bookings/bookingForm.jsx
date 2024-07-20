import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Grid, Typography, TextField, FormLabel, MenuItem, Select, Breadcrumbs, Link } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import AccountContext from '../../contexts/AccountContext'; // Import the AccountContext

const BookingForm = () => {
  const { state } = useLocation();
  const { event } = state || {};
  const [bookingDate, setBookingDate] = useState(''); // State for booking date
  const [numberOfPax, setNumberOfPax] = useState('');
  const [bookingId, setBookingId] = useState(''); // State to store booking ID
  const [qrCodeText, setQrCodeText] = useState(''); // State to store QR code text
  const [dateOptions, setDateOptions] = useState([]); // State for date options
  const [additionalNames, setAdditionalNames] = useState([]); 
  const [paxQrCodeRecords, setPaxQrCodeRecords] = useState([]); // State to store pax QR code records
  const [bookingSuccessful, setBookingSuccessful] = useState(false); // State for booking success
  const navigate = useNavigate();
  const { account, setAccount } = useContext(AccountContext); // Use the context

  useEffect(() => {
    // Fetch user data based on username
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
      }
    };

    if (!account) {
      fetchUserData();
    }
  }, [account, setAccount]);

  useEffect(() => {
    // Generate date options if event dates are available
    const generateDateOptions = () => {
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (startDate.getTime() !== endDate.getTime()) {
          const dates = [];
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          setDateOptions(dates);
        }
      }
    };

    generateDateOptions();
  }, [event]);

  const effectiveBookingDate = bookingDate || (event.startDate ? new Date(event.startDate).toISOString() : '');

   const generatePaxQrCodeRecords = (additionalNames) => {
    return additionalNames.map(paxName => {
      if (!paxName) return null;

      const paxQrCodeText = paxName;

      return {
        paxName: paxName,
        paxQrCodeText: paxQrCodeText,
        paxQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paxQrCodeText)}`
      };
    }).filter(record => record !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookingSuccessful) {
      // Prevent submission if booking is already successful
      return;
    }

    try {
      const paxQrCodeRecords = generatePaxQrCodeRecords(additionalNames);
      setPaxQrCodeRecords(paxQrCodeRecords);

      const formData = {
        eventId: event.eventId,
        eventName: event.eventName,
        leafPoints: event.leafPoints,
        amount: event.amount,
        bookingDate: effectiveBookingDate,
        numberOfPax,
        Name: account.name,
        email: account.email,
        phoneNumber: account.phone_no,
        location: event.location,
        paxName: additionalNames,
        paxQrCodeRecords
      };

      if (event.status !== 'Free' && event.amount) {
        navigate('/payment', { state: { formData, eventName: event.eventName, amount: event.amount, email: account.email, phoneNumber: account.phone_no, bookingId } });
        return;
      }

      const response = await axios.post('http://localhost:3001/api/bookings', formData);

      if (response.data.id && response.data.qrCodeText) {
        const { id, qrCodeText } = response.data;
        setBookingId(id);
        setQrCodeText(qrCodeText);

        sendEmail(formData, id, qrCodeText, paxQrCodeRecords);

        // Set booking as successful
        setBookingSuccessful(true);
      } else {
        throw new Error('Booking ID or QR code text not received');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

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

  const handleDateChange = (e) => {
    setBookingDate(e.target.value);
  };

  const handleDownloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'QR_Code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleNumberOfPaxChange = (e) => {
    const num = e.target.value;
    setNumberOfPax(num);
    setAdditionalNames(Array.from({ length: num }, (_, i) => ''));
  };

  const handleAdditionalNameChange = (index, value) => {
    const names = [...additionalNames];
    names[index] = value;
    setAdditionalNames(names);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Booking Form
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormLabel>Event</FormLabel>
          <Typography variant="h6">{event?.eventName}</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormLabel>Date</FormLabel>
          <Select
            value={bookingDate}
            onChange={handleDateChange}
            fullWidth
            disabled={bookingSuccessful} // Disable if booking is successful
          >
            {dateOptions.map((date, index) => (
              <MenuItem key={index} value={date.toISOString()}>
                {date.toLocaleDateString('en-GB')}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <FormLabel>Number of Pax</FormLabel>
          <TextField
            type="number"
            value={numberOfPax}
            onChange={handleNumberOfPaxChange}
            fullWidth
            disabled={bookingSuccessful} // Disable if booking is successful
          />
        </Grid>
        {additionalNames.map((name, index) => (
          <Grid item xs={12} key={index}>
            <TextField
              label={`Additional Pax ${index + 1}`}
              value={name}
              onChange={(e) => handleAdditionalNameChange(index, e.target.value)}
              fullWidth
              disabled={bookingSuccessful} // Disable if booking is successful
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={bookingSuccessful}>
            {bookingSuccessful ? 'Booking Successful' : 'Submit Booking'}
          </Button>
        </Grid>
      </Grid>
      {bookingId && qrCodeText && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Booking Successful</Typography>
          <Typography variant="body1">Booking ID: {bookingId}</Typography>
          <Box>
            <QRCode id="qr-code-canvas" value={qrCodeText} />
          </Box>
          <Button onClick={handleDownloadQRCode} variant="contained" color="secondary" sx={{ mt: 2 }}>
            Download QR Code
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BookingForm;
