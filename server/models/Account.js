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
        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'User'
        },
        profile_pic: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        leaf_points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10
        },
        status: {
            type: DataTypes.ENUM('Activated', 'Deactivated'),
            allowNull: false,
            defaultValue: 'Activated'
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
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
            tableName: 'Accounts',
        });
    return Account;
}