const { parsePlayers,
        parseInteger } = require('./functions.js');
const { getUserdata,
        updateUserdataRating } = require('./database.js');
const { getEmbed_Error,
        getEmbed_RatingSingleChange,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { roleRanksID,
        roleRanksValue,
        bot,
        guildID } = require('./config.js');


async function ratingHandler(robot, message, args){
    try{
        parsePlayers(message.content)
        handler = args.shift();
        playersID = parsePlayers(message.content);
        let ratingBefore = [], users = [], ratingAfter = [];
        switch(handler){
            case 'add':
            case 'change':
            case 'set':
                if(playersID.length != 1)
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо ввести одного игрока."));
                playerID = playersID[0];
                ratingValue = parseInteger(args[1]);
                if(isNaN(ratingValue) || (ratingValue == undefined))
                    return message.channel.send(getEmbed_Error("Введите значение рейтинга."));
                userdata = await getUserdata(playerID);
                ratingBefore = userdata.rating;
                user = message.guild.members.cache.get(playerID).user;
                if(handler == 'set')
                    ratingAfter = ratingValue;
                else
                    ratingAfter = ratingBefore + ratingValue;
                await updateUserdataRating(playerID, ratingAfter);
                return message.channel.send(getEmbed_RatingSingleChange([user], [ratingBefore], [ratingAfter]));
            case 'cc':
            case 'mult':
            case 'team':
                if(playersID.length < 2 || playersID.length > 16)
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо ввести от 2 до 16 игроков."));
                if( (handler == 'team') && (playersID.length % 2) )
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо чётное число игроков."));
                for(let i in playersID){
                    userdata = await getUserdata(playersID[i]);
                    ratingBefore[i] = userdata.rating;
                    users[i] = await message.guild.members.cache.get(playersID[i]).user;
                }
                ratingAfter = countRatingEloGeneral(ratingBefore, handler == 'mult', handler == 'team');
                for(let i in users)
                    await updateUserdataRating(playersID[i], ratingAfter[i]);
                return await message.channel.send(getEmbed_RatingSingleChange(users, ratingBefore, ratingAfter));
            case 'cancel':
                break;
            default:
                return message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\ncc, mult, team, set, add/change, cancel."));
        }
        if(playersID.length > 0)
            updateUsersRatingRole(playersID);
    } catch (errorRatingHandler){
        message.channel.send(getEmbed_UnknownError("errorRatingHandler"));
    }
}

async function updateUsersRatingRole(playersID){
    for(iterID of playersID){
        userdata = await getUserdata(iterID);
        iterRating = userdata.rating;
        let index = 0;
        for(index; index < roleRanksValue.length; index++)
            if (iterRating < roleRanksValue[index])
                break;
        let iterRoleID = roleRanksID[index];
        memberIter = bot.guilds.cache.get(guildID).members.cache.get(iterID);
        if(memberIter.roles.has(iterRoleID))
            return;
        for(i of roleRanksID)
            if(memberIter.roles.has(roleRanksID[i])){
                //member.roles.remove()
                break;
            }
    }
}

function countRatingEloPair(ratingA, ratingB, M){      // A побеждает B всегда (так задаётся функция ниже)
    d = 400;
    K = 30;
    S = 1;  // Победа (ничьи пока что нет)
    E = 1/(1 + Math.pow(10, (ratingB - ratingA)/400));
    RA = Math.round(M*K*(S-E));
    return [RA, -RA];
}

function countRatingEloGeneral(ratingBefore, isMultiplied, isTeamGame){
    playersCount = ratingBefore.length;
    delta = new Array(playersCount).fill(0);
    let multiplier = isMultiplied ? 1.5 : 1;
    if(isTeamGame)
        for(let i = 0; i < playersCount/2; i++)
            for(let j = playersCount/2; j < playersCount; j++){
                let deltaPair = countRatingEloPair(ratingBefore[i], ratingBefore[j], multiplier);
                delta[i] += deltaPair[0];
                console.log(i, j);
                delta[j] += deltaPair[1];
            }
    else
        for(let i = 0; i < playersCount-1; i++)
            for(let j = i+1; j < playersCount; j++){
                let deltaPair = countRatingEloPair(ratingBefore[i], ratingBefore[j], multiplier);
                delta[i] += deltaPair[0];
                delta[j] += deltaPair[1];
            }
    correctBonus = Math.min(Math.max(0, Math.floor((playersCount-4)/2)), 3);
    delta.map(iter => iter+correctBonus);
    let ratingAfter = [];
    for(let i = 0; i < playersCount; i++)
        ratingAfter[i] = ratingBefore[i] + delta[i];
    return ratingAfter;
}

module.exports = { ratingHandler }
