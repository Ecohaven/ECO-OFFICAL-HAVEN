module.exports = (sequelize, DataTypes) => {
  const Volunteer = sequelize.define('Volunteer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure email uniqueness
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    interest: {
      type: DataTypes.TEXT, // Store interests as JSON
      allowNull: true,
      get() {
        // Parse JSON string to array
        const value = this.getDataValue('interest');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        // Convert array to JSON string
        this.setDataValue('interest', JSON.stringify(value));
      }
    },
    availabilityDate: {
      type: DataTypes.DATE, // Use DATE type for dates
      allowNull: true
    }
  }, {
    tableName: 'volunteers',
    timestamps: true, // Ensure timestamps are handled if used
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return Volunteer;
};module.exports = (sequelize, DataTypes) => {
  const Volunteer = sequelize.define('Volunteer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure email uniqueness
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    interest: {
      type: DataTypes.TEXT, // Store interests as JSON
      allowNull: true,
      get() {
        const value = this.getDataValue('interest');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        // Convert array to JSON string
        this.setDataValue('interest', JSON.stringify(value));
      }
    },
    availabilityDate: {
      type: DataTypes.DATE, // Use DATE type for dates
      allowNull: true
    }
  }, {
    tableName: 'volunteers',
    timestamps: true, // Ensure timestamps are handled if used
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return Volunteer;
};