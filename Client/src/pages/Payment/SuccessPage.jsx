import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Typography } from '@mui/material';
import '../../style/payment/paymentform.css';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData, response } = location.state || {};

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleRefund = () => {
    navigate('/refund', { state: { paymentData } });
  };

  if (!paymentData || !response) {
    return (
      <Box className="success-page-container">
        <Typography variant="h1">Payment Successful!</Typography>
        <Typography>Thank you for your payment. Your transaction has been completed successfully.</Typography>
        <Button variant="contained" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleReturnHome}>
          Return to Home
        </Button>
      </Box>
    );
  }

  const { payment } = response;
  const { date, id } = payment || {};

  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Box className="success-page-container" style={{ textAlign: 'left' }}>
      <Box style={{ textAlign: 'center' }}>
        <CheckCircleIcon style={{ fontSize: 80, color: 'green' }} />
        <Typography variant="h2" style={{ fontSize: '2.5em', fontWeight: 'bold', textAlign: 'center', color: 'green', margin: '1em 0' }}>
          Payment Successful
        </Typography>
      </Box>
      <Typography variant="h5" style={{ fontSize: '1.7em', margin: '1em 0' }}>Payment Details:</Typography>      
      <Typography style={{ margin: '1.5em 0' }}>Payment ID: <strong>{id}</strong></Typography>
      <Typography style={{ margin: '1.5em 0' }}>Payment Method: <strong>{paymentData.paymentMethod}</strong></Typography>
      <Typography style={{ margin: '1.5em 0' }}>Date: <strong>{formattedDate}</strong></Typography>

      <Box style={{ marginTop: '2em', display: 'flex', justifyContent: 'center', gap: '1em' }}>
      <Button variant="contained" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleReturnHome}>
          Return to Home
        </Button>
        <Button variant="contained" style={{ backgroundColor: 'red', color: 'white' }} onClick={handleRefund}>
          Request Refund
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessPage;
