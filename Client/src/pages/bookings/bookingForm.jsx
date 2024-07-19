import React, { useState,useEffect,useContext } from 'react';
import { Box, Button, Grid, Typography, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, MenuItem, Select } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import AccountContext from '../../contexts/AccountContext'; // Import the AccountContext

const BookingForm = () => {
  const { state } = useLocation();
  const { event } = state || {};
  const [bookingDate, setBookingDate] = useState(''); // State for booking date
  const [gender, setGender] = useState('');
  const [numberOfPax, setNumberOfPax] = useState('');
  const [address, setAddress] = useState('');
  const [Name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingId, setBookingId] = useState(''); // State to store booking ID
  const [qrCodeText, setQrCodeText] = useState(''); // State to store QR code text
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
                // Handle error if needed
            }
        };

        if (!account) {
            fetchUserData();
        }
    }, [account, setAccount]);

 const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        eventId: event.eventId,
        eventName: event.eventName,
        leafPoints: event.leafPoints,
        amount: event.amount,
        bookingDate: new Date(),
        numberOfPax,
        address,
        Name: account.name,
        email: account.email,
        phoneNumber: account.phone_no,
        location: event.location
      };

      // Check if event status is not 'Free' and there is an amount
      if (event.status !== 'Free' && event.amount) {
        // Redirect to payment page
        navigate('/payment', { state: { formData,eventName: event.eventName, amount: event.amount, email: account.email, phoneNumber: account.phone_no , bookingId: bookingId} });
        return; // Prevent further execution
      }

      // Proceed with booking creation
      const response = await axios.post('http://localhost:3001/api/bookings', formData);

      if (response.data.id && response.data.qrCodeText) {
        const { id, qrCodeText } = response.data;

        setBookingId(id);
        setQrCodeText(qrCodeText);

        // Automatically send email here with bookingId and qrCodeText
        sendEmail(formData, id, qrCodeText);
      } else {
        throw new Error('Booking ID or QR code text not received');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };


  // Updated sendEmail function to include bookingId and qrCodeText
const sendEmail = async (formData, bookingId, qrCodeText) => {
  try {
    await axios.post('http://localhost:3001/send-email', {
      to: ['ecohaven787@gmail.com', 'kohqf80@gmail.com'],
      subject: `${formData.eventName} Booking Successful`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
              }
              .header {
                background-color: #28a745;
                color: white;
                text-align: center;
                padding: 10px;
                margin-bottom: 20px;
              }
              .header h1, .header h2 {
                margin: 0;
                font-weight: normal;
              }
              .content {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                margin-bottom: 20px;
              }
              .content h2 {
                color: #333333;
                border-bottom: 1px solid #dddddd;
                padding-bottom: 10px;
                margin-top: 0;
              }
              .content h4 {
                color: #666666;
                font-weight: normal;
              }
              .content p {
                margin: 10px 0;
              }
              .qr-code {
                text-align: center;
                margin-top: 20px;
              }
              .qr-code img {
                max-width: 100%;
                height: auto;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(10, 10, 10, 0.1);
              }
              .footer {
                text-align: center;
                color: #999999;
                font-size: 12px;
                margin-top: 20px;
              }
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
              <p>Please download the generated QR code from our website or remember this QR code text, they will be needed for check-in. You can flash the QR Code image from your account's profile page (events).</p>
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

  // Helper function to create an array of dates between start and end dates
  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Generate dates between event start and end dates
  let datesOptions = [];
  if (event.startDate && event.endDate) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (startDate.getTime() !== endDate.getTime()) {
      datesOptions = getDatesBetween(startDate, endDate);
    }
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Breadcrumb */}
      <Box sx={{ width: '100%', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: 'green', color: 'white', padding: '8px', borderRadius: '4px' }}>
        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button onClick={() => navigate('/')} color="inherit" sx={{ cursor: 'pointer', color: 'white' }}>
            Home
          </Button>
          <Typography>&gt;</Typography>
          <Button onClick={() => navigate('/booknow')} color="inherit" sx={{ cursor: 'pointer', color: 'white' }}>
            Book now
          </Button>
          <Typography>&gt;</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>{event.eventName}</Typography>
        </Typography>
      </Box>

      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" align="center" sx={{ mt: 2 }} style={{ fontWeight: 'bold' }}>
          {event.eventName}
        </Typography>
      </Box>

      <Grid container spacing={0}>
        {/* Left Grid - Event Details */}
        <Grid item xs={12} md={event.description && event.description.length > 100 ? 5 : 5}>
          <Box sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
            {/* Event Image */}
            <img
              src={`http://localhost:3001/api/event-picture/${event.eventId}`}
              alt={event.eventName}
              style={{ width: '80%', height: 'auto', borderRadius: '8px', maxHeight: '450px', objectFit: 'cover', marginLeft: '60px' }}
            />
            <Typography variant="body1" paragraph style={{ marginLeft: '60px', width: '85%', textAlign: 'left', fontSize: '20px' }}>
              {event.description}
            </Typography>

          </Box>
        </Grid>

        {/* Right Grid - Booking Form */}
        <Grid item xs={12} md={event.description && event.description.length > 100 ? 6 : 4}>
          <Box p={2}>
            {/* Event Details */}

            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Location: {event.location}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Organiser: {event.organiser}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Date: {event.startDate && event.endDate ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}` : event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No specific date'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Leaf Points: {event.leafPoints}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Status: {event.status}
            </Typography>
            {event.status !== 'Free' && (
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Price: {event.amount}
              </Typography>
            )}
          </Box>
          {/* End of Event Details */}
          <Box sx={{ width: '100%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', height: '100%', padding: '20px' }}>
            <Box>
              {bookingId ? (
                <>
                  <Typography variant="h5" align="center" gutterBottom>
                    Booking Successful: {bookingId}
                  </Typography>
                  <Typography variant="h5" align="center" gutterBottom>
                    Qr Code Text: {qrCodeText}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <QRCode id="qr-code-canvas" value={qrCodeText} size={200} includeMargin />
                    <Button onClick={handleDownloadQRCode} variant="contained" color="primary" sx={{ mt: 2 }}>
                      Download Qr-Code 
                    </Button>
                  </Box>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 2 }}>
                    <FormLabel>Booking Date</FormLabel>
                    <Select
                      value={bookingDate}
                      onChange={handleDateChange}
                      fullWidth
                      variant="outlined"
                      displayEmpty
                      disabled={event.startDate === event.endDate}
                    >
                      {datesOptions.map((date, index) => (
                        <MenuItem key={index} value={date.toISOString()} >
                          {date.toLocaleDateString('en-GB')}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box sx={{ mb: 2 }}>

                    <label>Number of Pax: <br /></label>
                    <Select
                      value={numberOfPax}
                      onChange={(e) => setNumberOfPax(e.target.value)}
                      required
                      MenuProps={{ PaperProps: { style: { maxWidth: 50 } } }}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>

                  </Box>

                  <Box sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                            label="Name"
                            value={account ? account.name : ''}
                            onChange={(e) => setAccount({ ...account, name: e.target.value })}
                            fullWidth
                            required
                            variant="outlined"
                            color="success"
                            focused
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            type="email"
                            value={account ? account.email : ''}
                            onChange={(e) => setAccount({ ...account, email: e.target.value })}
                            fullWidth
                            required
                            variant="outlined"
                            color="success"
                            focused
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            value={account ? account.phone_no : ''}
                            onChange={(e) => setAccount({ ...account, phone_no: e.target.value })}
                            fullWidth
                            required
                            variant="outlined"
                            color="success"
                            focused
                            disabled
                        />
                    </Grid>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button type="submit" fullWidth variant="contained" color="primary">
                      Book Now
                    </Button>
                  </Box>
                </form>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingForm;


