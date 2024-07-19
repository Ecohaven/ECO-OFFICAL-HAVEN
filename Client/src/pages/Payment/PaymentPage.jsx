import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Grid, TextField, Button, Box } from '@mui/material';

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from location state
  const { formData, amount = '', email = '', phoneNumber = '', eventName = '' } = location.state || {};

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be a positive number')
      .required('Amount is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^\d{8}$/, 'Phone number must be exactly 8 digits')
      .required('Phone number is required'),
    homeAddress: Yup.string()
      .required('Home address is required'),
    postalCode: Yup.string()
      .matches(/^\d{6}$/, 'Postal code must be exactly 6 digits')
      .required('Postal code is required'),
    paymentMethod: Yup.string()
      .required('Payment method is required'),
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
      .required('CVV is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      const response = await axios.post('http://localhost:3001/pay', values);
      const result = response.data;
      if (result.error) {
        setStatus({ message: result.error, type: 'error' });
      } else {
        setStatus({ message: 'Payment successful!', type: 'success' });
        resetForm();
        // Redirect to a new page where booking will be created
        navigate('/paymentsucess', { state: { paymentData: values, response: result, formData } });
      }
    } catch (error) {
      setStatus({ message: 'Failed to process payment', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Form
      </Typography>
      <Formik
        initialValues={{
          eventName: eventName || '',
          amount: amount || '',
          email: email || '',
          phoneNumber: phoneNumber || '',
          homeAddress: '',
          postalCode: '',
          paymentMethod: 'Debit',
          cardholderName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          currency: 'SGD',
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
                    <TextField
                      {...field}
                      label="Event Name"
                      type="text"
                      fullWidth
                      style={{ color: 'black' }}
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
                    <TextField
                      {...field}
                      label="Amount"
                      type="number"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="amount" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="email">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="email" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="phoneNumber">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="phoneNumber" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="homeAddress">
                  {({ field, meta }) => (
                    <TextField
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
                    <TextField
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
                <Field name="paymentMethod">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Payment Method"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="paymentMethod" />}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="cardholderName">
                  {({ field, meta }) => (
                    <TextField
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
              <Grid item xs={12}>
                <Field name="cardNumber">
                  {({ field, meta }) => (
                    <TextField
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
              <Grid item xs={12}>
                <Field name="expiryDate">
                  {({ field, meta }) => (
                    <TextField
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
              <Grid item xs={12}>
                <Field name="cvv">
                  {({ field, meta }) => (
                    <TextField
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
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                  Pay
                </Button>
              </Grid>
              {status && status.message && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ color: status.type === 'error' ? 'red' : 'green' }}>
                    {status.message}
                  </Box>
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
