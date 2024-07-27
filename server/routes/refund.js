const express = require('express');
const router = express.Router();
const db = require('../models');

router.post('/refundcreate', async (req, res) => {
  const {
    name, email, refundMethod, event, reason, paymentId
  } = req.body;

  console.log('Received refund request:', {
    name, email, refundMethod, event, reason, paymentId
  });

  try {
    const newRefund = await db.Refund.create({
      name, email, refundMethod, event, reason, paymentId
    });
    res.status(201).json({ message: 'Refund request created successfully', refund: newRefund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create refund request' });
  }
});

// Approve a refund request
router.post('/refund/approve/:refundId', async (req, res) => {
  const { refundId } = req.params;

  console.log('Approving refund request:', refundId);

  try {
    // Find the refund request by ID
    const refund = await db.Refund.findByPk(refundId);

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    // Update the status to 'Approved'
    refund.status = 'Approved';
    await refund.save();

    res.json({ message: 'Refund approved successfully', refund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve refund request' });
  }
});

router.get('/', async (req, res) => {
  try {
    const refunds = await db.Refund.findAll();
    res.status(200).json(refunds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve refunds' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const refund = await db.Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({ error: 'Refund request not found' });
    }
    res.status(200).json(refund);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve refund' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, email, paymentMethod, event, reason, status, paymentId
  } = req.body;

  try {
    console.log(`Fetching refund with ID: ${id}`);
    const refund = await db.Refund.findByPk(id);
    if (!refund) {
      console.log('Refund not found');
      return res.status(404).json({ error: 'Refund request not found' });
    }

    console.log('Refund found, updating...');
    refund.name = name;
    refund.email = email;
    refund.paymentMethod = paymentMethod;
    refund.event = event;
    refund.reason = reason;
    refund.status = status;
    refund.paymentId = paymentId;

    await refund.save();
    console.log('Refund updated successfully');
    res.status(200).json({ message: 'Refund updated successfully', refund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update refund' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const refund = await db.Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({ error: 'Refund request not found' });
    }

    await refund.destroy();
    res.status(200).json({ message: 'Refund deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete refund' });
  }
});

module.exports = router;