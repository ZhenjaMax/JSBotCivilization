const Discord = require('discord.js');
const { String } = require('./functions.js')

function getEmbed_NoVoice() {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .addField("Ошибка!", "Вы не в канале.");
    return embedMsg;
}

function getEmbed_WrongNumber(valueMin, valueMax) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .addField("Ошибка!", "Введите число от {0} до {1}.".format(valueMin, valueMax));
    return embedMsg;
}

function getEmbed_UnknownError(errorName) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .addField("Неизвестная ошибка!", "Попробуйте снова или позовите администратора. ({0})".format(errorName));
    return embedMsg;
}

function getEmbed_Error(errorDescription) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .addField("Ошибка!", errorDescription);
    return embedMsg;
}

function getEmbed_NotEnoughCivilizations() {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .addField("Ошибка!", "В списке слишком мало наций для такого драфта.");
    return embedMsg;
}

function getEmbed_Avatar(author, user) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#0099FF")
        .setTitle("Аватар пользователя {0}!".format(user.tag))
        .setImage(user.avatarURL({ size: 1024, dynamic: true, format: 'png' }))
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Heads(author) {
    const embedMsg = new Discord.MessageEmbed()
        .setAuthor("Подбрасывание монетки")
        .setColor("#FFB554")
        .setTitle("Орёл! 🌕")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Tails(author) {
    const embedMsg = new Discord.MessageEmbed()
        .setAuthor("Подбрасывание монетки")
        .setColor("#A0A0A0")
        .setTitle("Решка! 🌑")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Dice(author, valueDiceMax, valueDice) {
    const embedMsg = new Discord.MessageEmbed()
        .setAuthor("Подбрасывание D{0}".format(valueDiceMax))
        .setColor("#FF526C")
        .setTitle("🎲 Выпало: {0}{1}".format(valueDice, (valueDice == valueDiceMax) ? "! 🔥" : "."))
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Ready() {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#63FF73")
        .setTitle("👑 Бот запустился! 🏆");
    return embedMsg;
}

function getEmbed_MemberAdd(user) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF91D9")
        .setAuthor("Новый игрок")
        .setTitle("Добро пожаловать, {0}!".format(user.tag));
    return embedMsg;
}

function getEmbed_Clear(count) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FFFF00")
        .setAuthor("Удаление сообщений")
        .setTitle("✏️ Удалено {0} сообщений! 📝".format(count));
    return embedMsg;
}

function getEmbed_Profile(user, userData, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#0044FF")
        .setTitle("Профиль игрока")
        .addFields(
            { name: 'Никнейм:', value: user.toString(), inline: true },
            { name: 'Рейтинг:', value: userData.rating, inline: true },
            { name: 'Деньги:', value: userData.money, inline: true },
        )
        .addFields(
            { name: ':', value: user.toString(), inline: true },
            { name: 'Рейтинг:', value: userData.rating, inline: true },
            { name: 'Деньги:', value: userData.money, inline: true },
        )
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Register(user) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF8800")
        .addField("Регистрация", "🤖 Игрок {0} был зарегистрирован.\nДобро пожаловать! 🎉".format(user.toString()));
    return embedMsg;
}

function getEmbed_Ban() {
    const embedMsg = new Discord.MessageEmbed()
    return embedMsg;
}

function getEmbed_Unban() {
    const embedMsg = new Discord.MessageEmbed()
    return embedMsg;
}

module.exports = {
    getEmbed_NoVoice,
    getEmbed_WrongNumber,
    getEmbed_NotEnoughCivilizations,
    getEmbed_Avatar,
    getEmbed_Heads,
    getEmbed_Tails,
    getEmbed_Dice,
    getEmbed_Ready,
    getEmbed_MemberAdd,
    getEmbed_Clear,
    getEmbed_Profile,
    getEmbed_Register,
    getEmbed_UnknownError,
    getEmbed_Error,
    getEmbed_Ban,
    getEmbed_Unban
}

/*
function embedMessage(robot, message, args) {
    const embedMsg = new Discord.MessageEmbed()
	    .setColor(getRandomHexBrightString())
	    .setTitle('Some title')
	    .setURL('https://discord.js.org/')
	    .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
	    .setDescription('Some description here')
	    .setThumbnail('https://i.imgur.com/wSTFkRM.png')
	    .addFields(
		    { name: 'Regular field title', value: 'Some value here' },
		    { name: '\u200B', value: '\u200B' },
		    { name: 'Inline field title', value: 'Some value here', inline: true },
		    { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('\u200b', '\u200b')
        .addField('Inline field title my 1', 'Some value here', true)
        .addField('Inline field title my 3', 'Some value here', true)
	    .setImage('https://i.imgur.com/wSTFkRM.png')
	    .setTimestamp()
	    .setFooter(message.author.tag, message.author.avatarURL());
    message.channel.send(embedMsg);
}
*/
