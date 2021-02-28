// ЗДЕСЬ ПРОИСХОДИТ ТОЛЬКО ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ,
// В ТОЧНОСТИ - ИМПОРТ И ЭКСПОРТ, СОЗДАНИЕ И УДАЛЕНИЕ.
// НЕ НУЖНО ВКЛЮЧАТЬ СЮДА ОСТАЛЬНЫЕ ВЗАИМОДЕЙСТВИЯ.

const 	Sequelize = require('sequelize');
const { getEmbed_UnknownError } = require('./embedMessages.js');
const { bot,
		chatChannelID,
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

	bonusCooldown:	{ type: Sequelize.DATE },
	bonusStreak:	{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	likeCooldown:	{ type: Sequelize.DATE },
	dislikeCooldown:{ type: Sequelize.DATE },

	newCooldown:	{ type: Sequelize.DATE },
});


async function getUserdata(userID){
	try{
		let userdata = await databaseUsers.findOne({ where: { userid: userID } });
		if(!userdata){
			await createUserdata(userID);
			userdata = await databaseUsers.findOne({ where: { userid: userID } });
		}
		return userdata;
	} catch (errorGetUserdata){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetUserdata"));
	}
}

async function checkUserSilent(userID){
	try{
		return await databaseUsers.findOne({ where: { userid: userID } });
	} catch (errorCheckUserSilent){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorCheckUserSilent"));
	}
}

async function createUserdata(userID){		// Здесь производится печать
	try{
		return await databaseUsers.create({userid: userID});
	} catch (errorCreateUserdata) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorCreateUserdata"));
	}
}

async function getAllUserdataBanned(){
	try{
		return await databaseUsers.findAll( {where: { banned: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataBanned) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("getAllUserdataBanned"));
	}
}

async function getAllUserdataMuted(){
	try{
		return await databaseUsers.findAll( {where: { mutedvoice: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataMuted) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetUserdataMuted"));
	}
}

async function getAllUserdataNoChat(){
	try{
		return await databaseUsers.findAll( {where: { mutedchat: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataNoChat) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("getAllUserdataNoChat"));
	}
}

async function updateUserdataBanned(userID, bannedStatus){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ banned: bannedStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataBanned){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataBanned"));
	}
}

async function updateUserdataMuted(userID, mutedStatus){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ mutedvoice: mutedStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataMuted){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataMuted"));
	}
}

async function updateUserdataNochat(userID, nochatStatus){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ mutedchat: nochatStatus }, { where: { userid: userID } });
	} catch (errorUpdateUserdataNochat){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataNochat"));
	}
}

async function updateUserdataRating(userID, ratingNew){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ rating: ratingNew }, { where: { userid: userID } });
	} catch (errorUpdateUserdataRating){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataRating"));
	}
}

async function updateUserdataKarma(userID, karmaNew){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		await databaseUsers.update({ karma: karmaNew }, { where: { userid: userID } });
	} catch (errorUpdateUserdataKarma){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataKarma"));
	}
}

async function updateUserdataLikeIncrement(userID){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		await databaseUsers.update({ likes: userdata.likes+1 }, { where: { userid: userID } });
	} catch (errorUpdateUserdataLikeIncrement){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataLikeIncrement"));
	}
}

async function updateUserdataDislikeIncrement(userID){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ dislikes: userdata.dislikes+1 }, { where: { userid: userID } });
	} catch (errorUpdateUserdataLikeIncrement){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataDislikeIncrement"));
	}
}

async function updateUserdataLikeCooldown(userID){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		likeDate = new Date();
		return await databaseUsers.update({ likeCooldown: likeDate }, { where: { userid: userID } });
	} catch (errorupdateUserdataLikeCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorupdateUserdataLikeCooldown"));
	}
}

async function updateUserdataDislikeCooldown(userID){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		dislikeDate = new Date();
		return await databaseUsers.update({ dislikeCooldown: dislikeDate }, { where: { userid: userID } });
	} catch (errorupdateUserdataDislikeCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorupdateUserdataDislikeCooldown"));
	}
}

function syncDatabase(){
	databaseUsers.sync({ alter: true });
}

async function updateNewCooldownDate(userID){
	try{
		let newCooldownDate = new Date();
		return await databaseUsers.update({ newCooldown: newCooldownDate }, { where: { userid: userID } });
	} catch (errorUpdateNewCooldownDate) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateNewCooldownDate"));
	}
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
	updateUserdataLikeCooldown,
	updateUserdataDislikeIncrement,
	updateUserdataDislikeCooldown,

	updateUserdataBanned,
	updateUserdataMuted,
	updateUserdataNochat,
	getAllUserdataBanned,
	getAllUserdataMuted,
	getAllUserdataNoChat,

	checkUserSilent,

	updateNewCooldownDate
}
