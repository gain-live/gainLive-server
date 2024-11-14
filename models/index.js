const Sequelize = require('sequelize');
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const User = require('./user');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
User.initiate(sequelize);

User.associate(db);
// Comment.associate(db);


module.exports = db;


