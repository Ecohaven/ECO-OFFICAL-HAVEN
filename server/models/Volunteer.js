module.exports = (sequelize, DataTypes) => {
  const Volunteer = sequelize.define('Volunteer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    interest: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'volunteers'
  });

  return Volunteer;
};