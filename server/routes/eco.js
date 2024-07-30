const express = require('express');
const router = express.Router();
const { ProductDetail,Account,CollectInformation } = require('../models'); // Adjust this import based on your project structure
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const yup = require('yup');

// Validation schema for the redeem request
const redeemValidationSchema = yup.object().shape({
  accountId: yup.number().required(),
  productName: yup.string().required()
});

// multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'itemuploads/'); // uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB file size limit
}).single('file'); // field name for file input

// validation schema using yup
const validationSchema = yup.object({
  itemName: yup.string().trim().min(3).max(100).required(),
  leaves: yup.number().min(0).required(),
  stock: yup.number().min(0).required(),
  code: yup.string().trim().min(3).max(50).required(),
  category: yup.string().trim().required()
});

// POST route to create a new product detail with file upload
router.post('/product-detail', upload, async (req, res) => {
  try {
    // validate request body (excluding file) using yup schema
    const { itemName, leaves, stock, code, category } = req.body;
    await validationSchema.validate({ itemName, leaves, stock, code, category }, { abortEarly: false });

    // create new product detail
    const newItem = await ProductDetail.create({
      itemName,
      leaves,
      stock,
      code,
      category,
      itemimg: req.file ? req.file.filename : null // save file filename in the database
    });

    res.status(201).json(newItem); // respond with the newly created product detail
  } catch (error) {
    res.status(400).json({ message: 'Error adding item', error: error.message });
  }
});

// GET route to fetch all product details
router.get('/product-detail', async (req, res) => {
  let condition = {};
  let search = req.query.search;
  if (search) {
    condition[Op.or] = [
      { itemName: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } },
      { itemimg: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const ItemList = await ProductDetail.findAll({
      where: condition,
      order: [['createdAt', 'DESC']]
    });
    res.json(ItemList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item list', error: error.message });
  }
});

// GET route to fetch a single product detail by id
router.get('/product-detail/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const itemtDetail = await ProductDetail.findByPk(id);
    if (!itemtDetail) {
      res.sendStatus(404);
      return;
    }

    // assuming prodimg contains the filename of the uploaded image
    const filename = productDetail.itemimg;

    // return the image file path
    res.sendFile(path.join(__dirname, '../itemuploads', filename));
  } catch (error) {
    res.status(500).json({ message: `Error fetching item with id ${id}`, error: error.message });
  }
});

// route to serve images based on filename
router.get('/product-images/:filename', (req, res) => {
  const filename = req.params.filename;
  // construct the path to the image file
  const imagePath = path.join(__dirname, '../itemuploads', filename); // adjust the path as per your file storage location

  // send the file as a response
  res.sendFile(imagePath);
});


// PUT route to update a product detail by id
router.put('/product-detail/:id', upload, async (req, res) => {
  const id = req.params.id;
  try {
    let itemDetail = await ProductDetail.findByPk(id);
    if (!itemDetail) {
      res.sendStatus(404);
      return;
    }

    // validate request body (excluding file) using yup schema
    const { itemName, leaves, stock, code, category } = req.body;
    await validationSchema.validate({ itemName, leaves, stock, code, category }, { abortEarly: false });

    // update product detail
    const updatedFields = {
      itemName,
      leaves,
      stock,
      code,
      category,
      itemimg: req.file ? req.file.filename : itemDetail.itemimg // update file path if new file uploaded
    };
    const updatedItem = await itemDetail.update(updatedFields);

    res.json({ message: 'Item detail updated successfully', item: updatedItem });
  } catch (error) {
    res.status(400).json({ message: `Error updating item with id ${id}`, error: error.message });
  }
});

// DELETE route to delete a product detail by id
router.delete('/product-detail/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const num = await ProductDetail.destroy({ where: { id: id } });
    if (num === 1) {
      res.json({ message: 'Item detail deleted successfully' });
    } else {
      res.status(400).json({ message: `Cannot delete item detail with id ${id}` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting item with id ${id}`, error: error.message });
  }
});


// POST route to redeem a product and create a new collection entry
router.post('/redeem', async (req, res) => {
  try {
    // Validate the request body
    const { accountId, productName, phoneNumber, email } = req.body;
    await redeemValidationSchema.validate({ accountId, productName }, { abortEarly: false });

    // Fetch the product detail by productName
    const product = await ProductDetail.findOne({ where: { itemName: productName } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch the user's account
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if the user has enough leaf points and if the product is in stock
    const leavesRequired = product.leaves;
    if (account.leaf_points < leavesRequired) {
      return res.status(400).json({ message: 'Insufficient leaf points' });
    }
    if (product.stock < 1) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Deduct the required leaves from the user's account and reduce the product stock by 1
    account.leaf_points -= leavesRequired;
    product.stock -= 1;
    await account.save();
    await product.save();

    // Generate a random 6-digit collectionId
    const collectionId = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new collection entry
    const newCollection = await CollectInformation.create({
      name: account.name,
      phoneNumber,
      email,
      product: productName,
      collectionId
    });

    res.status(200).json({ message: 'Product redeemed successfully', newCollection });
  } catch (error) {
    console.error('Error redeeming product and creating collection:', error);
    res.status(400).json({ message: 'Error redeeming product and creating collection', error: error.message });
  }
});
module.exports = router;
