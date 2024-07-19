// Define the Booking model
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
    chosenDate: {
      type: DataTypes.DATEONLY, 
      allowNull: true
    },
    numberOfPax: {
      type: DataTypes.INTEGER,
      allowNull: false
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
      defaultValue: 'Active', // Corrected default value assignment
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
    Booking.hasMany(models.CheckIn, { foreignKey: 'associatedBookingId' , as: 'checkIns'});
  };

  return Booking;
};
