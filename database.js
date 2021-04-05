// ЗДЕСЬ ПРОИСХОДИТ ТОЛЬКО ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ,
// В ТОЧНОСТИ - ИМПОРТ И ЭКСПОРТ, СОЗДАНИЕ И УДАЛЕНИЕ.
// UPD: СОХРАНЕНИЕ КОПИЙ
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
const { String } = require('./functions.js');
const { copyFile } = require("fs/promises");

const databaseUsersSequelize = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./databaseUsers.sqlite',
});

const databaseRatingSequelize = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./databaseRating.sqlite',
});

const databaseClansSequelize = new Sequelize('database', 'user', 'password', {
	host: 		'localhost',
	dialect: 	'sqlite',
	logging: 	false,
	storage: 	'./databaseClans.sqlite',
});

const databaseUsers = databaseUsersSequelize.define('users', {
    userid: 		{ type: Sequelize.STRING, 	unique: true },
	description: 	{ type: Sequelize.TEXT },
	registration:	{ type: Sequelize.DATE, 	defaultValue: new Date() },
    rating: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingffa: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingteam: 	{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
	money: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	
	winsFFA: 		{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeatsFFA: 	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	firstPlaceFFA: 	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	winsTeamers: 	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	defeatsTeamers: { type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },

	multScience:	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	multCulture:	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	multDomination:	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	multReligious:	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	multDiplomatic:	{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	multScore:		{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },

	banned: 		{ type: Sequelize.DATE },
	mutedvoice: 	{ type: Sequelize.DATE },
	mutedchat: 		{ type: Sequelize.DATE },

	karma: 			{ type: Sequelize.INTEGER, 	defaultValue: 50,			allowNull: false },
	likes:			{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	dislikes: 		{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },

	achievements: 	{ type: Sequelize.STRING, 	defaultValue: '000000', 	allowNull: false },

	bonusStreak:	{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	bonusCooldown:	{ type: Sequelize.DATE },
	likeCooldown:	{ type: Sequelize.DATE },
	dislikeCooldown:{ type: Sequelize.DATE },
	newCooldown:	{ type: Sequelize.DATE },
	proposalCooldown:{type: Sequelize.DATE },

	clanid:			{ type: Sequelize.STRING },													// ID роли клана
	clanStatus:		{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },	// 0 - игрок, 1 - модератор, 2 - создатель клана
	clanJoinCooldown:{type: Sequelize.DATE },
	clanInviteCooldown:{type: Sequelize.DATE },
});

const databaseRating = databaseRatingSequelize.define('users', {
	gameid: 		{ type: Sequelize.INTEGER, 	allowNull: false },
	gameType:		{ type: Sequelize.INTEGER, 	allowNull: false },					// 0 = FFA, 1 = Team
	multType:		{ type: Sequelize.INTEGER, 	defaultValue: 0, allowNull: false}, // 0 = no,  1 = science, ... 6 = score
	isActive:		{ type: Sequelize.INTEGER, 	defaultValue: 1, allowNull: false},	// 0 = no, 	1 = yes

    userid: 		{ type: Sequelize.STRING, 	allowNull: false },
	ratingAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
	ratingTypedAdd:	{ type: Sequelize.INTEGER, 	allowNull: false },
	moneyAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
	karmaAdd:		{ type: Sequelize.INTEGER, 	allowNull: false },
});

const databaseClans = databaseClansSequelize.define('users', {
	clanid: 		{ type: Sequelize.STRING, 	unique: true },
	name:			{ type: Sequelize.STRING, 	unique: true },
	leaderid:		{ type: Sequelize.STRING, 	unique: true },
	textchannelid:	{ type: Sequelize.STRING, 	unique: true },
	money: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, allowNull: false },
	avatarURL:		{ type: Sequelize.STRING },
	description:	{ type: Sequelize.STRING },
	color:			{ type: Sequelize.STRING,	defaultValue: "#5395d7" },
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

async function updateUserdataDescription(userID, descriptionString){
	return await databaseUsers.update({ description: descriptionString }, { where: { userid: userID } });
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

async function updateNewCooldownDate(userID, isClear = false){
	try{
		let newCooldownDate = isClear ? null : new Date();
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

async function updateUserdataMultStats(userID, multType, multValue, reverted = false){
	let userdata = await getUserdata(userID);
	if(reverted)
		multValue *= -1;
	switch(multType){
		case 1:
			await databaseUsers.update({ multScience: userdata.multScience+multValue }, {where: {userid: userID}});
			break;
		case 2:
			await databaseUsers.update({ multCulture: userdata.multCulture+multValue }, {where: {userid: userID}});
			break;
		case 3:
			await databaseUsers.update({ multDomination: userdata.multDomination+multValue }, {where: {userid: userID}});
			break;
		case 4:
			await databaseUsers.update({ multReligious: userdata.multReligious+multValue }, {where: {userid: userID}});
			break;
		case 5:
			await databaseUsers.update({ multDiplomatic: userdata.multDiplomatic+multValue }, {where: {userid: userID}});
			break;
		case 6:
			await databaseUsers.update({ multScore: userdata.multScore+multValue }, {where: {userid: userID}});
			break;
	}
	return;
}

async function updateUserdataGameStats(userID, isGameTypeTeamers, gameValue, reverted = false){		// -1 = defeat, 1 - win, 2 - firstPlace
	try{
		let userdata = await getUserdata(userID);
		if(!isGameTypeTeamers){ 		// FFA
			if(gameValue < 0)
				await databaseUsers.update({ defeatsFFA: userdata.defeatsFFA+1-(2*reverted) }, { where: { userid: userID } });
			if(gameValue > 0)
				await databaseUsers.update({ winsFFA: userdata.winsFFA+1-(2*reverted) }, { where: { userid: userID } });
			if(gameValue > 1)
				await databaseUsers.update({ firstPlaceFFA: userdata.firstPlaceFFA+1-(2*reverted) }, { where: { userid: userID } });
		} else {		// Teamers
			if(gameValue < 0)
				await databaseUsers.update({ defeatsTeamers: userdata.defeatsTeamers+1-(2*reverted) }, { where: { userid: userID } });
			if(gameValue > 0)
				await databaseUsers.update({ winsTeamers: userdata.winsTeamers+1-(2*reverted) }, { where: { userid: userID } });
		}
	} catch (errorUpdateUserdataGameStats){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataGameStats"));
	}
}

async function databaseRatingRegister(newGameType, userIDArray, ratingAddArray, ratingTypedAddArray, moneyAddArray, karmaAddArray, multType = 0){
	maxID = await databaseRating.max('gameid');
	newGameID = maxID ? maxID+1 : 1;
	for(i in userIDArray){
		await databaseRating.create({
			gameid: newGameID, 
			gameType: newGameType,
			multType: multType,
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

async function clanCreate(userID, roleID, nameString, textChannelID){
	await databaseClans.create({
		clanid: roleID,
		name: nameString,
		leaderid: userID,
		textchannelid: textChannelID,
		color: "#5395d7",
	});
}

async function clanGetData(clanID){
	return await databaseClans.findOne({ where: { clanid: clanID } });
}

async function clanDelete(clanID){
	return await databaseClans.destroy({ where: { clanid: clanID } });
}

async function clanUpdateMoney(clanID, moneyValue){
	return await databaseClans.update({ money: moneyValue }, { where: { clanid: clanID } });
}

async function clanUpdateAvatar(clanID, url){
	return await databaseClans.update({ avatarURL: url }, { where: { clanid: clanID } });
}

async function clanUpdateLeader(clanID, userID){
	return await databaseClans.update({ leaderid: userID }, { where: { clanid: clanID } });
}

async function clanCheckClanName(nameString){
	return await databaseClans.findAll({ where: { name: nameString } });
}

async function clanUpdateName(clanID, nameString){
	return await databaseClans.update({ name: nameString }, { where: { clanid: clanID } });
}

async function clanUpdateDescription(clanID, descriptionString){
	return await databaseClans.update({ description: descriptionString }, { where: { clanid: clanID } });
}

async function clanUpdateColor(clanID, colorString){
	return await databaseClans.update({ color: colorString }, { where: { clanid: clanID } });
}

async function updateUserdataClanID(userID, clanID = null){
	return await databaseUsers.update({ clanid: clanID }, { where: { userid: userID } });
}

async function updateUserdataClanStatus(userID, clanStatusValue){
	return await databaseUsers.update({ clanStatus: clanStatusValue }, { where: { userid: userID } });
}

async function updateUserdataJoinCooldown(userID, currentDate){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ clanJoinCooldown: currentDate }, { where: { userid: userID } });
	} catch (errorUpdateUserdataJoinCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataJoinCooldown"));
	}
}

async function updateUserdataInviteCooldown(userID, currentDate){
	try{
		let userdata = await getUserdata(userID);
		if (!userdata){
			await createUserdata(userID);
			userdata = await getUserdata(userID);
		}
		return await databaseUsers.update({ clanInviteCooldown: currentDate }, { where: { userid: userID } });
	} catch (errorUpdateUserdataInviteCooldown){
		bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUpdateUserdataInviteCooldown"));
	}
}

async function clearAllUserdataClan(clanID){
	await databaseUsers.update({ clanStatus: 0 }, { where: { clanid: clanID } });
	await databaseUsers.update({ clanid: null }, { where: { clanid: clanID } });
	return;
}

async function getAllClans(){
	return await databaseClans.findAll();
}

async function getAllUserdataClan(clanID){
	return await databaseUsers.findAll({ where: { clanid: clanID } });
}

async function getAllUsersNewCooldown(){
	return await databaseUsers.findAll({where: {newCooldown: {[Sequelize.Op.ne]: null}}})
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

async function syncDatabase(){
	databaseUsers.sync({ alter: true });
	databaseRating.sync({ alter: true });
	databaseClans.sync({ alter: true });
}

async function saveDatabases(){
	const dbList = ["databaseUsers", "databaseRating", "databaseClans"]
    currentDate = new Date();
	for(db of dbList)
        await copyFile('{0}.sqlite'.format(db), './db_backups/{0}_{1}-{2}-{3}_{4}-{5}.sqlite'.format(db, currentDate.getFullYear(), currentDate.getMonth()+1, 
			currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes()));
    console.log("[{0}-{1}-{2} {3}:{4}:{5}] Databases was successfully saved.".format(currentDate.getFullYear(), currentDate.getMonth()+1, 
        currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
}

module.exports = { 
	getUserdata,
	createUserdata,
	syncDatabase,
	hasPermissionLevel,

	updateUserdataDescription,
	updateUserdataRating,
	updateUserdataRatingTyped,
	updateUserdataGameStats,
	updateUserdataMultStats,
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
	databaseRatingUnregister,

	clanCreate,
	clanDelete,
	clanGetData,
	clanUpdateMoney,
	clanUpdateAvatar,
	clanUpdateLeader,
	clanCheckClanName,
	clanUpdateName,
	updateUserdataClanID,
	updateUserdataClanStatus,
	clearAllUserdataClan,
	getAllUserdataClan,
	clanUpdateDescription,
	clanUpdateColor,
	updateUserdataJoinCooldown,
	updateUserdataInviteCooldown,
	getAllClans,

	saveDatabases,

	getAllUsersNewCooldown,
}
