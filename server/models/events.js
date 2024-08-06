// Define the Event model
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('events', {
    eventId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('recycling', 'upcycling', 'workshop', 'garden-walk'),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('startDate');
        return rawValue ? new Date(rawValue).toISOString().split('T')[0] : null; // Format as yyyy-MM-dd
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('endDate');
        return rawValue ? new Date(rawValue).toISOString().split('T')[0] : null; // Format as yyyy-MM-dd
      },
      validate: {
        isAfterStartDate() {
          if (this.endDate < this.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    chosenDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Paid','Free'),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    organiser: {
      type: DataTypes.STRING,
      allowNull: false
    },
    leafPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'events' // Specify the table name explicitly
  });

  // Define associations
  Event.associate = models => {
    Event.hasMany(models.Booking, { foreignKey: 'eventId' });
      Event.hasMany(models.CheckIn, { foreignKey: 'eventId' });

  };

  return Event;
};
