module.exports = (sequelize, DataTypes) => {
    const StaffAccount = sequelize.define("StaffAccount", {
        name: {
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
        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING(100), // hashed password
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Active', 'Inactive'),
            allowNull: false,
            defaultValue: 'Active'
        }
    },
    {
        tableName: 'StaffAccounts',
    })
    return StaffAccount;
}