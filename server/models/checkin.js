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
 Name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
 paxName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paxQrCodeText: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    paxQrCodeUrl: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    qrCodeText: {
      type: DataTypes.STRING,
      allowNull: true
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
    associatedBookingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'checkins'
  });

  CheckIn.associate = models => {
    CheckIn.belongsTo(models.Booking, { foreignKey: 'associatedBookingId' });
    CheckIn.belongsTo(models.events, { foreignKey: 'eventId', as: 'eventDetails' });
  };

  return CheckIn;
};
