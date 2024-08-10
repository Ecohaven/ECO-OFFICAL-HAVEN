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
            type: DataTypes.ENUM('Admin', 'Staff', 'Event Manager', 'Rewards Manager', 'Customer Support'),
            allowNull: false,
            defaultValue: 'Staff'
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
            type: DataTypes.ENUM('Activated', 'Deactivated'),
            allowNull: false,
            defaultValue: 'Activated'
        },
        // New fields for password reset
        verificationCode: {
            type: DataTypes.STRING(6),
            allowNull: true
        },
        verificationCodeExpires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: 'StaffAccounts',
    })
    return StaffAccount;
}