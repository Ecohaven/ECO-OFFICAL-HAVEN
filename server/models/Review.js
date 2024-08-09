module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
        max: 5,
      },
      set(value) {
        // Ensure rating is an integer between 1 and 5, in case frontend sends invalid data
        this.setDataValue('rating', Math.min(Math.max(parseInt(value, 10), 1), 5));
      },
    },
    reviewDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Review;
};
