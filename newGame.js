const { updateNewCooldownDate,
        getAllUsersNewCooldown,
        getUserdata } = require('./database.js');
const { draftFFA, } = require('./draft.js');
const { civilizations } = require('./config.js');
const { getEmbed_NoVoice, } = require('./embedMessages.js');

async function newgameVotingFFA(robot, message, args){
    voiceChannel = message.member.voice.channel;
    if(voiceChannel == null)
        return message.channel.send(getEmbed_NoVoice());
    
    authorID = message.author.id;
    userData = await getUserdata(authorID);
    newCommandDate = userData.newCooldown;
    currentDate = new Date();
    if(newCommandDate){
        if((currentDate.getTime() - newCommandDate.getTime())/1000 < 150)
            return;
    }
    newList = await getAllUsersNewCooldown();
    for(newCooldownPlayer of newList)
        if((currentDate.getTime() - newCooldownPlayer.dataValues.newCooldown.getTime())/1000 < 150 )
            return;
        else
            await updateNewCooldownDate(newCooldownPlayer.dataValues.userid, true);
    await updateNewCooldownDate(authorID);
    users =  message.member.voice.channel.members;
    usersID = users.keyArray();
    for(let i = 0; i < usersID.length; i++)
        if(message.guild.members.cache.get(usersID[i]).user.bot)
            usersID.splice(i, 1);
    usersCount = usersID.length;
    messageBeginContentStart = [
        `📌 __**Голосование за настройки игровой карты и правила игры**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#795264927974555651>.
        *Автор сообщения может отменить это голосование, нажав эмодзи  ⛔ под этим сообщением.*`,
        
        `👥 __**Участники игры ({0})**__:`.format(usersCount),  // 1
        `⚡__**Игроки, которые не проголосовали**__:`,      // 2
        `================================`      // 3
    ];
    messageBeginContentMid = [
        `__**Карта**__: `,
        `__**Возраст мира**__: `,
        `__**Стихийные бедствия**__: `,
        `__**Бонусные ресурсы**__: `,
        `__**Стратегические ресурсы**__: `,
        `__**Количество чудес природы**__: `,
        `__**Торговля золотом**__: `,
        `__**Торговля стратегическими ресурсами**__: `,
        `__**Максимальное количество одновременных дружб и союзов в сумме**__: `,
        `__**Военный союз**__: `,
        `__**Бан военной победы**__: `,
        `__**Баны наций**__: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,     // 9
    
        `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите эмодзи ниже.**`                                                                                   // 10
    ];
    possibleResults = [
        ["🇵 Пангея", "🇭 Нагорье", "7️⃣  Семь морей", "🇱  Озёра", "🇨 Континенты", "🇦 Архипелаги"],
        ["🏕️  Стандартный", "🏔️ Новый"],
        ["2️⃣", "3️⃣", "4️⃣"],
        ["🇸 Стандартные", "🇦 Изобильные"],
        ["🇸 Стандартные", "🇦 Изобильные", "<:Yes:808418109710794843> Гарантированные"],
        ["🌅 Стандартное", "🌠 Изобильное"],
        ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🪙 Разрешена"],
        ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🐴 Разрешена"],
        ["2️⃣", "3️⃣", "♾️"],
        ["<:No:808418109319938099> Запрещён", "🗡️ Разрешён"],
        ["<:No:808418109319938099> Нет", "🐍 Да"],
    ];
    reactionsList = [
        ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦"],
        ["🏕️", "🏔️"],
        ["2️⃣", "3️⃣", "4️⃣"],
        ["🇸", "🇦"],
        ["🇸", "🇦", "<:Yes:808418109710794843>"],
        ["🌅", "🌠"],
        ["<:No:808418109319938099>", "🇦", "🇫", "🪙"],
        ["<:No:808418109319938099>", "🇦", "🇫", "🐴"],
        ["2️⃣", "3️⃣", "♾️"],
        ["<:No:808418109319938099>", "🗡️"],
        ["<:No:808418109319938099>", "🐍"],
        ["🤔"],
        ["⚡"],
    ];
    messageContentListVotesLength = messageBeginContentMid.length;
    messageContentListStart = [];
    messageContentListVotes = [];
    for(i in messageBeginContentStart){
        messageContentListStart[i] = messageBeginContentStart[i];
        if((i == 1)||(i == 2))
            for(userID of usersID)
                messageContentListStart[i] += " <@{0}>".format(userID);
    }
    for(i in reactionsList){
        messageContentListVotes[i] = messageBeginContentMid[i];
        for(j in possibleResults[i])
            messageContentListVotes[i] += (possibleResults[i][j] + " | ");
        messageContentListVotes[i] = messageContentListVotes[i].slice(0, -3);
    }
    messageContentListVotes[messageBeginContentMid.length-2] = messageBeginContentMid[messageBeginContentMid.length-2];
    messageContentListVotes[messageBeginContentMid.length-1] = messageBeginContentMid[messageBeginContentMid.length-1];

    civilizationsEmojiList = Array.from(civilizations.keys());

    const trueFilter = (reaction, user) => {return true;};
    const filter = (reaction, user) => {
        messageID = reaction.message.id;
        for(index in messageContentListVotes){
            if(messageContentListVotes[index] == undefined)
                return false;
            if(messageContentListVotes[index].id == messageID){
                j = index;
                break;
            }
        }
        if(j == reactionsList.length - 2)
            return (((civilizationsEmojiList.includes(reaction.emoji.toString().toLowerCase()) || civilizationsEmojiList.includes(reaction.emoji.name)) && (usersID.includes(user.id))) || user.bot);
        if(reactionsList[j] == undefined)
            return false;
        return (((reactionsList[j].includes(reaction.emoji.name) || reactionsList[j].includes(reaction.emoji.toString())) && (usersID.includes(user.id))) || user.bot);
    };

    for(i in messageContentListStart)
        messageContentListStart[i] = await message.channel.send(messageContentListStart[i]);
    for(i in messageContentListVotes)
        messageContentListVotes[i] = await message.channel.send(messageContentListVotes[i]);

    await messageContentListStart[0].react("⛔");
    collectorDeleteVote = await messageContentListStart[0].createReactionCollector(trueFilter, {time: 185000});
    collectorDeleteVote.on('collect', async (reaction, user) => {
        if((reaction.emoji.toString() != "⛔")||(user.id != message.author.id))
            await messageContentListVotes[0].reactions.resolve(reaction).users.remove(user);
        else{
            reactionsList = [];
            for(i in messageContentListStart){
                if(messageContentListStart[i] != undefined){
                    await messageContentListStart[i].delete();
                    messageContentListStart[i] = undefined;
                }
            }
            for(i in messageContentListVotes){
                if(messageContentListVotes[i] != undefined){
                    await messageContentListVotes[i].delete();
                    messageContentListVotes[i] = undefined;
                }
            }
            await updateNewCooldownDate(authorID, true);
            return;
        }
    });

    collectorList = [];
    emojiResult = [];
    argsForDraft = [4];
    for(i in messageContentListVotes){
        collectorList[i] = await messageContentListVotes[i].createReactionCollector(trueFilter, {time: 185000});     // +35 сек
        collectorList[i].on('collect', async (reaction, user) => {
            if(!(filter(reaction, user))){
                messageID = reaction.message.id;
                for(index in messageContentListVotes){
                    if(messageContentListVotes[index] == undefined)
                        return false;
                    if(messageContentListVotes[index].id == messageID){
                        j = index;
                        break;
                    }
                }
                await messageContentListVotes[j].reactions.resolve(reaction).users.remove(user);
            }
            else if(j == messageContentListVotes.length-2){      // Баны
                emojies = await messageContentListVotes[j].reactions.cache.array();
                emojiNameArray = emojies.map(function(element){ return element._emoji.toString().toLowerCase(); });
                emojiCountArray = emojies.map(function(element){ return element.count; });
                emojiName = reaction.emoji.toString().toLowerCase();
                if((emojiCountArray[emojiNameArray.indexOf(emojiName)] > usersCount/2) && (emojiName != "🤔")){
                    await messageContentListVotes[j].edit(messageContentListVotes[j].content + "\n" + civilizations.get(emojiName));
                    civilizationsEmojiList.splice(civilizationsEmojiList.indexOf(emojiName), 1);
                    await reaction.remove();
                    argsForDraft.push(emojiName);
                }
            }
            else if(j == messageContentListVotes.length-1){      // Молния
                emojiArray = await messageContentListVotes[j].reactions.cache.array();
                if(emojiArray[0].count-1 == usersCount)
                    for(collector of collectorList)
                        await collector.stop();

                votedUserIndex = usersID.indexOf(user.id);
                if(votedUserIndex != -1){
                    usersID.splice(votedUserIndex, 1);
                    messageContentListStartWaiting = messageBeginContentStart[2];
                    for(userID of usersID)
                        messageContentListStartWaiting += " <@{0}>".format(userID);
                    if(usersID.length != 0)
                        messageContentListStart[2].edit(messageContentListStartWaiting);
                }
            }
        });
        collectorList[i].on('end', (collected, reason) => {
            if(reason == "messageDelete")
                return;
            emojies = collected.array();
            if(emojies[0] == undefined)
                return;
            messageID = emojies[0].message.id;
            for(index in messageContentListVotes)
            if(messageContentListVotes[index].id == messageID){
                j = index;                                              // Текущее сообщение
                break;
            }
            emojiName = emojies.map(function(element){ return element._emoji.toString(); });
            emojiCount = emojies.map(function(element){ return element.count; });
            emojiResult[j] = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
            if ((emojiResult.filter(Boolean).length == possibleResults.length) && (messageContentListVotes.length == messageContentListVotesLength)){                                                      // Если всё готово, то... этот блок вызывается
                messageContentListStart[0].edit("📌 __**Результат голосования за настройки игровой карты и правила игры**__ 📌");  // один раз в случае готовности всех коллекторов, см. выше
                messageContentListStart[0].reactions.removeAll();
                messageContentListStart[2].delete();                                                                                //messageContentListStart[2].edit("⚡__**Все игроки проголосовали!**__");
                for(k in emojiResult){                                                                                              // Новый итератор для всех сообщений, j больше не нужен
                    messageContentListVotes[k].reactions.removeAll();
                    resultIndex = reactionsList[k].indexOf(emojiResult[k]);
                    messageContentListVotes[k].edit(messageBeginContentMid[k] + possibleResults[k][resultIndex]);
                }
                let bansVotingString = messageContentListVotes[messageContentListVotes.length-2].content.slice(121);
                if(bansVotingString == "")
                    bansVotingString = messageContentListVotes[messageContentListVotes.length-2].content.slice(0, 20) + "нет";
                else
                    bansVotingString = messageContentListVotes[messageContentListVotes.length-2].content.slice(0, 20) + "\n" + bansVotingString;
                messageContentListVotes[messageContentListVotes.length-2].edit(bansVotingString);
                messageContentListVotes[emojiResult.length].reactions.removeAll();
                messageContentListVotes.pop().delete();
                draftFFA(robot, message, argsForDraft, users);
                updateNewCooldownDate(authorID, true);
            }
        });
    }
    for(i in messageContentListVotes)
        if((messageContentListVotes[i] == undefined)||(reactionsList[i] == undefined))
            return;
        else
            await messageContentListVotes[i].react(reactionsList[i][0]);
    for(i in messageContentListVotes){
        reactionsLength = reactionsList[i].length;
        if(reactionsLength > 1)
            for(let j = 1; j < reactionsLength; j++)
                if(messageContentListVotes[i] != undefined)
                    await messageContentListVotes[i].react(reactionsList[i][j]);
    }
}

module.exports = { newgameVotingFFA }
