module.exports = (sequelize, DataTypes) => {
  const Volunteer = sequelize.define('Volunteer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    interest: {
      type: DataTypes.JSON,
      allowNull: true
    },
 availabilityDate:{
  type: DataTypes.STRING,
      allowNull: true
}
  }, {
    tableName: 'volunteers'
  });

  return Volunteer;
};