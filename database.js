// ЗДЕСЬ ПРОИСХОДИТ ТОЛЬКО ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ,
// В ТОЧНОСТИ - ИМПОРТ И ЭКСПОРТ, СОЗДАНИЕ И УДАЛЕНИЕ.
// НЕ НУЖНО ВКЛЮЧАТЬ СЮДА ОСТАЛЬНЫЕ ВЗАИМОДЕЙСТВИЯ.

const 	Sequelize = require('sequelize');
const 	Discord = require('discord.js');
const { getEmbed_UnknownError,
		getEmbed_Register } = require('./embedMessages.js');
const { bot,
		chatChannelID,
		guildID,
		roleAdministratorID,
		roleModeratorID,
		roleSupportID,
		roleBannedID,
		ownerID } = require('./config.js');


const database = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./database.sqlite',
});


// DataGeneral
// DataTimings
// DataClans
// DataAchivements

const databaseUsers = database.define('users', {
    userid: 		{ type: Sequelize.STRING, 	unique: true },
	description: 	{ type: Sequelize.TEXT },
	registration:	{ type: Sequelize.DATE, 	defaultValue: new Date() },
    rating: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
	money: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	
	wins: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeats: 		{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	winsComplete: 	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeatsComplete:{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },

	banned: 		{ type: Sequelize.DATE },
	mutedvoice: 	{ type: Sequelize.DATE },
	mutedchat: 		{ type: Sequelize.DATE },

	karma: 			{ type: Sequelize.INTEGER, 	defaultValue: 50,			allowNull: false },
	likes:			{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	dislikes: 		{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },

	achievements: 	{ type: Sequelize.STRING, 	defaultValue: '000000', 	allowNull: false },
});


async function getUserdata(userID){
	try{
		userdata = await databaseUsers.findOne({ where: { userid: userID } });
		if(!userdata){
			await createUserdata(userID);
			userdata = await databaseUsers.findOne({ where: { userid: userID } });
		}
		return userdata;
	} catch (errorGetUserdata){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetUserdata"));
	}
}

async function createUserdata(userID){
	try{
		user = bot.guilds.cache.get(guildID).members.cache.get(userID).user;
		await bot.channels.cache.get(chatChannelID).send(getEmbed_Register(user));
		return await databaseUsers.create({userid: userID});
	} catch (errorCreateUserdata) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorCreateUserdata"));
	}
}

async function getAllUserdataBanned(){
	try{
		return await databaseUsers.findAll( {where: { banned: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataBanned) {
		return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("getAllUserdataBanned"));
	}
}

async function getAllUserdataMuted(){
	try{
		return await databaseUsers.findAll( {where: { mutedvoice: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataMuted) {
		return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetUserdataMuted"));
	}
}

async function getAllUserdataNoChat(){
	try{
		return await databaseUsers.findAll( {where: { mutedchat: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataNoChat) {
		return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("getAllUserdataNoChat"));
	}
}

async function updateUserdataBanned(userID, bannedStatus){
	try{
		userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ banned: bannedStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataBanned){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataBanned"));
	}
}

async function updateUserdataMuted(userID, mutedStatus){
	try{
		userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ mutedvoice: mutedStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataMuted){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataMuted"));
	}
}

async function updateUserdataNochat(userID, nochatStatus){
	try{
		userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ mutedchat: nochatStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataNochat){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataNochat"));
	}
}

async function updateUserdataRating(userID, ratingNew){
	try{
		userdata = await getUserdata(userID);
		if (!userdata)
			await createUserdata(userID);
		return await databaseUsers.update({ rating: ratingNew }, { where: { userid: userID } });
	} catch (errorUpdateUserdataRating){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataRating"));
	}
}

async function updateUserdataKarma(userID, karmaNew){
	try{
		userdata = await getUserdata(userID);
		if (!userdata)
			await createUserdata(userID);
		return await databaseUsers.update({ karma: karmaNew }, { where: { userid: userID } });
	} catch (errorUpdateUserdataKarma){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataKarma"));
	}
}

async function updateUserdataLikeIncrement(userID){
	try{
		userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ likes: userdata.likes+1 }, { where: { userid: userID } });
	} catch (errorUpdateUserdataLikeIncrement){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataLikeIncrement"));
	}
}

async function updateUserdataDislikeIncrement(userID){
	try{
		userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ dislikes: userdata.dislikes+1 }, { where: { userid: userID } });
	} catch (errorUpdateUserdataLikeIncrement){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataDislikeIncrement"));
	}
}

function syncDatabase(){
	databaseUsers.sync();
}

function hasPermissionLevel(user, level){ 	// 0 - бан, 1 - общий, 2 - стажёр, 3 - модератор, 4 - администратор, 5 - владелец.
	let currentLevel = 1;
	if (user.roles.cache.has(roleSupportID))
		currentLevel = 2;
	else if (user.roles.cache.has(roleModeratorID))
		currentLevel = 3;
	else if (user.roles.cache.has(roleAdministratorID))
		currentLevel = 4;
	if(user.roles.cache.has(roleBannedID))
		currentLevel = 0;
	if (user.id == ownerID)
		currentLevel = 5;
	return (level <= currentLevel);
}

module.exports = { 
	getUserdata,
	createUserdata,
	syncDatabase,
	hasPermissionLevel,

	updateUserdataRating,
	updateUserdataKarma,
	updateUserdataLikeIncrement,
	updateUserdataDislikeIncrement,

	updateUserdataBanned,
	updateUserdataMuted,
	updateUserdataNochat,
	getAllUserdataBanned,
	getAllUserdataMuted,
	getAllUserdataNoChat
}
