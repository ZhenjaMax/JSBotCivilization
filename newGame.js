const { updateNewCooldownDate,
        getAllUsersNewCooldown,
        getUserdata } = require('./database.js');
const { draftFFA,
        draftTeam } = require('./draft.js');
const { civilizations } = require('./config.js');
const { getEmbed_NoVoice,
        getEmbed_Split,
        getEmbed_Error } = require('./embedMessages.js');
const { parsePlayers,
        deepCopy } = require('./functions.js');

const trueFilter = (reaction, user) => {return true;};
const emojiOrder = ["⛔", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🇦", "🇧", "🇨", "🇩", "🇪", "🇫"];
const civilizationsEmoji = Array.from(civilizations.keys());
const pickTeamStandart =  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
const pickTeamFair =      [0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
const messagesFFA = [
    {
        content: `📌 __**Голосование за настройки и правила FFA**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#817348028591243264>.
        *Автор сообщения может отменить это голосование, нажав эмодзи  ⛔ под этим сообщением.*`,
        results: undefined,
        reactions: ["⛔"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `👥 __**Участники игры**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
    },
    {
        content: `⚡ __**Игроки, которые не проголосовали**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Карта**__`,
        results: ["🇵 Пангея", "🇭 Нагорье", "7️⃣ Семь морей", "🇱 Озёра", "🇨 Континенты", "🇦 Архипелаги"],
        reactions: ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Стихийные бедствия**__`,
        results: ["2️⃣", "3️⃣", "4️⃣"],
        reactions: ["2️⃣", "3️⃣", "4️⃣"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Бонусные ресурсы**__`,
        results: ["🇸 Стандартные", "🇦 Изобильные"],
        reactions: ["🇸", "🇦"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Стратегические ресурсы**__`,
        results: ["🇸 Стандартные", "🇦 Изобильные", "<:Yes:808418109710794843> Гарантированные"],
        reactions: ["🇸", "🇦", "<:Yes:808418109710794843>"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Количество чудес природы**__`,
        results: ["🌅 Стандартное", "🌠 Изобильное"],
        reactions: ["🌅", "🌠"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Возраст мира**__`,
        results: ["🏕️  Стандартный", "🏔️ Новый"],
        reactions: ["🏕️", "🏔️"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Торговля золотом**__`,
        results: ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🪙 Разрешена"],
        reactions: ["<:No:808418109319938099>", "🇦", "🇫", "🪙"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Торговля стратегическими ресурсами**__`,
        results: ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🐴 Разрешена"],
        reactions: ["<:No:808418109319938099>", "🇦", "🇫", "🐴"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Максимальное количество одновременных дружб и союзов в сумме**__`,
        results: ["2️⃣", "3️⃣", "♾️"],
        reactions: ["2️⃣", "3️⃣", "♾️"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Общение**__`,
        results: ["🕵️ Любое", "📰 Только публичное"],
        reactions: ["🕵️", "📰"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Баны наций**__: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,
        results: [],     // далее устанавливается
        reactions: ["🤔"],     // далее изменяется
        instance: undefined,
        collector: undefined,
    },
    {
        content: `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите ⚡ ниже.**`,
        results: undefined,     // не нужно
        reactions: ["⚡"],
        instance: undefined,
        collector: undefined,
    },
];
const messagesTeamers = [
    {
        content: `📌 __**Голосование за настройки и правила Teamers**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#817348028591243264>.
        *Автор сообщения может отменить это голосование, нажав эмодзи  ⛔ под этим сообщением.*

        *Базовые настройки для Teamers приведены ниже.*
        __**Стихийные бедствия**__: 2️⃣
        __**Возраст мира**__: 🏔️ Новый
        __**Варвары**__: <:No:808418109319938099> Отключены`,
        results: undefined,
        reactions: ["⛔"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `👥 __**Участники игры**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
    },
    {
        content: `⚡ __**Игроки, которые не проголосовали**__`,
        results: undefined,
        reactions: undefined,
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Карта**__`,
        results: ["🇵 Пангея", "🇭 Нагорье", "7️⃣ Семь морей", "🇱 Озёра", "🇨 Континенты", "🇦 Архипелаги", "🇮 Внутреннее море", "🇫 Фрактал", "🏝️ Континенты и острова"],
        reactions: ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦", "🇮", "🇫", "🏝️"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Торговля реликвиями до 20 хода включительно**__`,
        results: ["<:No:808418109319938099> Запрещена", "💨 Разрешена только в ход получения", "🗿 Разрешена"],
        reactions: ["<:No:808418109319938099>", "💨", "🗿"],
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Выборы двух капитанов команд**__`, 
        results: [],     // далее устанавливаются
        reactions: undefined,   // далее устанавливаются
        instance: undefined,
        collector: undefined,
    },
    {
        content: `__**Баны наций**__: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,
        results: [],     // далее устанавливается
        reactions: ["🤔"],     // далее изменяется
        instance: undefined,
        collector: undefined,
    },
    {
        content: `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите ⚡ ниже.**`,
        results: undefined,     // не нужно
        reactions: ["⚡"],
        instance: undefined,
        collector: undefined,
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
            await splitMessage.delete();
        } else if(autoNewCapitans){
            draftTeam(robot, message, autoArgsTeamersDraft);
        }
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
    let usersSourceID = usersID.map((x) => x);
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

    const filter = (reaction, user) => {
        let k = 0;
        if(user.bot)
            return k;       // Неважно, если это бот (производится проверка)
        if(!usersID.includes(user.id))
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
        if(!isFinished)
            newGameMessages[i].instance = await message.channel.send(newGameStringTemp);
        if(!isFinished)
            newGameMessages[i].collector = await newGameMessages[i].instance.createReactionCollector(trueFilter, {time: 185000});

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
                    newGameMessages[2].results.splice(usersID.indexOf(user.id), 1);
                    usersID.splice(usersID.indexOf(user.id), 1);
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
            for(j in newGameMessages){
                if(j == 0){
                    await newGameMessages[j].instance.edit("📌 __**Результат голосования за настройки и правила {0}**__ 📌".format(gameType ? "Teamers\n*Базовые настройки для Teamers приведены ниже.*\n__**Стихийные бедствия**__: 2️⃣ \n__**Возраст мира**__: 🏔️ Новый\n__**Варвары**__: <:No:808418109319938099> Отключены" : "FFA"));
                    await newGameMessages[j].instance.reactions.removeAll();
                } else if(j == 1){
                    continue;
                } else if(j == 2){
                    await newGameMessages[j].instance.delete();
                } else if((j == newGameMessages.length-3)&&(gameType == 1)){
                    let newGameStringTempEnd = newGameMessages[j].content + " | ";
                    let collectedReactionsArray = await newGameMessages[j].instance.reactions.cache.array();
                    let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                    for(let k = 0; k < 2; k++){
                        let maxReactionIndex = collectedReactionsCountArray.indexOf(Math.max(...collectedReactionsCountArray));
                        capitansID.push(usersSourceID[maxReactionIndex]);
                        newGameStringTempEnd += newGameMessages[j].results[maxReactionIndex];
                        if(k == 0)
                            newGameStringTempEnd += " и ";
                        collectedReactionsCountArray[maxReactionIndex] = 0;
                    }
                    newGameMessages[j].instance.edit(newGameStringTempEnd);
                    await newGameMessages[j].instance.reactions.removeAll();
                } else if(j == newGameMessages.length-2){
                    let newGameStringTempEnd = `__**Баны наций:**__`;
                    for(k in newGameMessages[j].results)
                        newGameStringTempEnd += ("\n" + newGameMessages[j].results[k]);
                    if(newGameMessages[j].results.length == 0)
                        newGameStringTempEnd += " (нет)";
                    await newGameMessages[j].instance.edit(newGameStringTempEnd);
                    await newGameMessages[j].instance.reactions.removeAll();
                } else if(j == newGameMessages.length-1){
                    newGameMessages[j].instance.delete();
                } else {
                    let collectedReactionsArray = await newGameMessages[j].instance.reactions.cache.array();
                    let collectedReactionsCountArray = collectedReactionsArray.map(function(element){ return element.count; });
                    let maxReactionIndex =  collectedReactionsCountArray.indexOf(Math.max(...collectedReactionsCountArray));
                    await newGameMessages[j].instance.edit(newGameMessages[j].content + " | " + newGameMessages[j].results[maxReactionIndex]);
                    await newGameMessages[j].instance.reactions.removeAll();
                }
            }
            await updateNewCooldownDate(authorID, true);
            if(gameType == 0)
                await draftFFA(robot, message, argsForDraft, users);
            else
                await split(robot, message, args, capitansID, usersSourceID, argsForDraft);
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
