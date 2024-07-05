'use strict';

// This file creates the sequelize instance and reads the model files from the same directory

const fs = require('fs'); // File system module
const path = require('path'); // Path module
const Sequelize = require('sequelize'); // Sequelize module
const process = require('process'); // Process module
const basename = path.basename(__filename); // Get the base name of the file
const db = {}; // Create an empty object to store the models
require('dotenv').config(); // Read from .env file

// Create sequelize instance using config 
let sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        timezone: '+08:00'
    }
    );
fs
    .readdirSync(__dirname)
    .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && 
        (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, 
        Sequelize.DataTypes);
        db[model.name] = model;
    });
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;