const Discord =                             require('discord.js');
const { randomInteger, 
        getRandomHexBrightString, 
        String, 
        parseInteger }  =                   require('./functions.js')
const { getEmbed_NoVoice, 
        getEmbed_WrongNumber, 
        getEmbed_NotEnoughCivilizations } = require('./embedMessages.js')

function getDraftFFA(playerCount, civilizationsCount, rawBans) {
    let { civilizations } = require("./config.js");
    civilizationsList = civilizations;
    civilizations = new Map(civilizationsList);

    const errorValue = [[], [], []];

    bans = [];
    errors = [];
    draftList = [];

    for(let iter of rawBans)         // Проверка на одинаковые элементы
        if(bans.indexOf(iter) == -1) // Ещё нет такого элемента
            bans.push(iter);
    rawBans = bans;
    bans = [];
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
    return [draftList, bans, errors];
}

function draftFFA(robot, message, args) {
    civilizationsCountMin = 1;
    civilizationsCountMax = 16;
    civilizationsCountDefault = 3;
    civilizationsCount = args[0];
    rawBans = args.slice(1);
    draftList = []; bans = []; errors = [];
    bansString = ""; valueField = ""; authorField = "";
    userBotsCount = 0;

    voiceChannel = message.member.voice.channel;
    if(voiceChannel == null)
        return message.channel.send(getEmbed_NoVoice());

    users =  message.member.voice.channel.members;          // Особый тип данных
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
    [draftList, bans, errors] = getDraftFFA(playerCount, civilizationsCount, rawBans);
    if(draftList.length == 0)
        return message.channel.send(getEmbed_NotEnoughCivilizations());

    bans = bans.sort();
    errors = errors.sort();
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

module.exports = { draftFFA }
