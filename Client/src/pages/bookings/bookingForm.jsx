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
  const [numberOfPax, setNumberOfPax] = useState(''); // Changed to a string to handle form input
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
        numberOfPax: Number(numberOfPax) || 0, // Ensure numberOfPax is a number, default to 0 if empty
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
                <h2>Hi ${record.paxName},</h2>
                <p>Your QR code for the event ${event.eventName} is included below:</p>
                <img src="${record.paxQrCodeUrl}" alt="QR Code">
                <p>Thank you for attending the event!</p>
              </body>
            </html>
          `
        });
        console.log(`Email sent to ${record.paxEmail}`);
      }));
    } catch (error) {
      console.error('Error sending additional pax emails:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {event ? `Booking Form for ${event.eventName}` : 'Booking Form'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Booking Date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Pax"
              value={numberOfPax}
              onChange={(e) => setNumberOfPax(e.target.value)}
              required
            />
          </Grid>
          {additionalPax.map((pax, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="h6">Additional Pax {index + 1}</Typography>
              <TextField
                fullWidth
                label="Name"
                value={pax.name}
                onChange={(e) => {
                  const newPax = [...additionalPax];
                  newPax[index].name = e.target.value;
                  setAdditionalPax(newPax);
                }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={pax.email}
                onChange={(e) => {
                  const newPax = [...additionalPax];
                  newPax[index].email = e.target.value;
                  setAdditionalPax(newPax);
                }}
                required
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" disabled={buttonDisabled}>
              {buttonText}
            </Button>
          </Grid>
        </Grid>
      </form>
      {qrCodeText && <QRCode value={qrCodeText} />}
    </Box>
  );
};

export default BookingForm;
