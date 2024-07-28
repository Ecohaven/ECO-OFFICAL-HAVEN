import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  FormHelperText,
  FormControl,
  InputLabel,
  Box,
  Modal,
} from '@mui/material';
import '../../style/payment/paymentform.css';
import AccountContext from '../../contexts/AccountContext';

const RefundForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account } = useContext(AccountContext);
  const { paymentId, email, eventName } = location.state || {};

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
    refundMethod: Yup.string().required('Refund Method is required'),
    event: Yup.string().required('Event Name is required'),
    reason: Yup.string().required('Refund Reason is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      const response = await axios.post('http://localhost:3001/refund/refundcreate', values);
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
    <Container
      maxWidth="sm"
      sx={{ mt: 4, mb: 4, p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: 'background.paper' }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Refund Request Form
      </Typography>
      <Formik
        initialValues={{
          paymentId: paymentId || '',
          name: account?.name || '',
          email: email || '',
          refundMethod: '',
          event: eventName || '',
          reason: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ status, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field
                  name="paymentId"
                  as={TextField}
                  label="Payment ID"
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText={<ErrorMessage name="paymentId" />}
                  error={Boolean(<ErrorMessage name="paymentId" />)}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="name"
                  as={TextField}
                  label="Name"
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText={<ErrorMessage name="name" />}
                  error={Boolean(<ErrorMessage name="name" />)}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="email"
                  as={TextField}
                  label="Email"
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText={<ErrorMessage name="email" />}
                  error={Boolean(<ErrorMessage name="email" />)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="refundMethod-label">Refund Method</InputLabel>
                  <Field
                    name="refundMethod"
                    as={Select}
                    labelId="refundMethod-label"
                    label="Refund Method"
                  >
                    <MenuItem value="Debit">Debit</MenuItem>
                    <MenuItem value="Credit">Credit</MenuItem>
                  </Field>
                  <FormHelperText error={Boolean(<ErrorMessage name="refundMethod" />)}>
                    <ErrorMessage name="refundMethod" />
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Field
                  name="event"
                  as={TextField}
                  label="Requested Refund - Event Name"
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText={<ErrorMessage name="event" />}
                  error={Boolean(<ErrorMessage name="event" />)}
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
                  error={Boolean(<ErrorMessage name="reason" />)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                  Submit Refund Request
                </Button>
              </Grid>
              {status && status.message && (
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    style={{ color: 'black' }} // Set color to black explicitly
                  >
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
        footer={
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        }
      />
    </Container>
  );
};

const ModalComponent = ({ isOpen, onRequestClose, message, footer }) => (
  <Modal
    open={isOpen}
    onClose={onRequestClose}
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
  >
    <Box
      sx={{
        p: 3,
        backgroundColor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        maxWidth: 500,
        mx: 'auto',
        mt: '20vh',
        textAlign: 'center',
      }}
    >
      <Typography id="modal-title" variant="h6" gutterBottom style={{color:'black'}}>
        {message}
      </Typography>
      <Box mt={3}>{footer}</Box>
    </Box>
  </Modal>
);

export default RefundForm;
