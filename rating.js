const { parsePlayers,
        parseInteger,
        trueFilter } = require('./functions.js');
const { getUserdata,
        databaseRatingRegister,
        databaseRatingUnregister, 
        setUserdata } = require('./database.js');
const { getEmbed_Error,
        getEmbed_RatingSingleChange,
        getEmbed_RatingChange,
        getEmbed_RatingChangeCancel,
        getEmbed_RatingChangeProposal,
        getEmbed_RatingProposal,
        getEmbed_RatingProposalConfirmed, } = require('./embedMessages.js');
const { updateUsersRatingRole,
        updateUsersWeakRole,
        updateUsersPlayRole,
        hasPermissionLevel, } = require('./roleManager.js');
const { bot,
        ratingReportsChannelID,
        newRatingReportsChannelID,
        guildID, } = require('./config.js');

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
    let userInstance = bot.guilds.cache.get(guildID).members.cache.get(ratingObject.userid).user;
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

async function ratingPlayerStringHandler(message, args, playerStatsArray, gameTypeIndex, multIndex, teamCountInput){
    let subPlayerStatsArray = [];
    let iterIndex = 0;
    let playersCount = playerStatsArray.length;
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
                else return await message.channel.send(getEmbed_Error("Некорректные данные о статусе игроков (см. <#807958245541019680>)!"));
                break;
        }
        playersCount = playerStatsArray.length;
    }
    if(args.shift() == "leave") 
        playerStatsArray[playerStatsArray.length-1].isLeave = true;
    if(gameTypeIndex == 0){                             // Индексы для ничьи
        for(let i = 0; i < playerStatsArray.length-1; i++){
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
            playerStatsArray[i].dmoney = Math.max(Math.floor(2*playersCount*playersCount - 3*playerStatsArray[i].dratingtyped/playersCount + 10*playersCount), 0);
        } else {
            playerStatsArray[i].dkarma = Math.floor(playersCount/2);
            playerStatsArray[i].dmoney = Math.max(Math.floor(2*playersCount*playersCount - 3*playerStatsArray[i].dratingtyped/playersCount), 0);
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
    return [subPlayerStatsArray, playerStatsArray.concat(subPlayerStatsArray)];
}

async function setPlayerStatsObject(playerStatsArray, concatPlayerStats, gameTypeIndex, multIndex){
    let currentDate = new Date();                
    for(let i = 0; i < concatPlayerStats.length; i++){              // Сохранение и регистрация
        let userdata = await getUserdata(concatPlayerStats[i].id);
        userdata.lastGameDate = currentDate;
        userdata.rating += concatPlayerStats[i].drating;
        if(gameTypeIndex) userdata.ratingteam += concatPlayerStats[i].dratingtyped;
        else userdata.ratingffa += concatPlayerStats[i].dratingtyped;
        userdata.money += concatPlayerStats[i].dmoney;
        userdata.karma = Math.min(userdata.karma + concatPlayerStats[i].dkarma, 100);
        userdata.weakPoints = (concatPlayerStats[i].isLeave) ? userdata.weakPoints : ((multIndex) ? Math.max(userdata.weakPoints-2, 0) : Math.max(userdata.weakPoints-1, 0));
        if(i==0){
            userdata.firstPlaceFFA++;
            switch(multIndex){
                case 0: break;
                case 1: userdata.multScience    += playerStatsArray.length-1;    break;
                case 2: userdata.multCulture    += playerStatsArray.length-1;    break;
                case 3: userdata.multDomination += playerStatsArray.length-1;    break;
                case 4: userdata.multReligious  += playerStatsArray.length-1;    break;
                case 5: userdata.multDiplomatic += playerStatsArray.length-1;    break;
                case 6: userdata.multScore      += playerStatsArray.length-1;    break;
            }
        }
        (concatPlayerStats[i].dratingtyped >= 0) ? userdata.winsFFA++ : userdata.defeatsFFA++;
        await setUserdata(userdata);
        await updateUsersWeakRole(userdata.userid);
    }
}

async function ratingHandler(robot, message, args){
    let playersID = parsePlayers(message.content);
    let playersCount = playersID.length;
    let handler = args.shift();
    let gameTypeIndex = 0;
    let multIndex = 0;
    let teamCountInput = 1;
    let isAdministrator = hasPermissionLevel(message.member, 2);
    switch(handler){
        case 'add':
        case 'change':
        case 'set':
            if(!isAdministrator)  return await message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
            if(playersCount != 1) return await message.channel.send(getEmbed_Error("Для данной команды необходимо ввести одного игрока."));
            let ratingValue = parseInteger(args[1]);
            if(isNaN(ratingValue) || (ratingValue == undefined)) return await message.channel.send(getEmbed_Error("Введите значение рейтинга."));
            let userdata = await getUserdata(playersID[0]);
            let playerStats = await getPlayerStatsObjectFromData(userdata);
            playerStats.drating = (handler == 'set') ? ratingValue-playerStats.rating : ratingValue;
            userdata.rating += playerStats.drating;
            await setUserdata(userdata);
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
                    multIndex = multTypeList.indexOf(args.shift())+1;
                    if(multIndex == 0) return await message.channel.send(getEmbed_Error("Введите один из следующих типов победы:\nscience, culture, domination, religious, diplomatic, score."));
                case 'cc':
                case 'gg':
                    let playerStatsArray = [];
                    for(let i = 0; i < playersCount; i++)
                        playerStatsArray.push(await getPlayerStatsObjectFromData(await getUserdata(playersID[i])));
                    let stringHandlerReturnValue = await ratingPlayerStringHandler(message, args, playerStatsArray, gameTypeIndex, multIndex, teamCountInput);
                    let subPlayerStatsArray = stringHandlerReturnValue[0];
                    let concatPlayerStats = stringHandlerReturnValue[1];
                    if(concatPlayerStats == undefined) return;
                    if(!isAdministrator){
                        let attachmentObject = message.attachments.first();
                        let imageURL = undefined;
                        if(attachmentObject)
                            imageURL = attachmentObject.url;
                        message.channel.send(getEmbed_RatingProposal(message.author));
                        let ratingProposalMessage = await bot.channels.cache.get(newRatingReportsChannelID).send(getEmbed_RatingChangeProposal(playerStatsArray, subPlayerStatsArray, (gameTypeIndex) ? teamCountInput : 0, multIndex, " -", message.author, imageURL));
                        let ratingProposalMessageCollector = ratingProposalMessage.createReactionCollector(trueFilter, {time: 86400000});
                        let reactedAdministrator = undefined;
                        ratingProposalMessageCollector.on('collect', async (reaction, user) =>{
                            let reactedMember = bot.guilds.cache.get(guildID).members.cache.get(user.id);
                            if(user.bot || (reaction.emoji.toString() == "<:Yes:808418109710794843>") || (reaction.emoji.toString() == "<:No:808418109319938099>") )
                                return;
                            else if((reaction.emoji.toString() == "🗑️")&&(hasPermissionLevel(reactedMember, 2)))
                                await ratingProposalMessage.delete();
                            else if((reaction.emoji.toString() == "🔨")&&(hasPermissionLevel(reactedMember, 2))){
                                reactedAdministrator = user;
                                await ratingProposalMessageCollector.stop();
                            }
                            else await ratingProposalMessage.reactions.resolve(reaction).users.remove(user);
                        });
                        ratingProposalMessageCollector.on('end', async (collected, reason) => {
                            await ratingProposalMessage.delete();
                            if((reason == "messageDelete")||(reason.toLowerCase() == "time"))
                                return;
                            await setPlayerStatsObject(playerStatsArray, concatPlayerStats, gameTypeIndex, multIndex);
                            let embedMsgRating = getEmbed_RatingChange(playerStatsArray, subPlayerStatsArray, (gameTypeIndex) ? teamCountInput : 0, multIndex, await databaseRatingRegister(concatPlayerStats, gameTypeIndex, multIndex), reactedAdministrator);
                            let ratingConfirmedMsg = await bot.channels.cache.get(newRatingReportsChannelID).send(getEmbed_RatingProposalConfirmed(reactedAdministrator));
                            await bot.channels.cache.get(ratingReportsChannelID).send(embedMsgRating);
                            await updateUsersRatingRole(concatPlayerStats.map(x => x.id));
                            await updateUsersPlayRole(concatPlayerStats.map(x => x.id), gameTypeIndex);
                            setTimeout(async function(){ await ratingConfirmedMsg.delete();}, 10000);
                            return;
                        });
                        await ratingProposalMessage.react("<:Yes:808418109710794843>");
                        await ratingProposalMessage.react("<:No:808418109319938099>");
                        await ratingProposalMessage.react("🔨");
                        await ratingProposalMessage.react("🗑️");
                        return;
                    }
                    await setPlayerStatsObject(playerStatsArray, concatPlayerStats, gameTypeIndex, multIndex);
                    let embedMsgInstance = getEmbed_RatingChange(playerStatsArray, subPlayerStatsArray, (gameTypeIndex) ? teamCountInput : 0, multIndex, await databaseRatingRegister(concatPlayerStats, gameTypeIndex, multIndex), message.author);
                    await message.channel.send(embedMsgInstance);
                    await bot.channels.cache.get(ratingReportsChannelID).send(embedMsgInstance);
                    await updateUsersRatingRole(concatPlayerStats.map(x => x.id));
                    await updateUsersPlayRole(concatPlayerStats.map(x => x.id), gameTypeIndex);
                    break;
                default:
                    return await message.channel.send(getEmbed_Error("Введите корректную подкоманду (см. <#807958245541019680>)."));
            }
            break;
        case 'cancel':
            if(!isAdministrator)  return await message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
            let gameID = parseInteger(args.shift());
            if(isNaN(gameID) || (gameID == undefined)) return await message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
            if(gameID <= 0) return await message.channel.send(getEmbed_Error("Введите натуральное число в качестве ID игры."));
            let gameResults = await databaseRatingUnregister(gameID);
            if(gameResults.length == 0) return await message.channel.send(getEmbed_Error("Игры с таким ID не существует!"));
            if(gameResults[0].isActive == 0) return await message.channel.send(getEmbed_Error("Игра с таким ID уже была отменена!"));
            let concatPlayerStats = [];
            for(i in gameResults)
                concatPlayerStats.push(await getPlayerStatsObjectFromRegistered(gameResults[i]));
            gameTypeIndex = gameResults[0].gameType;
            multIndex = gameResults[0].multType;
            for(let i = 0; i < concatPlayerStats.length; i++){
                let userdata = await getUserdata(concatPlayerStats[i].id);
                userdata.rating -= concatPlayerStats[i].drating;
                if(gameTypeIndex)
                    userdata.ratingteam -= concatPlayerStats[i].dratingtyped;
                else userdata.ratingffa -= concatPlayerStats[i].dratingtyped;
                userdata.money -= concatPlayerStats[i].dmoney;
                userdata.karma = Math.max(userdata.karma+concatPlayerStats[i].dkarma, 0);
                if(i==0){
                    userdata.firstPlaceFFA--;
                    switch(multIndex){
                        case 0: break;
                        case 1: userdata.multScience    -= playerStatsArray.length-1;    break;
                        case 2: userdata.multCulture    -= playerStatsArray.length-1;    break;
                        case 3: userdata.multDomination -= playerStatsArray.length-1;    break;
                        case 4: userdata.multReligious  -= playerStatsArray.length-1;    break;
                        case 5: userdata.multDiplomatic -= playerStatsArray.length-1;    break;
                        case 6: userdata.multScore      -= playerStatsArray.length-1;    break;
                    }
                }
                (concatPlayerStats[i].dratingtyped >= 0) ? userdata.winsFFA-- : userdata.defeatsFFA--;
                await setUserdata(userdata);
            }
            let embedMsgInstance = getEmbed_RatingChangeCancel(concatPlayerStats, gameTypeIndex, gameID, message.author);
            await message.channel.send(embedMsgInstance);
            await bot.channels.cache.get(ratingReportsChannelID).send(embedMsgInstance);
            await updateUsersRatingRole(concatPlayerStats.map(x => x.id));
            break;
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nffa, team, set, add/change, cancel."));
    }
}

module.exports = { ratingHandler }
