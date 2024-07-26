import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Grid, TextField, Button } from '@mui/material';

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from location state
  const {
    qrCodeText = '',
    amount = 0,
    email = '',
    phoneNumber = '',
    eventName = '',
    bookingId = '',
    Name = '',
    numberOfPax = 0,
    paxList = [] // Changed from paxDetails to paxList
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
      const finalAmount = amount * (numberOfPax || 1); // Calculate final amount based on numberOfPax

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
            paymentId: result.payment.id,
            amount: finalAmount,
            email: values.email,
            phoneNumber: values.phoneNumber,
            eventName,
            bookingId,
            qrCodeText,
            numberOfPax,
            paxDetails // Pass paxList instead of paxDetails
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
      <Formik
        initialValues={{
          eventName,
          amount,
          email,
          phoneNumber,
          homeAddress: '',
          postalCode: '',
          paymentMethod: 'Debit',
          cardholderName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          Name,
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
                    <TextField
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
                    <TextField
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
                    <TextField
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
                    <TextField
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
                <Field name="Name">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Name"
                      type="text"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="Name" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="numberOfPax">
                  {({ field, meta }) => (
                    <TextField
                      {...field}
                      label="Number of Pax"
                      type="number"
                      fullWidth
                      error={meta.touched && Boolean(meta.error)}
                      helperText={<ErrorMessage name="numberOfPax" />}
                      disabled
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Submit Payment'}
                </Button>
              </Grid>
              {status && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color={status.type === 'error' ? 'error.main' : 'success.main'}
                    align="center"
                  >
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
