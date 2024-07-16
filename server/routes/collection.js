// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const { CollectInformation, User } = require('../models'); // Adjust path as needed

// POST /collect/collections
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, email, product } = req.body;
    console.log('Received data:', { name, phoneNumber, email, product }); // Log received data

    // Generate a random 6-digit collectionId
    const collectionId = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new collection entry
    const newCollection = await CollectInformation.create({
      name: accountName, // Assuming accountName corresponds to the field in your model
      phoneNumber,
      email,
      product, // Ensure field name matches your model
      collectionId
    });

    res.status(201).json(newCollection);
  } catch (error) {
    console.error('Error adding collection:', error);
    res.status(400).json({ message: 'Error adding collection', error: error.message });
  }
});


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


// GET request to retrieve collection details by account name
router.get('/byAccount/:accountName', async (req, res) => {
  const accountName = req.params.accountName;

  try {
    const collections = await CollectInformation.findAll({
      where: {
        name: accountName // Adjust 'name' if it represents accountName in your CollectInformation model
      },
      attributes: ['collectionId', 'name', 'product', 'status'], // Adjust attributes as needed
    });

    if (collections.length === 0) {
      return res.status(404).json({ message: 'No collections found for this account' });
    }

    res.json(collections);
  } catch (error) {
    console.error('Error retrieving collections by account:', error);
    res.status(400).json({ message: 'Error retrieving collections', error: error.message });
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
