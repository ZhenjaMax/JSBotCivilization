const { updateNewCooldownDate,
        getAllUsersNewCooldown,
        getUserdata } = require('./database.js');
const { draftFFA,
        draftTeam } = require('./draft.js');
const { civilizations,
        numbersEmoji } = require('./config.js');
const { getEmbed_NoVoice,
        getEmbed_Split,
        getEmbed_Error,
        getEmbed_NewGameResult } = require('./embedMessages.js');
const { parsePlayers,
        deepCopy } = require('./functions.js');

const trueFilter = (reaction, user) => {return true;};
const emojiOrder = ["⛔"].concat(numbersEmoji.slice(1));
const civilizationsEmoji = Array.from(civilizations.keys());
const pickTeamStandart =  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
const pickTeamFair =      [0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
const voiceChannelStart = [
    "663144077818331190",
    "698542233770786917", ];
const voiceChannelsFFA = [
    "710084028161851452",
    "831677778784550952",
    "711937516692832258",
    "711937526784589896",
    "711937543356022898", ];
const voiceChannelsTeamers = [
    "711937891974250507",
    "711937939524943884",
    "711937965475102750",
    "711938004410695721" ];
const messagesFFA = [
    {
        content: `📌 __**Голосование за настройки и правила FFA**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#817348028591243264>.
        *Автор сообщения может отменить это голосование, нажав эмодзи  ⛔ под этим сообщением.*`,
        results: undefined,
        reactions: ["⛔"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `👥 __**Участники игры**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `⚡ __**Игроки, которые не проголосовали**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🌍 **Карта**`,
        results: ["🇵 Пангея", "🇭 Нагорье", "7️⃣ Семь морей", "🇱 Озёра", "🇨 Континенты", "🇦 Архипелаги"],
        reactions: ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🌋 **Стихийные бедствия**`,
        results: ["2️⃣", "3️⃣", "4️⃣"],
        reactions: ["2️⃣", "3️⃣", "4️⃣"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🌽 **Бонусные ресурсы**`,
        results: ["🇸 Стандартные", "🌽 Изобильные"],
        reactions: ["🇸", "🌽"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🐎 **Стратегические ресурсы**`,
        results: ["🇸 Стандартные", "🐎 Изобильные", "<:Yes:808418109710794843> Гарантированные"],
        reactions: ["🇸", "🐎", "<:Yes:808418109710794843>"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `⭐ **Количество чудес природы**`,
        results: ["🌅 Стандартное", "🌠 Изобильное"],
        reactions: ["🌅", "🌠"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🏞️ **Возраст мира**`,
        results: ["🏕️  Стандартный", "🏔️ Новый"],
        reactions: ["🏕️", "🏔️"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🪙 **Торговля золотом**`,
        results: ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🪙 Разрешена"],
        reactions: ["<:No:808418109319938099>", "🇦", "🇫", "🪙"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🐴 **Торговля стратегическими ресурсами**`,
        results: ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🐴 Разрешена"],
        reactions: ["<:No:808418109319938099>", "🇦", "🇫", "🐴"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🤝 **Число дружб**`,
        results: ["2️⃣", "3️⃣", "♾️"],
        reactions: ["2️⃣", "3️⃣", "♾️"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `⚔️ **Военный союз**`,
        results: ["<:No:808418109319938099> Запрещен", "🗡️ Разрешен"],
        reactions: ["<:No:808418109319938099>", "🗡️"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `💬 **Общение**`,
        results: ["🕵️ Любое", "📰 Только публичное"],
        reactions: ["🕵️", "📰"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🤔 **Баны наций**: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,
        results: [],     // далее устанавливается
        reactions: ["🤔"],     // далее изменяется
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите ⚡ ниже.**`,
        results: undefined,     // не нужно
        reactions: ["⚡"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
];
const messagesTeamers = [
    {
        content: `📌 __**Голосование за настройки и правила Teamers**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#817348028591243264>.
        *Автор сообщения может отменить это голосование, нажав эмодзи  ⛔ под этим сообщением.*` + "\n\n*Базовые настройки для Teamers приведены ниже.*\n\n🌋 __**Стихийные бедствия**__ | 2️⃣\n🏞️ __**Возраст мира**__ | 🏔️ Новый\n🤬 __**Варвары**__ | <:No:808418109319938099> Отключены",
        results: undefined,
        reactions: ["⛔"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `👥 __**Участники игры**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `⚡ __**Игроки, которые не проголосовали**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🌍 **Карта**`,
        results: ["🇵 Пангея", "🇭 Нагорье", "7️⃣ Семь морей", "🇱 Озёра", "🇨 Континенты", "🇦 Архипелаги", "🇮 Внутреннее море", "🇫 Фрактал", "🏝️ Континенты и острова"],
        reactions: ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦", "🇮", "🇫", "🏝️"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🗿 **Торговля реликвиями до 20 хода включительно**`,
        results: ["<:No:808418109319938099> Запрещена", "🗿 Разрешена только в ход получения"],
        reactions: ["<:No:808418109319938099>", "🗿"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `👑 **Выборы двух капитанов команд**`, 
        results: [],     // далее устанавливаются
        reactions: undefined,   // далее устанавливаются
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `🤔 **Баны наций**: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,
        results: [],     // далее устанавливается
        reactions: ["🤔"],     // далее изменяется
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
    {
        content: `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите ⚡ ниже.**`,
        results: undefined,     // не нужно
        reactions: ["⚡"],
        instance: undefined,
        collector: undefined,
        resultString: "",
    },
];

async function split(robot, message, args, autoNewCapitans = false, autoUserID = false, autoArgsTeamersDraft = false){
    let capitansID = [];
    let userID = [];
    if(!autoNewCapitans){
        voiceChannel = message.member.voice.channel;
        if(voiceChannel == null)
            return message.channel.send(getEmbed_NoVoice());
        capitansID = [message.author.id, parsePlayers(message.content)[0]];
        if(capitansID[1] == undefined)
            return message.channel.send(getEmbed_Error("Необходимо указать пользователя в качестве второго капитана."));
        if(capitansID[1] == capitansID[0])
            return message.channel.send(getEmbed_Error("Укажите другого игрока в качестве капитана, вы являетесь первым капитаном."));
        membersArray = await message.member.voice.channel.members.filter(member => !(member.user.bot))
        userID = membersArray.keyArray();
        if(userID.length%2 == 1)
            return message.channel.send(getEmbed_Error("Для разделения необходимо чётное число игроков!"));
        if((userID.length < 4)||(userID.length > 18))
            return message.channel.send(getEmbed_Error("Для разделения необходимо от 4 до 18 игроков!"));
        if(!userID.includes(capitansID[1]))
            return message.channel.send(getEmbed_Error("Второй капитан не присутствует в том же голосовом канале, что и вы!"));
    } else {
        capitansID = autoNewCapitans;
        userID = autoUserID;
    }

    playersNumber = userID.length;
    let teamPlayers = [[], []];
    let emojiReactions = [];
    for(i in capitansID){
        userID.splice(userID.indexOf(capitansID[i]), 1);    // Удалить капитанов из выбора всех игроков
        teamPlayers[i].push(capitansID[i]);
    }
    let r = Math.random();
    if(r >= 0.5){
        let temp = capitansID[1];
        capitansID[1] = capitansID[0];
        capitansID[0] = temp;
        temp = teamPlayers[1];
        teamPlayers[1] = teamPlayers[0];
        teamPlayers[0] = temp;
    }

    splitType = 0;
    handler = args[1];
    if((handler == "fair")||(autoNewCapitans))
        splitType = 1;
    const pickCurrent = splitType ? pickTeamFair : pickTeamStandart;
    splitStepNumber = 0;

    splitMessage = await message.channel.send(getEmbed_Split(teamPlayers, userID, pickCurrent[splitStepNumber], splitStepNumber, 1, message.author, playersNumber, splitType));
    const trueFilter = (reaction, user) => {return true;};
    const filter = (reaction, user) => {return ((capitansID[pickCurrent[splitStepNumber]] == user.id) && (emojiOrder.includes(reaction.emoji.toString()))) || (user.bot);};
    splitMessageCollector = await splitMessage.createReactionCollector(trueFilter, {time: 900000});
    for(i = 0; i <= userID.length; i++)
        emojiReactions.push(await splitMessage.react(emojiOrder[i]));
    splitMessageCollector.on('collect', async (reaction, user) => {
        if(filter(reaction, user)){
            if(user.bot) return;
            emojiName = reaction.emoji.toString();
            if(emojiName == emojiOrder[0]){
                splitMessage.delete();
                return;
            }
            await splitMessage.reactions.resolve(reaction).users.remove(user);
            emojiReactions[userID.length].users.remove(robot.user.id);
            teamPlayers[pickCurrent[splitStepNumber]].push(userID[emojiOrder.indexOf(emojiName)-1]);
            userID.splice(emojiOrder.indexOf(emojiName)-1, 1);
            splitStepNumber++;
            if(userID.length == 1){
                teamPlayers[pickCurrent[splitStepNumber]].push(userID[0]);
                userID = [];
                await splitMessage.edit(getEmbed_Split(teamPlayers, userID, pickCurrent[splitStepNumber], splitStepNumber, 2, message.author, playersNumber, splitType));
                await splitMessage.reactions.removeAll()
                await splitMessageCollector.stop();
                return;
            } else {
                splitMessage.edit(getEmbed_Split(teamPlayers, userID, pickCurrent[splitStepNumber], splitStepNumber, 0, message.author, playersNumber, splitType));
            }
        } else {
            await splitMessage.reactions.resolve(reaction).users.remove(user);
        }
    });
    splitMessageCollector.on('end', async (collected, reason) => {
        if((reason.toLowerCase() == "time")||(userID.length != 0)){
            if(!splitMessage.deleted)
                await splitMessage.delete();
        } else if(autoNewCapitans)
            draftTeam(robot, message, autoArgsTeamersDraft);
        return;
    });
}

async function newgameVoting(robot, message, args){
    let voiceChannel = message.member.voice.channel;
    if(voiceChannel == null)
        return message.channel.send(getEmbed_NoVoice());
    let authorID = message.author.id;
    let userData = await getUserdata(authorID);
    let newCommandDate = userData.newCooldown;
    let currentDate = new Date();
    if(newCommandDate)
        if((currentDate.getTime() - newCommandDate.getTime())/1000 < 150)
            return;
    let newList = await getAllUsersNewCooldown();
    for(newCooldownPlayer of newList)
        if((currentDate.getTime() - newCooldownPlayer.dataValues.newCooldown.getTime())/1000 < 150 )
            return;
        else
            await updateNewCooldownDate(newCooldownPlayer.dataValues.userid, true);

    let users =  message.member.voice.channel.members;
    let usersID = users.keyArray();
    for(let i = 0; i < usersID.length; i++)
        if(message.guild.members.cache.get(usersID[i]).user.bot)
            usersID.splice(i, 1);                               // Если в голосовом канале будет 2 бота, это может не сработать!
    const usersSourceID = usersID.map((x) => x);
    let usersCount = usersID.length;
    let handler = args.shift();
    let gameType = (handler == "team") ? 1 : 0;
    if(gameType && ((usersCount % 2 == 1)||(usersCount < 4)))
        return message.channel.send(getEmbed_Error("Для запуска голосования для Teamers необходимо четное количество игроков, но хотя бы 4."));
    if((gameType == 0)&&(usersCount < 2))
        return message.channel.send(getEmbed_Error("Для запуска голосования для FFA необходимо хотя бы 2 игрока."));
    await updateNewCooldownDate(authorID);

    let newGameMessages = deepCopy((gameType == 1) ? messagesTeamers : messagesFFA);
    if(gameType == 1){                                          // Инициализация строчки с капитаном
        newGameMessages[newGameMessages.length-3].reactions = emojiOrder.slice(1, usersCount+1);
        for(i in usersID)
            newGameMessages[newGameMessages.length-3].results.push("{0} <@{1}>".format(newGameMessages[newGameMessages.length-3].reactions[i], usersID[i]));
    }
    newGameMessages[1].content += " **({0})**".format(usersCount);
    newGameMessages[1].results = usersID.slice();
    newGameMessages[2].results = usersID.slice();

    let argsForDraft = [gameType ? 2 : 4];
    let capitansID = [];
    let civilizationsEmojiList = civilizationsEmoji.slice();
    let isFinished = false;

    if(voiceChannelStart.indexOf(voiceChannel.id) != -1){
        let channelIndex = 0, channelPlayersMinCount = 100, channelPlayersCount = 0;
        if(gameType == 0){
            for(i in voiceChannelsFFA){
                channelPlayersCount = await robot.channels.cache.get(voiceChannelsFFA[i]).members.size;
                if(channelPlayersCount < channelPlayersMinCount){
                    channelPlayersMinCount = channelPlayersCount;
                    channelIndex = Number(i);
                }
            }
        } else {
            for(i in voiceChannelsTeamers){
                channelPlayersCount = await robot.channels.cache.get(voiceChannelsTeamers[i]).members.size;
                if(channelPlayersCount < channelPlayersMinCount){
                    channelPlayersMinCount = channelPlayersCount;
                    channelIndex = Number(i);
                }
            }
        }
        for(userOfChannel of users.values())
            await userOfChannel.voice.setChannel(gameType == 0 ? voiceChannelsFFA[channelIndex] : voiceChannelsTeamers[channelIndex]);
    }

    const filter = (reaction, user) => {
        let k = 0;
        if(user.bot)
            return k;       // Неважно, если это бот (производится проверка)
        if(!usersSourceID.includes(user.id))
            return -1;      // не тот игрок
        for(let k in newGameMessages){
            if(newGameMessages[k].instance != undefined){
                if(newGameMessages[k].instance.id == reaction.message.id){
                    let emojiNameCommon = reaction.emoji.toString();
                    let emojiNameLower = emojiNameCommon.toLowerCase();
                    for(let nameElem of newGameMessages[k].reactions)
                        if((nameElem == emojiNameCommon)||(nameElem == emojiNameLower))
                            return k;
                    return -1;
                }
            }
        }
        return -1;
    };

    for(i in newGameMessages){
        let newGameStringTemp = newGameMessages[i].content;
        if(i == 2)
            newGameStringTemp += " **({0})**".format(usersCount);
        for(j in newGameMessages[i].results)
            if((i == 1)||(i == 2))
                newGameStringTemp += (" | " + "<@{0}>".format(newGameMessages[i].results[j]));
            else
                newGameStringTemp += (" | " + newGameMessages[i].results[j]);
        if((i == 1))
            newGameMessages[i].resultString = newGameStringTemp;
        if(!isFinished) newGameMessages[i].instance = await message.channel.send(newGameStringTemp);
        if(!isFinished) newGameMessages[i].collector = await newGameMessages[i].instance.createReactionCollector(trueFilter, {time: 185000});
        if(!isFinished) newGameMessages[i].collector.on('collect', async (reaction, user) => {
            if(user.bot) return;
            let filterIndex = filter(reaction, user);                    
                if(filterIndex == -1){              // неправильная реакция
                    for(j in newGameMessages)
                        if(newGameMessages[j].instance != undefined)
                            if(newGameMessages[j].instance.id == reaction.message.id)
                                return await newGameMessages[j].instance.reactions.resolve(reaction).users.remove(user);
                } else if(filterIndex == 0){        // Отмена голосованиЯ
                    if(user.id == authorID){
                        isFinished = true;
                        for(j in newGameMessages)
                            if(newGameMessages[j].instance != undefined)
                                await newGameMessages[j].instance.delete();
                        await updateNewCooldownDate(authorID, true);
                    } else await newGameMessages[filterIndex].instance.reactions.resolve(reaction).users.remove(user);
                } else if(filterIndex == newGameMessages.length-2){           // Бан по эмодзи
                    let nationEmojies = await newGameMessages[filterIndex].instance.reactions.cache.array();
                    let nationEmojiNameArray = nationEmojies.map(function(element){ return element._emoji.toString().toLowerCase(); });
                    let nationEmojiCountArray = nationEmojies.map(function(element){ return element.count; });
                    let nationEmojiName = reaction.emoji.toString().toLowerCase();
                    let nationEmojiCount = nationEmojiCountArray[nationEmojiNameArray.indexOf(nationEmojiName)];
                    if(nationEmojiCount > usersCount/2){
                        newGameMessages[filterIndex].results.push(civilizations.get(nationEmojiName));
                        civilizationsEmojiList.splice(civilizationsEmojiList.indexOf(nationEmojiName), 1);
                        let nationStringTemp = newGameMessages[filterIndex].content;
                        for(j in newGameMessages[filterIndex].results)
                            nationStringTemp += ("\n" + newGameMessages[filterIndex].results[j]);
                        await newGameMessages[filterIndex].instance.edit(nationStringTemp);
                        await reaction.remove();
                        argsForDraft.push(nationEmojiName);
                    }
                } else if(filterIndex == newGameMessages.length-1){              // Молния
                    let userSpliceIndex = usersID.indexOf(user.id);
                    if(userSpliceIndex == -1)
                        return;
                    newGameMessages[2].results.splice(userSpliceIndex, 1);
                    usersID.splice(userSpliceIndex, 1);
                    let collectStringTemp = newGameMessages[2].content + " **({0})**".format(usersID.length);
                    for(j in newGameMessages[2].results)
                        collectStringTemp += (" | " + "<@{0}>".format(newGameMessages[2].results[j]));
                    await newGameMessages[2].instance.edit(collectStringTemp);
                    if(newGameMessages[2].results.length == 0)
                        for(j in newGameMessages)
                            await newGameMessages[j].collector.stop();
                }
        });

        if(!isFinished) newGameMessages[i].collector.on('end', async (collected, reason) => {
            if(reason == "messageDelete" || isFinished)
                return;
            isFinished = true;
            for(let j=0; j<newGameMessages.length; j++)
                switch(j){
                    case 0:
                        newGameMessages[j].resultString = "📌 **Результат голосования за настройки и правила {0}".format(gameType ? "Teamers** 📌" : "FFA** 📌");
                    case 1:
                    case 2:
                    case newGameMessages.length-1:
                        break;
                    case newGameMessages.length-3:
                        if(gameType == 1){
                            let newGameStringCapitans = newGameMessages[j].content + " | ";
                            let collectedReactionsArray = await newGameMessages[j].instance.reactions.cache.array();
                            let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                            for(let k = 0; k < 2; k++){
                                let maxReactionIndex = collectedReactionsCountArray.indexOf(Math.max(...collectedReactionsCountArray));
                                capitansID.push(usersSourceID[maxReactionIndex]);
                                newGameStringCapitans += newGameMessages[j].results[maxReactionIndex];
                                if(k == 0) newGameStringCapitans += " и ";
                                collectedReactionsCountArray[maxReactionIndex] = 0;
                            }
                            newGameMessages[j].resultString = newGameStringCapitans;
                        }
                        break;
                    case newGameMessages.length-2:
                        let newGameStringBans = `🤔 __**Баны наций:**__`;
                        if(newGameMessages[j].results.length == 0)
                            newGameStringBans += " (нет)";
                        else for(k in newGameMessages[j].results)
                            newGameStringBans += ("\n" + newGameMessages[j].results[k]);
                        newGameMessages[j].resultString = newGameStringBans;
                        break;
                    default:
                        let collectedReactionsArray = await newGameMessages[j].instance.reactions.cache.array();
                        let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                        let maxReactionIndex =  collectedReactionsCountArray.indexOf(Math.max(...collectedReactionsCountArray));
                        newGameMessages[j].resultString = newGameMessages[j].content + " | " + newGameMessages[j].results[maxReactionIndex];
                        break;
                }
            await message.channel.send(getEmbed_NewGameResult(newGameMessages, message.author));
            await updateNewCooldownDate(authorID, true);
            gameType == 0 ? await draftFFA(robot, message, argsForDraft, users) : await split(robot, message, args, capitansID, usersSourceID, argsForDraft);
            for(j in newGameMessages)
                if(newGameMessages[j].instance != undefined)
                    await newGameMessages[j].instance.delete();
        });

        for(j in newGameMessages[i].reactions)
            if(!isFinished)
                await newGameMessages[i].instance.react(newGameMessages[i].reactions[j]);
        if(i == newGameMessages.length-2)
            if(!isFinished)
                newGameMessages[i].reactions = civilizationsEmojiList;
    }
}

module.exports = { newgameVoting, split }
