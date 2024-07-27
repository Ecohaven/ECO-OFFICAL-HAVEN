import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';


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
      const finalAmount = amount + amount * (numberOfPax || 1);

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
                <FormControl fullWidth error={Boolean(status?.message)}>
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Field name="paymentMethod">
                    {({ field, meta }) => (
                      <Select
                        {...field}
                        labelId="payment-method-label"
                        label="Payment Method"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                      >
                        <MenuItem value="Debit">Debit</MenuItem>
                        <MenuItem value="Credit">Credit</MenuItem>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="paymentMethod" component="div" style={{ color: 'red' }} />
                </FormControl>
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
              <Typography variant="h6" component="h2" style={{ marginTop: 16 }}>
                Additional Pax Details
              </Typography>
              {paxName.map((name, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant="body1" component="div">
                    <strong>Pax Name:</strong> {name}
                  </Typography>
                  <Typography variant="body1" component="div">
                    <strong>Pax Email:</strong> {paxEmail[index]}
                  </Typography>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Submit Payment'}
                </Button>
                {status && (
                  <Typography variant="body1" color={status.type === 'error' ? 'error' : 'success'}>
                    {status.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default PaymentForm;
