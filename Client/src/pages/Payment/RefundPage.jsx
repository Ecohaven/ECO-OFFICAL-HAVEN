import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import ModalComponent from '../../../components/RefundModal';
import { useLocation } from 'react-router-dom';
import { Container, Grid, TextField, Select, MenuItem, Button, Typography, FormHelperText } from '@mui/material';
import '../../style/payment/paymentform.css'; // Adjust as needed

const RefundForm = () => {
  const location = useLocation();
  const { paymentId, name, email, event } = location.state || {}; // Retrieve values from state

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const validationSchema = Yup.object().shape({
    paymentId: Yup.string()
      .matches(/^\d+$/, 'Payment ID must be a number and cannot contain letters')
      .required('Payment ID is required'),
    name: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Name cannot contain numbers or special characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    paymentMethod: Yup.string()
      .required('Payment Method is required'),
    event: Yup.string()
      .required('Event Name is required'),
    reason: Yup.string()
      .required('Refund Reason is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      const response = await axios.post('http://localhost:3001/api/refunds', values);
      const result = response.data;
      if (result.error) {
        setStatus({ message: result.error });
        console.error('Error:', result.error);
        setModalMessage(result.error);
      } else {
        setStatus({ message: 'Refund request created successfully!' });
        resetForm();
        setModalMessage('Refund request created successfully!');
      }
      setModalIsOpen(true);
    } catch (error) {
      setStatus({ message: 'Failed to create refund request' });
      console.error('Error:', error);
      setModalMessage('Failed to create refund request');
      setModalIsOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Refund Request Form
      </Typography>
      <Formik
        initialValues={{
          paymentId: paymentId || '',
          name: name || '',
          email: email || '',
          paymentMethod: 'Debit', // Default value; adjust as necessary
          event: event || '',
          reason: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ status, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  name="payment.id"
                  as={TextField}
                  label="Payment ID"
                  fullWidth
                  variant="outlined"
                  helperText={<ErrorMessage name="paymentId" />}
                  error={<ErrorMessage name="paymentId" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="name"
                  as={TextField}
                  label="Name"
                  fullWidth
                  variant="outlined"
                  helperText={<ErrorMessage name="name" />}
                  error={<ErrorMessage name="name" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="email"
                  as={TextField}
                  label="Email"
                  fullWidth
                  variant="outlined"
                  helperText={<ErrorMessage name="email" />}
                  error={<ErrorMessage name="email" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="paymentMethod"
                  as={Select}
                  fullWidth
                  variant="outlined"
                  label="Payment Method"
                >
                  <MenuItem value="Debit">Debit</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </Field>
                <FormHelperText error={<ErrorMessage name="paymentMethod" />} />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="event"
                  as={TextField}
                  label="Requested Refund - Event Name"
                  fullWidth
                  variant="outlined"
                  helperText={<ErrorMessage name="event" />}
                  error={<ErrorMessage name="event" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="reason"
                  as={TextField}
                  label="Refund Reason"
                  fullWidth
                  variant="outlined"
                  helperText={<ErrorMessage name="reason" />}
                  error={<ErrorMessage name="reason" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                  Submit Refund Request
                </Button>
              </Grid>
              {status && status.message && (
                <Grid item xs={12}>
                  <Typography variant="body1" color={status.message.includes('successfully') ? 'success.main' : 'error.main'}>
                    {status.message}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Form>
        )}
      </Formik>
      <ModalComponent
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        message={modalMessage}
      />
    </Container>
  );
};

export default RefundForm;
