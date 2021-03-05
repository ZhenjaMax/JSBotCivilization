// ЗДЕСЬ ПРОИСХОДИТ ТОЛЬКО ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ,
// В ТОЧНОСТИ - ИМПОРТ И ЭКСПОРТ, СОЗДАНИЕ И УДАЛЕНИЕ.
// НЕ НУЖНО ВКЛЮЧАТЬ СЮДА ОСТАЛЬНЫЕ ВЗАИМОДЕЙСТВИЯ.

// DataGeneral
// DataTimings
// DataClans
// DataAchivements

const 	Sequelize = require('sequelize');
const { getEmbed_UnknownError } = require('./embedMessages.js');
const { bot,
		chatChannelID,
		roleAdministratorID,
		roleModeratorID,
		roleSupportID,
		roleBannedID,
		ownerID } = require('./config.js');


const databaseUsersSequelize = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./databaseUsers.sqlite',
});

const databaseUsers = databaseUsersSequelize.define('users', {
    userid: 		{ type: Sequelize.STRING, 	unique: true },
	description: 	{ type: Sequelize.TEXT },
	registration:	{ type: Sequelize.DATE, 	defaultValue: new Date() },
    rating: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingffa: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingteam: 	{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
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
	proposalCooldown:{type: Sequelize.DATE },
});

const databaseRatingSequelize = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./databaseRating.sqlite',
});

const databaseRating = databaseRatingSequelize.define('users', {
	gameid: 		{ type: Sequelize.INTEGER, 	allowNull: false },
	gameType:		{ type: Sequelize.INTEGER, 	allowNull: false },					// 0 = FFA, 1 = Team
	isActive:		{ type: Sequelize.INTEGER, 	defaultValue: 1, allowNull: false},	// 0 = no, 	1 = yes

    userid: 		{ type: Sequelize.STRING, 	allowNull: false },
	ratingAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
	ratingTypedAdd:	{ type: Sequelize.INTEGER, 	allowNull: false },
	moneyAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
	karmaAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
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
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetAllUserdataBanned"));
	}
}

async function getAllUserdataMuted(){
	try{
		return await databaseUsers.findAll( {where: { mutedvoice: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataMuted) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetAllUserdataMuted"));
	}
}

async function getAllUserdataNoChat(){
	try{
		return await databaseUsers.findAll( {where: { mutedchat: { [Sequelize.Op.not]: null }}} );
	} catch (errorGetUserdataNoChat) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGetAllUserdataNoChat"));
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

async function updateUserdataRatingTyped(userID, ratingNew, typeTeamFlag){
	try{
		let userdata = await getUserdata(userID);
		if(!userdata)
			await createUserdata(userID);
		if(typeTeamFlag)
			await databaseUsers.update({ ratingteam: ratingNew }, { where: { userid: userID } });
		else
			await databaseUsers.update({ ratingffa: ratingNew }, { where: { userid: userID } });
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

async function updateUserdataBonusCooldown(userID, currentDate){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ bonusCooldown: currentDate }, { where: { userid: userID } });
	} catch (errorUpdateUserdataBonusCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataBonusCooldown"));
	}
}

async function updateNewCooldownDate(userID){
	try{
		let newCooldownDate = new Date();
		return await databaseUsers.update({ newCooldown: newCooldownDate }, { where: { userid: userID } });
	} catch (errorUpdateNewCooldownDate) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateNewCooldownDate"));
	}
}

async function setUserdataMoney(userID, moneyValue){
	try{
		return await databaseUsers.update({ money: moneyValue }, { where: { userid: userID } });
	} catch (errorSetUserdataMoney) {
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorSetUserdataMoney"));
	}
}

async function setUserdataBonusStreak(userID, daysValue){
	try{
		return await databaseUsers.update({ bonusStreak: daysValue }, { where: { userid: userID } })
	} catch (errorSetUserdataBonusStreak){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorSetUserdataBonusStreak"));
	}
}

async function updateUserdataGameStats(userID, gameValue, reverted = false){		// -1 = defeatComplete, 0 = defeat, 1 = win, 2 = winComplete
	try{
		let userdata = await getUserdata(userID);
		if(gameValue > 0){
			reverted ? await databaseUsers.update({ wins: userdata.wins-1 }, { where: { userid: userID } }) : await databaseUsers.update({ wins: userdata.wins+1 }, { where: { userid: userID } });
			if(gameValue > 1)
				reverted ? await databaseUsers.update({ winsComplete: userdata.winsComplete-1 }, { where: { userid: userID } }) : await databaseUsers.update({ winsComplete: userdata.winsComplete+1 }, { where: { userid: userID } });
		} else {
			reverted ? await databaseUsers.update({ defeats: userdata.defeats-1 }, { where: { userid: userID } }) : databaseUsers.update({ defeats: userdata.defeats+1 }, { where: { userid: userID } });
			if(gameValue < 0)
				reverted ? await databaseUsers.update({ defeatsComplete: userdata.defeatsComplete-1 }, { where: { userid: userID } }) : await databaseUsers.update({ defeatsComplete: userdata.defeatsComplete+1 }, { where: { userid: userID } });
		}
	} catch (errorSetUserdataBonusStreak){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorSetUserdataBonusStreak"));
	}
}

async function databaseRatingRegister(newGameType, userIDArray, ratingAddArray, ratingTypedAddArray, moneyAddArray, karmaAddArray){
	maxID = await databaseRating.max('gameid');
	newGameID = maxID ? maxID+1 : 1;
	for(i in userIDArray){
		await databaseRating.create({
			gameid: newGameID, 
			gameType: newGameType,
			userid: userIDArray[i], 
			ratingAdd: ratingAddArray[i], 
			ratingTypedAdd: ratingTypedAddArray[i],
			moneyAdd: moneyAddArray[i],
			karmaAdd: karmaAddArray[i]
		});
	}
	return newGameID;
}

async function databaseRatingUnregister(registeredGameID){
	maxID = await databaseRating.max('gameid');
	if(maxID)
		maxID = 1;
	gameResults = await databaseRating.findAll({ where: {gameid: registeredGameID} });
	if(gameResults.length != 0)
		await databaseRating.update({isActive: 0}, {where: {gameid: registeredGameID}});
	return gameResults;
}

async function updateUserdataProposalCooldown(userID, currentDate){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ proposalCooldown: currentDate }, { where: { userid: userID } });
	} catch (errorUpdateUserdataProposalCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataProposalCooldown"));
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

function syncDatabase(){
	databaseUsers.sync({ alter: true });
	databaseRating.sync({ alter: true });
}

module.exports = { 
	getUserdata,
	createUserdata,
	syncDatabase,
	hasPermissionLevel,

	updateUserdataRating,
	updateUserdataRatingTyped,
	updateUserdataGameStats,
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

	updateNewCooldownDate,
	setUserdataMoney,
	setUserdataBonusStreak,
	updateUserdataBonusCooldown,
	updateUserdataProposalCooldown,

	databaseRatingRegister,
	databaseRatingUnregister
}
