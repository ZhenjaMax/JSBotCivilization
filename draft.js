const   Discord = require('discord.js');
const { randomInteger, 
        getRandomHexBrightString, 
        String, 
        parseInteger,
        trueFilter }  = require('./functions.js')
const { getEmbed_NoVoice,
        getEmbed_Error, 
        getEmbed_WrongNumber, 
        getEmbed_NotEnoughCivilizations,
        getEmbed_DraftFFA,
        getEmbed_DraftTeamHeader,
        getEmbed_DraftTeamPage,
        getEmbed_RedraftProposalFFA, } = require('./embedMessages.js')
const { indexNationPairArray,
        civilizations } = require('./config.js');

const civilizationValuesArray = Array.from(civilizations.values());
redraftIsProcessed = false;
redraftCounter = 0;
redraftType = -1;
redraftArgs = [];
redraftUsers = [];
redraftBots = 0;

function getDraftFFA(playerCount, civilizationsCount, rawBans) {
    let { civilizations } = require("./config.js");
    civilizationsList = civilizations;
    civilizations = new Map(civilizationsList);

    const errorValue = [[], [], []];

    bans = [];
    errors = [];
    draftList = [];

    for(let iter of rawBans){
        if(civilizations.has(iter))
            bans.push(civilizations.get(iter));
        else if((iter != undefined) && (iter.trim() != ""))
            errors.push(iter);
        civilizations.delete(iter); // Если элемента не было, то всё ОК
    }

    if(civilizationsCount*playerCount > civilizations.size)
        return errorValue;

    for(let playerIndex = 0; playerIndex < playerCount; playerIndex++)
    {
        draft = [];
        for(let civilizationsIndex = 0; civilizationsIndex < civilizationsCount; civilizationsIndex++)
        {
            civilizationKey = Array.from(civilizations.keys())[randomInteger(civilizations.size)];
            draft.push(civilizations.get(civilizationKey));
            civilizations.delete(civilizationKey);
        }
        draftList.push(draft.sort());
    }
    return [draftList, bans.sort(), errors.sort()];
}

async function draftFFA(robot, message, args, autoNewUsers = false, isRedraft = false) {
    civilizationsCountMin = 1;
    civilizationsCountMax = 16;
    civilizationsCountDefault = 4;
    civilizationsCount = args[0];
    rawBans = args.slice(1);
    draftList = []; bans = []; errors = [];
    userBotsCount = 0;

    let users = [];
    if(autoNewUsers == false){
        voiceChannel = message.member.voice.channel;
        if(voiceChannel == null) return await message.channel.send(getEmbed_NoVoice());
        users = message.member.voice.channel.members;          // Особый тип данных
    } else users = autoNewUsers;
    usernames = users.map(member => member.user.tag);
    userID = users.keyArray();

    for(let i = 0; i < userID.length; i++){
        if(message.guild.members.cache.get(userID[i]).user.bot){
            usernames.splice(i, 1);
            userID.splice(i, 1);
            userBotsCount++;
        }
    }
    playerCount = userID.length;

    civilizationCountParse = parseInteger(civilizationsCount);
    if(isNaN(civilizationCountParse) || (civilizationCountParse == undefined)){
        if(isNaN(civilizationCountParse))
            rawBans.push(civilizationsCount);
        civilizationsCount = civilizationsCountDefault;
    }
    if((civilizationsCount < civilizationsCountMin) || (civilizationsCount > civilizationsCountMax)) return message.channel.send(getEmbed_WrongNumber(civilizationsCountMin, civilizationsCountMax));

    let rawBansTemp = [];    
    for(let iter of rawBans)         // Проверка на одинаковые элементы
        if(rawBansTemp.indexOf(iter) == -1) // Ещё нет такого элемента
            rawBansTemp.push(iter);
    rawBans = rawBansTemp;
    [draftList, bans, errors] = getDraftFFA(playerCount, civilizationsCount, rawBans);
    if(draftList.length == 0) return await message.channel.send(getEmbed_NotEnoughCivilizations());

    redraftCounter = (isRedraft) ? redraftCounter+1 : 0;
    redraftType = 0;
    redraftArgs = [civilizationsCount].concat(rawBans);
    redraftUsers = users.clone();
    redraftBots = userBotsCount;

    await message.channel.send(getEmbed_DraftFFA(bans, errors, draftList, userBotsCount, usernames, userID, message.author, redraftCounter));
}

function getDraftSwapIndexRoutine(draft, indexNationPair){
    indexA = draft.indexOf(civilizationValuesArray[indexNationPair[0]]);
    indexB = draft.indexOf(civilizationValuesArray[indexNationPair[1]]);
    if(indexA != -1 && indexB != -1) 
        return Math.random() < 0.5 ? indexA : indexB;
    return -1;
}

function getDraftSwapIndex(draft){
    let swapIndex = -1;
    for(pair of indexNationPairArray){
        swapIndex = getDraftSwapIndexRoutine(draft, pair);
        if(swapIndex != -1)
            return swapIndex;
    }
    return swapIndex;
}

function getDraftTeam(teamCount, rawBans){
    let { civilizations } = require("./config.js");
    civilizationsList = civilizations;
    civilizations = new Map(civilizationsList);

    const errorValue = [[], [], []];
    bans = [];
    errors = [];
    draftList = [];

    for(let iter of rawBans){
        if(civilizations.has(iter))
            bans.push(civilizations.get(iter));
        else if((iter != undefined) && (iter.trim() != ""))
            errors.push(iter);
        civilizations.delete(iter); // Если элемента не было, то всё ОК
    }

    let civilizationsCount = Math.floor(civilizations.size/teamCount);
    if(civilizationsCount == 0)
        return errorValue;

    for(let teamIndex = 0; teamIndex < teamCount; teamIndex++){
        let draft = [];
        for(let civilizationsIndex = 0; civilizationsIndex < civilizationsCount; civilizationsIndex++){
            civilizationKey = Array.from(civilizations.keys())[randomInteger(civilizations.size)];
            draft.push(civilizations.get(civilizationKey));
            civilizations.delete(civilizationKey);
        }
        draftList.push(draft);
    }
    
    let correctDraft = false, swapIndex = -1;
    while(!correctDraft){
        correctDraft = true;
        for(let i = 0; i < teamCount; i++){
            swapIndex = getDraftSwapIndex(draftList[i]);
            if(swapIndex != -1){
                correctDraft = false;
                let randomSwapIndex = randomInteger(civilizationsCount);
                let temp = draftList[i][swapIndex];
                draftList[i][swapIndex] = draftList[(i+1)%2][randomSwapIndex];
                draftList[(i+1)%2][randomSwapIndex] = temp;
            }
        }
    }
    draftList.forEach(draft => draft.sort());
    return [draftList, bans.sort(), errors.sort()];
}

async function draftTeam(robot, message, args, isRedraft = false) {
    let teamCountMin = 2, teamCountMax = 6, teamCountDefault = 2;
    let teamCount = args[0];
    let rawBans = args.slice(1);
    draftList = []; bans = []; errors = [];
    let colorHex = getRandomHexBrightString()

    teamCountParse = parseInteger(teamCount);
    if(isNaN(teamCountParse) || (teamCountParse == undefined)){
        if(isNaN(teamCountParse))
            rawBans.push(teamCount);
            teamCount = teamCountDefault;
    }
    if((teamCount < teamCountMin) || (teamCount > teamCountMax)) return await message.channel.send(getEmbed_WrongNumber(teamCountMin, teamCountMax));

    let rawBansTemp = [];    
    for(let iter of rawBans)                // Проверка на одинаковые элементы
        if(rawBansTemp.indexOf(iter) == -1) // Ещё нет такого элемента
            rawBansTemp.push(iter);
    rawBans = rawBansTemp;

    [draftList, bans, errors] = getDraftTeam(teamCount, rawBans);
    if(draftList.length == 0) return await message.channel.send(getEmbed_NotEnoughCivilizations());

    redraftCounter = (isRedraft) ? redraftCounter+1 : 0;
    redraftType = 1;
    redraftArgs = [teamCount].concat(rawBans);

    await message.channel.send(getEmbed_DraftTeamHeader(bans, errors, colorHex, teamCount, redraftCounter));
    for(let i = 0; i < teamCount; i++)
        await message.channel.send(getEmbed_DraftTeamPage(i, colorHex, draftList[i], (i+1 == teamCount) ? message.author : null))
}

async function redraft(robot, message, args){
    switch(redraftType){
        case -1: return await message.channel.send(getEmbed_Error("Драфта для проведения редрафта не найдено!"));
        case 1: return await draftTeam(robot, message, redraftArgs, true);
        case 0:
            if(redraftIsProcessed) return await message.channel.send(getEmbed_Error("Голосование о редрафте уже проводится!"));
            redraftIsProcessed = true;
            let playersCount = redraftUsers.size - redraftBots;
            let playersNeedCount = Math.min(Math.ceil((playersCount-1)/2)+1+redraftCounter, playersCount);
            const reactionList = ["<:Yes:808418109710794843>", "<:No:808418109319938099>"];
            const filterConfirm = (reaction, user) => { return (user.bot || ( reactionList.includes(reaction.emoji.toString()) && redraftUsers.has(user.id) )) };
            redraftMessage = await message.channel.send(getEmbed_RedraftProposalFFA(playersNeedCount, playersCount, redraftCounter, message.author, -1));

            redraftCollector = await redraftMessage.createReactionCollector(trueFilter, {time: 92000});
            redraftCollector.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user)){
                    let collectedReactionsArray = await redraftMessage.reactions.cache.array();
                    let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                    if(collectedReactionsCountArray[0] > playersNeedCount)
                        await redraftCollector.stop();
                    else if(collectedReactionsCountArray[1] > playersCount-playersNeedCount+1)
                        await redraftCollector.stop();
                } else if(!user.bot) await redraftMessage.reactions.resolve(reaction).users.remove(user);
            });
            redraftCollector.on('end', async (collected, reason) => {
                redraftIsProcessed = false;
                let collectedReactionsArray = await redraftMessage.reactions.cache.array();
                let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                await redraftMessage.reactions.removeAll();
                if((reason.toLowerCase() == "time")|| (collectedReactionsCountArray[1]>playersCount-playersNeedCount+1)){
                    redraftType = -1;
                    await redraftMessage.edit(getEmbed_RedraftProposalFFA(playersNeedCount, playersCount, redraftCounter, message.author, 0));
                }else{
                    await redraftMessage.edit(getEmbed_RedraftProposalFFA(playersNeedCount, playersCount, redraftCounter, message.author, 1));
                    await draftFFA(robot, message, redraftArgs, redraftUsers, true);
                }
            });
            for(i in reactionList)
                await redraftMessage.react(reactionList[i]);
    }
}

module.exports = {
    redraft,
    draftFFA, 
    draftTeam,
}
