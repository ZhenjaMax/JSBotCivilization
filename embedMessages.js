const Discord = require('discord.js');
const { String,
        getDateRus, 
        getRandomHexBrightString,
        randomInteger} = require('./functions.js');
const { bot,
        roleRanksValue,
        clanCreateCost, 
        clanRenameCost,
        clanChangeColorCost,
        numbersEmoji,
        weakPointsTotal, } = require('./config.js');

const thumbnailsURL = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Antu_flag-red.svg/768px-Antu_flag-red.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Antu_flag-blue.svg/768px-Antu_flag-blue.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Antu_flag-green.svg/768px-Antu_flag-green.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Antu_flag-yellow.svg/768px-Antu_flag-yellow.svg.png",
    "https://media.discordapp.net/attachments/698295115063492758/837417222732644372/768px-Antu_flag-purple.svg.png?width=599&height=599",
    "https://cdn.discordapp.com/attachments/698295115063492758/838985443642310666/768px-Antu_flag-grey.svg.png",
];

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
        .setDescription(`Добро пожаловать на сервер, **{0}**!
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
        .setTitle("👥 Профиль игрока {0}".format(user.tag))
        .addFields(
            { name: '🪙 Деньги:', value: userData.money, inline: true },
            { name: '🎩 Лайки/Дизлайки', value: `👍 ${userData.likes} / ${userData.dislikes} 👎`, inline: true },
            { name: '💧 Карма:', value: userData.karma == 100 ? userData.karma + "  👼" : (userData.karma == 0 ? userData.karma + "  😈" : userData.karma), inline: true },
            { name: '📈 Рейтинг:', value: "Общий: {0}\nFFA: {1}\nTeamers: {2}".format(userData.rating, userData.ratingffa, userData.ratingteam), inline: true },
            { name: '🔎 Статистика игр:', value: 
            `**FFA:** ${userData.winsFFA + userData.defeatsFFA}
            **Teamers:** ${userData.winsTeamers + userData.defeatsTeamers}`, inline: true },
            { name: '🏰 Клан:', value: clanString, inline: true },
            { name: '🔨 Наказание:', value: banString, inline: true },
            { name: '🐌 Очки слабости:', value: "{0}/{1}".format(userData.weakPoints, weakPointsTotal), inline: true },
            { name: '📝 Описание:', value: (userData.description != null) ? userData.description : "нет", inline: true },
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
        let index = 0;
        for(index; index < roleRanksValue.length; index++)
            if(userData.rating < roleRanksValue[index])
                break;
        embedMsg.setColor(colorList[index]);
        if(userData.avatarURL)
            embedMsg.setImage(userData.avatarURL);
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

function getEmbed_RatingSingleChange(playerStats, author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter("Администратор " + author.tag, author.avatarURL())
        .setTitle("📈 Изменение рейтинга")
        .addFields(
            { name: 'Никнейм:', value: "**{0}**".format(playerStats.userinstance.tag), inline: true },
            { name: 'Рейтинг:', value: "**{0}** {1} ({2})\n".format(
                playerStats.drating <= 0 ? playerStats.drating : "+"+playerStats.drating, 
                playerStats.drating < 0 ? "📉" : "📈", 
                playerStats.rating+playerStats.drating), inline: true },
        );
    return embedMsg;
}

function getEmbed_RatingChange(playerStatsArray, subPlayerStatsArray, gameType, multType, gameIndex, author){
    let playersString = "", ratingString = "", bonusString = "";
    let playersCount = playerStatsArray.length;
    let concatPlayerStats = playerStatsArray.concat(subPlayerStatsArray);
    let victoryTypesFFA = [gameType ? "GG" : "CC", "Научная", "Культурная", "Военная", "Религиозная", "Дипломатическая", "По очкам"];
    let victoryThumbnailsURL = [
        "https://static.wikia.nocookie.net/civilization/images/4/44/Science_Victory_%28Civ6%29.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/6/61/Icon_victory_culture.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/f/f7/Icon_victory_default.png",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/1/1c/Icon_victory_religious.png",
        "https://static.wikia.nocookie.net/civilization/images/1/1e/Diplomatic_Victory_%28Civ6%29.png/revision/latest/scale-to-width-down/220?cb=20200430082219",
        "https://static.wikia.nocookie.net/civ6_gamepedia_en/images/2/27/Icon_victory_score.png"
    ]
    let placeStringArray = [];
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter("Администратор " + author.tag, author.avatarURL())
        .setTitle("📈 Изменение рейтинга")
        .addFields(
        { name: 'Тип игры:', value: "{0}".format(gameType ? "Teamers" : "FFA"), inline: true },
        { name: 'Тип победы:', value: "{0}".format(victoryTypesFFA[multType]), inline: true },
        { name: 'ID игры:', value: "__**#{0}**__".format(gameIndex), inline: true},
    );
    if(multType != 0)
        embedMsg.setThumbnail(victoryThumbnailsURL[multType-1]);
    if(gameType == 0){                  // FFA
        for(i in concatPlayerStats)
            placeStringArray.push("");
        for(let i = 0; i < playersCount; i++){
            let tieLength = concatPlayerStats[i].tieIndex.length;
            if(tieLength != 0){
                for(let j = 0; j <= tieLength; j++)
                    placeStringArray[i+j] = numbersEmoji[Number(1+i)] + " ... " + numbersEmoji[Number(1+i+tieLength)];
                i += tieLength;
            } else 
                placeStringArray[i] = numbersEmoji[Number(1+i)];
        }
        for(i in concatPlayerStats){
            playersString += "**{0} {1}**".format(placeStringArray[i], concatPlayerStats[i].userinstance.tag);
            if(concatPlayerStats[i].isLeave) 
                playersString += " 💨";
            if(concatPlayerStats[i].subID != -1)
                playersString += " 🔄";
            if(concatPlayerStats[i].tieIndex.length != 0){
                playersString += " 🤝";
            } else if(i != 0){
                if(concatPlayerStats[i-1].tieIndex.length != 0)
                    playersString += " 🤝";
            }
            playersString += "\n";
            ratingString += "**{0} {1} ({2})**\n".format(
                concatPlayerStats[i].dratingtyped < 0 ? concatPlayerStats[i].dratingtyped : "+"+concatPlayerStats[i].dratingtyped,
                concatPlayerStats[i].dratingtyped < 0 ? "📉" : "📈", 
                concatPlayerStats[i].ratingffa+concatPlayerStats[i].dratingtyped,
            );
            bonusString += "**+{0}** 🪙 |  **+{1}** 💧\n".format(
                concatPlayerStats[i].dmoney, 
                concatPlayerStats[i].dkarma
            );
            if(i == playersCount-1){
                playersString += "\n";
                ratingString += "\n";
                bonusString += "\n";
            }
        }
    } else {
        let teamLength = playersCount / gameType;
        for(i in concatPlayerStats)
            placeStringArray.push("");
        for(let i = 0; i < gameType; i++){
            let tieLength = concatPlayerStats[i*teamLength].tieIndex.length / teamLength;
            if(tieLength != 0){
                for(let j = 0; j < (tieLength+1)*teamLength; j++)
                    placeStringArray[i*teamLength+j] = numbersEmoji[Number(1+i)] + " ... " + numbersEmoji[Number(1+i+tieLength)];
                i += tieLength;
            } else {
                for(let j = 0; j < teamLength; j++)
                    placeStringArray[i*teamLength+j] = numbersEmoji[Number(1+i)];
            }
        }
        for(i in concatPlayerStats){
            playersString += "**{0} {1}**".format(placeStringArray[i], concatPlayerStats[i].userinstance.tag);
            if(concatPlayerStats[i].isLeave) 
                playersString += " 💨";
            if(concatPlayerStats[i].subID != -1)
                playersString += " 🔄";
            if(concatPlayerStats[i].tieIndex.length != 0){
                playersString += " 🤝";
            } else if(i-teamLength >= 0){
                if(concatPlayerStats[i-teamLength].tieIndex.length != 0)
                    playersString += " 🤝";
            }
            playersString += "\n";
            ratingString += "**{0} {1} ({2})**\n".format(
                concatPlayerStats[i].dratingtyped < 0 ? concatPlayerStats[i].dratingtyped : "+"+concatPlayerStats[i].dratingtyped,
                concatPlayerStats[i].dratingtyped < 0 ? "📉" : "📈", 
                concatPlayerStats[i].ratingteam+concatPlayerStats[i].dratingtyped,
            );
            bonusString += "**+{0}** 🪙 |  **+{1}** 💧\n".format(
                concatPlayerStats[i].dmoney, 
                concatPlayerStats[i].dkarma
            );
            if((i < playersCount)&&((Number(i)+1)%teamLength == 0)){
                playersString += "\n";
                ratingString += "\n";
                bonusString += "\n";
            }
        }
    }
    embedMsg.addFields(
        { name: 'Никнейм:', value: playersString, inline: true },
        { name: 'Рейтинг:', value: ratingString, inline: true },
        { name: 'Бонус:', value: bonusString, inline: true },
    );
    return embedMsg;
}

function getEmbed_RatingChangeProposal(playerStatsArray, subPlayerStatsArray, gameType, multType, gameIndex, author, imageURL = null){
    const embedMsg = getEmbed_RatingChange(playerStatsArray, subPlayerStatsArray, gameType, multType, gameIndex, author);
    embedMsg
        .setFooter("Игрок " + author.tag, author.avatarURL())
        .addFields(
            { name: 'Возможные действия для игроков:', 
            value: "<:Yes:808418109710794843> Подтвердить рейтинг.\n<:No:808418109319938099> Оспорить рейтинг." },
            { name: 'Возможные действия для администрации:', 
            value: "🔨 Начислить рейтинг.\n🗑️ Удалить сообщение." });
    if(imageURL)
        embedMsg.setImage(imageURL);
    return embedMsg;
}

function getEmbed_RatingChangeCancel(playerStatsArray, gameType, gameIndex, author){
    let playersString = "", ratingString = "", bonusString = "";
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter("Администратор " + author.tag, author.avatarURL())
        .setTitle("📉 Отмена рейтинга")
        .addFields(
        { name: 'Тип игры:', value: "{0}".format(gameType ? "Teamers" : "FFA"), inline: true },
        { name: 'ID игры:', value: "__**#{0}**__".format(gameIndex), inline: true},
        { name: 'Весь рейтинг будет возвращён.', value: "**Все полученные бонусы аннулируются.**", inline: true},
    );
    for(i in playerStatsArray){
        playersString += "**{0}**\n".format(playerStatsArray[i].userinstance.tag);
        ratingString += "**{0} {1} ({2})**\n".format(
            -playerStatsArray[i].dratingtyped < 0 ? -playerStatsArray[i].dratingtyped : "+"+(-playerStatsArray[i].dratingtyped),
            -playerStatsArray[i].dratingtyped < 0 ? "📉" : "📈", 
            gameType ? playerStatsArray[i].ratingteam-playerStatsArray[i].dratingtyped : playerStatsArray[i].ratingffa-playerStatsArray[i].dratingtyped,
        );
        bonusString += "**{0}** 🪙 |  **{1}** 💧\n".format(
            -playerStatsArray[i].dmoney, 
            -playerStatsArray[i].dkarma
        );
    }
    embedMsg.addFields(
        { name: 'Никнейм:', value: playersString, inline: true },
        { name: 'Рейтинг:', value: ratingString, inline: true },
        { name: 'Возврат:', value: bonusString, inline: true },
    );
    return embedMsg;
}

function getEmbed_RatingProposal(author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setTitle("📈 Изменение рейтинга")
        .setDescription("**Ваш отчет был добавлен в канал** <#863810318785708092>**.**");
    return embedMsg;
}

function getEmbed_RatingProposalConfirmed(author){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#00FFF0')
        .setFooter("Администратор " + author.tag, author.avatarURL())
        .setTimestamp()
        .setTitle("📈 Изменение рейтинга")
        .setDescription("**Рейтинг был успешно начислен.**");
    return embedMsg;
}

function getEmbed_Weak(author, user, amount){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#a84300")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .addField("🐌 {0} получает очки слабости!".format(user.tag),
                  "{0}Всего {1}/{2}.".format((amount == weakPointsTotal) ? "😡 " : "", amount, weakPointsTotal));
    return embedMsg;
}

function getEmbed_LikeOrDislike(author, user, amount, likeIndicator){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF4FFF')
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .addField("{0} для {1}!".format(likeIndicator ? "👍 Лайк" : "👎 Дизлайк", user.tag),
                  "Всего {0}: {1}.".format(likeIndicator ? "лайков" : "дизлайков", amount));
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
            • потеряно хотя бы 2/3 городов;
            • вас признали *иррелевантным*;
            • вас заменил другой игрок.
        
        🤖  2. Не используйте баги и ошибки игры; не принимайте сделки и договоры от игровых ботов.
        
        🥰  3. Будьте доброжелательны, не будьте токсичными в общении с другими игроками.
        
        📌 **Последнее обновление правил: 23.05.2021 г.**`)
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
        .setDescription(`Иррелеватность - признание игрока неспособным влиять на игровой процесс с последующей возможностью покинуть игру без штрафов. Иррелеватный игрок считается погибшим при подсчёте рейтинга. Голосование за иррелевантность может проводится **не чаще, чем раз в 5 ходов** в отношении одного игрока. Голосование может быть инициировано только целью голосования, но в любой момент игры.

        **На это голосование нельзя наложить вето.**

        Для успешной иррелевантности необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-29 ход – единогласно.
        • 30-59 ход – 3/4 игроков.
        • 60+ ход – 2/3 игроков.
        • Если игрок имеет право вето: любой ход – единогласно.

        Игроку позволяется вылететь **до 2 раз за игру**. После **3 вылета** хост партии имеет право не впускать игрока в игру. В таком случае игрок вынужден найти замену, иначе он считается иррелевантным.
        `);
    return embedMsg;
}

function getEmbed_Remap(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: ремап и авторемап')
        .setDescription(`Голосование за ремап *в FFA* проводится **до 15 хода включительно**. 
        Для успешного ремапа необходимо согласие большинства игроков (50%+1 игрок).
        В случае, если предлагается провести ремап повторно, то после каждого ремапа требуется согласие на 1 игрока больше, чем требовалось в предыдущий раз.
        
        **В случае поражения одного из игроков, ремап и авторемап проводить запрещается.**

        Голосование за ремап *в Teamers* проводится **до 8 хода включительно**.
        Для успешного ремапа необходимо согласие **хотя бы** 50% команд.
        Команды могут выразить свое согласие на ремап лишь 1 раз за игру.
        
        Авторемап может произойти *в FFA* **до 15 хода включительно** и гарантирован в случаях, описанных ниже.
        • Вы не можете основать 3 новых города в радиусе 5 клеток от своего изначального местоположения (без учета других городов, кроме столиц и городов-государств) без изучения дополнительных технологий или социальных институтов **на игровых картах Пангея или Континенты**.
        • Были выставлены неправильные настройки, влияющие на игровую карту.
        `);
    return embedMsg;
}

function getEmbed_CC(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: СС')
        .setDescription(`CC – досрочное окончание FFA с определенным победителем.
        Голосование за СС может проводится **не чаще, чем раз в 5 ходов**. Голосование за СС должен инициировать игрок, не являющийся целью голосования.

        **Цель голосования не может наложить вето на это голосование.**

        Для успешного CC необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-79 ход – единогласно.
        • 80+ ход – 2/3 игроков.`);
    return embedMsg;
}

function getEmbed_Scrap(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: скрап')
        .setDescription(`Скрап – окончание игры без определенного победителя.
        Голосование за скрап может проводится **не чаще, чем раз в 5 ходов**, либо в случае, если изменилось состояние любого игрока:
        • игрок покинул игру не по правилам;
        • замена игрока.

        Для успешного скрапа необходима минимальная доля голосов, которая зависит от текущего хода в игре.
        • 1-29 ход – 2/3 игроков.
        • 30-59 ход – 3/4 игроков.
        • 60-79 ход – все, кроме 1 игрока.
        • 80+ ход – единогласно.`);
    return embedMsg;
}

function getEmbed_Tie(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: смена места и ничья')
        .setDescription(`**Смена места** – договор нескольких игроков о том, что при подсчёте рейтинга вы будете занимать место выше, чем то, которое указано во вкладке \"Всемирный Рейтинг\".
        Для смены места необходимо согласие **всех игроков, между которыми вы сменяете свою позицию**.

        Примечание: СС с определённым победителем и соответствующей сменой остальных игроков __по счёту__ не является сменой места.
        


        **Ничья** – договор нескольких игроков о том, что все они занимают одно и то же место. При подсчёте рейтинга такие игроки приобретают или теряют меньше рейтинга друг от друга.

        • **Фактическая ничья**: к концу игры несколько цивилизаций равны по счёту или одновременно побеждают какой-либо победой во время смены хода.
        • **Договорная ничья**: игроки договариваются о том, что при подсчёте рейтинга они занимают одно и то же место.

        Договорная ничья возможна с теми игроками, которые занимают **соседние с вами места**.
        Для договорной ничьи вы обязаны получить согласие на это **от всех игроков, занимающих место, которое вы хотите разделить**.
        Для договорной ничьи на **первом месте** вы обязаны получить согласие от **всех оставшихся игроков**.
        `);
    return embedMsg;
}

function getEmbed_Sub(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: замена')
        .setDescription(`Замена игрока – процедура, в результате которой один из игроков выходит из игры, и на его место приходит другой игрок, который будет продолжать игру за предыдущего. 
        Новый игрок действует в полном соответствии с правилами, как если бы он полностью играл данную игру. При подсчете рейтинга считается, что заменяющий игрок победил предыдущего.
        
        Игрок может объявить о своей замене **в любой момент игры**, если имеет игрока, который будет его заменять. В данном случае исходный игрок не получит никаких наказаний за досрочный выход из игры.
        
        Игрок может заменить игрока, который покинул партию не по правилам, **в ход выхода из игры**. В таком случае исходный игрок получит наказание в обычном порядке. Игрок, который покинул данную партию, не сможет заменить в ней какого-либо игрока, кроме его заменяющего.
        
        • Для замены в *FFA* требуется отсутствие нарушений по правилу 1.3 (просмотр стрима).
        • Для замены в *Teamers* дополнительно к этому требуется **согласие всех капитанов** команд на замену.
        `);
    return embedMsg;
}

function getEmbed_Leave(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: лив')
        .setDescription(`Запрещено покидать игру до её окончания. Вы можете покинуть игру без наказания в одном из случаев ниже.

        • Вы потеряли хотя бы 2/3 своих городов.
        • Вы потеряли изначальную столицу.
        • Вас признали иррелевантным с помощью голосования (см. !irr).
        • Вас заменил другой игрок (см. !sub).

        Если игрок покинул игру не по правилам (например, по техническим причинам), то у него есть **10 минут** с момента выхода из игры, чтобы зайти в игру обратно. По истечении срока игрок признается покинувшим партию и получает за это соответствующее наказание.
        Перед продолжением игры игроки решают, продолжать игру или искать нового игрока вместо ливнувшего игрока (см. !sub).
        `);
    return embedMsg;
}

function getEmbed_Veto(){
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#FF3D3D')
        .setTitle('📌 Краткое описание правил: право вето')
        .setDescription(`Право вето – право игрока единолично признать любое голосование в FFA проваленным, если не сказано другого.
        Права вето начинают действовать с **60 хода игры**.

        ⌛ **1. Вето по очкам.**
        • Игроки, занимающие лидирующие места по очкам, имеют право вето. Для 2-7 игроков – 2 игрока; для 8-9 игроков – 3; для 10-12 игроков – 4.
        ⚗️ **2. Научное вето.**
        • Каждый игрок, который завершил проект «Запуск искусственного спутника».
        • Игрок, изучивший наибольшее число технологий.
        • Игрок, имеющий наибольшее количество науки в ход.
        🎵 **3. Культурное вето.**
        • Игрок, имеющий больше всего внешних туристов.
        • Каждый игрок, у которого 500 и более туризма в ход.
        ⚔️ **4. Военное вето.**
        • Игрок с наибольшей военной мощью.
        • Игрок с наибольшим количеством захваченных столиц. *Примечение: при настройке правил игры \"Бан военной победы – да\" данный пункт военного вето действует*.
        🗿 **5. Религиозное вето.**
        • Игрок, обративший большинство существующих цивилизаций в свою религию, **но хотя бы 1/3 от их числа**.
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

function getEmbed_ClanList(author, clansData, clansCount, clansRating){
    descriptionString = "";
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🏰 Список кланов сервера")
        .setColor("#5395d7")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(clansData.length == 0)
        embedMsg.setDescription("На сервере нет кланов! 🏰\nВы можете основать первый клан на сервере.");
    else{
        let clansNameString = "", clansLeader = "", clansStatString = "";
        for(i in clansData){
            clansNameString += "<@&{0}>\n".format(clansData[i].clanid);
            clansLeader += "<@{0}>\n".format(clansData[i].leaderid);
            clansStatString += "{0} 👥 | {1} {2} | {3} 🪙\n".format(clansCount[i], clansRating[i], (clansRating[i] >= 0) ? "📈" : "📉", clansData[i].money);
        }
        embedMsg.addFields(
            { name: '🛡️ Клан', value: clansNameString, inline: true },
            { name: '👑 Лидер', value: clansLeader, inline: true },
            { name: '🛂 Статистика', value: clansStatString, inline: true },
        );
    }
    return embedMsg;
}

function getEmbed_TagRolesManager(author, tagRoleData, giveRole){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("{0} Выдача роли {1}".format(tagRoleData.emoji, tagRoleData.name))
        .setColor(tagRoleData.color)
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription((giveRole ? "<:Yes:808418109710794843> **Вы получили роль** " : "<:No:808418109319938099> **У вас больше нет роли** ") + "<@&{0}>**.**".format(tagRoleData.id))
    return embedMsg;
}

function getEmbed_Split(pickedTeamPlayers, unpickedPlayers, commandIndex, stepNumber, splitStatus, author, playersNumber, splitType){    // status: {0 = default, 1 = first, 2 = last & ready}, type: {0 = standard, 1 = fair}
    const emojiOrder = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🇦", "🇧", "🇨", "🇩", "🇪", "🇫"];
    let commandList = ["", "", ""];
    for(i in unpickedPlayers)
        commandList[0] += ("{0} <@{1}>\n".format(emojiOrder[i], unpickedPlayers[i]))
    for(i in pickedTeamPlayers[0])
        commandList[1] += (i == 0 ? "👑 <@{0}>\n".format(pickedTeamPlayers[0][i]) : "<@{0}>\n".format(pickedTeamPlayers[0][i]));
    for(i in pickedTeamPlayers[1])
        commandList[2] += (i == 0 ? "👑 <@{0}>\n".format(pickedTeamPlayers[1][i]) : "<@{0}>\n".format(pickedTeamPlayers[1][i]));

    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🐲 Разделение на команды (шаг {0}/{1})".format(stepNumber+1, playersNumber-3))
        .setColor("#35f00f")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    switch(splitStatus){
        case 0:
        case 1:
            embedMsg
                .addFields(
                { name: 'Доступные игроки:',     value: commandList[0], inline: true },
                { name: 'Команда #1:',           value: commandList[1], inline: true },
                { name: 'Команда #2:',           value: commandList[2], inline: true },
            )
                .setDescription(splitStatus
                    ? "🍀 Фортуна решила, что первым будет выбирать <@{0}>!\nВыбирает капитан команды **#{1}**.".format(pickedTeamPlayers[commandIndex][0], commandIndex+1)
                    : "Теперь выбирает капитан команды **#{0} (<@{1}>)**.".format(commandIndex+1, pickedTeamPlayers[commandIndex][0]));
            break;
        case 2:
            embedMsg
                .setTitle("🐲 Разделение на команды ({0})".format(splitType ? "честное" : "стандартное"))
                .addFields(
                { name: 'Команда #1:',           value: commandList[1], inline: true },
                { name: 'Команда #2:',           value: commandList[2], inline: true },
            )
                .setDescription("Разделение на команды завершено!");
            break;
    }
    return embedMsg;
}

function getEmbed_ProfileDescription(author, descriptionString){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#5395d7")
        .setTitle("👥 Изменение описания профиля")
        .setDescription(descriptionString ? "**Описание профиля успешно изменено. 📝**" : "**Описание профиля успешно сброшено. 📝**")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    return embedMsg;
}

function getEmbed_NewGameResult(newGameResults, author){
    let isTeamers = (newGameResults.length < 10);
    const separatorIndex = [2, isTeamers ? 3 : 8, newGameResults.length-3];
    let resultString = "";
    for(let i in newGameResults){
        if(i == 0)
            continue;
        else if ((newGameResults[i].resultString != undefined)&&(newGameResults[i].resultString != ""))
            resultString += (newGameResults[i].resultString + "\n");
        if(isTeamers && (i == 3))
            resultString += "🌋 **Стихийные бедствия** | 2️⃣\n🏞️ **Возраст мира** | 🏔️ Новый\n🤬 **Варвары** | <:No:808418109319938099> Отключены\n"
        if(separatorIndex.includes(Number(i)))
            resultString += "\n";
    }

    const embedMsg = new Discord.MessageEmbed()
        .setTitle(newGameResults[0].resultString)
        .setColor("#36393f")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp()
        .setDescription(resultString);
    return embedMsg;
}

function getEmbed_DraftFFA(bans, errors, draftList, userBotsCount, usernames, userID, author, redraftCounter){
    const embedMsg = new Discord.MessageEmbed()
        .setColor(getRandomHexBrightString())
        .setAuthor((usernames.length == 1) ?
            "{0} для 1 игрока".format((redraftCounter) ? "Редрафт #{0}".format(redraftCounter) : "Драфт") :
            "{0} для {1} игроков".format((redraftCounter) ? "Редрафт #{0}".format(redraftCounter) : "Драфт", playerCount), bot.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(author.tag, author.avatarURL());

    let bansString = "";
    if(bans.length != 0){
        bansString = "⛔ **Список банов ({0}):**\n".format(bans.length);
        for(ban of bans)
            bansString += (ban + "\n");
        bansString += "\u200B";
    }
    if(errors.length != 0){
        bansString += "⚠️ **Список ошибок ({0}):**\n".format(errors.length);
        for(errorBan of errors)
            bansString += (errorBan + ", ");
        bansString = bansString.slice(0, -2) + "\n";
    }
    if(userBotsCount != 0)
        bansString += "🤖 **В канале {0} {1} {2}.**\nБоты были удалены из драфта."
            .format(userBotsCount == 1 ? "присутствует" : "присутствуют", 
                    userBotsCount,
                    userBotsCount == 1 ? "бот" : "бота");
    embedMsg.setDescription(bansString);

    for(let i = 0; i < playerCount; i++){
        let valueField = "**{0}** (<@{1}>)".format(usernames[i], userID[i]);
        for(let j = 0; j < draftList[i].length; j++)
            valueField += "\n{0}".format(draftList[i][j]);
        embedMsg.addField("\u200b", valueField);
    }
    return embedMsg;
}

function getEmbed_DraftTeamHeader(bans, errors, colorHex, teamCount, redraftCounter){
    let bansString = "";
    if(bans.length != 0){
        bansString = "⛔ **Список банов ({0}):**\n".format(bans.length);
        for(ban of bans)
            bansString += (ban + "\n");
    }
    if(errors.length != 0){
        bansString += "\n⚠️ **Список ошибок ({0}):**\n".format(errors.length);
        for(errorBan of errors)
            bansString += (errorBan + ", ");
        bansString = bansString.slice(0, -2);
    }
    const embedMsg = new Discord.MessageEmbed()
        .setColor(colorHex)
        .setAuthor("{0} Team для {1} команд".format((redraftCounter) ? "Редрафт #{0}".format(redraftCounter) : "Драфт", teamCount), bot.user.displayAvatarURL())
        .setDescription(bansString);
    return embedMsg;
}

function getEmbed_DraftTeamPage(pageNumber, colorHex, draftList, author){
    let valueField = "**Команда #{0}**".format(pageNumber+1);
    for(let i = 0; i < draftList.length; i++)
        valueField += "\n{0}".format(draftList[i]);
    const embedMsg = new Discord.MessageEmbed()
        .setColor(colorHex)
        .setDescription(valueField)
        .setThumbnail(thumbnailsURL[pageNumber]);
    if(author) embedMsg
        .setTimestamp()
        .setFooter(author.tag, author.avatarURL());
    return embedMsg;
}

function getEmbed_RedraftProposalFFA(playersNeedCount, playersCount, redraftCounter, author, redraftStatus = -1){
    const embedMsg = new Discord.MessageEmbed()
        .setTitle("🔄 Редрафт #{0} FFA".format(redraftCounter+1))
        .setTimestamp()
        .setFooter(author.tag, author.avatarURL())
        .setColor("#b0b0b0");
    switch(redraftStatus){
        case -1: embedMsg.setDescription("Предлагается провести редрафт.\nДля успешного редрафта необходимо **{0}/{1} голосов** <:Yes:808418109710794843> **\"за\".**\n\n⏰ **На голосование отводится 90 секунд!**".format(playersNeedCount, playersCount)); break;
        case 0:  embedMsg.setDescription("<:No:808418109319938099> **Редрафт отклонён.**"); break;
        case 1:  embedMsg.setDescription("<:Yes:808418109710794843> **Редрафт принят.**"); break;
    }
    return embedMsg;
}

function getEmbed_AvatarChange(author, avatarURL){
    const embedMsg = new Discord.MessageEmbed()
        .setColor("#5395d7")
        .setTitle("👥 Изменение изображения профиля")
        .setDescription(avatarURL ? "**Изображение профиля успешно изменено.**  🖼️" : "**Изображение профиля успешно сброшено.**  🖼️")
        .setFooter(author.tag, author.avatarURL())
        .setTimestamp();
    if(avatarURL)
        embedMsg.setImage(avatarURL);
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
    getEmbed_RatingChange,
    getEmbed_RatingChangeCancel,
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
    getEmbed_TagRolesManager,
    getEmbed_Split,
    getEmbed_ProfileDescription,
    getEmbed_NewGameResult,
    getEmbed_Tie,
    getEmbed_Sub,
    getEmbed_Leave,
    getEmbed_DraftFFA,
    getEmbed_DraftTeamHeader,
    getEmbed_DraftTeamPage,
    getEmbed_RedraftProposalFFA,
    getEmbed_AvatarChange,
    getEmbed_Weak,
    getEmbed_RatingChangeProposal,
    getEmbed_RatingProposal,
    getEmbed_RatingProposalConfirmed,
}
