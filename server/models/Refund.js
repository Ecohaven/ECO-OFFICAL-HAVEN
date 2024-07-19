module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define('Refund', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[a-zA-Z\s]+$/i,
        notEmpty: true
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    refundMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Debit', 'Credit']] // Assuming refund methods are Debit and Credit
      }
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending'
    },
    paymentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Payments',
        key: 'id'
      },
      allowNull: false
    }
  });

  Refund.associate = function(models) {
    Refund.belongsTo(models.Payment, { foreignKey: 'paymentId', as: 'payment' });
  };

  return Refund;
};
