const Discord =                             require('discord.js');
const { randomInteger, 
        getRandomHexBrightString, 
        String, 
        parseInteger }  =                   require('./functions.js')
const { getEmbed_NoVoice, 
        getEmbed_WrongNumber, 
        getEmbed_NotEnoughCivilizations } = require('./embedMessages.js')
const { indexNationPairArray } = require('./config.js');

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

function draftFFA(robot, message, args, autoNewUsers = false) {
    civilizationsCountMin = 1;
    civilizationsCountMax = 16;
    civilizationsCountDefault = 3;
    civilizationsCount = args[0];
    rawBans = args.slice(1);
    draftList = []; bans = []; errors = [];
    bansString = ""; valueField = ""; authorField = "";
    userBotsCount = 0;

    let users = [];
    if(autoNewUsers == false){
        voiceChannel = message.member.voice.channel;
        if(voiceChannel == null)
            return message.channel.send(getEmbed_NoVoice());
        users =  message.member.voice.channel.members;          // Особый тип данных
    } else {
        users = autoNewUsers;
    }
    usernames = users.map(member => member.user.tag);
    userID = users.keyArray();
    for(let i = 0; i < userID.length; i++)
        if(message.guild.members.cache.get(userID[i]).user.bot){
            usernames.splice(i, 1);
            userID.splice(i, 1);
            userBotsCount++;
        }
    playerCount = userID.length;

    civilizationCountParse = parseInteger(civilizationsCount);
    if(isNaN(civilizationCountParse) || (civilizationCountParse == undefined)){
        if(isNaN(civilizationCountParse))
            rawBans.push(civilizationsCount);
        civilizationsCount = civilizationsCountDefault;
    }
    if((civilizationsCount < civilizationsCountMin) || (civilizationsCount > civilizationsCountMax))
        return message.channel.send(getEmbed_WrongNumber(civilizationsCountMin, civilizationsCountMax));

    let rawBansTemp = [];    
    for(let iter of rawBans)         // Проверка на одинаковые элементы
        if(rawBansTemp.indexOf(iter) == -1) // Ещё нет такого элемента
            rawBansTemp.push(iter);
    rawBans = rawBansTemp;

    [draftList, bans, errors] = getDraftFFA(playerCount, civilizationsCount, rawBans);

    if(draftList.length == 0)
        return message.channel.send(getEmbed_NotEnoughCivilizations());
    authorField = playerCount == 1 ? "Драфт FFA для 1 игрока" : "Драфт FFA для {0} игроков".format(playerCount);
    const embedMsg = new Discord.MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setAuthor(authorField, robot.user.displayAvatarURL());

    if(bans.length != 0){
        bansString = "⛔ **Список банов ({0}):**\n".format(bans.length);
        for(ban of bans)
            bansString += (ban + "\n");
        bansString += "\u200B";
    }
    if(errors.length != 0){
        bansString += "⚠️ **Список ошибок ({0}):**\n".format(errors.length);
        for(ban of errors)
            bansString += (ban + ", ");
        bansString = bansString.slice(0, -2) + "\n";
    }
    if(userBotsCount != 0)
        bansString += "🤖 **В канале {0} {1} {2}.**\nБоты были удалены из драфта."
            .format(userBotsCount == 1 ? "присутствует" : "присутствуют", 
                    userBotsCount,
                    userBotsCount == 1 ? "бот" : "бота");
    embedMsg.setDescription(bansString);

    for(let i = 0; i < playerCount; i++){
        valueField = "**{0}** (<@{1}>)".format(usernames[i], userID[i]);
        for(let j = 0; j < civilizationsCount; j++)
            valueField += "\n{0}".format(draftList[i][j]);
        embedMsg.addField("\u200b", valueField);
    }
    embedMsg
        .setTimestamp()
        .setFooter(message.author.tag, message.author.avatarURL());
    message.channel.send(embedMsg);
}

let { civilizations } = require("./config.js");
const civilizationValuesArray = Array.from(civilizations.values());

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

function draftTeam(robot, message, args) {
    let teamCountMin = 2, teamCountMax = 6, teamCountDefault = 2;
    let teamCount = args[0];
    let rawBans = args.slice(1);
    draftList = []; bans = []; errors = [];
    let bansString = "", valueField = "", authorField = "";
    let colorHex = getRandomHexBrightString()
    const thumbnailsURL = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Antu_flag-red.svg/768px-Antu_flag-red.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Antu_flag-blue.svg/768px-Antu_flag-blue.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Antu_flag-green.svg/768px-Antu_flag-green.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Antu_flag-yellow.svg/768px-Antu_flag-yellow.svg.png",
        "https://media.discordapp.net/attachments/698295115063492758/837417222732644372/768px-Antu_flag-purple.svg.png?width=599&height=599",
        "https://cdn.discordapp.com/attachments/698295115063492758/838985443642310666/768px-Antu_flag-grey.svg.png",
    ];
    teamCountParse = parseInteger(teamCount);
    if(isNaN(teamCountParse) || (teamCountParse == undefined)){
        if(isNaN(teamCountParse))
            rawBans.push(teamCount);
            teamCount = teamCountDefault;
    }
    if((teamCount < teamCountMin) || (teamCount > teamCountMax))
        return message.channel.send(getEmbed_WrongNumber(teamCountMin, teamCountMax));

    let rawBansTemp = [];    
    for(let iter of rawBans)                // Проверка на одинаковые элементы
        if(rawBansTemp.indexOf(iter) == -1) // Ещё нет такого элемента
            rawBansTemp.push(iter);
    rawBans = rawBansTemp;

    [draftList, bans, errors] = getDraftTeam(teamCount, rawBans);

    if(draftList.length == 0)
        return message.channel.send(getEmbed_NotEnoughCivilizations());

    if(bans.length != 0){
        bansString = "⛔ **Список банов ({0}):**\n".format(bans.length);
        for(ban of bans)
            bansString += (ban + "\n");
    }
    if(errors.length != 0){
        bansString += "\n⚠️ **Список ошибок ({0}):**\n".format(errors.length);
        for(ban of errors)
            bansString += (ban + ", ");
        bansString = bansString.slice(0, -2);
    }
    authorField = "Драфт Team для {0} команд".format(teamCount);
    let embedMsg = new Discord.MessageEmbed()
        .setColor(colorHex)
        .setAuthor(authorField, robot.user.displayAvatarURL())
        .setDescription(bansString);
    message.channel.send(embedMsg);

    for(let i = 0; i < teamCount; i++){
        embedMsg = new Discord.MessageEmbed()
            .setColor(colorHex);
        valueField = "**Команда #{0}**".format(i+1);
        for(let j = 0; j < draftList[i].length; j++){
            valueField += "\n{0}".format(draftList[i][j]);
        }
        if((i+1) == teamCount)
            embedMsg
                .setTimestamp()
                .setFooter(message.author.tag, message.author.avatarURL());
        embedMsg
            .setDescription(valueField)
            .setThumbnail(thumbnailsURL[i]);
        message.channel.send(embedMsg);
    }
}

module.exports = { 
    draftFFA, 
    draftTeam,
}
