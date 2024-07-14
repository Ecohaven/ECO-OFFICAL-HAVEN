// Define the CheckIn model
module.exports = (sequelize, DataTypes) => {
  const CheckIn = sequelize.define('CheckIn', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    qrCodeText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qrCodeChecked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    qrCodeStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Not Checked'
    },
    leafPoints: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
 eventId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  eventName: {
      type: DataTypes.STRING,
      allowNull: true
    },

  }, {
    tableName: 'checkins'
  });

  CheckIn.associate = models => {
    CheckIn.belongsTo(models.Booking, { foreignKey: 'associatedBookingId' });
    CheckIn.belongsTo(models.events, { foreignKey: 'eventId' }); 
  };

  return CheckIn;
};
