const { getUserdata } = require('./database.js');
const { weakRoles,
        guildID,
        bot,
        FFARoleID,
        teamersRoleID,
        roleRanksID,
        roleRanksValue,
        roleAdministratorID,
		roleModeratorID,
		roleSupportID,
		roleBannedID,
		ownerID, 
        weakPointsPerRole} = require('./config.js');

function hasPermissionLevel(member, level){ 	// 0 - бан, 1 - общий, 2 - стажёр, 3 - модератор, 4 - администратор, 5 - владелец.
	let currentLevel = 1;
	if (member.roles.cache.has(roleSupportID))
		currentLevel = 2;
	else if (member.roles.cache.has(roleModeratorID))
		currentLevel = 3;
	else if (member.roles.cache.has(roleAdministratorID))
		currentLevel = 4;
	if(member.roles.cache.has(roleBannedID))
		currentLevel = 0;
	if (member.id == ownerID)
		currentLevel = 5;
	return (level <= currentLevel);
}


async function updateUsersWeakRole(playersID){
    if(!Array.isArray(playersID)) playersID = [playersID];
    for(playerIterID of playersID){
        userdata = await getUserdata(playerIterID);
        let weakLevel = Math.floor(userdata.weakPoints / weakPointsPerRole);
        playerIterMember = bot.guilds.cache.get(guildID).members.cache.get(playerIterID);
        let wrongRole = null;
        for(roleWeakIterID of weakRoles)     // убрать все неправильные роли
            if(playerIterMember.roles.cache.has(roleWeakIterID))
                wrongRole = bot.guilds.cache.get(guildID).roles.cache.get(roleWeakIterID);
        rightRole = (weakLevel) ? bot.guilds.cache.get(guildID).roles.cache.get(weakRoles[weakLevel-1]) : null;
        if(rightRole != wrongRole){
            if(wrongRole) await playerIterMember.roles.remove(wrongRole);
            if(rightRole) await playerIterMember.roles.add(rightRole)
        }
    }
}

async function updateUsersPlayRole(usersID, gameType){
    gameRole = bot.guilds.cache.get(guildID).roles.cache.get((gameType) ? teamersRoleID : FFARoleID);
    for(let i in usersID)
        await bot.guilds.cache.get(guildID).members.cache.get(usersID[i]).roles.add(gameRole);
}

async function updateUsersRatingRole(playersID){
    for(playerIterID of playersID){
        userdata = await getUserdata(playerIterID);
        let ratingList = [userdata.rating];
        if(userdata.winsFFA + userdata.defeatsFFA > 0) 
            ratingList.push(userdata.ratingffa);
        if(userdata.winsTeamers + userdata.defeatsTeamers > 0)
            ratingList.push(userdata.ratingteam);
        playerIterRating = Math.max(...ratingList);
        let index = 0;
        for(index; index < roleRanksValue.length; index++)
            if(playerIterRating < roleRanksValue[index])
                break;
        let rightRoleID = roleRanksID[index];    // Найден ID роли, который нужно дать memberIter
        playerIterMember = bot.guilds.cache.get(guildID).members.cache.get(playerIterID);   // нашли memberIter
        if(playerIterMember.roles.cache.has(rightRoleID))    // если уже есть
            continue;                           // next iterID для memberIter
        for(roleRankIterID of roleRanksID){     // убрать все неправильные роли
            if(playerIterMember.roles.cache.has(roleRankIterID)){
                wrongRole = bot.guilds.cache.get(guildID).roles.cache.get(roleRankIterID);
                await playerIterMember.roles.remove(wrongRole)
            }
        }
        rightRole = bot.guilds.cache.get(guildID).roles.cache.get(rightRoleID);
        await playerIterMember.roles.add(rightRole);
    }
}

module.exports = {
    updateUsersWeakRole,
    hasPermissionLevel,
    updateUsersRatingRole,
    updateUsersPlayRole,
}
