import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Grid, Typography, TextField, FormLabel, MenuItem, Select } from '@mui/material';
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
  const [additionalPax, setAdditionalPax] = useState([]); // State to store additional pax details
  const [paxQrCodeRecords, setPaxQrCodeRecords] = useState([]); // State to store pax QR code records
  const [bookingSuccessful, setBookingSuccessful] = useState(false); // State for booking success
 const [buttonDisabled, setButtonDisabled] = useState(false);
 const [buttonText, setButtonText] = useState('Submit Booking');
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

   // Generate date options and set booking date if needed
    const generateDateOptions = () => {
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (startDate.getTime() === endDate.getTime()) {
          // Automatically set bookingDate if startDate and endDate are the same
          setBookingDate(startDate.toISOString().split('T')[0]);
        } else {
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

  const generatePaxQrCodeRecords = (paxDetails) => {
    return paxDetails.map(({ name, email }) => {
      if (!name || !email) return null;

      const paxQrCodeText = name;

      return {
        paxName: name,
        paxEmail: email,
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
      const paxQrCodeRecords = generatePaxQrCodeRecords(additionalPax);
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
        paxName: additionalPax.map(pax => pax.name),
        paxEmail: additionalPax.map(pax => pax.email),
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
        sendPaxEmails(paxQrCodeRecords);

        setBookingSuccessful(true);
        setButtonText('Booking Successful');
        setButtonDisabled(true);
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

  const sendPaxEmails = async (paxQrCodeRecords) => {
    try {
      await Promise.all(paxQrCodeRecords.map(async (record) => {
        await axios.post('http://localhost:3001/send-email', {
          to: [record.paxEmail],
          subject: `Your QR Code for ${event.eventName}`,
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
                  <h2>Hello ${record.paxName}!</h2>
                  <p>Here is your QR code for the event: ${event.eventName}.</p>
                  <p>Your QR Code:</p>
                  <img src="${record.paxQrCodeUrl}" alt="QR Code for Pax Name ${record.paxName}">
                </div>
                <div class="footer">
                  <i><b>This email is auto-generated by ECOHAVEN.</b></i>
                </div>
              </body>
            </html>
          `
        });
      }));
      console.log('Pax emails sent successfully!');
    } catch (error) {
      console.error('Error sending pax emails:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ padding: 2 }}>
      <Typography variant="h4">Booking Form</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormLabel>Event Name</FormLabel>
          <Typography variant="h6">{event.eventName}</Typography>
        </Grid>
        <Grid item xs={12}>
          <FormLabel>Booking Date</FormLabel>
          <TextField
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormLabel>Number of Pax</FormLabel>
          <Select
            value={numberOfPax}
            onChange={(e) => setNumberOfPax(e.target.value)}
            fullWidth
          >
            {[1, 2, 3, 4, 5].map((pax) => (
              <MenuItem key={pax} value={pax}>{pax}</MenuItem>
            ))}
          </Select>
        </Grid>
        {Array.from({ length: numberOfPax }).map((_, index) => (
          <Grid container item xs={12} key={index} spacing={2}>
            <Grid item xs={6}>
              <TextField
                label={`Additional Pax ${index + 1} Name`}
                value={additionalPax[index]?.name || ''}
                onChange={(e) => {
                  const newAdditionalPax = [...additionalPax];
                  newAdditionalPax[index] = { ...newAdditionalPax[index], name: e.target.value };
                  setAdditionalPax(newAdditionalPax);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`Additional Pax ${index + 1} Email`}
                value={additionalPax[index]?.email || ''}
                onChange={(e) => {
                  const newAdditionalPax = [...additionalPax];
                  newAdditionalPax[index] = { ...newAdditionalPax[index], email: e.target.value };
                  setAdditionalPax(newAdditionalPax);
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={buttonDisabled}
          >
            {buttonText}
          </Button>
        </Grid>
      </Grid>

      {bookingSuccessful && qrCodeText && (
        <Box mt={2}>
          <Typography variant="h6">Your QR Code:</Typography>
          <QRCode value={qrCodeText} size={256} />
        </Box>
      )}
      {paxQrCodeRecords.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Additional Pax QR Codes:</Typography>
          {paxQrCodeRecords.map((record, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="body2">Pax Name: {record.paxName}</Typography>
              <QRCode value={record.paxQrCodeText} size={128} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};



export default BookingForm;
