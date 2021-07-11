// ЗДЕСЬ ПРОИСХОДИТ ТОЛЬКО ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ,
// В ТОЧНОСТИ - ИМПОРТ И ЭКСПОРТ, СОЗДАНИЕ И УДАЛЕНИЕ,
// СОХРАНЕНИЕ КОПИЙ БАЗ ДАННЫХ: АВТОМАТИЧЕСКОЕ И РУЧНОЕ.
// НЕ НУЖНО ВКЛЮЧАТЬ СЮДА ОСТАЛЬНЫЕ ВЗАИМОДЕЙСТВИЯ.
// DataAchivements?

const 	Sequelize = require('sequelize');
const { String,
		deepCopy } = require('./functions.js');
const { copyFile } = require("fs/promises");

const dbList = ["databaseUsers", "databaseRating", "databaseClans"];

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
	avatarURL:		{ type: Sequelize.STRING },

    rating: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingffa: 		{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
  	ratingteam: 	{ type: Sequelize.INTEGER, 	defaultValue: 1000, 		allowNull: false },
	
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

	banned: 		{ type: Sequelize.DATE, 	defaultValue: null },
	mutedvoice: 	{ type: Sequelize.DATE,		defaultValue: null },
	mutedchat: 		{ type: Sequelize.DATE,		defaultValue: null },

	karma: 			{ type: Sequelize.INTEGER, 	defaultValue: 50,			allowNull: false },
	money: 			{ type: Sequelize.INTEGER, 	defaultValue: 0, 			allowNull: false },
	likes:			{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	dislikes: 		{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	weakPoints: 	{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },

	achievements: 	{ type: Sequelize.STRING, 	defaultValue: '000000', 	allowNull: false },

	bonusStreak:	{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },
	bonusCooldown:	{ type: Sequelize.DATE,		defaultValue: null },
	likeCooldown:	{ type: Sequelize.DATE,		defaultValue: null },
	dislikeCooldown:{ type: Sequelize.DATE,		defaultValue: null },
	newCooldown:	{ type: Sequelize.DATE,		defaultValue: null },
	proposalCooldown:{type: Sequelize.DATE,		defaultValue: null },
	lastGameDate:	{ type: Sequelize.DATE,		defaultValue: null },

	clanid:			{ type: Sequelize.STRING },													// ID роли клана
	clanStatus:		{ type: Sequelize.INTEGER, 	defaultValue: 0,			allowNull: false },	// 0 - игрок, 1 - модератор, 2 - создатель клана
	clanJoinCooldown:{type: Sequelize.DATE,		defaultValue: null },
	clanInviteCooldown:{type: Sequelize.DATE,	defaultValue: null },
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

async function checkUserData(userID){ return await databaseUsers.findOne({ where: { userid: userID } }); }
async function createUserdata(userID){ return await databaseUsers.create({userid: userID}); }

async function getUserdata(usersID){
	if(!Array.isArray(usersID))
		usersID = [usersID];
	usersData = [];
	for(i in usersID){
		userdata = await databaseUsers.findOne( { where: { userid: usersID[i] } });
		if(!userdata){
			await createUserdata(usersID[i]);
			userdata = await databaseUsers.findOne({ where: { userid: usersID[i] } });
		}
		usersData.push(deepCopy(userdata.dataValues));
		delete usersData[usersData.length-1].id;
		delete usersData[usersData.length-1].createdAt;
		delete usersData[usersData.length-1].updatedAt;
	}
	return (usersData.length == 1) ? usersData[0] : usersData;
}

async function setUserdata(usersData){
	if(!Array.isArray(usersData))
		usersData = [usersData];
	for(i in usersData)
		if(usersData[i]) await databaseUsers.update(usersData[i], { where: { userid: usersData[i].userid } });
}

async function getAllUserdataBanned(){
	usersdata = await databaseUsers.findAll( {where: { banned: { [Sequelize.Op.not]: null }}} );
	return usersdata.map(x => {
		x = x.dataValues;
		delete x.id;
		delete x.createdAt;
		delete x.updatedAt;
		return x;
	});
}

async function getAllUserdataMuted(){
	usersdata = await databaseUsers.findAll( {where: { mutedvoice: { [Sequelize.Op.not]: null }}} );
	return usersdata.map(x => {
		x = x.dataValues;
		delete x.id;
		delete x.createdAt;
		delete x.updatedAt;
		return x;
	});
}

async function getAllUserdataNoChat(){
	usersdata = await databaseUsers.findAll( {where: { mutedchat: { [Sequelize.Op.not]: null }}} );
	return usersdata.map(x => {
		x = x.dataValues;
		delete x.id;
		delete x.createdAt;
		delete x.updatedAt;
		return x;
	});
}

async function databaseRatingRegister(concatPlayerStats, gameType, multType){
	maxID = await databaseRating.max('gameid');
	newGameID = maxID ? maxID+1 : 1;
	for(i in concatPlayerStats){
		await databaseRating.create({
			gameid: newGameID,
			gameType: gameType,
			multType: multType,
			userid: concatPlayerStats[i].id,
			ratingAdd: concatPlayerStats[i].drating, 
			ratingTypedAdd: concatPlayerStats[i].dratingtyped,
			moneyAdd: concatPlayerStats[i].dmoney,
			karmaAdd: concatPlayerStats[i].dkarma,
		});
	}
	return newGameID;
}

async function databaseRatingUnregister(registeredGameID){
	maxID = await databaseRating.max('gameid');
	if(maxID) maxID = 1;
	gameResults = await databaseRating.findAll({ where: {gameid: registeredGameID} });
	if(gameResults.length != 0)
		await databaseRating.update({isActive: 0}, {where: {gameid: registeredGameID}});
	return gameResults;
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

async function getClanData(clanID){
	clandata = await databaseClans.findOne({ where: { clanid: clanID } });
	clandata = clandata.dataValues;
	delete clandata.id;
	delete clandata.createdAt;
	delete clandata.updatedAt;
	return clandata;
}

async function setClanData(clandata){ await databaseClans.update(clandata, { where: { clanid: clandata.clanid } }); }
async function clanDelete(clanID){ return await databaseClans.destroy({ where: { clanid: clanID } }); }

async function clanCheckClanName(nameString){
	clanList = await databaseClans.findAll({ where: { name: nameString } });
	return (clanList.length != 0);
}

async function clearAllUserdataClan(clanID){
	await databaseUsers.update({ clanStatus: 0 }, { where: { clanid: clanID } });
	await databaseUsers.update({ clanid: null }, { where: { clanid: clanID } });
}

async function getAllClans(){ return await databaseClans.findAll(); }
async function getAllUserdataClan(clanID){ return await databaseUsers.findAll({ where: { clanid: clanID } }); }

async function getAllUsersNewCooldown(){
	usersdata = await databaseUsers.findAll({where: {newCooldown: {[Sequelize.Op.ne]: null}}});
	return usersdata.map(x => {
		x = x.dataValues;
		delete x.id;
		delete x.createdAt;
		delete x.updatedAt;
		return x;
	});
}

async function syncDatabases(){
	databaseUsers.sync({ alter: true });
	databaseRating.sync({ alter: true });
	databaseClans.sync({ alter: true });
}

async function saveDatabases(){
    currentDate = new Date();
	for(db of dbList)
        await copyFile('{0}.sqlite'.format(db), './db_backups/{0}_{1}-{2}-{3}_{4}-{5}.sqlite'.format(db, currentDate.getFullYear(), currentDate.getMonth()+1, 
			currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes()));
    console.log("[{0}-{1}-{2} {3}:{4}:{5}] Databases was successfully saved.".format(currentDate.getFullYear(), currentDate.getMonth()+1, 
        currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
}

module.exports = { 
	checkUserData,
	getUserdata,
	createUserdata,
	setUserdata,

	getAllUsersNewCooldown,
	getAllUserdataBanned,
	getAllUserdataMuted,
	getAllUserdataNoChat,

	databaseRatingRegister,
	databaseRatingUnregister,

	clanCreate,
	clanDelete,
	getClanData,
	setClanData,
	clanCheckClanName,
	clearAllUserdataClan,
	getAllUserdataClan,
	getAllClans,

	syncDatabases,
	saveDatabases,
}
