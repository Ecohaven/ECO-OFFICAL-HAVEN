import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Grid, Typography, TextField, FormLabel, MenuItem, Select } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import AccountContext from '../../contexts/AccountContext';

const BookingForm = () => {
  const { state } = useLocation();
  const { event } = state || {};
  const [bookingDate, setBookingDate] = useState('');
  const [numberOfPax, setNumberOfPax] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [qrCodeText, setQrCodeText] = useState('');
  const [dateOptions, setDateOptions] = useState([]);
  const [paxDetails, setPaxDetails] = useState([{ name: '', email: '' }]);
  const [paxQrCodeRecords, setPaxQrCodeRecords] = useState([]);
  const [bookingSuccessful, setBookingSuccessful] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Submit Booking');
  const navigate = useNavigate();
  const { account, setAccount } = useContext(AccountContext);


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
      }
    };

    if (!account) {
      fetchUserData();
    }
  }, [account, setAccount]);

  useEffect(() => {
    const generateDateOptions = () => {
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (startDate.getTime() === endDate.getTime()) {
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

  useEffect(() => {
    const updatePaxDetails = () => {
      const newPaxDetails = Array.from({ length: numberOfPax }, (_, i) => {
        return paxDetails[i] || { name: '', email: '' };
      });
      setPaxDetails(newPaxDetails);
    };

    updatePaxDetails();
  }, [numberOfPax]);

  const effectiveBookingDate = bookingDate || (event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '');

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

  const handlePaxDetailChange = (index, field, value) => {
    const updatedPaxDetails = [...paxDetails];
    updatedPaxDetails[index] = { ...updatedPaxDetails[index], [field]: value };
    setPaxDetails(updatedPaxDetails);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (bookingSuccessful) {
    return;
  }

  try {
    const paxQrCodeRecords = generatePaxQrCodeRecords(paxDetails);
    setPaxQrCodeRecords(paxQrCodeRecords);

    const formData = {
      eventId: event.eventId,
      eventName: event.eventName,
      leafPoints: event.leafPoints,
      amount: event.amount,
      bookingDate: effectiveBookingDate,
      numberOfPax: Number(numberOfPax) || 0,
      Name: account.name,
      email: account.email,
      phoneNumber: account.phone_no,
      location: event.location,
      paxName: paxDetails.map(pax => pax.name),
      paxEmail: paxDetails.map(pax => pax.email),
      paxQrCodeRecords
    };

    // Handle booking
    const response = await axios.post('http://localhost:3001/api/bookings', formData);

    if (response.data.id && response.data.qrCodeText) {
      const { id, qrCodeText } = response.data;
      setBookingId(id);
      setQrCodeText(qrCodeText);

      // Send emails
      sendEmail(formData, id, qrCodeText, paxQrCodeRecords);
      sendPaxEmails(paxQrCodeRecords);

      setBookingSuccessful(true);
      setButtonText('Booking Successful');
      setButtonDisabled(true);

      // Redirect to payment if necessary
      if (event.status !== 'Free' && event.amount) {
        navigate('/payment', { state: { formData, eventName: event.eventName, amount: event.amount, email: account.email, phoneNumber: account.phone_no, bookingId: id } });
      }
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
            <body>
              <h1>Eco<span style="color:black;">Haven</span></h1>
              <h2>Booking Details</h2>
              ${bookingId ? `<p>Booking ID: <strong>${bookingId}</strong></p>` : ''}
              <p>Event: <strong>${formData.eventName}</strong></p>
              <p>Email: <strong>${account.email}</strong></p>
              <p>Phone Number: <strong>${account.phone_no}</strong></p>
              <p>Date: <strong>${new Date(formData.bookingDate).toLocaleDateString('en-GB')}</strong></p>
              <p>Number of Pax: <strong>${formData.numberOfPax}</strong></p>
              <p>Location: ${formData.location}</p>
              ${qrCodeText ? `<div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}" alt="QR Code">
              </div>` : ''}
              ${paxQrCodeRecords.length > 0 ? `<div>
                <h3>Your Additional Guest QR Codes</h3>
                ${paxQrCodeRecords.map(record => `
                  <div>
                    <p>${record.paxName} - ${record.paxQrCodeText}</p>
                    <img src="${record.paxQrCodeUrl}" alt="QR Code for Pax Name ${record.paxName}">
                  </div>
                `).join('')}
              </div>` : ''}
              <p>Please download or remember this QR code text for check-in.</p>
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
              <body>
                <h2>Hi ${record.paxName},</h2>
                <p>Your QR code for the event ${event.eventName} is included below:</p>
                <img src="${record.paxQrCodeUrl}" alt="QR Code">
                <p>Thank you for attending the event!</p>
              </body>
            </html>
          `
        });
        console.log(`QR code email sent to ${record.paxEmail}`);
      }));
    } catch (error) {
      console.error('Error sending pax emails:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" gutterBottom>Booking Form</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormLabel>Booking Date</FormLabel>
          {dateOptions.length > 0 ? (
            <Select
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              fullWidth
            >
              {dateOptions.map((date, index) => (
                <MenuItem key={index} value={date.toISOString().split('T')[0]}>
                  {date.toLocaleDateString('en-GB')}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <TextField
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              fullWidth
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormLabel>Number of Pax</FormLabel>
          <Select
            value={numberOfPax}
            onChange={(e) => setNumberOfPax(e.target.value)}
            fullWidth
          >
            {[0,1, 2, 3, 4, 5].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        {paxDetails.map((pax, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Pax ${index + 1} Name`}
                value={pax.name}
                onChange={(e) => handlePaxDetailChange(index, 'name', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Pax ${index + 1} Email`}
                type="email"
                value={pax.email}
                onChange={(e) => handlePaxDetailChange(index, 'email', e.target.value)}
                fullWidth
              />
            </Grid>
          </React.Fragment>
        ))}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" disabled={buttonDisabled}>
            {buttonText}
          </Button>
        </Grid>
      </Grid>
      {bookingSuccessful && (
        <Box mt={3}>
          <Typography variant="h6">Booking Successful!</Typography>
          <Typography variant="body1">Booking ID: {bookingId}</Typography>
          {qrCodeText && (
            <Box>
              <Typography variant="body1">QR Code:</Typography>
              <QRCode value={qrCodeText} />
            </Box>
          )}
          {paxQrCodeRecords.length > 0 && (
            <Box mt={2}>
              <Typography variant="body1">Pax QR Codes:</Typography>
              {paxQrCodeRecords.map((record, index) => (
                <Box key={index} mb={1}>
                  <Typography variant="body2">{record.paxName}</Typography>
                  <img src={record.paxQrCodeUrl} alt={`QR Code for ${record.paxName}`} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BookingForm;
