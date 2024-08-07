const express = require('express');
const router = express.Router();
const { CollectInformation, User } = require('../models'); // Adjust path as needed
const nodemailer = require('nodemailer');
const path = require('path');


function sendConfirmationEmail(email, collectionId, itemName, itemImage) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Extract the filename from the itemImage path
  const filename = path.basename(itemImage);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Collection Confirmation',
    html: `
       <div style="font-family: Arial, sans-serif; color: #white;">
    <h1 style="background-color: #14772B; padding: 10px; text-align: center; border-bottom: 1px solid #ccc;">
        EcoHaven Reward Confirmation
    </h1>
    <div style="padding: 20px;">
        <p style="color: black;">Dear Valued Customer,</p>
        <p style="color: black;">Thank you for your redemption! Here are the details of your collection:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 10px; background-color: #55d171; font-weight: bold;">Collection ID:</td>
                <td style="padding: 10px; background-color: #55d171;">${collectionId}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid black; color: black; background-color: #b9ecc5; font-weight: bold;">Item Name:</td>
                <td style="padding: 10px; border: 1px solid black; color: black; background-color: #b9ecc5;">${itemName}</td>
            </tr>
        </table>
        <p style="margin-top: 20px; color: black;">
            We appreciate your commitment to eco-friendly practices. If you have any questions or need further assistance, please don't hesitate to contact us at <a href="mailto:ecohaven787@gmail.com" style="color: #14772B; font-weight: bold;">ecohaven787@gmail.com</a>.
        </p>
        <p style="color: black;">Best regards,</p>
        <p style="color: black;">EcoHaven Team</p>
    </div>
    <footer style="background-color: #14772B; padding: 10px; text-align: center; border-top: 1px solid #ccc;">
        <p style="color: white;">&copy; 2024 EcoHaven. All rights reserved.</p>
    </footer>
</div>
    `,
    attachments: [
      {
        filename: filename,
        path: itemImage,
        cid: 'productImage'
      }
    ]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Route to send email
router.post('/send-email', async (req, res) => {
  const { email, collectionId, itemName, itemImage } = req.body; // Include itemName and itemImage here
  try {
    sendConfirmationEmail(email, collectionId, itemName, itemImage);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

//For backend 

// GET request to retrieve all collection details
router.get('/collections', async (req, res) => {
  try {
    const collections = await CollectInformation.findAll();
    res.json(collections);
  } catch (error) {
    console.error('Error retrieving collections:', error);
    res.status(400).json({ message: 'Error retrieving collections', error: error.message });
  }
});

// GET request to retrieve all collection IDs
router.get('/collectionIds', async (req, res) => {
  try {
    const collections = await CollectInformation.findAll({
      attributes: ['collectionId'] // Only retrieve the collectionId attribute
    });
    res.json(collections);
  } catch (error) {
    console.error('Error retrieving collection IDs:', error);
    res.status(400).json({ message: 'Error retrieving collection IDs', error: error.message });
  }
});


// GET request to retrieve a single collection detail by collectionId
router.get('/:collectionId', async (req, res) => {
  const collectionId = req.params.collectionId;
  try {
    const collection = await CollectInformation.findOne({
      where: { collectionId },
      attributes: ['collectionId', 'name', 'phoneNumber', 'email', 'product', 'status'], // Adjust attributes as needed
    });
    if (!collection) {
      return res.status(404).json({ message: 'Collection information not found' });
    }
    res.json(collection);
  } catch (error) {
    console.error('Error retrieving collection:', error);
    res.status(400).json({ message: 'Error retrieving collection', error: error.message });
  }

});

// GET request to retrieve collections by account name
router.get('/byAccount/:accountName', async (req, res) => {
  const { accountName } = req.params;
  try {
    const collections = await CollectInformation.findAll({
      where: { name: accountName },
      attributes: ['collectionId', 'name', 'phoneNumber', 'email', 'product', 'status'],
    });
    if (collections.length === 0) {
      return res.status(404).json({ message: 'No collections found for this account' });
    }
    res.json(collections);
  } catch (error) {
    console.error('Error retrieving collections:', error);
    res.status(400).json({ message: 'Error retrieving collections', error: error.message });
  }
});


// GET request to retrieve all collection IDs
router.get('/collectionIds', async (req, res) => {
  try {
    const collections = await CollectInformation.findAll({
      attributes: ['collectionId'] // Assuming 'collectionId' is the attribute containing the collection ID
    });
    const collectionIds = collections.map(collection => collection.collectionId); // Map to extract collectionIds
    res.json(collectionIds);
  } catch (error) {
    console.error('Error retrieving collection IDs:', error);
    res.status(400).json({ message: 'Error retrieving collection IDs', error: error.message });
  }
});




// PUT request to update collection status by ID
router.put('/collections/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const collection = await CollectInformation.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection information not found' });
    }
    const { status } = req.body;
    collection.status = status;
    await collection.save();
    res.json({ message: 'Collection status updated successfully', collection });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(400).json({ message: 'Error updating collection', error: error.message });
  }
});

// DELETE request to delete collection detail by ID
router.delete('/collections/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const collection = await CollectInformation.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection information not found' });
    }
    await collection.destroy();
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(400).json({ message: 'Error deleting collection', error: error.message });
  }
});

module.exports = router;
