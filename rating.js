const { parsePlayers,
        parseInteger } = require('./functions.js');
const { getUserdata,
        updateUserdataRating,
        setUserdataMoney,
        updateUserdataKarma,
        updateUserdataRatingTyped,
        updateUserdataGameStats,
        databaseRatingRegister,
        databaseRatingUnregister } = require('./database.js');
const { getEmbed_Error,
        getEmbed_RatingSingleChange,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { roleRanksID,
        roleRanksValue,
        bot,
        guildID } = require('./config.js');
const { ratingReportsChannelID } = require('./config.js');

async function ratingHandler(robot, message, args){
    try{
        let users = [], playersID = parsePlayers(message.content); 
        ratingTypedBefore = [], ratingBefore = [],  
        ratingTypedAfter = [], ratingAfter = [],   
        ratingTypedAdd = [], ratingAdd = [], 
        karmaBefore = [], karmaAdd = [],
        moneyBefore = [], moneyAdd = [];
        playersCount = playersID.length;

        handler = args.shift();
        switch(handler){
            case 'add':
            case 'change':
            case 'set':
                if(playersCount != 1)
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо ввести одного игрока."));
                playerID = playersID[0];
                ratingValue = parseInteger(args[1]);
                if(isNaN(ratingValue) || (ratingValue == undefined))
                    return message.channel.send(getEmbed_Error("Введите значение рейтинга."));
                userdata = await getUserdata(playerID);
                ratingBefore = userdata.rating;
                user = message.guild.members.cache.get(playerID).user;
                ratingAfter = (handler == 'set') ? ratingValue : ratingBefore + ratingValue;
                await updateUserdataRating(playerID, ratingAfter);
                await message.channel.send(getEmbed_RatingSingleChange([user], [ratingBefore], [ratingAfter], message.author));
                await bot.channels.cache.get(ratingReportsChannelID).send(getEmbed_RatingSingleChange([user], [ratingBefore], [ratingAfter], message.author));
                break;
            case 'cc':
            case 'mult':
            case 'team':
                if(playersCount < 2 || playersCount > 16)
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо ввести от 2 до 16 игроков."));
                if( (handler == 'team') && (playersCount % 2) )
                    return message.channel.send(getEmbed_Error("Для данной команды необходимо чётное число игроков."));
                let multType = 0;
                if(handler == "mult"){
                    multType = args.shift().toLowerCase();
                    multTypeList = ["science", "culture", "domination", "religious", "diplomatic", "score"];
                    multType = 1 + multTypeList.indexOf(multType);
                    if(multType == 0)
                        return message.channel.send(getEmbed_Error("Введите один из следующих типов победы:\nscience, culture, domination, religious, diplomatic, score."));
                }
                for(let i in playersID){
                    userdata = await getUserdata(playersID[i]);
                    ratingBefore[i] = userdata.rating;
                    ratingTypedBefore[i] = (handler == 'team') ? userdata.ratingteam : userdata.ratingffa;
                    moneyBefore[i] = userdata.money;
                    karmaBefore[i] = userdata.karma;
                    users[i] = await message.guild.members.cache.get(playersID[i]).user;
                }
                ratingAfter = countRatingEloGeneral(ratingBefore, handler == 'mult', handler == 'team');
                ratingTypedAfter = countRatingEloGeneral(ratingTypedBefore, handler == 'mult', handler == 'team');
                for(let i in playersID){
                    moneyAdd[i] = Math.max(Math.round(2*Math.pow(playersCount, 2) - 3*(ratingAfter[i]-ratingBefore[i])/playersCount + 10*(playersCount-1)*(Number(handler == 'mult'))), 0);  // MONEY = 2n^2 - 3d/n
                    karmaAdd[i] = Math.floor((playersCount - 1)/2*(1 + (handler == 'mult')));
                    await updateUserdataRating(playersID[i], ratingAfter[i]);
                    await updateUserdataRatingTyped(playersID[i], ratingTypedAfter[i], handler == 'team');
                    await setUserdataMoney(playersID[i], Math.max(moneyBefore[i] + moneyAdd[i], 0));
                    await updateUserdataKarma(playersID[i], Math.min(karmaBefore[i] + karmaAdd[i], 100));
                    await updateUserdataGameStats(playersID[i], (i == 0 ? 2 : (ratingTypedAfter[i]-ratingTypedBefore[i] >= 0 ? 1 : 0)));
                }
                for(i in playersID){
                    ratingAdd[i] = ratingAfter[i]-ratingBefore[i];
                    ratingTypedAdd[i] = ratingTypedAfter[i]-ratingTypedBefore[i];
                }
                gameID = await databaseRatingRegister(Number(handler == 'team'), playersID, ratingAdd, ratingTypedAdd, moneyAdd, karmaAdd);
                await message.channel.send(getEmbed_RatingSingleChange(users, ratingTypedBefore, ratingTypedAfter, message.author, moneyAdd, karmaAdd, handler == 'team', multType, gameID, handler == 'cancel'));
                await bot.channels.cache.get(ratingReportsChannelID).send(getEmbed_RatingSingleChange(users, ratingTypedBefore, ratingTypedAfter, message.author, moneyAdd, karmaAdd, handler == 'team', multType, gameID, handler == 'cancel'));
                break;
            case 'cancel':
                gameID = parseInteger(args.shift());
                if(isNaN(gameID) || (gameID == undefined))
                    return message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
                if(gameID <= 0)
                    return message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
                gameResults = await databaseRatingUnregister(gameID);
                if(gameResults.length == 0)
                    return message.channel.send(getEmbed_Error("Игры с таким ID не существует!"));
                if(gameResults[0].isActive == 0)
                    return message.channel.send(getEmbed_Error("Игра с таким ID уже была отменена!"));
                for(i in gameResults){
                    gameResults[i] = gameResults[i].dataValues;
                    playersID[i] = gameResults[i].userid;
                    ratingAdd[i] = gameResults[i].ratingAdd;
                    ratingTypedAdd[i] = gameResults[i].ratingTypedAdd;
                    moneyAdd[i] = gameResults[i].moneyAdd;
                    karmaAdd[i] = gameResults[i].karmaAdd;
                }
                gameType = gameResults[0].gameType;     // 0 = FFA, 1 = Team
                for(let i in playersID){
                    userdata = await getUserdata(playersID[i]);
                    users[i] = await message.guild.members.cache.get(playersID[i]).user;

                    ratingBefore[i] = userdata.rating;
                    ratingTypedBefore[i] = (gameType) ? userdata.ratingteam : userdata.ratingffa;
                    ratingAfter[i] = ratingBefore[i] - ratingAdd[i];
                    ratingTypedAfter[i] = ratingTypedBefore[i] - ratingTypedAdd[i];

                    moneyBefore[i] = userdata.money;
                    karmaBefore[i] = userdata.karma;
                }
                for(let i in playersID){
                    await updateUserdataRating(playersID[i], ratingAfter[i]);
                    await updateUserdataRatingTyped(playersID[i], ratingTypedAfter[i], gameType);
                    await setUserdataMoney(playersID[i], Math.max(moneyBefore[i] - moneyAdd[i], 0));
                    await updateUserdataKarma(playersID[i], Math.max(karmaBefore[i] - karmaAdd[i], 0));
                    await updateUserdataGameStats(playersID[i], (i == 0 ? 2 : (ratingTypedAdd[i] >= 0 ? 1 : 0)), true);
                }
                await message.channel.send(getEmbed_RatingSingleChange(users, ratingTypedBefore, ratingTypedAfter, message.author, moneyAdd, karmaAdd, handler == 'team', 0, gameID, handler == 'cancel'));
                await bot.channels.cache.get(ratingReportsChannelID).send(getEmbed_RatingSingleChange(users, ratingTypedBefore, ratingTypedAfter, message.author, moneyAdd, karmaAdd, handler == 'team', 0, gameID, handler == 'cancel'));
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
    for(playerIterID of playersID){
        userdata = await getUserdata(playerIterID);
        playerIterRating = userdata.rating;
        let index = 0;
        for(index; index < roleRanksValue.length; index++)
            if(playerIterRating < roleRanksValue[index])
                break;
        let rightRoleID = roleRanksID[index];    // Найден ID роли, который нужно дать memberIter
        playerIterMember = await bot.guilds.cache.get(guildID).members.cache.get(playerIterID);   // нашли memberIter
        if(playerIterMember.roles.cache.has(rightRoleID))    // если уже есть
            continue;                           // next iterID для memberIter
        
        for(roleRankIterID of roleRanksID){     // убрать все неправильные роли
            if(playerIterMember.roles.cache.has(roleRankIterID)){
                wrongRole = await bot.guilds.cache.get(guildID).roles.cache.get(roleRankIterID);
                await playerIterMember.roles.remove(wrongRole)
            }
        }
        rightRole = await bot.guilds.cache.get(guildID).roles.cache.get(rightRoleID);
        await playerIterMember.roles.add(rightRole);
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
