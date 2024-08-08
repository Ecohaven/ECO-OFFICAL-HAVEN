import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Grid, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';

// Styled TextField with error styles
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'black', 
  },
  '& .MuiInputBase-input': {
    color: 'black', 
    '&.Mui-disabled': {
      opacity: 1,
      '-webkit-text-fill-color': 'black',
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'red', // Error text color
  },
  '& .MuiInputBase-input.Mui-error': {
    borderColor: 'red', // Border color for error state
  },
}));

// Styled FormControl with error styles
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: 'black', 
  },
  '& .MuiSelect-root': {
    color: 'black', 
  },
  '& .MuiFormHelperText-root': {
    color: 'red', // Error text color
  },
}));

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from location state
  const {
    qrCodeText = '',
    amount = '',
    email = '',
    phoneNumber = '',
    eventName = '',
    eventdate = '',
    bookingId = '',
    Name = '',
    numberOfPax = 0,
    paxName = [],
    paxEmail = [],
    paxQrCodeRecords = []
  } = location.state || {};

  const validationSchema = Yup.object().shape({
    homeAddress: Yup.string().required('Home address is required'),
    postalCode: Yup.string()
      .matches(/^\d{6}$/, 'Postal code must be exactly 6 digits')
      .required('Postal code is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
    cardholderName: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Cardholder name must contain only letters')
      .required('Cardholder name is required'),
    cardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Card number must be exactly 16 digits')
      .required('Card number is required'),
    expiryDate: Yup.string()
      .matches(/^\d{2}\/\d{2}$/, 'Expiry date must be formatted as MM/YY')
      .required('Expiry date is required'),
    cvv: Yup.string()
      .matches(/^\d{3}$/, 'CVV must be exactly 3 digits')
      .required('CVV is required')
  });

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      const finalAmount = amount * (numberOfPax || 1);

      const response = await axios.post('http://localhost:3001/pay', { ...values, amount: finalAmount });
      const result = response.data;

      if (result.error) {
        setStatus({ message: result.error, type: 'error' });
      } else {
        setStatus({ message: 'Payment successful!', type: 'success' });
        resetForm();
        navigate('/paymentsuccess', {
          state: {
            formData: values,
            Name,
            paymentId: result.payment.id,
            amount: finalAmount,
            email: values.email,
            phoneNumber: values.phoneNumber,
            eventdate,
            eventName,
            bookingId,
            qrCodeText,
            numberOfPax,
            paxDetails: paxName.map((name, index) => ({
              name,
              email: paxEmail[index]
            })),
            paxQrCodeRecords
          }
        });
      }
    } catch (error) {
      setStatus({ message: 'Failed to process payment', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" style={{ textAlign: 'left' }} gutterBottom>
        Payment Form
      </Typography>
      <i>Amount * No. of Additional guest (if applicable)</i>
      <Formik
        initialValues={{
          eventName,
          amount,
          email,
          phoneNumber,
          homeAddress: '',
          postalCode: '',
          paymentMethod: '',
          cardholderName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          Name,
          eventdate,
          numberOfPax
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ status, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field name="eventName">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Event Name"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="eventName" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="amount">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Amount"
                      type="number"
                      fullWidth
                      value={amount * (numberOfPax || 1)} // Display calculated amount
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="amount" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="email">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="email" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="phoneNumber">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Phone Number"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="phoneNumber" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="homeAddress">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Home Address"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="homeAddress" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="postalCode">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Postal Code"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="postalCode" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <StyledFormControl fullWidth error={Boolean(status?.message)}>
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Field name="paymentMethod">
                    {({ field, meta }) => (
                      <Select
                        {...field}
                        labelId="payment-method-label"
                        label="Payment Method"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        style={{ color: 'black' }} // Ensure text color is black
                      >
                        <MenuItem value='Debit'>Debit</MenuItem>
                        <MenuItem value='Credit'>Credit</MenuItem>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="paymentMethod" component="div" style={{ color: 'red' }} />
                </StyledFormControl>
              </Grid>
              <Grid item xs={12}>
                <Field name="cardholderName">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Cardholder Name"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="cardholderName" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field name="cardNumber">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Card Number"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="cardNumber" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field name="expiryDate">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="Expiry Date (MM/YY)"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="expiryDate" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field name="cvv">
                  {({ field, meta }) => (
                    <StyledTextField
                      {...field}
                      label="CVV"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="cvv" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12} container justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ maxWidth: '300px',marginBottom:'20px' }} // Optional: Limit button width for better centering
                >
                  {isSubmitting ? 'Processing...' : 'Submit Payment'}
                </Button>
              </Grid>
              {status && status.message && (
                <Grid item xs={12}>
                  <Typography color={status.type === 'error' ? 'red' : 'green'}>
                    {status.message}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default PaymentForm;
