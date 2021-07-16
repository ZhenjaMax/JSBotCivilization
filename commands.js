const { draftFFA,
        draftTeam,
        redraft } = require('./draft.js');
const { getEmbed_Avatar,
        getEmbed_Heads, 
        getEmbed_Tails,
        getEmbed_Dice,
        getEmbed_WrongNumber,
        getEmbed_Clear,
        getEmbed_Profile,
        getEmbed_Error,
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
        getEmbed_Karma,
        getEmbed_Money,
        getEmbed_Bonus,
        getEmbed_BiasList,
        getEmbed_Proposal,
        getEmbed_Save,
        getEmbed_TagRolesManager,
        getEmbed_ProfileDescription,
        getEmbed_Tie,
        getEmbed_Sub,
        getEmbed_Leave,
        getEmbed_AvatarChange,
        getEmbed_Weak, } = require('./embedMessages.js');
const { randomInteger,
        parseInteger,
        getNextDayString, } = require('./functions.js');
const { getUserdata,
        setUserdata,
        saveDatabases, } = require('./database.js');
const { ratingHandler } = require('./rating.js');
const { banAdm,
        unbanAdm,
        muteAdm,
        unmuteAdm,
        nochatAdm,
        unchatAdm,
        pardonAdm } = require('./administration.js');
const { hasPermissionLevel,
        updateUsersWeakRole } = require('./roleManager.js');
const { proposalChannelID,
        tagRolesData,
        descriptionLength,
        deleteCountMin,
        deleteCountMax,
        urlLength,
        weakPointsTotal, } = require('./config.js');
const { catImage,
        dogImage } = require('./url.js');
const { clanManager } = require('./clans.js');
const { newgameVoting,
        split } = require('./newGame.js');

async function irrel(robot, message, args)  { await message.channel.send(getEmbed_Irrel()); }
async function cc(robot, message, args)     { await message.channel.send(getEmbed_CC()) }
async function scrap(robot, message, args)  { await message.channel.send(getEmbed_Scrap()) }
async function veto(robot, message, args)   { await message.channel.send(getEmbed_Veto()) }
async function remap(robot, message, args)  { await message.channel.send(getEmbed_Remap()) }
async function tie(robot, message, args)    { await message.channel.send(getEmbed_Tie()) }
async function sub(robot, message, args)    { await message.channel.send(getEmbed_Sub()) }
async function leave(robot, message, args)  { await message.channel.send(getEmbed_Leave()) }
async function bias(robot, message, args)   { await message.channel.send(getEmbed_BiasList()); }
async function coin(robot, message, args)   { await message.channel.send(Math.random() < 0.5 ? getEmbed_Heads(message.author) : getEmbed_Tails(message.author)); }
async function achievement(robot, message, args)    {  }
async function rating(robot, message, args) { await ratingHandler(robot, message, args); }

async function save(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return await message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    await saveDatabases();
    await message.channel.send(getEmbed_Save(message.author));
}

async function profile(robot, message, args) {
    let user = message.mentions.users.first() || message.author, author = message.author;
    let userData = await getUserdata(user.id);
    await message.channel.send(getEmbed_Profile(user, userData, author));
}

async function welcome(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return;
    await message.channel.send(getEmbed_Welcome1());
    await message.channel.send(getEmbed_Welcome2());
    await message.channel.send(getEmbed_Welcome3());
}

async function vote(robot, message, args){
    let questionString = message.content.slice(6).trim();
    if(questionString.length == 0)
        return await message.channel.send(getEmbed_Error("Введите вопрос для начала голосования."));
    if((questionString.toLowerCase() == "redraft") || (questionString.toLowerCase() == "редрафт"))
        return await redraft(robot, message, args);
    voteMessage = await message.channel.send(getEmbed_Vote(message.author, questionString));
    await voteMessage.react("<:Yes:808418109710794843>");
    await voteMessage.react("<:No:808418109319938099>");
}

async function draft(robot, message, args){
    if(args[0] == "ffa")
        args.splice(0, 1);
    else if(args[0] == "team"){
        args.splice(0, 1);
        return await draftTeam(robot, message, args);
    }
    await draftFFA(robot, message, args);
}

async function dice(robot, message, args){
    let valueMin = 2, valueMax = 100, value = parseInteger(args[0]);
    if(value == undefined) value = 6;
    if(isNaN(value) || (value < valueMin) || (value > valueMax)) return await message.channel.send(getEmbed_WrongNumber(valueMin, valueMax));
    else if(value == 2) return await coin(robot, message, args);
    else return await message.channel.send(getEmbed_Dice(message.author, value, randomInteger(value)+1));
}

async function clear(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    let deleteCount = parseInteger(args[0]);
    if((isNaN(deleteCount)) || (deleteCount == undefined) || (deleteCount < deleteCountMin) || (deleteCount > deleteCountMax)) return message.channel.send(getEmbed_WrongNumber(deleteCountMin, deleteCountMax));
    let fetched = await message.channel.messages.fetch({limit: deleteCount+1});
    await message.channel.bulkDelete(fetched)
    await message.channel.send(getEmbed_Clear(deleteCount));
}

async function weakPointManager(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    let handler = args.shift();
    switch(handler){
        case 'add':
        case 'set':
            member = await message.mentions.members.first();
            if(!member) return await message.channel.send(getEmbed_Error("Укажите пользователя для изменения очков слабости."));
            userdata = await getUserdata(member.id);
            let weakValue = parseInteger(args[1]);
            if(!weakValue && (weakValue !== 0)) weakValue = 1;
<<<<<<< Updated upstream
            if(handler == "add") userdata.weakPoints = Math.min(Math.max(weakValue + userdata.weakPoints, 0), 10);
            if(handler == "set") userdata.weakPoints = Math.min(Math.max(weakValue, 0), 10);
=======
            if(handler == "add") userdata.weakPoints = Math.min(Math.max(weakValue + userdata.weakPoints, 0), weakPointsTotal);
            if(handler == "set") userdata.weakPoints = Math.min(Math.max(weakValue, 0), weakPointsTotal);
>>>>>>> Stashed changes
            await setUserdata(userdata);
            await updateUsersWeakRole(userdata.userid);
            return await message.channel.send(getEmbed_Weak(message.author, member.user, userdata.weakPoints));
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nadd, set."));
    }
}

async function avatar(robot, message, args){
    let profileURL = "";
    let handler = args.shift();
    if(handler) handler = handler.toLowerCase();
    switch(handler){
        case "set":
            let attachmentObject = await message.attachments.first();
            if(attachmentObject != undefined)
            profileURL = attachmentObject.url;
            else{
                embedAttachment = message.embeds[0];
                if(embedAttachment != undefined)
                    profileURL = embedAttachment.url;
            }
            let checkExistURL = args.shift();

            if((profileURL == "")&&(checkExistURL != undefined)) return await message.channel.send(getEmbed_Error("Прикрепите к сообщению изображение или ссылку на него.\nЕсли вы прикрепляете ссылку на GIF-изображение, необходимо, чтобы ссылка заканчивалась на *.gif*."));
            if(profileURL.length > urlLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина ссылки вложения.\nМаксимальная длина: 192."));
            if(profileURL == "") profileURL = null;
        case "reset":
            userdata = await getUserdata(message.author.id);
            userdata.avatarURL = profileURL;
            await setUserdata(userdata);
            return await message.channel.send(getEmbed_AvatarChange(message.author, userdata.avatarURL));
        default:
            return await message.channel.send(getEmbed_Avatar(message.author, message.mentions.users.first() || message.author));
    }
}

async function like(robot, message, args){
    let author = message.author;
    let authorID = message.author.id;
    let authorData = await getUserdata(authorID);
    let currentDate = new Date(), isLike = (message.content.slice(1, 5).toLowerCase() == "like") ? 1 : -1, user = message.mentions.users.first();
    if(!user) return await message.channel.send(getEmbed_Error("Укажите пользователя для лайка или дизлайка."));
    if(author.id == user.id) return await message.channel.send(getEmbed_Error("Нельзя лайкнуть самого себя!"));
    if(isLike > 0){
        if(authorData.likeCooldown)
            if((authorData.likeCooldown.getDate() == currentDate.getDate()) && (authorData.likeCooldown.getMonth() == currentDate.getMonth()))
                return await message.channel.send(getEmbed_Error("Вы уже использовали эту команду сегодня!\nПопробуйте снова через {0}.".format(getNextDayString(authorData.likeCooldown, currentDate))));
    } else {
        if(authorData.dislikeCooldown)
            if((authorData.dislikeCooldown.getDate() == currentDate.getDate()) && (authorData.dislikeCooldown.getMonth() == currentDate.getMonth()))
                return await message.channel.send(getEmbed_Error("Вы уже использовали эту команду сегодня!\nПопробуйте снова через {0}.".format(getNextDayString(authorData.dislikeCooldown, currentDate))));
    }
    let userData = await getUserdata(user.id);
    userData.karma = Math.max(Math.min(userData.karma+isLike, 100), 0);
    (isLike > 0) ? userData.likes++ : userData.dislikes++;
    if((isLike < 0) && Math.random() > 0.5){
        authorData.karma = Math.max(authorData.karma+isLike, 0);
        authorData.dislikeCooldown = currentDate;
    } else authorData.likeCooldown = currentDate;
    await setUserdata([userData, authorData]);
    await message.channel.send(getEmbed_LikeOrDislike(author, user, (isLike > 0) ? userData.likes : userData.dislikes, (isLike > 0)));
}

async function tagRolesManager(robot, message, args){
    let roleIndex = 0;
    switch(message.content.split(" ", 1)[0].slice(1)){
        case "ffa":
            roleIndex = 0;
            break;
        case "team":
        case "teamers":
            roleIndex = 1;
            break;
        case "tabletop":
        case "table":
            roleIndex = 2;
            break;
        case "dota":
        case "dota2":
            roleIndex = 3;
            break;
    }
    let member = message.member;
    let role = await message.guild.roles.cache.get(tagRolesData[roleIndex].id);
    let giveRole = !(await member.roles.cache.has(tagRolesData[roleIndex].id));
    giveRole ? await member.roles.add(role) : await member.roles.remove(role);
    await message.channel.send(getEmbed_TagRolesManager(message.author, tagRolesData[roleIndex], giveRole));
}

async function karma(robot, message, args){
    if(!hasPermissionLevel(message.member, 2)) return message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
    let handler = args.shift();
    switch(handler){
        case 'add':
        case 'set':
            member = await message.mentions.members.first();
            if(!member) return await message.channel.send(getEmbed_Error("Укажите пользователя для изменения кармы."));
            userdata = await getUserdata(member.id);
            newValueKarma = parseInteger(args[1]);
            if(newValueKarma == undefined) return await message.channel.send(getEmbed_Error("Введите целое значение."));
            if(handler == "add") userdata.karma = Math.min(Math.max(newValueKarma + userdata.karma, 0), 100);
            if(handler == "set") userdata.karma = Math.min(Math.max(newValueKarma, 0), 100);
            setUserdata(userdata);
            return await message.channel.send(getEmbed_Karma(member, userdata.karma, message.author));
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nadd, set."));
    }
}

async function bonus(robot, message, args){
    let userdata = await getUserdata(message.author.id);
    let bonusDate = userdata.bonusCooldown;
    let tempDate = new Date();
    let currentDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);
    let deltaDays = 1;
    if(bonusDate) deltaDays = Math.floor((currentDate - bonusDate)/(1000*86400));
    if(deltaDays == 0) return message.channel.send(getEmbed_Error("Вы уже использовали эту команду сегодня!\nПопробуйте снова через {0}.".format(getNextDayString(bonusDate, currentDate))));

    const maxStreak = 7;
    let isMaxStreakFlag = (userdata.bonusStreak == maxStreak);
    let daysValue = (deltaDays == 1) ? Math.min(userdata.bonusStreak+1, maxStreak) : 1;

    let random = Math.random()/4 + 0.75, karmaCoeff = (userdata.karma-50)*0.5;
    let bonusValue = Math.round(Math.max(25*random*daysValue + karmaCoeff, 20));
    let karmaValue = 0, ratingValue = 0;

    if(Math.random() > 1-(daysValue/10)){
        ratingValue++;
        if((daysValue >= 5) && (Math.random() > 0.75)) ratingValue++;
    }
    if(Math.random() > 1-(0.11 + 0.04*daysValue)) karmaValue++;

    userdata.rating += ratingValue;
    userdata.karma = Math.min(userdata.karma + karmaValue, 100);
    userdata.bonusStreak = daysValue;
    userdata.money += bonusValue;
    userdata.bonusCooldown = currentDate;
    await setUserdata(userdata);
    await message.channel.send(getEmbed_Bonus(message.author, bonusValue, daysValue, isMaxStreakFlag, userdata.money, ratingValue, karmaValue));
}

async function money(robot, message, args){
    let handler = args.shift();
    switch(handler){
        case 'add':
        case 'set':
            if(!hasPermissionLevel(message.member, 5)) return await message.channel.send(getEmbed_Error("У вас недостаточно прав для использования этой команды."));
            member = await message.mentions.members.first();
            if(!member) return await message.channel.send(getEmbed_Error("Укажите пользователя для изменения денег."));
            newMoneyValue = parseInteger(args[1]);
            if(newMoneyValue == undefined) return await message.channel.send(getEmbed_Error("Введите целое значение."));
            userdata = await getUserdata(member.id);
            userdata.money = (handler == "add") ? userdata.money+newMoneyValue : newMoneyValue;
            await setUserdata(userdata);
            return await message.channel.send(getEmbed_Money(member, userdata.money, message.author));
        case 'pay':
            author = await message.author;
            member = await message.mentions.members.first();
            if(!member) return await message.channel.send(getEmbed_Error("Укажите пользователя для передачи денег."));
            if(author.id == member.id) return await message.channel.send(getEmbed_Error("Нельзя переводить деньги самому себе!"));
            sendMoneyValue = parseInteger(args[1]);
            if((sendMoneyValue == undefined) || (isNaN(sendMoneyValue))) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            if(sendMoneyValue <= 0) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            let userdataSend = await getUserdata(author.id), userdataReceive = await getUserdata(member.id);
            if(userdataSend.money < sendMoneyValue) return await message.channel.send(getEmbed_Error("У вас недостаточно средств!"));
            userdataSend.money -= sendMoneyValue;
            userdataReceive.money += sendMoneyValue;
            await setUserdata([userdataSend, userdataReceive]);
            return await message.channel.send(getEmbed_Money(member, sendMoneyValue, message.author, [[userdataSend.money+sendMoneyValue, userdataSend.money], [userdataReceive.money-sendMoneyValue, userdataReceive.money]]));
        default:
            return await message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\npay, add, set."));
    }
}

async function proposal(robot, message, args){
    const deltaTimeHours = 6;
    let userdata = await getUserdata(message.author.id);
    let currentDate = new Date();
    if(userdata.proposalCooldown)
        if((currentDate - userdata.proposalCooldown)/1000/3600 < deltaTimeHours)
            return await message.channel.send(getEmbed_Error("Отправлять новые предложения можно раз в 6 часов!"));
    proposalString = (message.content[1] == 'p') ? message.content.slice(10).trim() : message.content.slice(7).trim()   //proposal / offer
    if(proposalString.length == 0) return await message.channel.send(getEmbed_Error("Введите предложение для отправки."));
    userdata.proposalCooldown = currentDate;
    await setUserdata(userdata);
    voteMessage = await robot.channels.cache.get(proposalChannelID).send(getEmbed_Proposal(message.author, proposalString));
    await voteMessage.react("<:Yes:808418109710794843>");
    await voteMessage.react("<:No:808418109319938099>");
}

async function description(robot, message, args){
    let descriptionString = (message.content[5] == " ") ? message.content.slice(6) : message.content.slice(13);
    if(descriptionString.length > descriptionLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина описания профиля игрока.\nМаксимальная длина: 128."));
    if(descriptionString.length == 0) descriptionString = null;
    let userdata = await getUserdata(message.author.id);
    userdata.description = descriptionString;
    await setUserdata(userdata);
    await message.channel.send(getEmbed_ProfileDescription(message.author, descriptionString));
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

var commands =
[
    {
        name: ["draft"],
        out: draft,
        about: "Общая команда для драфта"
    },
    {
        name: ["redraft"],
        out: redraft,
        about: "Команда для редрафта последнего драфта"
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
        name: ["dice", "die", "roll", "random", "rand"],
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
        name: ["like", "dislike", "report"],
        out: like,
        about: "Похвалить или поругать игрока"
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
    {
        name: ["save"],
        out: save,
        about: "Сохранить базу данных"
    },
    {
        name: ["ffa", "team", "teamers", "tabletop", "table", "dota", "dota2"],
        out: tagRolesManager,
        about: "Менеджер тегабельных ролей"
    },
    {
        name: ["split"],
        out: split,
        about: "Разделить игроков в лобби на команды"
    },
    {
        name: ["desc", "description"],
        out: description,
        about: "Установить описание в профиль игрока"
    },
    {
        name: ["sub"],
        out: sub,
        about: "Правила о замене игрока"
    },
    {
        name: ["tie"],
        out: tie,
        about: "Правила о ничье"
    },
    {
        name: ["leave"],
        out: leave,
        about: "Правила о ливе"
    },
    {
        name: ["weak", "weakpoint", "weakpoints"],
        out: weakPointManager,
        about: "Менеджер очков слабости"
    },
]

module.exports = commands;
