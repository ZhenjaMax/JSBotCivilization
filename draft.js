const Discord =                             require('discord.js');
const { randomInteger, 
        getRandomHexBrightString, 
        String, 
        parseInteger }  =                   require('./functions.js')
const { getEmbed_NoVoice, 
        getEmbed_WrongNumber, 
        getEmbed_NotEnoughCivilizations } = require('./embedMessages.js')

function getDraftFFA(playerCount, civilizationsCount, rawBans) {
    let { civilizations } = require("./data.js");
    civilizationsList = civilizations;
    civilizations = new Map(civilizationsList);

    const errorValue = [[], [], []];

    bans = [];
    bansError = [];
    draftList = [];

    for(let iter of rawBans)         // Проверка на одинаковые элементы
        if(bans.indexOf(iter) == -1) // Нет элемента
            bans.push(iter);
    rawBans = bans;
    bans = [];
    for(let iter of rawBans){
        if(civilizations.has(iter))
            bans.push(civilizations.get(iter));
        else if((iter != undefined) && (iter.trim() != ""))
            bansError.push(iter);
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
    return [draftList, bans, bansError];
}

function draftFFA(robot, message, args) {
    voiceChannel = message.member.voice.channel;
    if(voiceChannel == null)
        return message.channel.send(getEmbed_NoVoice());

    civilizationsCount = args[0];
    rawBans = args.slice(1);
    draftList = [];
    bans = [];
    bansError = [];
    bansString = "";
    valueField = "";
    inlineField = "\u200b"
    authorField = "";
    users =  message.member.voice.channel.members;
    userID = users.keyArray();
    usernames = users.map(member => member.user.tag);

    playerCount = userID.length;

    civilizationCountParse = parseInteger(civilizationsCount);
    if(isNaN(civilizationCountParse) || (civilizationCountParse == undefined)){
        if(isNaN(civilizationCountParse))
            rawBans.push(civilizationsCount);
        civilizationsCount = 3;
    }
    civilizationsCountMin = 1;
    civilizationsCountMax = 16;
    if((civilizationsCount < civilizationsCountMin) || (civilizationsCount > civilizationsCountMax))
        return message.channel.send(getEmbed_WrongNumber(civilizationsCountMin, civilizationsCountMax));

    [draftList, bans, bansError] = getDraftFFA(playerCount, civilizationsCount, rawBans);
    bans = bans.sort();
    bansError = bansError.sort();
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
    if(bansError.length != 0){
        bansString += "⚠️ **Список ошибок ({0}):**\n".format(bansError.length);
        for(ban of bansError)
            bansString += (ban + ", ");
        bansString = bansString.slice(0, -2) + "\u200B";
    }
    embedMsg.setDescription(bansString);

    for(let i = 0; i < playerCount; i++){
        valueField = "**{0}** (<@{1}>)".format(usernames[i], userID[i]);
        for(let j = 0; j < civilizationsCount; j++)
            valueField += "\n{0}".format(draftList[i][j]);
        embedMsg.addField(inlineField, valueField);
    }
    embedMsg
        .setTimestamp()
        .setFooter(message.author.tag, message.author.avatarURL());
    message.channel.send(embedMsg);
}

module.exports = { draftFFA }
