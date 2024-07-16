import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import ModalComponent from '../../../components/RefundModal';
import { useLocation } from 'react-router-dom';
import '../../style/payment/paymentform.css';

const RefundForm = () => {
  const location = useLocation();
  const { paymentData } = location.state || {};

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
    <div className="refund-form-container">
      <h2>Refund Request Form</h2>
      <Formik
        initialValues={{
          paymentId: paymentData ? paymentData.id : '',
          name: paymentData ? paymentData.cardholderName : '',
          email: paymentData ? paymentData.email : '',
          paymentMethod: paymentData ? paymentData.paymentMethod : 'Debit',
          event: '',
          reason: '',
          phoneNumber: paymentData ? paymentData.phoneNumber : '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ status, isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="paymentId">Payment ID</label>
              <Field type="text" id="paymentId" name="paymentId" />
              <ErrorMessage name="paymentId" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <Field type="text" id="name" name="name" />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field type="email" id="email" name="email" />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <Field as="select" id="paymentMethod" name="paymentMethod">
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </Field>
              <ErrorMessage name="paymentMethod" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="event">Requested Refund - Event Name</label>
              <Field type="text" id="event" name="event" />
              <ErrorMessage name="event" component="div" className="error-message" />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Refund Reason</label>
              <Field type="text" id="reason" name="reason" />
              <ErrorMessage name="reason" component="div" className="error-message" />
            </div>
            <button type="submit" className="button" disabled={isSubmitting}>
              Submit Refund Request
            </button>
            {status && status.message && <div className="message">{status.message}</div>}
          </Form>
        )}
      </Formik>
      <ModalComponent
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default RefundForm;
