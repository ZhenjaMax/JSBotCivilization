const { draftFFA,
        draftTeam } = require('./draft.js');
const { getEmbed_Avatar,
        getEmbed_Heads, 
        getEmbed_Tails,
        getEmbed_Dice,
        getEmbed_WrongNumber,
        getEmbed_Clear,
        getEmbed_Profile,
        getEmbed_Error,
        getEmbed_NoVoice,
        getEmbed_UnknownError,
        getEmbed_LikeOrDislike,
        getEmbed_Welcome1,
        getEmbed_Welcome2,
        getEmbed_Welcome3,
        getEmbed_Vote,
        getEmbed_Irrel,
        getEmbed_CC,
        getEmbed_Scrap,
        getEmbed_Veto,
        getEmbed_Remap,
        getEmbed_Test,
        getEmbed_Karma,
        getEmbed_Money,
        getEmbed_Bonus,
        getEmbed_BiasList,
        getEmbed_Proposal } = require('./embedMessages.js');
const { randomInteger,
        parseInteger } = require('./functions.js');
const { getUserdata,
        hasPermissionLevel,
        updateUserdataKarma,
        updateUserdataLikeIncrement,
        updateUserdataLikeCooldown,
        updateUserdataDislikeIncrement,
        updateUserdataDislikeCooldown,
        updateNewCooldownDate,
        setUserdataMoney,
        setUserdataBonusStreak,
        updateUserdataBonusCooldown,
        updateUserdataRating,
        updateUserdataProposalCooldown } = require('./database.js');
const { ratingHandler } = require('./rating.js');
const { banAdm,
        unbanAdm,
        muteAdm,
        unmuteAdm,
        nochatAdm,
        unchatAdm,
        pardonAdm } = require('./administration.js');
const { String } = require('./functions.js');
const { civilizations,
        proposalChannelID } = require('./config.js');
const { catImage,
        dogImage } = require('./url.js');
const { clanManager } = require('./clans.js');

function draft(robot, message, args) {
    if(args[0] == "ffa"){
        args.splice(0, 1);
        draftFFA(robot, message, args);
    }
    else if(args[0] == "team"){
        args.splice(0, 1)
        draftTeam(robot, message, args);
    }
    else
        draftFFA(robot, message, args);
}

function avatar(robot, message, args) {
    message.channel.send(getEmbed_Avatar(message.author, message.mentions.users.first() || message.author));
}

function coin(robot, message, args){
    message.channel.send(Math.random() < 0.5 ? getEmbed_Heads(message.author) : getEmbed_Tails(message.author));
}

function dice(robot, message, args){
    value = parseInteger(args[0]);
    valueMin = 2;
    valueMax = 100;
    if (value == undefined)
        value = 6;
    if (isNaN(value) || (value < valueMin) || (value > valueMax))
        return message.channel.send(getEmbed_WrongNumber(valueMin, valueMax));
    else if(value == 2)
        return coin(robot, message, args);
    else 
        return message.channel.send(getEmbed_Dice(message.author, value, randomInteger(value)+1));
}

async function profile(robot, message, args) {
    user = message.mentions.users.first() || message.author;
    author = message.author;
    try{
        userData = await getUserdata(user.id);
        return message.channel.send(getEmbed_Profile(user, userData, author));
    } catch (errorProfile) {
        return message.channel.send(getEmbed_UnknownError("errorProfile"));
    }
}

async function clear(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    deleteCountMin = 1;
    deleteCountMax = 10;
    deleteCount = parseInteger(args[0]);
    if((isNaN(deleteCount)) || (deleteCount == undefined) || (deleteCount < deleteCountMin) || (deleteCount > deleteCountMax))
        return message.channel.send(getEmbed_WrongNumber(deleteCountMin, deleteCountMax));
    try {
        let fetched = await message.channel.messages.fetch({limit: deleteCount+1});
        await message.channel.bulkDelete(fetched)
        await message.channel.send(getEmbed_Clear(deleteCount));
    } catch (errorClear) {
        return message.channel.send(getEmbed_UnknownError("errorClear"));
    }
}

async function ban(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    banAdm(robot, message, args);
}

async function unban(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    unbanAdm(robot, message, args);
}

async function mute(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    muteAdm(robot, message, args);
}

async function unmute(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    unmuteAdm(robot, message, args);
}

async function nochat(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    nochatAdm(robot, message, args);
}

async function unchat(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    unchatAdm(robot, message, args);
}

async function pardon(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    pardonAdm(robot, message, args);
}

function rating(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    ratingHandler(robot, message, args);
}

async function like(robot, message, args){
    try{
        authorID = message.author.id;
        authorData = await getUserdata(authorID);
        likeDate = authorData.likeCooldown;
        currentDate = new Date();
        if(likeDate)    //
            if((likeDate.getDate() == currentDate.getDate()) && (likeDate.getMonth() == currentDate.getMonth()))
                return message.channel.send(getEmbed_Error("Попробуйте завтра."));

        user = message.mentions.users.first();
        if(!user)
            return message.channel.send(getEmbed_Error("Укажите пользователя для лайка."));
        author = message.author;
        if(author.id == user.id) 
            return message.channel.send(getEmbed_Error("Нельзя лайкнуть самого себя!"));
        userData = await getUserdata(user.id);
        karma = userData.karma;
        await updateUserdataKarma(userData.userid, Math.min(karma+1, 100));
        await updateUserdataLikeIncrement(user.id);
        await updateUserdataLikeCooldown(authorID);
        userData = await getUserdata(user.id);
        return message.channel.send(getEmbed_LikeOrDislike(author, user, userData, 1));
    } catch (errorLike) {
        return message.channel.send(getEmbed_UnknownError("errorLike"));
    }
}

async function dislike(robot, message, args){
    try{
        authorID = message.author.id;
        authorData = await getUserdata(authorID);
        dislikeDate = authorData.dislikeCooldown;
        currentDate = new Date();
        if(dislikeDate)    //
            if((dislikeDate.getDate() == currentDate.getDate()) && (dislikeDate.getMonth() == currentDate.getMonth()))
                return message.channel.send(getEmbed_Error("Попробуйте завтра."));

        user = message.mentions.users.first();
        if(!user)
            return message.channel.send(getEmbed_Error("Укажите пользователя для дизлайка."));
        author = message.author;
        if(author.id == user.id) 
            return message.channel.send(getEmbed_Error("Нельзя дизлайкнуть самого себя!"));
        userData = await getUserdata(user.id);
        karma = userData.karma;
        await updateUserdataKarma(userData.userid, Math.max(karma-1, 0));
        if(Math.random() > 0.5){                    // С вероятность 50% снимет отправителю
            authorData = await getUserdata(author.id);
            await updateUserdataKarma(author.id, Math.max(authorData.karma-1, 0));
        }
        await updateUserdataDislikeIncrement(user.id);
        await updateUserdataDislikeCooldown(authorID);
        userData = await getUserdata(user.id);
        return message.channel.send(getEmbed_LikeOrDislike(author, user, userData, -1));
    } catch (errorDislike) {
        return message.channel.send(getEmbed_UnknownError("errorDislike"));
    }
}

async function welcome(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return;
    await message.channel.send(getEmbed_Welcome1());
    await message.channel.send(getEmbed_Welcome2());
    await message.channel.send(getEmbed_Welcome3());
}

async function vote(robot, message, args){
    questionString = message.content.slice(6).trim();
    if(questionString.length == 0)
        return message.channel.send(getEmbed_Error("Введите вопрос для начала голосования."));
    voteMessage = await message.channel.send(getEmbed_Vote(message.author, questionString));
    await voteMessage.react("<:Yes:808418109710794843>");
    await voteMessage.react("<:No:808418109319938099>");
}

async function irrel(robot, message, args){
    message.channel.send(getEmbed_Irrel());
}

async function cc(robot, message, args){
    message.channel.send(getEmbed_CC())
}

async function scrap(robot, message, args){
    message.channel.send(getEmbed_Scrap())
}

async function veto(robot, message, args){
    message.channel.send(getEmbed_Veto())
}

async function remap(robot, message, args){
    message.channel.send(getEmbed_Remap())
}

async function newgameVoting(robot, message, args){
    voiceChannel = message.member.voice.channel;
    if(voiceChannel == null)
        return message.channel.send(getEmbed_NoVoice());

    authorID = message.author.id;
    userData = await getUserdata(authorID);
    newCommandDate = userData.newCooldown;
    if(newCommandDate){
        currentDate = new Date();
        if((currentDate.getTime() - newCommandDate.getTime())/1000 < 150)
            return;
    }
    updateNewCooldownDate(authorID);

    users =  message.member.voice.channel.members;
    usersID = users.keyArray();

    for(let i = 0; i < usersID.length; i++)
        if(message.guild.members.cache.get(usersID[i]).user.bot)
            usersID.splice(i, 1);
    usersCount = usersID.length;

    messageBeginContentStart = [
        `📌 __**Голосование за настройки игровой карты и правила игры**__ 📌
        *Не забудьте перед игрой ознакомиться с правилами в канале* <#795264927974555651>.`,
        
        `👥 __**Участники игры ({0})**__:`.format(usersCount),
        `⚡__**Игроки, которые не проголосовали**__:`,      // 2
        `================================`
    ];
    messageBeginContentMid = [
        `__**Карта**__: `,
        `__**Возраст мира**__: `,
        `__**Стихийные бедствия**__: `,
        `__**Бонусные ресурсы**__: `,
        `__**Стратегические ресурсы**__: `,
        `__**Торговля золотом**__: `,
        `__**Торговля стратегическими ресурсами**__: `,
        `__**Максимальное количество одновременных дружб и союзов в сумме**__: `,
        `__**Военный союз**__: `,
        `__**Баны наций**__: *добавьте эмодзи нации под этим сообщением; если проголосует большинство, то нация окажется в бане.*`,     // 9

        `================================
        ⏰  **На голосование отводится 150 секунд!**
        📌  **Если вы готовы, нажмите эмодзи ниже.**`                                                                                   // 10
    ];
    messageContentListVotesLength = messageBeginContentMid.length;
    possibleResults = [
        ["🇵 Пангея", "🇭 Нагорье", "7️⃣  Семь морей", "🇱  Озёра", "🇨 Континенты", "🇦 Архипелаги"],
        ["🏕️  Стандартный", "🏔️ Новый"],
        ["2️⃣", "3️⃣", "4️⃣"],
        ["🇸 Стандартные", "🇦 Изобильные"],
        ["🇸 Стандартные", "🇦 Изобильные", "<:Yes:808418109710794843> Гарантированные"],
        ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🪙 Разрешена"],
        ["<:No:808418109319938099> Запрещена", "🇦 Между союзниками", "🇫 Между друзьями и союзниками", "🐴 Разрешена"],
        ["2️⃣", "3️⃣", "♾️"],
        ["<:No:808418109319938099> Запрещён", "🗡️ Разрешён"],
    ]

    reactionsList = [
        ["🇵", "🇭", "7️⃣", "🇱", "🇨", "🇦"],    // 0
        ["🏕️", "🏔️"],
        ["2️⃣", "3️⃣", "4️⃣"],
        ["🇸", "🇦"],
        ["🇸", "🇦", "<:Yes:808418109710794843>"],
        ["<:No:808418109319938099>", "🇦", "🇫", "🪙"],
        ["<:No:808418109319938099>", "🇦", "🇫", "🐴"],
        ["2️⃣", "3️⃣", "♾️"],
        ["<:No:808418109319938099>", "🗡️"],
        ["🤔"],     // 9
        ["⚡"]      // 10
    ]

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
        for(index in messageContentListVotes)
        if(messageContentListVotes[index].id == messageID){
            j = index;
            break;
        }
        if(j == 9)
            return (((civilizationsEmojiList.includes(reaction.emoji.toString().toLowerCase()) || civilizationsEmojiList.includes(reaction.emoji.name)) && (usersID.includes(user.id))) || user.bot);
        return (((reactionsList[j].includes(reaction.emoji.name) || reactionsList[j].includes(reaction.emoji.toString())) && (usersID.includes(user.id))) || user.bot);
    };

    for(i in messageContentListStart)
        messageContentListStart[i] = await message.channel.send(messageContentListStart[i]);
    for(i in messageContentListVotes)
        messageContentListVotes[i] = await message.channel.send(messageContentListVotes[i]);

    collectorList = [];
    emojiResult = [];
    argsForDraft = [4];
    for(i in messageContentListVotes){
        collectorList[i] = await messageContentListVotes[i].createReactionCollector(trueFilter, {time: 185000});     // +35 сек
        collectorList[i].on('collect', (reaction, user) => {
            if(!(filter(reaction, user))){
                messageID = reaction.message.id;
                for(index in messageContentListVotes)
                if(messageContentListVotes[index].id == messageID){
                    j = index;
                    break;
                }
                messageContentListVotes[j].reactions.resolve(reaction).users.remove(user);
            }
            else if(j == messageContentListVotes.length-2){      // Баны
                emojies = messageContentListVotes[j].reactions.cache.array();
                emojiNameArray = emojies.map(function(element){ return element._emoji.toString().toLowerCase(); });
                emojiCountArray = emojies.map(function(element){ return element.count; });
                emojiName = reaction.emoji.toString().toLowerCase();
                if((emojiCountArray[emojiNameArray.indexOf(emojiName)] > usersCount/2) && (emojiName != "🤔")){
                    messageContentListVotes[j].edit(messageContentListVotes[j].content + "\n" + civilizations.get(emojiName));
                    civilizationsEmojiList.splice(civilizationsEmojiList.indexOf(emojiName), 1);
                    reaction.remove();
                    argsForDraft.push(emojiName);
                }
            }
            else if(j == messageContentListVotes.length-1){      // Молния
                emojiArray = messageContentListVotes[j].reactions.cache.array();
                if(emojiArray[0].count-1 == usersCount)
                    for(collector of collectorList)
                        collector.stop();

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
                messageContentListStart[2].edit("⚡__**Все игроки проголосовали!**__");
                for(k in emojiResult){                                                                                              // Новый итератор для всех сообщений, j больше не нужен
                    messageContentListVotes[k].reactions.removeAll();
                    resultIndex = reactionsList[k].indexOf(emojiResult[k]);
                    messageContentListVotes[k].edit(messageBeginContentMid[k] + possibleResults[k][resultIndex]);
                }
                messageContentListVotes[emojiResult.length].reactions.removeAll();
                messageContentListVotes.pop().delete();
                draftFFA(robot, message, argsForDraft, users);
            }
        });
    }
    for(i in messageContentListVotes)
        await messageContentListVotes[i].react(reactionsList[i][0]);
    for(i in messageContentListVotes){
        reactionsLength = reactionsList[i].length;
        if(reactionsLength > 1)
            for(let j = 1; j < reactionsLength; j++)
                await messageContentListVotes[i].react(reactionsList[i][j])
    }
}

async function karma(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    handler = args.shift();
    switch(handler){
        case 'add':
        case 'set':
            member = await message.mentions.members.first();
            if(!member)
                return await message.channel.send(getEmbed_Error("Укажите пользователя для изменения кармы."));
            userdata = await getUserdata(member.id);
            newValueKarma = parseInteger(args[1]);
            if(newValueKarma == undefined)
                return await message.channel.send(getEmbed_Error("Введите целое значение."));
            if(handler == "add")
                newValueKarma = Math.min(Math.max(newValueKarma + userdata.karma, 0), 100);
            if(handler == "set")
                newValueKarma = Math.min(Math.max(newValueKarma, 0), 100);
            updateUserdataKarma(member.id, newValueKarma);
            return await message.channel.send(getEmbed_Karma(member, newValueKarma, message.author));
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nadd, set."));
    }
}

async function bonus(robot, message, args){
    userID = message.author.id;
    userdata = await getUserdata(userID);
    bonusDate = userdata.bonusCooldown;
    tempDate = new Date();
    currentDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);
    let deltaDays = 1;
    if(bonusDate)
        deltaDays = Math.floor((currentDate - bonusDate)/(1000*86400));
    if(deltaDays == 0)
        return message.channel.send(getEmbed_Error("Попробуйте завтра."));

    let maxStreak = 7;
    let isMaxStreakFlag = (userdata.bonusStreak == maxStreak);
    daysValue = (deltaDays == 1) ? Math.min(userdata.bonusStreak+1, maxStreak) : 1;

    random = Math.random()/4 + 0.75;
    karmaCoeff = (userdata.karma-50)*0.5;
    bonusValue = Math.round(Math.max(25*random*daysValue + karmaCoeff, 20));
    let karmaValue = 0;
    let ratingValue = 0;
    if(Math.random() > 1-(daysValue/10)){
        ratingValue++;
        if((daysValue >= 5) && (Math.random() > 0.75))
            ratingValue++;
    }
    if(Math.random() > 1-(0.11 + 0.04*daysValue))
        karmaValue++;

    if(ratingValue)
        await updateUserdataRating(userID, userdata.rating + ratingValue);
    if(karmaValue)
        updateUserdataKarma(userID, userdata.karma + karmaValue);
    await setUserdataBonusStreak(userID, daysValue);
    await setUserdataMoney(userID, userdata.money + bonusValue);
    await updateUserdataBonusCooldown(userID, currentDate);
    return await message.channel.send(getEmbed_Bonus(message.author, bonusValue, daysValue, isMaxStreakFlag, userdata.money + bonusValue, ratingValue, karmaValue));
}

async function money(robot, message, args){
    handler = args.shift();
    switch(handler){
        case 'add':
        case 'set':
            if(!hasPermissionLevel(message.member, 5)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
            member = await message.mentions.members.first();
            if(!member)
                return message.channel.send(getEmbed_Error("Укажите пользователя для изменения денег."));
            userdata = await getUserdata(member.id);
            newMoneyValue = parseInteger(args[1]);
            if(newMoneyValue == undefined)
                return message.channel.send(getEmbed_Error("Введите целое значение."));
            if(handler == "add")
                newMoneyValue = Math.max(newMoneyValue + userdata.money, 0);
            if(handler == "set")
                newMoneyValue = Math.max(newMoneyValue, 0);
            await setUserdataMoney(member.id, newMoneyValue);
            return message.channel.send(getEmbed_Money(member, newMoneyValue, message.author));
        case 'pay':
            author = await message.author;
            member = await message.mentions.members.first();
            if(!member)
                return message.channel.send(getEmbed_Error("Укажите пользователя для передачи денег."));
            sendMoneyValue = parseInteger(args[1]);
            if((sendMoneyValue == undefined) || (isNaN(sendMoneyValue)))
                return message.channel.send(getEmbed_Error("Введите целое значение денег для передачи денег, большее 0."));
            if(sendMoneyValue <= 0)
                return message.channel.send(getEmbed_Error("Введите целое значение денег для передачи денег, большее 0."));
            userdataSend = await getUserdata(author.id);
            userdataReceive = await getUserdata(member.id);
            if(userdataSend.money < sendMoneyValue)
                return message.channel.send(getEmbed_Error("У вас недостаточно средств!"));
            await setUserdataMoney(userdataSend.userid, userdataSend.money - sendMoneyValue);
            await setUserdataMoney(userdataReceive.userid, userdataReceive.money + sendMoneyValue);
            return message.channel.send(getEmbed_Money(member, sendMoneyValue, message.author, [[userdataSend.money, userdataSend.money - sendMoneyValue], [userdataReceive.money, userdataReceive.money + sendMoneyValue]]));
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\npay, add, set."));
    }
}

async function bias(robot, message, args){
    return await message.channel.send(getEmbed_BiasList());
}

async function achievement(robot, message, args){
    
}

async function proposal(robot, message, args){
    userdata = await getUserdata(message.author.id);
    proposalDate = userdata.proposalCooldown;
    deltaTimeHours = 6;
    currentDate = new Date();
    if(proposalDate)
        if((currentDate - proposalDate)/1000/3600 < deltaTimeHours)
            return message.channel.send(getEmbed_Error("Отправлять новые предложения можно раз в 6 часов!"));
    proposalString = (message.content[1] == 'p') ? message.content.slice(10).trim() : message.content.slice(7).trim()   //proposal / offer
    if(proposalString.length == 0)
        return message.channel.send(getEmbed_Error("Введите предложение для отправки."));
    voteMessage = await robot.channels.cache.get(proposalChannelID).send(getEmbed_Proposal(message.author, proposalString));
    await updateUserdataProposalCooldown(message.author.id, currentDate);
    await voteMessage.react("<:Yes:808418109710794843>");
    await voteMessage.react("<:No:808418109319938099>");
}

async function test(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return;
}

var commands =
[
    {
        name: ["draft"],
        out: draft,
        about: "Общая команда для драфта"
    },
    {
        name: ["draftffa"],
        out: draftFFA,
        about: "Команда для драфта FFA"
    },
    {
        name: ["draftteam"],
        out: draftTeam,
        about: "Команда для драфта Team"
    },
    {
        name: ["avatar"],
        out: avatar,
        about: "Показать аватар пользователя"
    },
    {
        name: ["coin", "coinflip", "flip", "flipcoin"],
        out: coin,
        about: "Подбросить монетку"
    },
    {
        name: ["dice", "die", "roll", "random", "d", "rand"],
        out: dice,
        about: "Подбросить игральную кость"
    },
    {
        name: ["profile", "p", "user"],
        out: profile,
        about: "Профиль игрока"
    },
    {
        name: ["clear", "clean"],
        out: clear,
        about: "Удалить последние сообщения (до 10)"
    },
    {
        name: ["rating", "r"],
        out: rating,
        about: "Интерфейс для начисления рейтинга"
    },
    {
        name: ["ban"],
        out: ban,
        about: "Выдать бан"
    },
    {
        name: ["unban"],
        out: unban,
        about: "Снять бан"
    },
    {
        name: ["mute"],
        out: mute,
        about: "Заглушить микрофон игрока"
    },
    {
        name: ["unmute"],
        out: unmute,
        about: "Разблокировать микрофон игрока"
    },
    {
        name: ["nochat"],
        out: nochat,
        about: "Заблокировать чат игрока"
    },
    {
        name: ["unchat"],
        out: unchat,
        about: "Разблокировать чат игрока"
    },
    {
        name: ["pardon"],
        out: pardon,
        about: "Полностью разблокировать игрока"
    },
    {
        name: ["like"],
        out: like,
        about: "Похвалить игрока, повысить карму"
    },
    {
        name: ["dislike", "report"],
        out: dislike,
        about: "Поругать игрока, понизить карму"
    },
    {
        name: ["welcome"],
        out: welcome,
        about: "Сообщение в канал Welcome"
    },
    {
        name: ["vote", "poll"],
        out: vote,
        about: "Голосование с двумя вариантами ответов (да, нет)"
    },
    {
        name: ["irr", "irrel"],
        out: irrel,
        about: "Подсказка об иррелевантности"
    },
    {
        name: ["cc"],
        out: cc,
        about: "Подсказка о CC"
    },
    {
        name: ["scrap"],
        out: scrap,
        about: "Подсказка о CC"
    },
    {
        name: ["veto"],
        out: veto,
        about: "Подсказка о CC"
    },
    {
        name: ["remap"],
        out: remap,
        about: "Подсказка о ремапе"
    },
    {
        name: ["daily", "bonus"],
        out: bonus,
        about: "Ежедневная награда"
    },
    {
        name: ["new", "begin"],
        out: newgameVoting,
        about: "Начать голосование за настройки и правила игры"
    },
    {
        name: ["test"],
        out: test,
        about: "Тестовая команда"
    },
    {
        name: ["karma"],
        out: karma,
        about: "Админская команда для изменения значения кармы"
    },
    {
        name: ["money"],
        out: money,
        about: "Интерфейс админской команды для редактирования денег у игроков"
    },
    {
        name: ["bias"],
        out: bias,
        about: "Команда для вывода стартовых биасов наций"
    },
    {
        name: ["ach", "achievement"],
        out: achievement,
        about: "Интерфейс для получения списка достижений и их получения"
    },
    {
        name: ["cat"],
        out: catImage,
        about: "Случайный кот"
    },
    {
        name: ["dog"],
        out: dogImage,
        about: "Случайный пёс"
    },
    {
        name: ["proposal", "offer"],
        out: proposal,
        about: "Ввести предложение на сервер (сообщение в специализированный канал)"
    },
    {
        name: ["clan", "clans"],
        out: clanManager,
        about: "Интерфейс кланов"
    },
]

module.exports = commands;
