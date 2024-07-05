module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define("Account", {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        phone_no: {
            type: DataTypes.STRING(8),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100), // hashed password
            allowNull: false
        },
        profile_pic: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    }, 
    {
        tableName: 'Accounts',
    });
    return Account;
}