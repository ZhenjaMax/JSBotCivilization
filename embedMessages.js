const Discord = require('discord.js');
const { String } = require('./functions.js');

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
        .setTitle("👋 Новый игрок!")
        .setDescription(`Добро пожаловать на сервер, <@{0}>!
        Не забудьте ознакомиться с информацией в канале <#806267897658998834>.`.format(user.id));
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
            { name: 'Лайки/Дизлайки', value: (userData.likes + "/" + userData.dislikes), inline: true },
            { name: 'Карма:', value: userData.karma, inline: true },
            { name: 'Наказание:', value: "{0}".format( (userData.banned || userData.mutedvoice || userData.mutedchat) ? "да" : "нет" ), inline: true },
        )
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setThumbnail(author.avatarURL());
    return embedMsg;
}

function getEmbed_Ban(user, dateUntil, reason) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("🔨 Бан", "Игрок: {0}\nСрок до: {1}\nПричина:{2}".format(user.toString(), dateUntil, reason));
    return embedMsg;
}

function getEmbed_Unban(user) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Разбанен", "Игрок: {0}".format(user.toString()));
    return embedMsg;
}

function getEmbed_Mute(user, dateUntil, reason) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Мут", "Игрок: {0}\nСрок до: {1}\nПричина:{2}".format(user.toString(), dateUntil, reason));
    return embedMsg;
}

function getEmbed_Unmute(user) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Размучен", "Игрок: {0}".format(user.toString()));
    return embedMsg;
}

function getEmbed_Nochat(user, dateUntil, reason) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Блокировка чата", "Игрок: {0}\nСрок до: {1}\nПричина:{2}".format(user.toString(), dateUntil, reason));
    return embedMsg;
}

function getEmbed_Unchat(user) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Разблокировка чата", "Игрок: {0}".format(user.toString()));
    return embedMsg;
}

function getEmbed_Pardon(user) {
    const embedMsg = new Discord.MessageEmbed()
        .addField("Все ограничения сняты!", "Игрок: {0}".format(user.toString()));
    return embedMsg;
}

function getEmbed_RatingSingleChange(user, ratingBefore, ratingAfter){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0');
        for(let i in user)
            embedMsg.addField("Изменение рейтинга", "{0}: {1} -> {2} ({3})".format(user[i].toString(), ratingBefore[i], ratingAfter[i], 
                ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i])));
    return embedMsg;
}

function getEmbed_LikeOrDislike(author, user, userData, likeIndicator){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF4FFF')
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(likeIndicator > 0)
        embedMsg.addField("👍 Лайк для {0}!".format(user.tag), "Всего лайков: {0}.".format(userData.likes));
    else
        embedMsg.addField("👎 Дизлайк для {0}!".format(user.tag), "Всего дизлайков: {0}".format(userData.dislikes));
    return embedMsg;
}

function getEmbed_Welcome1(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#125FB3')
        .setTitle('👋 Привет!')
        .setDescription(`Добро пожаловать на пиратский сервер по игре Civilization VI.\n
                        Здесь вы сможете установить игру и сыграть с друзьями или другими игроками нашего сервера. 🎉`)
        .setImage('https://cdn.discordapp.com/attachments/699241676048433202/808379643417591848/welcome1.png')
    return embedMsg;
}

function getEmbed_Welcome2(){
    const embedMsg = new Discord.MessageEmbed()
    .setColor('#FF3D3D')
        .setTitle('📌 Правила сервера').setURL('https://docs.google.com/document/d/1PR7FUXDuM9Yay3Vw3yO0zZnJxccGgc6SKhvrgcHVuUc/edit?usp=sharing')
        .setDescription(`На сервере имеется свод правил. Чтобы открыть полные правила, нажмите по заголовку. __Три основных__ правила сервера перечислены ниже.

        🏃 1. Не покидайте игру до её окончания. Вы можете покинуть игру в одном из случаев:
            • потеряна изначальную столицу;
            • потеряно хотя бы ⅔ городов;
            • вас признали *иррелевантным*;
            • вас заменил другой игрок.
        
        🤖  2. Не используйте баги и ошибки игры; не принимайте сделки и договоры от игровых ботов.
        
        🥰  3. Будьте доброжелательны, не будьте токсичными в общении с другими игроками.
        
        📌 **Последнее обновление правил: 07.02.2021 г.**`)
        .setImage('https://cdn.discordapp.com/attachments/699241676048433202/808379645598105610/welcome2.png');
    return embedMsg;
}

function getEmbed_Welcome3(){
    const embedMsg = new Discord.MessageEmbed()
    .setColor('#80FF4A')
        .setTitle('🧭 Навигация на сервере')
        .setDescription(`На сервере имеется много каналов.
        
        <#698952979851771937> - важные новости сервера
        <#698985011017416774> - инструкция по установке игры
        <#807958245541019680> - описание команд бота
        
        <#698294019331063908> - основной чат
        <#698295115063492758> - канал для вызова команд бота
        <#722467597710262563> - канал для планирования игровых партий
        <#705473314524495963> - исторические моменты и смешные записи игроков
        
        <#701085858576597052> - отчеты о прошедших играх и действиях модерации
        <#701025666606432309> - канал для вызова музыкального бота
        <#704803588853071983> - новости о проходящих событиях сервера
        <#698294522223788092> - канал, в котором не действуют правила чата (18+)`)
        .setImage('https://cdn.discordapp.com/attachments/699241676048433202/808379646235639908/welcome3.png');
    return embedMsg;
}

function getEmbed_Test(robot, message, args) {
    const embedMsg = new Discord.MessageEmbed()
	    .setColor("#000FFF")

        .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')

	    .setTitle('Some title').setURL('https://discord.js.org/')
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
    return embedMsg;
}

function getEmbed_Vote(author, questionString){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#EEEEEE")
        .setTitle('🤔 Вопрос:')
        .setDescription(questionString)
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_Irrel(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: иррелевантность')
        .setDescription(`Голосование за иррелевантность может проводится **не чаще, чем раз в 5 ходов** в отношении одного игрока. Игрок не должен иметь права вето или игрок трижды вылетает из игры по техническим причинам.

        Для успешной иррелевантности необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-30 ход – единогласно.
        • 31-60 ход – 3/4 игроков.
        • 61+ ход – 2/3 игроков.`);
    return embedMsg;
}

function getEmbed_Remap(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: ремап и авторемап')
        .setDescription(`Голосование за ремап *в FFA* проводится **до 15 хода включительно**. 
        Для успешного ремапа необходимо согласие большинства игроков (50%+1 игрок).
        В случае, если предлагается провести ремап повторно, то после каждого ремапа требуется согласие на 1 игрока больше, чем требовалось в предыдущий раз.
        
        Голосование за ремап *в Teamers* проводится **до 8 хода включительно**.
        Для успешного ремапа необходимо согласие хотя бы 50% команд.
        Команды могут выразить свое согласие на ремап лишь 1 раз за игру.
        
        Авторемап может произойти *в FFA* **до 15 хода включительно**.
        • Авторемап гарантирован, если вы не можете основать 3 новых города в радиусе 5 клеток от своей столицы без изучения дополнительных технологий.`);
    return embedMsg;
}

function getEmbed_CC(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: СС')
        .setDescription(`Голосование за СС может проводится **не чаще, чем раз в 5 ходов**. Голосование за СС должен инициировать игрок, не являющийся целью голосования. Цель голосования не участвует в голосовании и не учитывается при подсчете голосов, даже если цель имеет право вето.
        
        Для успешного CC необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-80 ход – единогласно.
        • 81+ ход – 2/3 игроков.`);
    return embedMsg;
}

function getEmbed_Scrap(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: скрап')
        .setDescription(`Голосование за скрап может проводится **не чаще, чем раз в 5 ходов**, либо в случае, если изменилось состояние игрока:
        • игрок покинул игру не по правилам;
        • замена игрока.

        Для успешного скрапа необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-30 ход – 2/3 игроков.
        • 31-60 ход – 3/4 игроков.
        • 61-80 ход – все, кроме 1 игрока.
        • 81+ ход– единогласно.`);
    return embedMsg;
}

function getEmbed_Veto(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: право вето')
        .setDescription(`Права вето начинают действовать с **61 хода игры**.

        ⌛ **1. Вето по очкам.**
        • Игроки, занимающие лидирующие места по очкам, имеют право вето. Для 6 игроков – 2 игрока; для 8 игроков – 3; для 10 или 12 игроков – 4.
        ⚗️ **2. Научное вето.**
            • Каждый игрок, который завершил проект «Запуск искусственного спутника».
            • Игрок, изучивший наибольшее число технологий.
            • Игрок, имеющий наибольшее количество науки в ход.
        🎵 **3. Культурное вето.**
        • Игрок, имеющий больше всего внешних туристов.
        • Каждый игрок, у которого 500 и более туризма в ход.
        ⚔️ **4. Военное вето.**
        • Игрок с наибольшей военной мощью.
        • Игрок с наибольшим количеством захваченных столиц.
        🗿 **5. Религиозное вето.**
        • Игрок, обративший большинство существующих цивилизаций в свою религию, **но хотя бы ⅓ от их числа**.
        🕊️ **6. Дипломатическое вето.**
        • Игрок, имеющий наибольшее число очков дипломатической победы, **но хотя бы 10.**`);
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
    getEmbed_UnknownError,
    getEmbed_Error,
    getEmbed_Ban,
    getEmbed_Unban,
    getEmbed_Mute,
    getEmbed_Unmute,
    getEmbed_Nochat,
    getEmbed_Unchat,
    getEmbed_Pardon,
    getEmbed_RatingSingleChange,
    getEmbed_LikeOrDislike,
    getEmbed_Welcome1,
    getEmbed_Welcome2,
    getEmbed_Welcome3,
    getEmbed_Vote,
    getEmbed_Test,
    getEmbed_Irrel,
    getEmbed_CC,
    getEmbed_Scrap,
    getEmbed_Veto,
    getEmbed_Remap
}

