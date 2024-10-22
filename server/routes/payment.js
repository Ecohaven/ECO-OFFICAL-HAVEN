const express = require('express');
const router = express.Router();
const db = require('../models');
const { Account,Payment } = require('../models');
const { processPayment } = require('./mockpayment');

// Utility function to check for missing fields
const checkMissingFields = (requiredFields, data) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  return missingFields;
};

/// Route for processing payments
router.post('/', async (req, res) => {
  const requiredFields = [
    'amount', 'email', 'phoneNumber', 'homeAddress', 'postalCode', 
    'paymentMethod', 'cardholderName', 'cardNumber', 'expiryDate', 'cvv',
    'eventName', 'Name', 
  ];

  const missingFields = checkMissingFields(requiredFields, req.body);

  // Log received data and missing fields
  console.log('Received data:', req.body);
  console.log('Missing fields:', missingFields);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missingFields });
  }

  const {
    amount, email, phoneNumber, homeAddress, postalCode, paymentMethod,
    cardholderName, cardNumber, expiryDate, cvv, eventName, Name, numberOfPax, eventdate,
  } = req.body;

  try {
    // Simulate payment processing
    const paymentResult = await processPayment({
      amount, cardNumber, cardholderName, expiryDate, cvv
    });

    if (!paymentResult.success) {
      return res.status(500).json({ error: paymentResult.message });
    }

   
    const newPayment = await db.Payment.create({
      eventName,
      eventdate,
      amount,
      email,
      phoneNumber,
      homeAddress,
      postalCode,
      paymentMethod,
      cardholderName,
      cardNumber,
      expiryDate,
      cvv,
      currency: paymentResult.currency,
      status: 'Paid',
      Name,
      numberOfPax
    });

    // Return the payment ID and other relevant details
    res.status(201).json({
      message: 'Payment created successfully',
      payment: {
        id: newPayment.id,
        eventName,
        eventdate,
        amount,
        email,
        phoneNumber,
        homeAddress,
        postalCode,
        paymentMethod,
        cardholderName,
        cardNumber,
        expiryDate,
        cvv,
        currency: paymentResult.currency,
        status: 'Paid',
        Name,
        numberOfPax
      }
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});



// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await db.Payment.findAll({
      include: [
        {
          model: db.Refund,
          as: 'refunds'
        }
      ]
    });
    res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});



// GET request to retrieve payments by email or phone number
router.get('/by-contact', async (req, res) => {
  const { email, phoneNumber } = req.query; // Use query parameters for email and phoneNumber

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    // Define query conditions based on provided parameters
    const queryConditions = {};
    if (email) {
      queryConditions.email = email;
    }
    if (phoneNumber) {
      queryConditions.phoneNumber = phoneNumber;
    }

    // Fetch payments based on query conditions
    const payments = await db.Payment.findAll({
      where: queryConditions,
      attributes: [
        'id', 'eventName', 'amount', 'email', 'phoneNumber', 
        'homeAddress', 'postalCode', 'paymentMethod', 'cardholderName', 
        'cardNumber', 'expiryDate', 'cvv', 'currency', 'status'
      ] // Include all relevant fields
    });

    if (payments.length === 0) {
      return res.status(404).json({ error: 'No payments found for the given contact information' });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error retrieving payments:', error);
    res.status(500).json({ error: 'Failed to retrieve payments', message: error.message });
  }
});




// GET payments by payment method
router.get('/method/:method', async (req, res) => { // Ensure this endpoint is correct
  const { method } = req.params;
  if (method !== 'Debit' && method !== 'Credit') {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  try {
    const payments = await db.Payment.findAll({
      where: {
        paymentMethod: method
      }
    });
    if (payments.length === 0) {
      return res.status(404).json({ error: 'No payments found for the given method' });
    }
    res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

// UPDATE payment by ID
router.put('/:id', async (req, res) => { // Ensure this endpoint is correct
  const { id } = req.params;
  const requiredFields = [
    'amount', 'email', 'phoneNumber', 'homeAddress', 'postalCode', 
    'paymentMethod', 'cardholderName', 'cardNumber', 'expiryDate', 'cvv', 'currency'
  ];
  const missingFields = checkMissingFields(requiredFields, req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missingFields });
  }

  const { amount, email, phoneNumber, homeAddress, postalCode, paymentMethod, cardholderName, cardNumber, expiryDate, cvv, currency } = req.body;

  try {
    const payment = await db.Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment details
    payment.amount = amount;
    payment.email = email;
    payment.phoneNumber = phoneNumber;
    payment.homeAddress = homeAddress;
    payment.postalCode = postalCode;
    payment.paymentMethod = paymentMethod;
    payment.cardholderName = cardholderName;
    payment.cardNumber = cardNumber;
    payment.expiryDate = expiryDate;
    payment.cvv = cvv;
    payment.currency = currency || 'SGD'; // Default to SGD if not provided

    await payment.save();
    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// DELETE payment by ID
router.delete('/:id', async (req, res) => { // Ensure this endpoint is correct
  const { id } = req.params;

  try {
    const payment = await db.Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.destroy();
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;
