module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // Changed to DECIMAL for monetary values
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [8, 8]
      }
    },
    homeAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [6, 6]
      }
    },
    paymentMethod: {
      type: DataTypes.ENUM('Debit', 'Credit'),
      allowNull: false
    },
    cardholderName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[a-zA-Z\s]+$/i
      }
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [16, 16]
      }
    },
    expiryDate: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\d{2}\/\d{2}$/i
      }
    },
    cvv: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [3, 3]
      }
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SGD'
    },
    status: {
      type: DataTypes.ENUM('Paid', 'Refunded'),
      allowNull: false,
      defaultValue: 'Paid'
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: true
    },
 eventdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qrCodeUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qrCodeText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    numberOfPax: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    }
  });

  Payment.associate = function(models) {
    Payment.hasMany(models.Refund, { foreignKey: 'paymentId', as: 'refunds' });
  };

  return Payment;
};
