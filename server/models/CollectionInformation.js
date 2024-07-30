module.exports = (sequelize, DataTypes) => {
  const CollectInformation = sequelize.define("CollectInformation", {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    product: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    collectionId: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Not collected'
    }
  }, {
    tableName: 'collection_information' 
  });

  return CollectInformation;
};
