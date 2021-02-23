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
        getEmbed_Test } = require('./embedMessages.js');
const { randomInteger,
        parseInteger } = require('./functions.js');
const { getUserdata,
        hasPermissionLevel,
        updateUserdataKarma,
        updateUserdataLikeIncrement,
        updateUserdataLikeCooldown,
        updateUserdataDislikeIncrement,
        updateUserdataDislikeCooldown } = require('./database.js');
const { ratingHandler } = require('./rating.js');
const { banAdm,
        unbanAdm,
        muteAdm,
        unmuteAdm,
        nochatAdm,
        unchatAdm,
        pardonAdm } = require('./administration.js');

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

async function bonus(robot, message, args){
    
}

async function test(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return;
    message.channel.send(getEmbed_Test(robot, message, args));
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
        name: ["test"],
        out: test,
        about: "Тестовая команда"
    }
]

module.exports = commands;
