const express = require('express');
const router = express.Router();
const { Booking, CheckIn,events } = require('../models');


// Check-in route by QR code text
router.post('/check-in/:qrCodeText', async (req, res) => {
    const qrCodeText = req.params.qrCodeText;

    try {
        // Find the booking using qrCodeText and include the associated event
        const booking = await Booking.findOne({
            where: { qrCodeText },
            include: [
                {
                    model: events,
                    as: 'eventDetails', // Use the alias 'eventDetails' as specified in the association
                    attributes: ['eventId', 'eventName'] // Include only the id and name attributes of the event
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found for the provided QR code' });
        }

        // Retrieve leaf points from the booking
        const leafPoints = booking.leafPoints || 0; // Default to 0 if leafPoints not available

        // Check if QR code is already checked in
        let checkIn = await CheckIn.findOne({ where: { associatedBookingId: booking.id } });

        if (checkIn && checkIn.qrCodeChecked) {
            return res.status(400).json({ error: 'QR code has already been checked in' });
        }

        // Update or create the check-in record with the check-in time and mark it as checked in
        if (checkIn) {
            checkIn = await checkIn.update({
                checkInTime: new Date(),
                qrCodeChecked: true,
                associatedBookingId: associatedBookingId,
                qrCodeStatus: 'Checked',
                leafPoints: booking.leafPoints, // Update leafPoints if necessary 
                eventId: booking.eventDetails.eventId,
                eventName: booking.eventDetails.eventName // Update eventName in CheckIn
            });
        } else {
            checkIn = await CheckIn.create({
               associatedBookingId: associatedBookingId,
                qrCodeText: booking.qrCodeText,
                checkInTime: new Date(),
                qrCodeChecked: true,
                qrCodeStatus: 'Checked',
                leafPoints: booking.leafPoints, // Store leafPoints from the booking
                eventId: booking.eventDetails.eventId,
                eventName: booking.eventDetails.eventName // Store eventName in CheckIn
            });
        }

        // Update the booking status to 'Attended'
        await booking.update({
            status: 'Attended'
        });
        const response = {
            message: 'Check-in successful',
            bookingId: booking.id,
            checkIn,
            leafPoints
        };

        res.json(response);
    } catch (err) {
        console.error('Error during check-in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Test URL: http://localhost:3001/checkin/check-in/:qrCodeText
// To see if this particular qrCodeText has been checked in
router.get('/check-in/:qrCodeText', async (req, res) => {
    const qrCodeText = req.params.qrCodeText;

    try {
        // Find the booking by QR code text and include the associated event details
        const booking = await Booking.findOne({
            where: { qrCodeText },
            include: [
                {
                    model: events, 
                    as: 'eventDetails',
                    attributes: ['eventId', 'eventName'] // Include only the id and name attributes of the event
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found for the provided QR code' });
        }

        // Find check-in record by bookingId
        const checkIn = await CheckIn.findOne({ where: { associatedBookingId: booking.id } });

        if (!checkIn) {
            return res.status(404).json({ error: 'Check-in record not found for the provided QR code' });
        }

        res.json({
            message: `${qrCodeText} has been recorded and checked in successfully`,
            checkIn
        });
    } catch (err) {
        console.error('Error fetching check-in record:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


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

//check in by qr code 
router.post('/checkinbycam', async (req, res) => {
    const { qrCodeText } = req.body;

    if (!qrCodeText) {
        return res.status(400).json({ error: 'No QR code text provided' });
    }

    try {
        // Find the booking using qrCodeText
        const booking = await Booking.findOne({ where: { qrCodeText } });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found for the provided QR code' });
        }

        // Update booking status to 'checked' or similar
        booking.status = 'checked';
        await booking.save();

        // Create check-in record
        const checkIn = await CheckIn.create({
            associatedBookingId: associatedBookingId,
            qrCodeText: booking.qrCodeText,
            checkInTime: new Date(),
            qrCodeChecked: true,
            qrCodeStatus: 'Checked',
            leafPoints: booking.leafPoints
        });

        res.json({ message: 'Check-in successful', checkIn });
    } catch (err) {
        console.error('Error during check-in by QR code:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
