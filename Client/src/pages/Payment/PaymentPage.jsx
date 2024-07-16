import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import '../../style/payment/paymentform.css';

const PaymentForm = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .positive('Amount must be positive number')
      .required('Amount is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^\d{8}$/, 'Phone number must be exactly 8 digits and contain only numbers')
      .required('Phone number is required'),
    homeAddress: Yup.string()
      .required('Home address is required'),
    postalCode: Yup.string()
      .matches(/^\d{6}$/, 'Postal code must be exactly 6 digits and contain only numbers')
      .required('Postal code is required'),
    paymentMethod: Yup.string()
      .required('Payment method is required'),
    cardholderName: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Cardholder name must contain only letters')
      .required('Cardholder name is required'),
    cardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Card number must be exactly 16 digits and contain only numbers')
      .required('Card number is required'),
    expiryDate: Yup.string()
      .matches(/^\d{2}\/\d{2}$/, 'Expiry date must be formatted as MM/YY and contain only numbers')
      .required('Expiry date is required'),
    cvv: Yup.string()
      .matches(/^\d{3}$/, 'CVV must be exactly 3 digits and contain only numbers')
      .required('CVV is required'),
    currency: Yup.string()
      .oneOf(['USD', 'EUR', 'SGD'], 'Currency must be USD, EUR, or SGD')
      .required('Currency is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    console.log('Form values:', values);
    try {
      const response = await axios.post('http://localhost:5000/api/payments', values);
      const result = response.data;
      if (result.error) {
        setStatus({ message: result.error, type: 'error' });
        console.error('Error:', result.error);
      } else {
        setStatus({ message: 'Payment successful!', type: 'success' });
        resetForm();
        navigate('/success', { state: { paymentData: values, response: result } });
      }
    } catch (error) {
      setStatus({ message: 'Failed to process payment', type: 'error' });
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="payment-form-container">
        <h2>Payment Form</h2>
        <Formik
          initialValues={{
            amount: '',
            email: '',
            phoneNumber: '',
            homeAddress: '',
            postalCode: '',
            paymentMethod: 'Debit',
            cardholderName: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            currency: 'USD',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ status, isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <Field type="number" id="amount" name="amount" required />
                <ErrorMessage name="amount" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field type="email" id="email" name="email" placeholder="potato@gmail.com" required />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <Field type="text" id="phoneNumber" name="phoneNumber" placeholder="12345678" required />
                <ErrorMessage name="phoneNumber" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="homeAddress">Home Address</label>
                <Field type="text" id="homeAddress" name="homeAddress" required />
                <ErrorMessage name="homeAddress" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <Field type="text" id="postalCode" name="postalCode" placeholder="123456" required />
                <ErrorMessage name="postalCode" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <Field as="select" id="paymentMethod" name="paymentMethod" required>
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </Field>
                <ErrorMessage name="paymentMethod" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="cardholderName">Cardholder Name</label>
                <Field type="text" id="cardholderName" name="cardholderName" required />
                <ErrorMessage name="cardholderName" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <Field type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required />
                <ErrorMessage name="cardNumber" component="div" className="error-message" />
              </div>
              <div className="form-group expiry-group">
                <div>
                  <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                  <Field type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" required />
                  <ErrorMessage name="expiryDate" component="div" className="error-message" />
                </div>
                <div>
                  <label htmlFor="cvv">CVV</label>
                  <Field type="text" id="cvv" name="cvv" placeholder="123" required />
                  <ErrorMessage name="cvv" component="div" className="error-message" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <Field type="text" id="currency" name="currency" required />
                <ErrorMessage name="currency" component="div" className="error-message" />
              </div>
              <button type="submit" className="payment-button" disabled={isSubmitting}>
                Pay
              </button>
              {status && status.message && (
                <div className={`message ${status.type}`}>{status.message}</div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PaymentForm;
