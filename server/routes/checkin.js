const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, CheckIn,events,Account } = require('../models');



// Check-in route by QR code text or Pax name
router.post('/checkin/text', async (req, res) => {
  const { data } = req.body;

  console.log('Received data:', { data });

  try {
    // Validate the input data
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Find the check-in record by QR code text or Pax name
    let checkInRecord = await CheckIn.findOne({
      where: {
        [Op.or]: [
          { qrCodeText: data },
          { paxName: data }
        ]
      }
    });

    if (!checkInRecord) {
      return res.status(404).json({ error: 'Check-in record not found' });
    }

    // Check if the QR code or Pax name has already been checked in
    if (checkInRecord.qrCodeStatus === 'Checked-In') {
      return res.status(400).json({ error: 'Record has already been checked in' });
    }

    // Update the check-in record status
    await CheckIn.update(
      { qrCodeStatus: 'Checked-In', qrCodeChecked: true },
      { where: { id: checkInRecord.id } }
    );

    // Update booking status to Attended
    if (checkInRecord.bookingId) {
      await Booking.update(
        { status: 'Attended' },
        { where: { id: checkInRecord.bookingId } }
      );
    }

    // Optionally, update related account leaf points if needed
    if (checkInRecord.leafPoints) {
      const account = await Account.findOne({ where: { name: checkInRecord.Name } });
      if (account) {
        await Account.update(
          { leaf_points: (account.leaf_points || 0) + (checkInRecord.leafPoints || 0) },
          { where: { name: checkInRecord.Name } }
        );
      } else {
        console.warn('Account not found for accountName:', checkInRecord.Name);
      }
    }

    return res.json({ message: 'Check-in successful' });

  } catch (err) {
    console.error('Error handling check-in:', err);
    res.status(500).json({ error: 'An error occurred while handling the check-in' });
  }
});



// Get all overall records of check-in
// Test URL: http://localhost:3001/checkin/records
router.get('/records', async (req, res) => {
    try {
        // Fetch all check-ins
        const checkIns = await CheckIn.findAll();

        res.json({ checkIns });
    } catch (err) {
        console.error('Error fetching check-in records:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get check-in record by booking ID
// Test URL: http://localhost:3001/checkin/records/:bookingId
router.get('/records/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId;

    try {
        // Find the booking by booking ID
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Find check-in record by bookingId
        const checkIn = await CheckIn.findOne({ where: { associatedBookingId: booking.id } });

        if (!checkIn) {
            return res.json({ message: `Booking with ID ${bookingId} has not been checked in` });
        }

        // Respond with check-in details
        res.json({
            message: `Booking with ID ${bookingId} has been checked in`,
            checkIn: checkIn.toJSON()
        });
    } catch (err) {
        console.error('Error fetching check-in record:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get check-in records by event name
router.get('/check-eventname', async (req, res) => {
    try {
        // Extract eventName from query parameters
        const { eventName } = req.query;

        if (!eventName) {
            return res.status(400).json({ error: 'Event name is required' });
        }

        // Fetch check-ins based on event name
        const checkIns = await CheckIn.findAll({
            where: { eventName: eventName }
        });

        res.json({ checkIns });
    } catch (err) {
        console.error('Error fetching check-in records by event name:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Combined check-in of pax and qrcodetext, using CAMERA SCANNING
router.post('/checkin', async (req, res) => {
  const { data } = req.body;

  console.log('Received data:', { data }); // Add logging here

  try {
    // Check for valid data
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Check if the QR code has already been scanned
    let checkInRecord = await CheckIn.findOne({ where: { qrCodeText: data } });
    
    if (checkInRecord) {
      // If the QR code has already been checked in, return an appropriate message
      if (checkInRecord.qrCodeStatus === 'Checked-In') {
        return res.status(400).json({ error: 'QR Code has already been checked in' });
      }

      // Update check-in record status
      await CheckIn.update(
        { qrCodeStatus: 'Checked-In', qrCodeChecked: true },
        { where: { id: checkInRecord.id } }
      );

      // Update the associated account with leaf points from the check-in record
      const account = await Account.findOne({ where: { name: checkInRecord.Name } }); // Use accountName field
      if (account) {
        // Ensure leaf_points is updated correctly
        await Account.update(
          { leaf_points: (account.leaf_points || 0) + (checkInRecord.leafPoints || 0) },
          { where: { name: checkInRecord.Name } } // Use accountName field
        );
      } else {
        console.warn('Account not found for accountName:', checkInRecord.Name);
      }

      // Update booking status based on QR code check-in
      await Booking.update(
        { status: 'Checked-In' },
        { where: { bookingId: checkInRecord.bookingId } } // Adjust based on schema
      );

      return res.json({ message: 'Check-in by QR Code successful' });
    }

    // If not found by qrCodeText, check by paxName
    checkInRecord = await CheckIn.findOne({ where: { paxName: data } });
    if (checkInRecord) {
      // Update check-in record status
      await CheckIn.update(
        { qrCodeStatus: 'Checked-In', qrCodeChecked: true },
        { where: { id: checkInRecord.id } }
      );

      // No account update for paxName
      // Update booking status based on paxName check-in
      await Booking.update(
        { status: 'Checked-In' },
        { where: { bookingId: checkInRecord.bookingId } } // Adjust based on schema
      );

      return res.json({ message: 'Check-in by Pax Name successful' });
    }

    // If neither match, return an error
    return res.status(404).json({ error: 'Check-in record not found' });

  } catch (err) {
    console.error('Error handling check-in:', err);
    res.status(500).json({ error: 'An error occurred while handling the check-in' });
  }
});




module.exports = router;
