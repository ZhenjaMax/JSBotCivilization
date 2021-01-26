const Sequelize = require('sequelize');

const database = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./database.sqlite', 	//SQLite only
});

const databaseUsers = database.define('users', {    // Здесь и далее содержится описание базы данных
    userid: 		{ type: Sequelize.STRING, 	unique: true },
    description: 	{ type: Sequelize.TEXT },
    rating: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
    money: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	wins: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeats: 		{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	winsComplete: 	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeatsComplete:{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	achievements: 	{ type: Sequelize.STRING, 	defaultValue: '000000', 	allowNull: false },
	banned: 		{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	karma: 			{ type: Sequelize.INTEGER, 	defaultValue: 50,			allowNull: false },
});

module.exports = { database, databaseUsers }
