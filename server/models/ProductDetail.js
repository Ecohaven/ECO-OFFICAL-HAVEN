const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

// multer configuration
const storage = multer.diskStorage({

  // destination of uploaded files
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // uploads directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // unique suffix using current timestamp & random number
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB file size limit
}).single('file'); // field name for file input

module.exports = (sequelize) => {
  const ProductDetail = sequelize.define('ProductDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    itemName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    leaves: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50), // Adjust the size as necessary
      allowNull: false,
    },
    itemimg: {
      type: DataTypes.STRING(100), // adjust size as necessary
      allowNull: true, // depending on your application logic
    }
  }, {
    tableName: 'product_details',
    hooks: {
      // hook to delete file from uploads directory when a record is deleted
      beforeDestroy: (instance, options) => {
        if (instance.imageFile) {
          const filePath = path.join(__dirname, '..', 'uploads', instance.imageFile);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
  });

  // method to handle file upload
  ProductDetail.uploadProductImage = function (req, res, callback) {
    upload(req, res, function (err) {
      if (err) {
        return callback(err);
      }
      // file uploaded successfully, save file path in database
      const filePath = req.file ? req.file.path : null;
      callback(null, filePath);
    });
  };

  return ProductDetail;
};
