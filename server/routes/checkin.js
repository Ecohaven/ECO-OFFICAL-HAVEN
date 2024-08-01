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

    // Start a transaction
    const transaction = await CheckIn.sequelize.transaction();

    try {
      // Find the check-in record by QR code text or Pax name
      let checkInRecord = await CheckIn.findOne({
        where: {
          [Op.or]: [
            { qrCodeText: data },
            { paxName: data }
          ]
        },
        transaction
      });

      if (!checkInRecord) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Check-in record not found' });
      }

      // Check if the QR code or Pax name has already been checked in
      if (checkInRecord.qrCodeStatus === 'Checked-In') {
        await transaction.rollback();
        return res.status(400).json({ error: 'Record has already been checked in' });
      }

      // Update the check-in record status
      await CheckIn.update(
        { qrCodeStatus: 'Checked-In', qrCodeChecked: true },
        { where: { id: checkInRecord.id }, transaction }
      );

      // Update booking status to Attended
      if (checkInRecord.associatedBookingId) {
        const bookingUpdateResult = await Booking.update(
          { status: 'Attended' },
          { where: { id: checkInRecord.associatedBookingId }, transaction }
        );

        console.log('Booking update result:', bookingUpdateResult);
        if (bookingUpdateResult[0] === 0) {
          console.error('Booking update failed, no rows affected.');
        }
      }

      // Optionally, update related account leaf points if needed
      if (checkInRecord.leafPoints) {
        const account = await Account.findOne({ where: { name: checkInRecord.Name }, transaction });
        if (account) {
          await Account.update(
            { leaf_points: (account.leaf_points || 0) + (checkInRecord.leafPoints || 0) },
            { where: { name: checkInRecord.Name }, transaction }
          );
        } else {
          console.warn('Account not found for accountName:', checkInRecord.Name);
        }
      }

      // Commit the transaction
      await transaction.commit();

      return res.json({ message: 'Check-in successful' });

    } catch (err) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error('Error handling check-in within transaction:', err);
      res.status(500).json({ error: 'An error occurred while handling the check-in' });
    }
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


router.post('/checkin', async (req, res) => {
  const { data } = req.body;

  console.log('Received data:', { data });

  if (!data) {
    return res.status(400).json({ error: 'Data is required' });
  }

  const transaction = await CheckIn.sequelize.transaction();

  try {
    // Find check-in record by QR code text
    let checkInRecord = await CheckIn.findOne({
      where: { qrCodeText: data },
      transaction
    });

    if (!checkInRecord) {
      // If not found by QR code, find the latest check-in record by paxName
      checkInRecord = await CheckIn.findOne({
        where: { paxName: data },
        order: [['createdAt', 'DESC']], // Ensure to order by the timestamp to get the latest record
        transaction
      });
    }

    if (!checkInRecord) {
      // If neither match, return an error
      await transaction.rollback();
      return res.status(404).json({ error: 'Check-in record not found' });
    }

    if (checkInRecord.qrCodeStatus === 'Checked-In') {
      // If already checked-in, return an error
      await transaction.rollback();
      return res.status(400).json({ error: 'QR Code or Pax Name has already been checked in' });
    }

    // Update check-in record status
    await checkInRecord.update(
      { qrCodeStatus: 'Checked-In', qrCodeChecked: true },
      { transaction }
    );

    // Update the associated account with leaf points if available
    if (checkInRecord.Name) {
      const account = await Account.findOne({
        where: { name: checkInRecord.Name },
        transaction
      });

      if (account) {
        await account.update(
          { leaf_points: (account.leaf_points || 0) + (checkInRecord.leafPoints || 0) },
          { transaction }
        );
      } else {
        console.warn('Account not found for name:', checkInRecord.Name);
      }
    }

    // Update booking status to Attended
    if (checkInRecord.associatedBookingId) {
      const bookingUpdateResult = await Booking.update(
        { status: 'Attended' },
        { where: { id: checkInRecord.associatedBookingId }, transaction }
      );

      console.log('Booking update result:', bookingUpdateResult);
      if (bookingUpdateResult[0] === 0) {
        console.error('Booking update failed, no rows affected.');
      }
    } else {
      console.warn('Associated booking ID not found for check-in record:', checkInRecord.id);
    }

    // Commit the transaction
    await transaction.commit();

    return res.json({ message: 'Check-in successful' });
  } catch (err) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    console.error('Error handling check-in:', err);
    return res.status(500).json({ error: 'An error occurred while handling the check-in' });
  }
});




module.exports = router;
