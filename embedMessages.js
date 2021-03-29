const Discord = require('discord.js');
const { String,
        getDateRus, 
        getRandomHexBrightString,
        randomInteger} = require('./functions.js');
const { roleRanksValue,
        FFARoleID,
        teamersRoleID,
        tableTopRoleID, 
        clanCreateCost, 
        clanRenameCost,
        clanChangeColorCost } = require('./config.js');

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
        .setDescription(`Добро пожаловать на сервер, **<@{0}>**!
        Не забудьте ознакомиться с информацией в канале <#806267897658998834>.`.format(user.tag));
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
    let clanString = "нет";
    if(userData.clanid){
        clanString = "<@&{0}>".format(userData.clanid);
        if(userData.clanStatus == 2)
            clanString += "\n(👑 лидер клана)";
        if(userData.clanStatus == 1)
            clanString == "\n(🛡️ модератор клана)";
    }
    let banString = "нет";
    if(userData.banned || userData.mutedvoice || userData.mutedchat){
        banString = "";
        if(userData.banned)
            banString += `бан до: ${getDateRus(userData.banned)}\n`;
        if(userData.mutedvoice)
            banString += `войс заблокирован до: ${getDateRus(userData.mutedvoice)}\n`;
        if(userData.mutedchat)
            banString += `чат заблокирован до: ${getDateRus(userData.mutedchat)}\n`;
    }
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("👥 Профиль игрока")
        .addFields(
            { name: 'Никнейм:', value: user.toString(), inline: true },
            { name: '🪙 Деньги:', value: userData.money, inline: true },
            { name: '🎩 Лайки/Дизлайки', value: `👍 ${userData.likes} / ${userData.dislikes} 👎`, inline: true },
            { name: '💧 Карма:', value: userData.karma == 100 ? userData.karma + "  👼" : (userData.karma == 0 ? userData.karma + "  😈" : userData.karma), inline: true },
            { name: '📈 Рейтинг:', value: "Общий: {0}\nFFA: {1}\nTeamers: {2}".format(userData.rating, userData.ratingffa, userData.ratingteam), inline: true },
            { name: '🔎 Статистика игр:', value: 
            `**FFA:** ${userData.winsFFA} / ${userData.defeatsFFA}
            **Первых мест:** ${userData.firstPlaceFFA}
            **Teamers:** ${userData.winsTeamers} / ${userData.defeatsTeamers}`, inline: true },
            { name: '🏰 Клан:', value: clanString, inline: true },
            { name: '🔨 Наказание:', value: banString, inline: false },
        )
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setThumbnail(user.avatarURL());
        let colorList = [
            "#ffff00", "#ffe100",
            "#ffc300", "#ffa600",
            "#ff8800", "#ff6600",
            "#ff4800", "#ff0000",
            "#ff0054"
        ];
        let index = 0
        for(index; index < roleRanksValue.length; index++)
            if(userData.rating < roleRanksValue[index])
                break;
        embedMsg.setColor(colorList[index]);
    return embedMsg;
}

function getEmbed_Ban(user, dateUntil, reason, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Бан")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
            { name: 'Срок назания до:', value: getDateRus(dateUntil), inline: true },
            { name: 'Причина:', value: reason, inline: true },
        )
        .setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Unban(user, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Разбан")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
        );
        if(author)
            embedMsg.setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Mute(user, dateUntil, reason, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Мут в голосовых каналах")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
            { name: 'Срок назания до:', value: getDateRus(dateUntil), inline: true },
            { name: 'Причина:', value: reason, inline: true },
        )
        .setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Unmute(user, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Размут в голосовых каналах")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
        );
        if(author)
            embedMsg.setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Nochat(user, dateUntil, reason, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Блокировка чата")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
            { name: 'Срок назания до:', value: getDateRus(dateUntil), inline: true },
            { name: 'Причина:', value: reason, inline: true },
        )
        .setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Unchat(user, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Разблокировка чата")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
        );
        if(author)
            embedMsg.setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Pardon(user, author) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FF9100")
        .setTitle("🔨 Все ограничения сняты!")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
        )
        .setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_RatingSingleChange(user, ratingBefore, ratingAfter, author, moneyAdd, karmaAdd, teamFlag, multType, gameID, isCancel){
    userString = ""; ratingString = ""; additionalString = "";
    if(isCancel){
        const embedMsg = new Discord.MessageEmbed()
            .setColor('#00FFF0')
            .setFooter("Администратор " + author.tag, author.avatarURL())
            .setTitle("📉 Отмена рейтинга")
            .addFields(
                { name: 'Тип игры:', value: "{0}".format(teamFlag ? "Teamers" : "FFA"), inline: true },
                { name: 'ID игры:', value: "__**#" + gameID + "**__", inline: true},
                { name: 'Весь рейтинг будет возвращён.', value: "**Все полученные бонусы аннулируются.**", inline: true},
            );
            if(teamFlag){       // TEAM сообщение
                for(i = 0; i < (user.length)/2; i++){
                    userString += "**{0}**\n".format(user[i].tag);
                    ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                        ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                        ratingAfter[i]);
                    additionalString += "**-{0}** 🪙 |  **-{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
                }
                embedMsg.addFields(
                    { name: 'Никнейм:', value: userString, inline: true },
                    { name: 'Рейтинг:', value: ratingString, inline: true },
                    { name: 'Возврат:', value: additionalString, inline: true},
                );
                userString = ""; ratingString = ""; additionalString = "";
                for(i; i < user.length; i++){
                    userString += "**{0}**\n".format(user[i].tag);
                    ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                        ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                        ratingAfter[i]);
                    additionalString += "**-{0}** 🪙 |  **-{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
                }
                embedMsg.addFields(
                    { name: 'Никнейм:', value: userString, inline: true },
                    { name: 'Рейтинг:', value: ratingString, inline: true },
                    { name: 'Возврат:', value: additionalString, inline: true},
                );
            } else {    // FFA сообщение
                for(i in user){
                    userString += "{0}. {1}\n".format(Number(i)+1, user[i].tag);
                    ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                        ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                        ratingAfter[i]);
                    additionalString += "**-{0}** 🪙 |  **-{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
                }
                embedMsg
                    .addFields(
                    { name: 'Никнейм:', value: userString, inline: true },
                    { name: 'Рейтинг:', value: ratingString, inline: true },
                    { name: 'Возврат:', value: additionalString, inline: true},
                )
            }
        return embedMsg;

    }
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter("Администратор " + author.tag, author.avatarURL())
        .setTitle("📈 Изменение рейтинга");
    if(user.length != 1){
        let victoryTypesFFA = ["CC", "Научная", "Культурная", "Военная", "Религиозная", "Дипломатическая", "По очкам"];
        embedMsg.addFields(
            { name: 'Тип игры:', value: "{0}".format(teamFlag ? "Teamers" : "FFA"), inline: true },
            { name: 'Тип победы:', value: "{0}".format(teamFlag ? "GG" : victoryTypesFFA[multType]), inline: true },
            { name: 'ID игры:', value: "__**#" + gameID + "**__", inline: true},
        );
        if(teamFlag){       // TEAM сообщение
            for(i = 0; i < (user.length)/2; i++){
                userString += "**{0}**\n".format(user[i].tag);
                ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                    ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                    ratingAfter[i]);
                additionalString += "**+{0}** 🪙 |  **+{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
            }
            embedMsg.addFields(
                { name: 'Никнейм:', value: userString, inline: true },
                { name: 'Рейтинг:', value: ratingString, inline: true },
                { name: 'Бонус:', value: additionalString, inline: true},
            );
            userString = ""; ratingString = ""; additionalString = "";
            for(i; i < user.length; i++){
                userString += "**{0}**\n".format(user[i].tag);
                ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                    ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                    ratingAfter[i]);
                additionalString += "**+{0}** 🪙 |  **+{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
            }
            embedMsg.addFields(
                { name: 'Никнейм:', value: userString, inline: true },
                { name: 'Рейтинг:', value: ratingString, inline: true },
                { name: 'Бонус:', value: additionalString, inline: true},
            );
        } else {    // FFA сообщение
            for(i in user){
                userString += "{0}. **{1}**\n".format(Number(i)+1, user[i].tag);
                ratingString += "**{0}** {1} ({2})\n".format(ratingAfter[i]<ratingBefore[i] ? ratingAfter[i]-ratingBefore[i] : "+" + (ratingAfter[i]-ratingBefore[i]), 
                    ratingAfter[i]<ratingBefore[i] ? "📉" : "📈", 
                    ratingAfter[i]);
                additionalString += "**+{0}** 🪙 |  **+{1}** 💧\n".format(moneyAdd[i], karmaAdd[i]);
            }
            let victoryThumbnailsURL = [
                "https://static.wikia.nocookie.net/civilization/images/4/44/Science_Victory_%28Civ6%29.png",
                "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/6/61/Icon_victory_culture.png",
                "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/f/f7/Icon_victory_default.png",
                "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/1/1c/Icon_victory_religious.png",
                "https://static.wikia.nocookie.net/civilization/images/1/1e/Diplomatic_Victory_%28Civ6%29.png/revision/latest/scale-to-width-down/220?cb=20200430082219",
                "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/2/27/Icon_victory_score.png"
            ]
            embedMsg
                .setThumbnail(victoryThumbnailsURL[multType-1])
                .addFields(
                { name: 'Никнейм:', value: userString, inline: true },
                { name: 'Рейтинг:', value: ratingString, inline: true },
                { name: 'Бонус:', value: additionalString, inline: true},
            )
        }
    } else {    // АДМИН СООБЩЕНИЕ
        embedMsg.addFields(
            { name: 'Никнейм:', value: user[0].toString(), inline: true },
            { name: 'Рейтинг:', value: "**{0}** {1} ({2})\n".format(
                ratingAfter[0]<ratingBefore[0] ? ratingAfter[0]-ratingBefore[0] : "+" + (ratingAfter[0]-ratingBefore[0]), 
                ratingAfter[0]<ratingBefore[0] ? "📉" : "📈", 
                ratingAfter[0]), inline: true },
        );
    }
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

function getEmbed_Karma(user, karmaValue, author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#00B3FF")
        .setTitle("💧 Изменение кармы")
        .addFields(
            { name: 'Игрок:', value: user.toString(), inline: true },
            { name: 'Новое значение:', value: karmaValue, inline: true },
        )
        .setFooter("Администратор " + author.tag, author.avatarURL())
    return embedMsg;
}

function getEmbed_Money(user, moneyValue, author, payment = false){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FFD500")
        .setTitle("💰 Изменение баланса");
        if(payment == false)
            embedMsg
                .addFields(
                    { name: 'Игрок:', value: user.toString(), inline: true },
                    { name: 'Новое значение:', value: moneyValue + " 🪙", inline: true },
                )
                .setFooter("Администратор " + author.tag, author.avatarURL());
        else
            embedMsg
                .addFields(
                    { name: 'Отправитель:', value: author.toString(), inline: true },
                    { name: 'Было:', value: payment[0][0] + " 🪙", inline: true },
                    { name: 'Стало:', value: payment[0][1] + " 🪙", inline: true }
                )
                .addFields(
                    { name: 'Получатель:', value: user.toString(), inline: true },
                    { name: 'Было:', value: payment[1][0] + " 🪙", inline: true },
                    { name: 'Стало:', value: payment[1][1] + " 🪙", inline: true }
                )
                .setFooter(author.tag, author.avatarURL());
    return embedMsg;
}

function getEmbed_Bonus(author, bonusValue, streakValue, isMaxStreakFlag, moneyValue, ratingValue, karmaValue){
    bonusStringContent = `**Вы получили ${bonusValue} 🪙.**\n`;
    if(ratingValue)
        bonusStringContent += `**Вы получили 📈 +${ratingValue} к общему рейтингу.**\n`;
    if(karmaValue)
        bonusStringContent += `**Вы получили 💧 +${karmaValue} к карме.**\n`;
    if(ratingValue + karmaValue)
        bonusStringContent += "\n";
    bonusStringContent += `**Ваш баланс: ${moneyValue} 🪙.**\n\n`;
    bonusStringContent += `**Вы получаете ежедневный бонус `;
    switch(streakValue){
        case 1:
            bonusStringContent += `${streakValue} день`;
            break;
        case 5:
        case 6:
            bonusStringContent += `${streakValue} дней`;
            break;
        case 7:
            if(isMaxStreakFlag)
                bonusStringContent += `более ${streakValue} дней`
            else
                bonusStringContent += `${streakValue} дней`;
            break;
        default:
            bonusStringContent += `${streakValue} дня`;
            break;
    }
    bonusStringContent += " подряд!**";
    if(streakValue == 7){
        if(isMaxStreakFlag)
            bonusStringContent += " 🥳\n💷 💷 💷 💷 💷 💷 💷";
        else
            bonusStringContent += " 🥳\n💵 💵 💵 💵 💵 💵";
        bonusStringContent += " 💸\n**Приходите завтра, чтобы сохранить накопленный бонус!**"
    }
    else{
        bonusStringContent += "\n";
        for(let i = 0; i < streakValue-1; i++)
            bonusStringContent += "💵 ";
        bonusStringContent += "💸 "
        for(let i = 0; i < 7 - streakValue; i++)
            bonusStringContent += "🗓️ ";
        bonusStringContent += "\n**Приходите завтра и получите больше бонусов!**";
    }
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FFD500")
        .setTitle("💰 Ежедневный бонус")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(bonusStringContent);
    return embedMsg;
}

function getEmbed_BiasList(){
    defaultURL = "https://cdn.discordapp.com/attachments/462808131999629333/779417967263088653/Start_Biass_BBG_v4-0-3.jpg";
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🏞️ Стартовые спавны наций")
        .setColor("#47FF3D")
        .setDescription("На изображении ниже приведены все стартовые спавны (биасы) наций.\n\n📌 **Актуально для модификации BBG v4.0.3.**")
        .setImage(defaultURL);
    return embedMsg;
}

function getEmbed_CatImage(catURL){
    catEmojis = ["😼", "😹", "🙀", "😾", "😿", "😻", "😺", "😸", "😽", "🐱", "🐈"];
    const embedMsg = new Discord.MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setTitle("{0} Случайный кот!".format(catEmojis[randomInteger(catEmojis.length)]))
        .setDescription("Какой же он милый!")
        .setImage(catURL);
    return embedMsg;
}

function getEmbed_DogImage(dogURL){
    dogEmojis = ["🐶", "🦮", "🐕‍🦺", "🐕", "🐺"];
    const embedMsg = new Discord.MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setTitle("{0} Случайный пёс!".format(dogEmojis[randomInteger(dogEmojis.length)]))
        .setDescription("Какой же он крутой!")
        .setImage(dogURL);
    return embedMsg;
}

function getEmbed_Proposal(author, proposalString){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#FAB3FF")
        .setTitle('✍ Предложение:')
        .setDescription(proposalString)
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanInfo(author, clanID, clanRating, clanMoney, clanLeaderID, clanModerators, clanMemberCount, clanAvatarURL, clanDescription, clanColor){
    clanModeratorsString = "";
    for(moder of clanModerators)
        clanModeratorsString += "<@!{0}>\n".format(moder);
    if(clanModeratorsString.length == 0)
        clanModeratorsString = "нет";
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Информация о клане")
        .addFields(
            { name: 'Название:',           value: "<@&{0}>".format(clanID), inline: true },
            { name: '📈 Рейтинг:',         value: clanRating, inline: true },
            { name: '🪙 Казна:',             value: clanMoney, inline: true },
            { name: '👑 Лидер клана:',     value: "<@!{0}>".format(clanLeaderID), inline: true },
            { name: '🛡 Модераторы клана:', value: clanModeratorsString, inline: true },
            { name: 'Число участников:',    value: clanMemberCount, inline: true },
            { name: '📜 Описание:',            value: clanDescription ? clanDescription : "нет", inline: false },
        )
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(clanAvatarURL)
        embedMsg.setImage(clanAvatarURL);
    return embedMsg;
}

function getEmbed_ClanSet(clanName, deleteFlag = false, clanColor = false){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor ? clanColor : "#74a5d6")
        if(deleteFlag)
            embedMsg
                .setTitle("🏰 Удаление клана")
                .setDescription("Вы действительно хотите удалить клан <@&{0}> ?\n🚫 **Это действие нельзя отменить!**\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 30 секунд на подтверждение.".format(clanName));
        else
            embedMsg
                .setTitle("🏰 Создание клана")
                .setDescription("Вы действительно хотите создать клан **«{0}»** ?\nЭто стоит {1} 🪙 монет.\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 30 секунд на подтверждение.".format(clanName, clanCreateCost));
    return embedMsg;
}

function getEmbed_ClanCreate(clanID, costValue, author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#74a5d6")
        .setTitle("🏰 Создание клана")
        .setDescription("**Вы создали клан** <@&{0}>! 🎉\nТеперь вы являетесь 👑 Лидером клана.\n\nВы потратили {1} 🪙 монет.".format(clanID, costValue))
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanDelete(clanName, author, clanColor, administrationFlag = false){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Удаление клана")
        .setDescription("Вы удалили клан **«{0}»** ! 🚫\nКанал клана и роль клана были удалены.\n".format(clanName))
        .setFooter(administrationFlag ? "Администратор " + author.tag : author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanTimeout(author, deleteFlag = false, clanColor = false){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor ? clanColor : "#74a5d6")
        .setTitle(deleteFlag ? "🏰 Удаление клана" : "🏰 Создание клана")
        .setDescription("⏰ Время для подтверждения действия истекло.")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanCancel(author, deleteFlag = false, clanColor = false){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor ? clanColor : "#74a5d6")
        .setTitle(deleteFlag ? "🏰 Удаление клана" : "🏰 Создание клана")
        .setDescription("<:No:808418109319938099> Подтверждение действия отклонено.")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanDescription(author, descriptionString, clanColor){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Изменение описания клана")
        .setDescription(descriptionString ? "**Описание клана успешно изменено.** 📜\n**Новое описание клана:**\n{0}".format(descriptionString) : "📜 **Описание клана успешно сброшено.**")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanAvatar(author, url, clanColor){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Изменение изображения клана")
        .setDescription(url ? "**Изображение клана успешно изменено.** 🏞️" : "Изображение клана успешно сброшено. 🏞️")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(url)
        embedMsg.setImage(url);
    return embedMsg;
}

function getEmbed_ClanColor(author, clanColor, confirmCode){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Изменение цвета клана");
    if(confirmCode == 0)
        embedMsg.setDescription("Вы действительно хотите поменять цвет клана? 🎨\nНовый цвет представлен слева.\nЭто стоит {0} 🪙 монет.\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 30 секунд на подтверждение.".format(clanChangeColorCost));
    else if(confirmCode == 1)
        embedMsg
            .setDescription("**Цвет клана был успешно изменён.** 🎨")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else if(confirmCode == -1)
        embedMsg
            .setDescription("<:No:808418109319938099> Подтверждение действия отклонено.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else
        embedMsg
            .setDescription("⏰ Время для подтверждения действия истекло.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    return embedMsg;
}

function getEmbed_Save(author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#63FF73")
        .setTitle('🤖 База данных успешно сохранена.')
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanRename(author, clanName, newClanName, clanColor, confirmCode){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Изменение названия клана");
    if(confirmCode == 0)
        embedMsg.setDescription("Вы действительно хотите переименовать клан\n**«{0}»** в **«{1}»** ? ✍️\nЭто стоит {2} 🪙 монет.\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 30 секунд на подтверждение.".format(clanName, newClanName, clanRenameCost));
    else if(confirmCode == 1)
        embedMsg
            .setDescription("Название вашего клана было изменено на **«{0}»**. ✍️\nКлан потратил из казны {1} 🪙 монет.".format(newClanName, clanRenameCost))
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else if(confirmCode == -1)
        embedMsg
            .setDescription("<:No:808418109319938099> Подтверждение действия отклонено.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else
        embedMsg
            .setDescription("⏰ Время для подтверждения действия истекло.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanTransfer(author, clanID, userTransferID, clanColor, confirmCode){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Передача клана");
    if(confirmCode == 0)
        embedMsg.setDescription("Вы действительно хотите сделать новым лидером клана <@&{0}> игрока <@!{1}> ?\n🚫 **Это действие нельзя отменить!**\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 30 секунд на подтверждение.".format(clanID, userTransferID));
    else if(confirmCode == 1)
        embedMsg
            .setDescription("Теперь <@!{0}> - новый 👑 лидер клана.".format(userTransferID))
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else if(confirmCode == -1)
        embedMsg
            .setDescription("<:No:808418109319938099> Подтверждение действия отклонено.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else
        embedMsg
            .setDescription("⏰ Время для подтверждения действия истекло.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanJoin(author, clanID, clanColor, confirmCode, clanModerator = false){
    userID = author.id;
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Добавление нового участника в клан");
    if(confirmCode == 0)
        embedMsg.setDescription("Игрок <@!{0}> хочет вступить в клан <@&{1}> !\nЛидер клана или любой модератор клана должен принять решение.\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 120 секунд на подтверждение.".format(userID, clanID));
    else if(confirmCode == 1)
        embedMsg
            .setDescription("Теперь <@!{0}> - новый участник клана. 🥳".format(userID))
            .setFooter(clanModerator.tag, clanModerator.avatarURL())
            .setTimestamp();
    else if(confirmCode == -1)
        embedMsg
            .setDescription("<:No:808418109319938099> Подтверждение действия отклонено.")
            .setFooter(clanModerator.tag, clanModerator.avatarURL())
            .setTimestamp();
    else
        embedMsg
            .setDescription("⏰ Время для подтверждения действия истекло.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanInvite(author, userInviteID, clanID, clanColor, confirmCode){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(clanColor)
        .setTitle("🏰 Приглашение нового участника в клан");
    if(confirmCode == 0)
        embedMsg.setDescription("Игрок <@!{0}> приглашается в клан <@&{1}> !\nИгрок должен принять решение.\n\nДля подтверждения, нажмите на нужный эмодзи ниже.\nУ вас есть 120 секунд на подтверждение.".format(userInviteID, clanID));
    else if(confirmCode == 1)
        embedMsg
            .setDescription("Теперь <@!{0}> - новый участник клана. 🥳".format(userInviteID))
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else if(confirmCode == -1)
        embedMsg
            .setDescription("<:No:808418109319938099> Подтверждение действия отклонено игроком.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    else
        embedMsg
            .setDescription("⏰ Время для подтверждения действия истекло.")
            .setFooter(author.tag, author.avatarURL())
            .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanMoney(author, clanID, clanBefore, clanAfter, clanColor){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🏰 Изменение казны клана")
        .setColor(clanColor)
        .addFields(
            { name: (clanAfter >= clanBefore) ? 'Положил в казну:' : 'Забрал из казны:', value: author.toString(), inline: true },
            { name: 'Было:', value: clanBefore + " 🪙", inline: true },
            { name: 'Стало:', value: clanAfter + " 🪙", inline: true }
        )
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_ClanLeave(author, userID, clanID, clanColor){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🏰 Изменение состава участников клана")
        .setColor(clanColor)
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(author.id == userID ? "Игрок <@!{0}> покинул клан <@&{1}>.".format(userID, clanID) : "Игрок <@!{0}> был изгнан из <@&{1}> модератором клана <@!{2}>.".format(userID, clanID, author.id));
    return embedMsg;
}

function getEmbed_ClanPromote(author, userID, clanID, clanColor, promoteStatus){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle(promoteStatus ? "🏰 Повышение участника клана" : "🏰 Понижение участника клана")
        .setColor(clanColor)
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(promoteStatus ? "Игрок <@!{0}> был повышен до модератора клана <@&{1}>.".format(userID, clanID) : "Игрок <@!{0}> был разжалован до участника клана <@&{1}>.".format(userID, clanID));
    return embedMsg;
}

function getEmbed_ClanList(author, clansID, clansLeader){
    descriptionString = "";
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🏰 Список кланов сервера")
        .setColor("#5395d7")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(clansID.length == 0)
        embedMsg.setDescription("На сервере нет кланов! 🏰\nВы можете основать первый клан на сервере.");
    else{
        for(i in clansID)
            descriptionString += ("**{0}.** <@&{1}> | Лидер 👑 <@!{2}>\n".format(Number(i)+1, clansID[i], clansLeader[i]));
        embedMsg.setDescription(descriptionString);
    }
    return embedMsg;
}

function getEmbed_FFARole(author, giveRole){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🗿 Выдача роли FFA")
        .setColor("#428ff4")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(giveRole ? "<:Yes:808418109710794843> **Вы получили роль** <@&{0}>**.**".format(FFARoleID) : "<:No:808418109319938099> **У вас больше нет роли** <@&{0}>**.**".format(FFARoleID));
    return embedMsg;
}

function getEmbed_TeamersRole(author, giveRole){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🐲 Выдача роли Teamers")
        .setColor("#35f00f")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(giveRole ? "<:Yes:808418109710794843> **Вы получили роль** <@&{0}>**.**".format(teamersRoleID) : "<:No:808418109319938099> **У вас больше нет роли** <@&{0}>**.**".format(teamersRoleID));
    return embedMsg;
}

function getEmbed_TableTopRole(author, giveRole){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🎲 Выдача роли TableTop")
        .setColor("#21bbc4")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(giveRole ? "<:Yes:808418109710794843> **Вы получили роль** <@&{0}>**.**".format(tableTopRoleID) : "<:No:808418109319938099> **У вас больше нет роли** <@&{0}>**.**".format(tableTopRoleID));
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
    getEmbed_Remap,
    getEmbed_Karma,
    getEmbed_Money,
    getEmbed_Bonus,
    getEmbed_BiasList,
    getEmbed_CatImage,
    getEmbed_DogImage,
    getEmbed_Proposal,
    getEmbed_ClanInfo,
    getEmbed_ClanSet,
    getEmbed_ClanCreate,
    getEmbed_ClanDelete,
    getEmbed_ClanTimeout,
    getEmbed_ClanCancel,
    getEmbed_ClanDescription,
    getEmbed_ClanAvatar,
    getEmbed_ClanColor,
    getEmbed_Save,
    getEmbed_ClanRename,
    getEmbed_ClanTransfer,
    getEmbed_ClanMoney,
    getEmbed_ClanJoin,
    getEmbed_ClanLeave,
    getEmbed_ClanPromote,
    getEmbed_ClanInvite,
    getEmbed_ClanList,
    getEmbed_FFARole,
    getEmbed_TeamersRole,
    getEmbed_TableTopRole,
}
