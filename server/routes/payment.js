const express = require('express');
const router = express.Router();
const db = require('../models');
const { processPayment } = require('../mockpayment');

// Utility function to check for missing fields
const checkMissingFields = (requiredFields, data) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  return missingFields;
};

// Route for processing payments
router.post('/', async (req, res) => {
  const requiredFields = [
    'amount', 'email', 'phoneNumber', 'homeAddress', 'postalCode', 
    'paymentMethod', 'cardholderName', 'cardNumber', 'expiryDate', 'cvv', 'currency'
  ];
  const missingFields = checkMissingFields(requiredFields, req.body);

  console.log('Received data:', req.body); // Log received data
  console.log('Missing fields:', missingFields); // Log missing fields

  if (missingFields.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missingFields });
  }

  const { amount, email, phoneNumber, homeAddress, postalCode, paymentMethod, cardholderName, cardNumber, expiryDate, cvv, currency } = req.body;

  try {
    // Simulate payment processing
    const paymentResult = await processPayment(req.body);

    if (!paymentResult.success) {
      return res.status(500).json({ error: paymentResult.message });
    }

    const newPayment = await db.Payment.create({
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
      status: 'Paid'
    });

    res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
  } catch (err) {
    console.error(err);
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


// GET payment by ID
router.get('/:id', async (req, res) => { // Ensure this endpoint is correct
  const { id } = req.params;
  try {
    const payment = await db.Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve payment' });
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