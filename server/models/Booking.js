module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    numberOfPax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    paxName: {
      type: DataTypes.JSON, // Store names as a JSON array
      allowNull: true,
    },
paxQrCodeRecords: {
    type: DataTypes.JSON,
    allowNull: true, // Allow null because not all bookings will have pax
  },
paxEmail: {
      type: DataTypes.JSON, // Store emails as a JSON array
      allowNull: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active', 
      allowNull: true
    },
    leafPoints: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    qrCodeText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qrCodeUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'bookings'
  });

  // Define associations
  Booking.associate = models => {
    Booking.belongsTo(models.events, { foreignKey: 'eventId', as: 'eventDetails' });
    Booking.hasMany(models.CheckIn, { foreignKey: 'associatedBookingId', as: 'checkIns' });
  };

  return Booking;
};
