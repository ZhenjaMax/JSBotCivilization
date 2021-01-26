const { draftFFA } =       require('./draft.js');
const { getEmbed_Avatar,
        getEmbed_Heads, 
        getEmbed_Tails,
        getEmbed_Dice,
        getEmbed_WrongNumber,
        getEmbed_Clear,
        getEmbed_Profile,
        getEmbed_Register,
        getEmbed_Error,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { randomInteger,
        parseInteger } = require('./functions.js');
const { databaseUsers } = require('./database.js');
const { roleBannedID } = require('./data.js')

function draft(robot, message, args) {
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
    userData = await databaseUsers.findOne({ where: { userid: user.id } });
    if (userData)
        return message.channel.send(getEmbed_Profile(user, userData, author));
    try {
        const registration = await databaseUsers.create({userid: user.id});
        return message.channel.send(getEmbed_Register(user));
    } catch (errorDB) {
        return message.channel.send(getEmbed_UnknownError("errorDB"));
    }
}

async function clear(robot, message, args){
    deleteCountMin = 1;
    deleteCountMax = 10;
    deleteCount = parseInteger(args[0]);
    if((isNaN(deleteCount)) || (deleteCount == undefined) || (deleteCount < deleteCountMin) || (deleteCount > deleteCountMax))
        return message.channel.send(getEmbed_WrongNumber(deleteCountMin, deleteCountMax));
    try {
        let fetched = await message.channel.messages.fetch({limit: deleteCount});
        await message.channel.bulkDelete(fetched)
        await message.channel.send(getEmbed_Clear(deleteCount));
    } catch (errorClear) {
        return message.channel.send(getEmbed_UnknownError("errorClear"));
    }
}

async function test(robot, message, args){
}

async function ban(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для бана."));
    try{
        userdata = await databaseUsers.findOne({ where: { userid: user.id } });
        if(!userdata)
            return message.channel.send(getEmbed_Error("Пользователь не зарегистрирован!"));
        if(userdata.banned)
            return message.channel.send(getEmbed_Error("Пользователь уже имеет бан! Чтобы снять, используйте !unban"));
        roleBanned = await message.guild.roles.cache.get(roleBannedID);
        await user.roles.add(roleBanned);
        await databaseUsers.update({ banned: 1 }, { where: { userid: user.id } });
        return await message.channel.send("Забанен!");
    } catch {
        return message.channel.send(getEmbed_UnknownError("errorBan"));
    }
}

async function unban(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для бана."));
    try{
        userdata = await databaseUsers.findOne({ where: { userid: user.id } });
        if(!userdata)
            return message.channel.send(getEmbed_Error("Пользователь не зарегистрирован!"));
        if(!userdata.banned)
            return message.channel.send(getEmbed_Error("Пользователь не имеет бана."));
        roleBanned = await message.guild.roles.cache.get(roleBannedID);
        await user.roles.remove(roleBanned);
        await databaseUsers.update({ banned: 0 }, { where: { userid: user.id } });
        return await message.channel.send("Разбанен!");
    } catch (errorUnban) {
        return message.channel.send(getEmbed_UnknownError("errorUnban"));
    }
}

// Список комманд //
var commands = 
[
    {
        name: ["draft", "draftffa"],
        out: draft,
        about: "Драфт для FFA"
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
        name: ["profile", "p"],
        out: profile,
        about: "Профиль игрока"
    },
    {
        name: ["clear", "clean"],
        out: clear,
        about: "Удалить последние сообщения (до 10)"
    },
    {
        name: ["test"],
        out: test,
        about: "Тестовая команда"
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
]

module.exports = commands;
