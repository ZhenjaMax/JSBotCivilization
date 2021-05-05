const { parsePlayers,
        parseInteger } = require('./functions.js');
const { getUserdata,
        updateUserdataRating,
        setUserdataMoney,
        updateUserdataKarma,
        updateUserdataRatingTyped,
        updateUserdataGameStats,
        updateUserdataMultStats,
        databaseRatingRegister,
        databaseRatingUnregister } = require('./database.js');
const { getEmbed_Error,
        getEmbed_RatingSingleChange,
        getEmbed_UnknownError,
        getEmbed_RatingChange,
        getEmbed_RatingChangeCancel } = require('./embedMessages.js');
const { roleRanksID,
        roleRanksValue,
        bot,
        guildID,
        FFARoleID,
        teamersRoleID, } = require('./config.js');
const { ratingReportsChannelID } = require('./config.js');

const multTypeList = ["science", "culture", "domination", "religious", "diplomatic", "score"];
const multMultiplier = 1.5;
const multMultiplierWin = 1.25;
const multMultiplierDefeat = 0.75;
const subMultiplier = 1.5;

async function getPlayerStatsObjectFromData(userdata){
    let userInstance = await bot.users.fetch(userdata.userid);
    return {
        id: userdata.userid,
        userinstance: userInstance,
        multiplier: 1,

        rating: userdata.rating,
        ratingffa: userdata.ratingffa,
        ratingteam: userdata.ratingteam,
        money: userdata.money,
        karma: userdata.karma,
        
        tieIndex: [],
        subID: -1, 
        isLeave: false,

        drating: 0,
        dratingtyped: 0,
        dmoney: 0,
        dkarma: 0,  
    };
}

async function getPlayerStatsObjectFromRegistered(ratingObject){
    let userInstance = await bot.users.fetch(ratingObject.userid);
    let userdata = await getUserdata(ratingObject.userid);
    return {
        id: userdata.userid,
        userinstance: userInstance,
        multiplier: 1,

        rating: userdata.rating,
        ratingffa: userdata.ratingffa,
        ratingteam: userdata.ratingteam,
        money: userdata.money,
        karma: userdata.karma,
        
        tieIndex: [],
        subID: -1, 
        isLeave: false,

        drating: ratingObject.ratingAdd,
        dratingtyped: ratingObject.ratingTypedAdd,
        dmoney: ratingObject.moneyAdd,
        dkarma: ratingObject.karmaAdd,  
    };
}

function ratingEloPair(ratingA, ratingB, isTie = false){      // A win B
    let d = 400, K = 30, S = isTie ? 0.5 : 1;
    E = 1/(1 + Math.pow(10, (ratingB - ratingA)/d));
    return Math.round(K*(S-E));
}

    function ratingElo(playerStatsArray, teamLength = 1){
    let teamCount = playerStatsArray.length / teamLength, drating, dratingtyped;
    for(let i = 0; i < teamCount-1; i++)
        for(let j = 0; j < teamLength; j++)
            for(let k = (i+1)*teamLength; k < playerStatsArray.length; k++){
                drating = ratingEloPair(playerStatsArray[i*teamLength+j].rating, playerStatsArray[k].rating, playerStatsArray[i*teamLength+j].tieIndex.indexOf(k) != -1);
                dratingtyped = (teamLength > 1) ? ratingEloPair(playerStatsArray[i*teamLength+j].ratingteam, playerStatsArray[k].ratingteam, playerStatsArray[i*teamLength+j].tieIndex.indexOf(k) != -1) :
                                                ratingEloPair(playerStatsArray[i*teamLength+j].ratingffa, playerStatsArray[k].ratingffa, playerStatsArray[i*teamLength+j].tieIndex.indexOf(k) != -1);
                playerStatsArray[i*teamLength+j].drating += drating;
                playerStatsArray[i*teamLength+j].dratingtyped += dratingtyped;
                playerStatsArray[k].drating -= drating;
                playerStatsArray[k].dratingtyped -= dratingtyped;
            }
    return playerStatsArray;
}

    async function ratingHandler(robot, message, args){
    let playersID = parsePlayers(message.content);
    let playersCount = playersID.length;
    let handler = args.shift(), multString = "";
    let gameTypeIndex = 0;
    let multIndex = 0;
    let teamCountInput = 1;
    let playerStatsArray = [], subPlayerStatsArray = [];
    switch(handler){
        case 'add':
        case 'change':
        case 'set':
            if(playersCount != 1) return await message.channel.send(getEmbed_Error("Для данной команды необходимо ввести одного игрока."));
            let ratingValue = parseInteger(args[1]);
            if(isNaN(ratingValue) || (ratingValue == undefined)) return await message.channel.send(getEmbed_Error("Введите значение рейтинга."));
            let playerStats = await getPlayerStatsObjectFromData(await getUserdata(playersID[0]));
            playerStats.drating = (handler == 'set') ? ratingValue-playerStats.rating : ratingValue;
            await updateUserdataRating(playerStats.id, playerStats.rating+playerStats.drating);
            await message.channel.send(getEmbed_RatingSingleChange(playerStats, message.author));
            await bot.channels.cache.get(ratingReportsChannelID).send(getEmbed_RatingSingleChange(playerStats, message.author));
            await updateUsersRatingRole([playerStats.id]);
            break;
        case 'team':
            gameTypeIndex = 1;
            handler = args.shift();
            teamCountInput = parseInteger(handler);
            if(isNaN(teamCountInput)||(teamCountInput == undefined)){
                args.unshift(handler);
                teamCountInput = 2;
            }
        case 'ffa':
            handler = args.shift();
            switch(handler){
                case 'mult':
                    multString = args.shift();
                    multIndex = multTypeList.indexOf(multString)+1;
                    if(multIndex == 0) return await message.channel.send(getEmbed_Error("Введите один из следующих типов победы:\nscience, culture, domination, religious, diplomatic, score."));
                case 'cc':
                case 'gg':
                    for(let i = 0; i < playersCount; i++)
                        playerStatsArray.push(await getPlayerStatsObjectFromData(await getUserdata(playersID[i])));
                    let iterIndex = 0;
                    while(iterIndex != playersCount){
                        let currentArg = args.shift();
                        switch(currentArg){
                            case undefined:
                                return await message.channel.send(getEmbed_Error("Некорректные данные (см. <#807958245541019680>)!"));
                            case "leave":
                                playerStatsArray[iterIndex-1].isLeave = true;
                                break;
                            case "tie":
                                playerStatsArray[iterIndex-1].tieIndex.push(iterIndex);
                                break;
                            case "sub":
                                playersCount--;
                                playerStatsArray[iterIndex].subID = iterIndex-1;
                                playerStatsArray[iterIndex-1].subID = iterIndex;
                                subPlayerStatsArray.push(playerStatsArray.splice(iterIndex, 1)[0]);
                                currentArg = args.shift();
                                if(parsePlayers(currentArg)[0] == subPlayerStatsArray[subPlayerStatsArray.length-1].id)
                                    playersID.splice(iterIndex, 1);
                                currentArg = args.shift();
                                if(currentArg == 'leave')
                                    subPlayerStatsArray[subPlayerStatsArray.length-1].isLeave = true;
                                else if(currentArg != undefined)
                                    args.unshift(currentArg);
                                break;
                            default:
                                if(parsePlayers(currentArg)[0] == playerStatsArray[iterIndex].id)
                                    iterIndex++;
                                else return await message.channel.send(getEmbed_Error("Некорректные данные (см. <#807958245541019680>)!"));
                                break;
                        }
                    }
                    if(args.shift() == "leave") 
                        playerStatsArray[playerStatsArray.length-1].isLeave = true;
                    if(gameTypeIndex == 0){                             // Индексы для ничьи
                        for(let i = 0; i < playerStatsArray-1; i++){
                            if(playerStatsArray[i].tieIndex.length != 0){
                                for(let j = i+1; j < playersCount; j++)
                                    if(playerStatsArray[j].tieIndex.length == 0)
                                        break;
                                    else
                                        playerStatsArray[i].tieIndex.push(playerStatsArray[j].tieIndex[0]);
                            }
                        }
                    } else {
                        if(gameTypeIndex && (playersCount % teamCountInput) != 0) return await message.channel.send(getEmbed_Error("Количество игроков должно быть кратно количеству команд."));
                        let teamLength = playersCount / teamCountInput;
                        for(let i = 0; i < teamCountInput-1; i++){
                            if(playerStatsArray[(i+1)*teamLength-1].tieIndex.length != 0){
                                for(let j = i+1; j < teamCountInput; j++)
                                    if(playerStatsArray[(j+1)*teamLength-1].tieIndex.length == 0)
                                        break;
                                    else 
                                        playerStatsArray[(i+1)*teamLength-1].tieIndex.push(playerStatsArray[(j+1)*teamLength-1].tieIndex[0]);
                            }
                        }
                        for(let i = 0; i < teamCountInput; i++){
                            let tieLength = playerStatsArray[(i+1)*teamLength-1].tieIndex.length;
                            for(let j = 0; j < tieLength; j++){
                                for(let k = 0; k < teamLength-1; k++)
                                    playerStatsArray[(i+1)*teamLength-1].tieIndex.push(playerStatsArray[(i+1)*teamLength-1].tieIndex[j]+k+1);
                            }
                        }
                        for(let i = 0; i < teamCountInput; i++)
                            for(let j = 0; j < teamLength-1; j++)
                                playerStatsArray[(i+1)*teamLength-2-j].tieIndex = playerStatsArray[(i+1)*teamLength-1].tieIndex;   
                    }
                    if(playersCount < 2 || playersCount > 16) return await message.channel.send(getEmbed_Error("Для данной команды необходимо ввести от 2 до 16 игроков."));
                    playerStatsArray = ratingElo(playerStatsArray, gameTypeIndex ? playersCount/teamCountInput : 1);      // Подсчёт
                    for(i in playerStatsArray)
                        if(multIndex != 0){                                     // Выдача денег и кармы
                            playerStatsArray[i].dkarma = playersCount;
                            playerStatsArray[i].dmoney = Math.floor(2*playersCount*playersCount - 3*playerStatsArray[i].dratingtyped/playersCount);
                        } else {
                            playerStatsArray[i].dkarma = Math.floor(playersCount/2);
                            playerStatsArray[i].dmoney = Math.floor(2*playersCount*playersCount - 3*playerStatsArray[i].dratingtyped/playersCount + 10*playersCount);
                        }
                    for(i in subPlayerStatsArray){                       // Замены (учёт бонусов)
                        let subIndex = subPlayerStatsArray[i].subID;
                        let subRating = ratingEloPair(playerStatsArray[subIndex].rating, subPlayerStatsArray[i].rating);
                        let subRatingTyped = gameTypeIndex ? ratingEloPair(playerStatsArray[subIndex].ratingteam, subPlayerStatsArray[i].ratingteam) : ratingEloPair(playerStatsArray[subIndex].ratingffa, subPlayerStatsArray[i].ratingffa);
                        playerStatsArray[subIndex].drating += subRating;
                        playerStatsArray[subIndex].dratingtyped += subRatingTyped;
                        playerStatsArray[subIndex].dmoney = Math.floor(playerStatsArray[subIndex].dmoney*subMultiplier);
                        playerStatsArray[subIndex].dkarma = Math.floor(playerStatsArray[subIndex].dkarma*subMultiplier);
                        subPlayerStatsArray[i].drating -= subRating;
                        subPlayerStatsArray[i].dratingtyped -= subRatingTyped;
                        subPlayerStatsArray[i].dmoney = subRating;
                        subPlayerStatsArray[i].dkarma = 1;
                        if(playerStatsArray[subIndex].drating < 0){
                            subPlayerStatsArray[i].drating += playerStatsArray[subIndex].drating
                            playerStatsArray[subIndex].drating = 0;
                        }
                        if(playerStatsArray[subIndex].dratingtyped < 0){
                            subPlayerStatsArray[i].dratingtyped += playerStatsArray[subIndex].dratingtyped
                            playerStatsArray[subIndex].dratingtyped = 0;
                        }
                    }
                    for(i in playerStatsArray){                         // Учёт ливнувших игроков
                        if(playerStatsArray[i].isLeave){                // И всех бонусов за мульт
                            playerStatsArray[i].dkarma = 0;
                            playerStatsArray[i].dmoney = 0;
                        }
                        if(multIndex != 0){
                            if(gameTypeIndex == 0){
                                playerStatsArray[i].drating = Math.floor(multMultiplier*playerStatsArray[i].drating);
                                playerStatsArray[i].dratingtyped = Math.floor(multMultiplier*playerStatsArray[i].dratingtyped);
                            } else {
                                playerStatsArray[i].drating = Math.floor(playerStatsArray[i].drating > 0 ? multMultiplierWin*playerStatsArray[i].drating : multMultiplierDefeat*playerStatsArray[i].drating);
                                playerStatsArray[i].drating = Math.floor(playerStatsArray[i].dratingtyped > 0 ? multMultiplierWin*playerStatsArray[i].dratingtyped : multMultiplierDefeat*playerStatsArray[i].dratingtyped);
                            }
                        }
                    }
                    for(i in subPlayerStatsArray){
                        if(subPlayerStatsArray[i].isLeave){
                            subPlayerStatsArray[i].dkarma = 0;
                            subPlayerStatsArray[i].dmoney = 0;
                        }
                        if(multIndex != 0){
                            if(gameTypeIndex == 0){
                                subPlayerStatsArray[i].drating = Math.floor(multMultiplier*subPlayerStatsArray[i].drating);
                                subPlayerStatsArray[i].dratingtyped = Math.floor(multMultiplier*subPlayerStatsArray[i].dratingtyped);
                            } else {
                                subPlayerStatsArray[i].drating = Math.floor(subPlayerStatsArray[i].drating > 0 ? multMultiplierWin*subPlayerStatsArray[i].drating : multMultiplierDefeat*subPlayerStatsArray[i].drating);
                                subPlayerStatsArray[i].drating = Math.floor(subPlayerStatsArray[i].dratingtyped > 0 ? multMultiplierWin*subPlayerStatsArray[i].dratingtyped : multMultiplierDefeat*subPlayerStatsArray[i].dratingtyped);
                            }
                        }
                    }
                    let concatPlayerStats = playerStatsArray.concat(subPlayerStatsArray);
                    for(i in concatPlayerStats){                         // Изменение в базе данных и последующая регистрация
                        await updateUserdataRating(concatPlayerStats[i].id, concatPlayerStats[i].rating+concatPlayerStats[i].drating);
                        await updateUserdataRatingTyped(concatPlayerStats[i].id, gameTypeIndex ? concatPlayerStats[i].ratingteam+concatPlayerStats[i].dratingtyped : concatPlayerStats[i].ratingffa+concatPlayerStats[i].dratingtyped, gameTypeIndex);
                        await setUserdataMoney(concatPlayerStats[i].id, concatPlayerStats[i].money+concatPlayerStats[i].dmoney);
                        await updateUserdataKarma(concatPlayerStats[i].id, Math.min(concatPlayerStats[i].karma+concatPlayerStats[i].dkarma, 100));
                        let gameValue = (i==0) ? 2 : ((concatPlayerStats[i].dratingtyped >= 0) ? 1 : -1);
                        await updateUserdataGameStats(concatPlayerStats[i].id, gameTypeIndex, gameValue);
                    }
                    if(multIndex != 0)                                  // Мультик первому игроку
                        await updateUserdataMultStats(playerStatsArray[0].id, multIndex, playerStatsArray.length-1)                 // игравшие, заменённые, тип игры, индекс мульта,
                    let embedMsgInstance = getEmbed_RatingChange(playerStatsArray, subPlayerStatsArray, gameTypeIndex ? teamCountInput : 0, multIndex, await databaseRatingRegister(concatPlayerStats, gameTypeIndex, multIndex), message.author);
                    await message.channel.send(embedMsgInstance)   // +индекс игры, +автор
                    await bot.channels.cache.get(ratingReportsChannelID).send(embedMsgInstance);
                    await updateUsersRatingRole(concatPlayerStats.map(x => x.id));
                    break;
                default:
                    return await message.channel.send(getEmbed_Error("Введите корректную подкоманду (см. <#807958245541019680>)."));
            }
            break;
        case 'cancel':
            let gameID = parseInteger(args.shift());
            if(isNaN(gameID) || (gameID == undefined))
                return await message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
            if(gameID <= 0)
                return await message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
            gameResults = await databaseRatingUnregister(gameID);
            if(gameResults.length == 0)
                return await message.channel.send(getEmbed_Error("Игры с таким ID не существует!"));
            if(gameResults[0].isActive == 0)
                return await message.channel.send(getEmbed_Error("Игра с таким ID уже была отменена!"));
            let concatPlayerStats = [];
            for(i in gameResults)
                concatPlayerStats.push(await getPlayerStatsObjectFromRegistered(gameResults[i]));
            gameTypeIndex = gameResults[i].gameType;
            multIndex = gameResults[i].multType;
            for(i in concatPlayerStats){
                await updateUserdataRating(concatPlayerStats[i].id, concatPlayerStats[i].rating-concatPlayerStats[i].drating);
                await updateUserdataRatingTyped(concatPlayerStats[i].id, gameTypeIndex ? concatPlayerStats[i].ratingteam-concatPlayerStats[i].dratingtyped : concatPlayerStats[i].ratingffa-concatPlayerStats[i].dratingtyped, gameTypeIndex);
                await setUserdataMoney(concatPlayerStats[i].id, concatPlayerStats[i].money-concatPlayerStats[i].dmoney);
                await updateUserdataKarma(concatPlayerStats[i].id, Math.max(concatPlayerStats[i].karma-concatPlayerStats[i].dkarma, 0));
                let gameValue = (i==0) ? 2 : ((concatPlayerStats[i].dratingtyped >= 0) ? 1 : -1);
                await updateUserdataGameStats(concatPlayerStats[i].id, gameTypeIndex, gameValue, true);
            }
            if(multIndex != 0)
                await updateUserdataMultStats(concatPlayerStats[0].id, multIndex, playerStatsArray.length-1, true);
            let embedMsgInstance = getEmbed_RatingChangeCancel(concatPlayerStats, gameTypeIndex, gameID, message.author);
            await message.channel.send(embedMsgInstance);
            await bot.channels.cache.get(ratingReportsChannelID).send(embedMsgInstance);
            await updateUsersRatingRole(concatPlayerStats.map(x => x.id));
            break;
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nffa, team, set, add/change, cancel."));
    }
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

module.exports = { ratingHandler, updateUsersRatingRole }
