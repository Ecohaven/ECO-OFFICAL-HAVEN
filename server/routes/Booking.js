const express = require('express');
const router = express.Router();
const QRCodeLib = require('qrcode')
const { Booking,CheckIn,Event,Payment } = require('../models');
const yup = require('yup');
const { Op } = require("sequelize");

// Define the validation schema for bookings
//Booking date only needed for event 1 or 2 the rest booking date are allowed to be null -- tentative settings 
const validationSchema = yup.object({
  email: yup.string().trim().email().required(),
  phoneNumber: yup.string().trim().required(),
  numberOfPax: yup.number().required(),
});

// Function to generate custom ID
function generateCustomId() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${timestamp}-${randomString}`;
}
//generating random text for qr code 
function generateRandomText(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
// Booking creation route
router.post("/", async (req, res) => {
    let data = req.body;
    try {
        // Validate the data
        data = await validationSchema.validate(data, { abortEarly: false });

        // Generate custom ID
        data.id = generateCustomId();

        // Generate QR code text and URL
        const qrCodeText = generateRandomText(5);
        const qrCodeUrl = await QRCodeLib.toDataURL(qrCodeText);
        data.qrCodeText = qrCodeText;
        data.qrCodeUrl = qrCodeUrl;

        // Set status as active by default
        data.status = 'Active';

        // Set createdAt field to current date and time
        data.createdAt = new Date();

        // Create the booking
        let result = await Booking.create(data);

        // Create the corresponding check-in record
        await CheckIn.create({ associatedBookingId: result.id, qrCodeText: qrCodeText });

        res.json(result);
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(400).json({ errors: err.errors });
    }
});

// GET route to fetch all bookings
router.get("/", async (req, res) => {
  let condition = {};
  let search = req.query.search;
  if (search) {
    condition[Op.or] = [
      { id: { [Op.like]: `%${search}%` } },
      { Name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phoneNumber: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
      { event: { [Op.like]: `%${search}%` } },
      { bookingDate: { [Op.like]: `%${search}%` } },
      { numberOfPax: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    let bookings = await Booking.findAll({
      where: condition,
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Route to fetch booking details by account name
router.get("/account/:accountName/bookings", async (req, res) => {
  const { accountName } = req.params;

  try {
    // Find bookings associated with the accountName
    const bookings = await Booking.findAll({
      where: { Name: accountName }, // Adjust based on your actual model field for account name
      attributes: ['id', 'eventName', 'qrCodeText', 'qrCodeUrl','status'] // Specify booking attributes to retrieve
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ error: 'No bookings found for this account' });
    }

    res.json(bookings); // Return bookings as JSON response
  } catch (error) {
    console.error('Error fetching bookings by accountName:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET request to fetch booking details by bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // Query the database using Sequelize to find the booking by its bookingId
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] } // Example: Exclude timestamps if not needed
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Return the booking details as JSON response
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by bookingId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//GET QR code by booking ID
// /qr-code/(QRCODETEXT)
router.get("/qr-code/:qrCodeText", async (req, res) => {
  const qrCodeText = req.params.qrCodeText;
try{
//find associated qr code in the booking by ID
const booking = await Booking.findOne({where: {qrCodeText}});
if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking by QR code:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE REQUEST Updating id 
router.put("/:id", async (req, res) => {
  let id = req.params.id;
  let data = req.body;
  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    let booking = await Booking.findByPk(id);

    if (!booking) {
      res.status(404).json({ error: 'Booking cannot be found' });
      return;
    }

    await Booking.update(data, { where: { id: id } });
    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

// Cancelling booking request
router.put('/cancel/:id', async (req, res) => {
    const bookingId = req.params.id;

    try {
        // Find the booking by ID including associated check-ins
        const booking = await Booking.findByPk(bookingId, {
            include: { model: CheckIn, as: 'checkIns' }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update the status to 'Cancelled' in booking
        await booking.update({ status: 'Cancelled' });

        // Update checkIn.qrCodeStatus to 'Cancelled' if checkIns exist
        if (booking.checkIns && booking.checkIns.length > 0) {
            for (let checkIn of booking.checkIns) {
                await checkIn.update({ qrCodeStatus: 'Cancelled' });
            }
        }

        // Fetch the updated booking with the new status and check-ins
        const updatedBooking = await Booking.findByPk(bookingId, {
            include: { model: CheckIn, as: 'checkIns' }
        });

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Updated booking not found' });
        }

        // Now you can perform operations with updatedBooking.status or any other properties

        res.json({ message: 'Booking has been cancelled successfully', booking: updatedBooking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).send('Server error');
    }
});




// specific route in backend for updating 
router.put("/:id/update-details", async (req, res) => {
    try {
        // Extract the ID from the request parameters
        const id = req.params.id;
        
        // Extract the updated details 
        const { numberOfPax,event } = req.body;

     
        const booking = await Booking.findByPk(id);

     
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // iimportant to store updated details 
        booking.numberOfPax = numberOfPax;
        booking.event = event;
        await booking.save();


        return res.status(200).json({ message: 'Details has been updated successfully' });
    } catch (error) {
        console.error('Error updating number of pax:', error);
        return res.status(500).json({ error: 'An error occurred while updating the number of pax' });
    }
});


module.exports = router;
