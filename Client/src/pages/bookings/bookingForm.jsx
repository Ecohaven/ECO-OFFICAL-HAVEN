import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Grid, Typography, TextField, FormLabel, MenuItem, Select, Checkbox, FormControlLabel } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';
import AccountContext from '../../contexts/AccountContext';
import ecoGmailImg from '../../assets/images/eco-gmail.jpg';



const BookingForm = () => {
  const { state } = useLocation();
  const { event } = state || {};
  const [bookingDate, setBookingDate] = useState('');
  const [numberOfPax, setNumberOfPax] = useState(0);
  const [bookingId, setBookingId] = useState('');
  const [qrCodeText, setQrCodeText] = useState('');
  const [dateOptions, setDateOptions] = useState([]);
  const [paxDetails, setPaxDetails] = useState([{ name: '', email: '' }]);
  const [paxQrCodeRecords, setPaxQrCodeRecords] = useState([]);
  const [bookingSuccessful, setBookingSuccessful] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonText, setButtonText] = useState('Submit Booking');
  const [sendToPax, setSendToPax] = useState(true);
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

  useEffect(() => {
    const updatePaxDetails = () => {
      setPaxDetails(Array.from({ length: numberOfPax }, (_, i) => {
        return paxDetails[i] || { name: '', email: '' };
      }));
    };

    updatePaxDetails();
  }, [numberOfPax]);

  const effectiveBookingDate = bookingDate || (event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '');     

  const generatePaxQrCodeRecords = (paxDetails) => {
    return paxDetails.map(({ name, email }) => {
      if (!name || !email) return null;

      return {
        paxName: name,
        paxEmail: email,
        paxQrCodeText: name,
        paxQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(name)}`
      };
    }).filter(record => record !== null);
  };

  const handlePaxDetailChange = (index, field, value) => {
    setPaxDetails(prev => {
      const updatedPaxDetails = [...prev];
      updatedPaxDetails[index] = { ...updatedPaxDetails[index], [field]: value };
      return updatedPaxDetails;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookingSuccessful) return;

const currentDate = new Date().toISOString().split('T')[0];

    try {
      const paxQrCodeRecords = generatePaxQrCodeRecords(paxDetails);
      setPaxQrCodeRecords(paxQrCodeRecords);

      const formData = {
        eventId: event.eventId,
        eventName: event.eventName,
        leafPoints: event.leafPoints,
        amount: event.amount,
        bookingDate: currentDate,
        numberOfPax: Number(numberOfPax),
        Name: account.name,
        email: account.email,
        phoneNumber: account.phone_no,
        location: event.location,
        time: event.startTime,
        paxName: paxDetails.map(pax => pax.name),
        paxEmail: paxDetails.map(pax => pax.email),
        paxQrCodeRecords
      };

      const response = await axios.post('http://localhost:3001/api/bookings', formData);
      

      if (response.data.id && response.data.qrCodeText) {
        const { id, qrCodeText } = response.data;
        setBookingId(id);
        setQrCodeText(qrCodeText);

        setBookingSuccessful(true);
        setButtonText('Booking Successful');
        setButtonDisabled(true);


  if (event.status !== 'Free' && event.amount) {
   navigate('/payment', {
  state: {
    Name: account.name,
    eventName: event.eventName,
    eventdate: event.startDate,
    amount: event.amount,
    email: account.email,
    location: event.location,
        time: event.startTime,
 bookingDate: currentDate,
    phoneNumber: account.phone_no,
    numberOfPax: numberOfPax,
    bookingId: id,
    qrCodeText: qrCodeText,
    paxName: paxDetails.map(pax => pax.name),
        paxEmail: paxDetails.map(pax => pax.email),
        paxQrCodeRecords
  }
});
        } else {
          await sendEmail(formData, id, qrCodeText, paxQrCodeRecords);

          if (sendToPax) {
            await sendPaxEmails(paxQrCodeRecords);
          }
        }
      } else {
        throw new Error('Booking ID or QR code text not received');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };


  const sendEmail = async (formData, bookingId, qrCodeText,paxQrCodeRecords) => {
    try {
      await axios.post('http://localhost:3001/send-email', {
        to: ['ecohaven787@gmail.com'],
        subject: `${formData.eventName} Booking Successful`,
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
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: auto;
      padding: 0;
      border-radius: 8px;
      background-color: #e0f7f4;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: row;
      align-items: stretch;
      overflow: hidden;
    }
    .left-column {
      flex: 0.75; /* Reduced width for the event details section */
      text-align: center;
      background-color: #99c2a2;
      padding: 20px;
      position: relative;
      min-width: 150px; /* Ensuring a smaller width for event details */
    }
    .left-column img {
      max-width: 100%;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .left-column p {
      margin: 10px 0;
      font-weight: bold;
      font-size: 16px;
      color: #fff;
    }
    .right-column {
      flex: 3; /* Adjusted to make it larger than the left-column */
      padding: 20px;
      background-color: #ffffff;
    }
    .right-column h1 {
      text-align: center;
      color: #4CAF50;
      margin: 0;
    }
    .right-column h2 {
      text-align: center;
      color: #333;
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 22px;
    }
    .right-column p {
      margin: 8px 0;
      line-height: 1.5;
    }
    .qr-code-container {
      text-align: center;
      margin: 20px 0;
    }
    .qr-code-container img {
      border-radius: 8px;
      border: 2px solid #4CAF50;
    }
    .guest-qr-codes {
      margin-top: 20px;
    }
    .guest-qr-code {
      margin-bottom: 10px;
      text-align: center;
    }
    .guest-qr-code p {
      margin: 0;
      font-weight: bold;
    }
    .guest-qr-code img {
      margin-top: 5px;
      border-radius: 8px;
      border: 2px solid #4CAF50;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left-column">
      <p><strong>Event:</strong> ${formData.eventName}</p>
      <p><strong>Event Date:</strong> ${event.startDate}</p>
      <p><strong>Event Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Amount:</strong> ${event.amount}</p>
    </div>
    <div class="right-column">
      <h1>Eco<span style="color: #333;">Haven</span></h1>
      <h2>Booking Details</h2>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Email:</strong> ${account.email}</p>
      <p><strong>Phone Number:</strong> ${account.phone_no}</p>
      <p><strong>Booked Date:</strong> ${new Date(formData.bookingDate).toLocaleDateString('en-GB')}</p>
      ${qrCodeText ? `
      <div class="qr-code-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}" alt="QR Code">
      </div>` : ''}
      ${paxQrCodeRecords.length > 0 ? `
      <div class="guest-qr-codes">
        <h3>Your Additional Guest QR Codes</h3>
        ${paxQrCodeRecords.map(record => `
        <div class="guest-qr-code">
          <p>${record.paxName}</p>
          <img src="${record.paxQrCodeUrl}" alt="QR Code for ${record.paxName}">
        </div>`).join('')}
      </div>` : ''}
      <p style="text-align: center; color: #666;">Please show this QR-Code for check-in.</p>
    </div>
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
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border-radius: 8px;
      background-color: #e0f7f4;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h2 {
      color: white;
      margin-bottom: 20px;
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
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi ${record.paxName},</h2>
    <p>Your QR code for the event <strong>${event.eventName}</strong> is included below:</p>
    <div class="qr-code-container">
      <img src="${record.paxQrCodeUrl}" alt="QR Code">
    </div>
    <p class="footer">Please show this QR code on the actual day. Thank you!</p>
  </div>
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
    <Box component="form" onSubmit={handleSubmit} sx={{ padding: 2.5, borderRadius: 2, boxShadow: 4, backgroundColor: 'white' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'black', textAlign: 'center',fontWeight:'bold' }}>Booking Form</Typography>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>Event Name: <strong>{event.eventName}</strong></Typography>
     <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>Description: <strong>{event.description}</strong></Typography>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>Time: <strong>{event.time}</strong></Typography>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>Location:  <strong>{event.location}</strong></Typography>
      <Typography
  variant="h6"
  gutterBottom
  sx={{ textAlign: 'left', color: 'black' }}
>
  Admission: 
  <strong>
    {event.status === 'Paid' ? `$${event.amount}` : 'Free'}
  </strong>
</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
             <FormLabel style={{color:'black'}}>Event Date</FormLabel>
        {dateOptions.length > 0 ? (
          <Select
            value={effectiveBookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            fullWidth
            margin="normal"
          >
            {dateOptions.map((date, index) => (
              <MenuItem key={index} value={date.toISOString().split('T')[0]}>
                {date.toISOString().split('T')[0]}
              </MenuItem>
            ))}
          </Select>
          ) : (
           <TextField
            value={new Date(event.startDate).toISOString().split('T')[0]}
            fullWidth
            InputProps={{
              readOnly: true
            }}
          />
        )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormLabel style={{color:'black'}}>Additional Guests:</FormLabel>
          <Select
            value={numberOfPax}
            onChange={(e) => setNumberOfPax(e.target.value)}
            fullWidth
            sx={{ bgcolor: '#fff', borderRadius: 1, boxShadow: 1 }}
            disabled={bookingSuccessful}
          >
            {[0, 1, 2, 3, 4, 5].map((num) => (
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
                required
                sx={{ bgcolor: '#fff', borderRadius: 1, boxShadow: 1 }}
                disabled={bookingSuccessful}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={`Pax ${index + 1} Email`}
                type="email"
                value={pax.email}
                onChange={(e) => handlePaxDetailChange(index, 'email', e.target.value)}
                fullWidth
                required
                sx={{ bgcolor: '#fff', borderRadius: 1, boxShadow: 1 }}
                disabled={bookingSuccessful}
              />
            </Grid>
          </React.Fragment>
        ))}
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={sendToPax} onChange={() => setSendToPax(!sendToPax)} disabled={bookingSuccessful} />}
            label="Send booking details to additional pax emails"
            sx={{ color: '#555' }}
            disabled={numberOfPax === 0} // Disable if numberOfPax is 0
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="success" disabled={buttonDisabled} sx={{ width: '20%', py: 1.5 }}>
            {buttonText}
          </Button>
        </Grid>
      </Grid>
{bookingSuccessful && (
  <Box mt={3} sx={{ border: '1px solid #ddd', padding: 4, borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', bgcolor: '#f9f9f9' }}>
    <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
      🎉 Booking Successful!
    </Typography>
    <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
      Your booking has been confirmed. Below are the details:
    </Typography>
    <Box sx={{ mb: 3, textAlign: 'center' }}>
      <Typography variant="body1" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        Booking ID: <span style={{ color: 'green', fontWeight: 'bold' }}>{bookingId}</span>
      </Typography>
    </Box>
    {qrCodeText && (
      <Box mt={2} sx={{ textAlign: 'center' }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>QR Code for Your Booking:</Typography>
        <QRCode value={qrCodeText} size={128} />
      </Box>
    )}
    {paxQrCodeRecords.length > 0 && (
      <Box mt={4}>
        <Typography variant="body1" sx={{ color: '#333', fontSize: '1.2rem', fontWeight: 'bold', mb: 2 }}>Additional Guest QR Codes:</Typography>
        <Grid container spacing={2} justifyContent="center">
          {paxQrCodeRecords.map((record, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ textAlign: 'center', padding: 2, border: '1px solid green', borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>{record.paxName}</Typography>
                <img src={record.paxQrCodeUrl} alt={`QR Code for ${record.paxName}`} style={{ borderRadius: '8px', maxWidth: '100%' }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    )}
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/home')}
      >
        Back to Home
      </Button>
    </Box>
  </Box>
)}

    </Box>
  );
};

export default BookingForm;


