const { clanCreateCost,
        clanNameLength,
        clanRenameCost,
        descriptionLength,
        urlLength,
        clanChangeColorCost, } = require('./config.js');
const { getEmbed_Error,
        getEmbed_ClanInfo,
        getEmbed_ClanSet,
        getEmbed_ClanCreate,
        getEmbed_ClanDelete,
        getEmbed_ClanTimeout,
        getEmbed_ClanCancel,
        getEmbed_ClanDescription,
        getEmbed_ClanAvatar,
        getEmbed_ClanColor,
        getEmbed_ClanRename,
        getEmbed_ClanMoney,
        getEmbed_ClanTransfer,
        getEmbed_ClanJoin,
        getEmbed_ClanLeave,
        getEmbed_ClanPromote,
        getEmbed_ClanInvite,
        getEmbed_ClanList, } = require('./embedMessages.js');
const { String,
        parseHexColor,
        parseInteger,
        rgbToHex,
        trueFilter } = require('./functions.js');
const { setUserdata,
        clanCreate,
	    clanDelete,
	    getClanData,
        setClanData,
        clanCheckClanName,
        clearAllUserdataClan,
        getUserdata,
        getAllUserdataClan,
        getAllClans } = require('./database.js');
const { hasPermissionLevel } = require('./roleManager.js');

async function clanManager(robot, message, args){
    let clanID = "", clanRating = 0, clanModerators = [];
    author = message.author;
    userID = author.id;
    clanData = undefined;
    const filterConfirm = (reaction, user) => { return ((userID == user.id) && (reactionList.includes(reaction.emoji.toString()))); };
    const reactionList = ["<:Yes:808418109710794843>", "<:No:808418109319938099>"];
    handler = args.shift();
    let currentDate = new Date();
    if(handler == undefined)
        handler = "";
    switch(handler){
        case "stats":
        case "info":
        case "":
            clanID = args.shift();
            if(!clanID){
                userdata = await getUserdata(message.author.id);
                clanID = userdata.clanid;
            } else
                clanID = clanID.slice(3, -1);
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            clanData = await getClanData(clanID);
            if(!clanData) return await message.channel.send(getEmbed_Error("Такого клана не существует!"));
            clanMembers = await getAllUserdataClan(clanID);
            clanRating = 0;
            for(member of clanMembers){
                clanRating += (member.rating - 1000);
                if(member.clanStatus == 1)
                    clanModerators.push(member.userid);
            }
            await message.channel.send(getEmbed_ClanInfo(message.author, clanID, clanRating, clanData.money, clanData.leaderid, clanModerators, clanMembers.length, clanData.avatarURL, clanData.description, clanData.color));
            break;
        case "list":
            clans = await getAllClans();
            clansData = [], clansCount = [], clansRating = [];
            for(clanIter of clans){
                clansData.push(clanIter.dataValues);
                clanMembers = await getAllUserdataClan(clanIter.clanid);
                clanRating = 0;
                for(member of clanMembers)
                    clanRating += (member.rating - 1000);
                clansCount.push(clanMembers.length);
                clansRating.push(clanRating);
            }
            await message.channel.send(getEmbed_ClanList(author, clansData, clansCount, clansRating));
            break;
        case "create":
            userdata = await getUserdata(userID);
            if(userdata.clanid) return await message.channel.send(getEmbed_Error("Нельзя создать клан, когда вы уже состоите в клане!"));
            if(userdata.money < clanCreateCost) return await message.channel.send(getEmbed_Error("У вас недостаточно средств!\nНеобходимо {0} 🪙 монет для создания клана.".format(clanCreateCost)));
            if(message.mentions.members.size + message.mentions.roles.size + message.mentions.channels.size) return await message.channel.send(getEmbed_Error("Вы не можете использовать упоминание игрока, роли или канала в качестве названия клана!"));
            clanName = message.content.slice(13).trim();
            if(clanName.length == 0) return await message.channel.send(getEmbed_Error("Введите название для клана."));
            if(await clanCheckClanName(clanName)) return await message.channel.send(getEmbed_Error("Клан с таким названием уже есть!"));
            if(clanName.length > clanNameLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина названия клана.\nМаксимальная длина: 64."));
            confirmMessage = await message.channel.send(getEmbed_ClanSet(clanName));
            collectorCreate = await confirmMessage.createReactionCollector(trueFilter, {time: 32000}); // +2 секунды на 2 эмодзи
            collectorCreate.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user))
                    collectorCreate.stop();
                else{
                    if(!user.bot)
                        await confirmMessage.reactions.resolve(reaction).users.remove(user);
                }
            });
            collectorCreate.on('end', async (collected, reason) => {
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanTimeout(message.author))
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined) return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    newClanRole = await message.guild.roles.create({
                        data: { 
                            name: "🛡️ " + clanName,
                            color: '#5395d7', 
                            position: 20,
                            mentionable: true, 
                        }
                    });
                    newClanChannel = await message.guild.channels.create('🏰╏клан╏' + clanName, {
                        type: 'text',
                        topic: 'Канал клана «' + clanName + '»',
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                deny: ['VIEW_CHANNEL'],
                            },
                            {
                                id: newClanRole.id,
                                allow: ['VIEW_CHANNEL'],
                            }
                        ],
                        parent: '820811272726642699',
                    });
                    clanID = newClanRole.id;
                    clanChannelID = newClanChannel.id;
                    userdata.money -= clanCreateCost;
                    userdata.clanid = clanID;
                    userdata.clanStatus = 2;
                    await setUserdata(userdata);
                    await clanCreate(userID, clanID, clanName, clanChannelID);
                    await message.member.roles.add(newClanRole);
                    await message.channel.send(getEmbed_ClanCreate(clanID, clanCreateCost, message.author));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanCancel(message.author));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "delete":
            userdata = await getUserdata(userID);
            let administrationFlag = false;
            if(hasPermissionLevel(message.member, 3) && (message.mentions.roles.size != 0)){
                clanRole = message.mentions.roles.first();
                if(!clanRole) return await message.channel.send(getEmbed_Error("Введите клан для его удаления."));
                clanID = clanRole.id;
                clanData = await getClanData(clanID);
                if(!clanData) return await message.channel.send(getEmbed_Error("Введите клан для его удаления."));
                administrationFlag = true;
            } else {
                if(!userdata.clanid) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
                clanID = userdata.clanid;
                if(userdata.clanStatus != 2) return await message.channel.send(getEmbed_Error("Вы должны быть владельцем клана, чтобы удалить его!"));
            }
            clanData = await getClanData(clanID);
            clanColor = clanData.color;
            confirmMessage = await message.channel.send(getEmbed_ClanSet(clanID, true, clanColor));
            collectorDelete = await confirmMessage.createReactionCollector(trueFilter, {time: 32000}); // +2 секунды на 2 эмодзи
            collectorDelete.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user))
                    collectorDelete.stop();
                else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
            });
            collectorDelete.on('end', async (collected, reason) => {
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanTimeout(message.author, true, clanColor));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined) return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    clanRole = await message.guild.roles.cache.get(clanData.clanid);
                    await clearAllUserdataClan(clanID);
                    await clanDelete(clanID);
                    await clanRole.delete();
                    await message.channel.send(getEmbed_ClanDelete(clanData.name, author, clanColor, administrationFlag));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanCancel(message.author, true, clanColor));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "pay":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            value = parseInteger(args.shift());
            if((value == undefined)||(isNaN(value))) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            if(value <= 0) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            if(userdata.money < value) return await message.channel.send(getEmbed_Error("У вас недостаточно средств!"));
            clanData = await getClanData(clanID);
            clanData.money += value;
            userdata.money -= value;
            await setClanData(clanData);
            await setUserdata(userdata);
            await message.channel.send(getEmbed_ClanMoney(author, clanID, clanData.money-value, clanData.money, clanData.color));
            break;
        case "withdraw":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Вы должны быть лидером или модератором клана, чтобы брать деньги из казны!"));
            value = parseInteger(args.shift());
            if((value == undefined)||(isNaN(value))) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            if(value <= 0) return await message.channel.send(getEmbed_Error("Введите целое значение больше 0 для передачи денег."));
            clanData = await getClanData(clanID);
            if(clanData.money < value) return await message.channel.send(getEmbed_Error("В казне клана недостаточно средств!"));
            clanData.money -= value;
            userdata.money += value;
            await setClanData(clanData);
            await setUserdata(userdata);
            await message.channel.send(getEmbed_ClanMoney(author, clanID, clanData.money+value, clanData.money, clanData.color));
            break;
        case "desc":
        case "description":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Вы должны быть лидером или модератором клана, чтобы изменить его описание!"));
            descriptionString = (handler == "desc") ? message.content.slice(11) : message.content.slice(18);
            if(descriptionString.length > descriptionLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина описания клана.\nМаксимальная длина: 128."));
            if(descriptionString.length == 0) descriptionString = null;
            clanData = await getClanData(clanID);
            clanData.description = descriptionString;
            await setClanData(clanData);
            await message.channel.send(getEmbed_ClanDescription(author, descriptionString, clanData.color));
            break;
        case "avatar":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Вы должны быть лидером или модератором клана, чтобы изменить его изображение!"));
            clanURL = "";
            attachmentObject = await message.attachments.first();
            if(attachmentObject != undefined)
                clanURL = attachmentObject.url;
            else{
                embedAttachment = message.embeds[0];
                if(embedAttachment != undefined)
                    clanURL = embedAttachment.url;
            }
            checkExistURL = args.shift();
            if((clanURL == "")&&(checkExistURL != undefined)) return await message.channel.send(getEmbed_Error("Прикрепите к сообщению изображение или ссылку на него.\nЕсли вы прикрепляете ссылку на GIF-изображение, необходимо, чтобы ссылка заканчивалась на *.gif*."));
            if(clanURL.length > urlLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина ссылки вложения.\nМаксимальная длина: 192."));
            if(clanURL == "")
                clanURL = null;
            clanData = await getClanData(clanID);
            clanData.avatarURL = clanURL;
            await setClanData(clanData);
            await message.channel.send(getEmbed_ClanAvatar(author, clanURL, clanData.color));
            break;
        case "color":
        case "colour":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Вы должны быть лидером или модератором клана, чтобы изменить его цвет!"));
            clanData = await getClanData(clanID);
            if(clanData.money < clanChangeColorCost) return await message.channel.send(getEmbed_Error("В казне клана недостаточно средств!\nНеобходимо {0} 🪙 монет для изменения цвета клана.".format(clanChangeColorCost)));
            colorString = args.shift();
            if(parseHexColor(colorString) != undefined)
                colorString = colorString.toLowerCase();
            else if(colorString == undefined)
                colorString = "#74a5d6";
            else if(!isNaN(parseInteger(colorString))){
                color_R = parseInteger(colorString);
                color_G = parseInteger(args.shift());
                color_B = parseInteger(args.shift());
                if((color_G != undefined)&&(color_B != undefined)&&(!isNaN(color_G)&&(!isNaN(color_B)))){
                    if((color_R < 0) || (color_R > 255) ||
                    (color_G < 0) || (color_G > 255) ||
                    (color_B < 0) || (color_B > 255)){
                        return await message.channel.send(getEmbed_Error("Значения чисел у цветов должны быть в диапазоне от 0 до 255 включительно."));
                    } else {
                        colorString = rgbToHex([color_R, color_G, color_B]);
                    }
                } else {
                    return await message.channel.send(getEmbed_Error("Значения чисел у цветов должны быть в диапазоне от 0 до 255 включительно."));
                }
            } else {
                colorString = colorString.toLowerCase();
                switch(colorString){
                    case "красный":
                    case "red":
                        colorString = "#FF0000";
                        break;
                    case "оранжевый":
                    case "orange":
                        colorString = "#FF8B00";
                        break;
                    case "жёлтый":
                    case "желтый":
                    case "yellow":
                        colorString = "#FFFF00";
                        break;
                    case "зелёный":
                    case "зеленый":
                    case "green":
                        colorString = "#00FF00";
                        break;
                    case "голубой":
                    case "cyan":
                        colorString = "#00EAFF";
                        break;
                    case "синий":
                    case "blue":
                        colorString = "#0000FF";
                        break;  
                    case "фиолетовый":
                    case "purple":
                        colorString = "#BB00FF";
                        break;
                    case "чёрный":
                    case "черный":
                    case "black":
                        colorString = "#000000";
                        break;
                    case "white":
                    case "белый":
                        colorString = "#FFFFFF";
                        break;
                    case "серый":
                    case "gray":
                    case "grey":
                        colorString = "#888888";
                        break;
                    case "коричневый":
                    case "brown":
                        colorString = "#8A4124";
                        break;
                    case "розовый":
                    case "pink":
                        colorString = "#FFC0CB";
                        break;
                    default:
                        return await message.channel.send(getEmbed_Error("Введите цвет в виде #ABC012 (HEX), трех чисел через пробел (RGB), или слово, соответствующее цвету (на русском или английском языке)!"));
                }
            }
            confirmMessage = await message.channel.send(getEmbed_ClanColor(author, colorString, 0));
            collector = await confirmMessage.createReactionCollector(trueFilter, {time: 32000}); // +2 секунды на 2 эмодзи
            collector.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user))
                    collector.stop();
                else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
                
            });
            collector.on('end', async (collected, reason) => {
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanRename(author, clanName, newClanName, clanData.color, -2));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined)
                    return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    clanData.color = colorString;
                    clanData.money -= clanChangeColorCost;
                    await setClanData(clanData);
                    await message.guild.roles.cache.get(clanID).edit({color: colorString});
                    await message.channel.send(getEmbed_ClanColor(author, colorString, 1));
                    await confirmMessage.delete();
                } else {
                    colorString = clanData.color;
                    await message.channel.send(getEmbed_ClanColor(author, colorString, -1));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "name":
        case "rename":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus != 2) return await message.channel.send(getEmbed_Error("Вы должны быть лидером клана, чтобы изменить его название!"));
            clanData = await getClanData(clanID);
            if(clanData.money < clanRenameCost) return await message.channel.send(getEmbed_Error("В казне клана недостаточно средств!\nНеобходимо {0} 🪙 монет для переименования клана.".format(clanRenameCost)));
            clanID = userdata.clanid;
            newClanName = (handler == "rename") ? message.content.slice(13).trim() : message.content.slice(11).trim();
            if(newClanName.length == 0) return await message.channel.send(getEmbed_Error("Введите название для клана."));
            checkClanName = await clanCheckClanName(newClanName);
            if(checkClanName.length != 0) return await message.channel.send(getEmbed_Error("Клан с таким названием уже есть!"));
            if(newClanName.length > clanNameLength) return await message.channel.send(getEmbed_Error("Превышена максимальная длина названия клана.\nМаксимальная длина: 64."));
            if(message.mentions.members.size + message.mentions.roles.size + message.mentions.channels.size) return await message.channel.send(getEmbed_Error("Вы не можете использовать упоминание игрока, роли или канала в качестве названия клана!"));
            clanName = clanData.name;
            confirmMessage = await message.channel.send(getEmbed_ClanRename(author, clanName, newClanName, clanData.color, 0));
            collector = await confirmMessage.createReactionCollector(trueFilter, {time: 32000}); // +2 секунды на 2 эмодзи
            collector.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user))
                    collector.stop();
                else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
                
            });
            collector.on('end', async (collected, reason) => {
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanRename(author, clanName, newClanName, clanData.color, -2));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined)
                    return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    clanData.name = newClanName;
                    clanData.money -= clanRenameCost;
                    await setClanData(clanData);
                    clanChannel = await message.guild.channels.cache.get(clanData.textchannelid);
                    await clanChannel.setName('🏰╏клан╏' + newClanName);
                    await clanChannel.setTopic('Канал клана «' + newClanName + '»');
                    clanRole = await message.guild.roles.cache.get(clanID);
                    await clanRole.edit({name: "🛡️ "+newClanName});
                    await message.channel.send(getEmbed_ClanRename(author, clanName, newClanName, clanData.color, 1));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanRename(author, clanName, newClanName, clanData.color, -1));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "join":
            userdata = await getUserdata(userID);
            if(userdata.clanid) return await message.channel.send(getEmbed_Error("Нельзя вступить в клан, когда вы уже состоите в клане!"));
            clanRole = message.mentions.roles.first();
            if(!clanRole) return await message.channel.send(getEmbed_Error("Введите название клана, в который вы хотите вступить."));
            clanID = clanRole.id;
            if((currentDate - userdata.clanJoinCooldown)/1000 < 125) return await message.channel.send(getEmbed_Error("Эту команду можно использовать раз в 2 минуты!"));
            userdata.clanJoinCooldown = currentDate;
            await setUserdata(userdata);
            clanData = await getClanData(clanID);
            confirmMessage = await message.channel.send(getEmbed_ClanJoin(author, clanID, clanData.color, 0));
            clanMembers = await getAllUserdataClan(clanID);
            clanRating = 0;
            for(member of clanMembers)
                if(member.clanStatus > 0)
                    clanModerators.push(member.userid);
            const filterUserConfirm = (reaction, user) => { return ((clanModerators.includes(user.id)) && (reactionList.includes(reaction.emoji.toString()))); };
            let moderatorActed = undefined;
            collector = await confirmMessage.createReactionCollector(trueFilter, {time: 122000}); // +2 секунды на 2 эмодзи
            collector.on('collect', async (reaction, user) => {
                if(filterUserConfirm(reaction, user)){
                    moderatorActed = user;
                    collector.stop();
                }else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
            });
            collector.on('end', async (collected, reason) => {
                userdata.clanJoinCooldown = null;
                await setUserdata(userdata);
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanJoin(author, clanID, clanData.color, -2));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined)
                    return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    clanRole = await message.guild.roles.cache.get(clanID);
                    await message.member.roles.add(clanRole);
                    userdata.clanid = clanID;
                    userdata.clanStatus = 0;
                    await setUserdata(userdata);
                    await message.channel.send(getEmbed_ClanJoin(author, clanID, clanData.color, 1, moderatorActed));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanJoin(author, clanID, clanData.color, -1, moderatorActed));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "invite":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!\nЧтобы отправить просьбу на вступление в клан, используйте: !clan join"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Приглашать в клан могут только лидер и модераторы клана!"));
            userInvite = await message.mentions.members.first();
            if(!userInvite) return await message.channel.send(getEmbed_Error("Укажите пользователя для приглашения в клан."));
            userInviteID = userInvite.id;
            if(userInviteID == userID)  return await message.channel.send(getEmbed_Error("Нельзя пригласить в клан самого себя!"));
            userInviteData = await getUserdata(userInviteID);
            if(userInviteData.clanid) return await message.channel.send(getEmbed_Error("Игрок уже состоит в другом клане!"));
            if((currentDate - userdata.clanInviteCooldown)/1000 < 125) return await message.channel.send(getEmbed_Error("Эту команду можно использовать раз в 2 минуты!"));
            userdata.clanInviteCooldown = currentDate;
            await setUserdata(userdata);
            clanData = await getClanData(clanID);
            clanColor = clanData.color;
            const filterInviteConfirm = (reaction, user) => { return ((userInviteID == user.id) && (reactionList.includes(reaction.emoji.toString()))); };
            confirmMessage = await message.channel.send(getEmbed_ClanInvite(author, userInviteID, clanID, clanColor, 0));
            collector = await confirmMessage.createReactionCollector(trueFilter, {time: 122000}); // +2 секунды на 2 эмодзи
            collector.on('collect', async (reaction, user) => {
                if(filterInviteConfirm(reaction, user))
                    collector.stop();
                else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
            });
            collector.on('end', async (collected, reason) => {
                userdata.clanInviteCooldown = null;
                await setUserdata(userdata);
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanInvite(author, userInviteID, clanID, clanColor, -2));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined)
                    return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    userInviteData.clanid = clanID;
                    await setUserdata(userInviteData);
                    clanRole = await message.guild.roles.cache.get(clanID);
                    await userInvite.roles.add(clanRole);
                    await message.channel.send(getEmbed_ClanInvite(author, userInviteID, clanID, clanColor, 1));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanInvite(author, userInviteID, clanID, clanColor, -1));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "kick":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 0) return await message.channel.send(getEmbed_Error("Кикать игроков из клана могут лидер и модераторы клана!"));
            userKick = message.mentions.members.first();
            if(!userKick) return message.channel.send(getEmbed_Error("Укажите пользователя для кика из клана."));
            userKickID = userKick.id;
            if(userKickID == userID) return message.channel.send(getEmbed_Error("Нельзя кикнуть самого себя!\nЕсли вы хотите покинуть клан, используйте: !clan leave"));
            userKickData = await getUserdata(userKickID);
            if(userKickData.clanid != clanID) return message.channel.send(getEmbed_Error("Игрок должен состоять в клане, чтобы его кикнуть!"));
            if(userKickData.clanStatus != 0) return message.channel.send(getEmbed_Error("Игрок должен быть понижен, чтобы его кикнуть!"));
            clanData = await getClanData(clanID);
            clanRole = await message.guild.roles.cache.get(clanID);
            userKickData.clanid = null;
            userKickData.clanStatus = 0;
            await setUserdata(userKickData);
            await userKick.roles.remove(clanRole);
            await message.channel.send(getEmbed_ClanLeave(author, userKickID, clanID, clanData.color));
            break;
        case "leave":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid;
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus == 2) return await message.channel.send(getEmbed_Error("Владелец клана не может покинуть клан!\nУдалите клан или передайте другому игроку, чтобы покинуть его."));
            clanData = await getClanData(clanID);
            userdata.clanid = null;
            userdata.clanStatus = 0;
            await setUserdata(userdata);
            clanRole = await message.guild.roles.cache.get(clanID);
            await message.member.roles.remove(clanRole);
            await message.channel.send(getEmbed_ClanLeave(author, userID, clanID, clanData.color));
            break;
        case "transfer":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus != 2) return await message.channel.send(getEmbed_Error("Вы должны быть лидером клана, чтобы передать его!"));
            userTransfer = message.mentions.users.first();
            if(!userTransfer) return message.channel.send(getEmbed_Error("Укажите пользователя для передачи клана."));
            userTransferID = userTransfer.id;
            if(userID == userTransferID) return message.channel.send(getEmbed_Error("Нельзя передать клан самому себе!"));
            userTransferData = await getUserdata(userTransferID);
            if(userTransferData.clanid != clanID) return message.channel.send(getEmbed_Error("Игрок должен состоять в клане для передачи клана!"));
            clanData = await getClanData(clanID);
            confirmMessage = await message.channel.send(getEmbed_ClanTransfer(author, clanID, userTransferID, clanData.color, 0));
            collector = await confirmMessage.createReactionCollector(trueFilter, {time: 32000}); // +2 секунды на 2 эмодзи
            collector.on('collect', async (reaction, user) => {
                if(filterConfirm(reaction, user))
                    collector.stop();
                else if(!user.bot)
                    await confirmMessage.reactions.resolve(reaction).users.remove(user);
            });
            collector.on('end', async (collected, reason) => {
                if(reason.toLowerCase() == 'time'){
                    await message.channel.send(getEmbed_ClanTransfer(author, clanID, userTransferID, clanData.color, -2));
                    await confirmMessage.delete();
                    return;
                }
                emojies = collected.array();
                if(emojies[0] == undefined)
                    return await confirmMessage.delete();
                emojiName = emojies.map(function(element){ return element._emoji.toString(); });
                emojiCount = emojies.map(function(element){ return element.count; });
                emojiResult = emojiName[emojiCount.indexOf(Math.max(...emojiCount))];
                if(emojiResult == reactionList[0]){
                    clanData.leaderid = userTransferID;
                    await setClanData(clanData);
                    userdata.clanStatus = 0;
                    userTransferData.clanStatus = 2;
                    await setUserdata([userdata, userTransferData]);
                    await message.channel.send(getEmbed_ClanTransfer(author, clanID, userTransferID, clanData.color, 1));
                    await confirmMessage.delete();
                } else {
                    await message.channel.send(getEmbed_ClanTransfer(author, clanID, userTransferID, clanData.color, -1));
                    await confirmMessage.delete();
                }
            });
            for(emoji of reactionList)
                confirmMessage.react(emoji);
            break;
        case "promote":
        case "demote":
            userdata = await getUserdata(userID);
            clanID = userdata.clanid
            if(!clanID) return await message.channel.send(getEmbed_Error("Вы не состоите в клане!"));
            if(userdata.clanStatus != 2) return await message.channel.send(getEmbed_Error("Вы должны быть лидером клана, чтобы назначать модераторов клана!"));
            changeUser = message.mentions.users.first();
            if(!changeUser) return await message.channel.send(getEmbed_Error("Укажите пользователя для повышения или понижения!"));
            changeUserID = changeUser.id;
            changeUserdata = await getUserdata(changeUserID);
            if(changeUserdata.clanid != clanID) return await message.channel.send(getEmbed_Error("Пользователь должен состоять в вашем клане для повышения или понижения!"));
            if((changeUserdata.clanStatus == 0)&&(handler == "demote")) return await message.channel.send(getEmbed_Error("Нельзя понизить обычного игрока клана!"));
            if((changeUserdata.clanStatus == 1)&&(handler == "promote")) return await message.channel.send(getEmbed_Error("Нельзя повысить модератора клана!\nЕсли вы хотите сделать игрока владельцем клана, используйте команду: !clan transfer"));
            changeUserdata.clanStatus = (handler == "promote") ? 1 : 0;
            await setUserdata(changeUserdata);
            clanData = await getClanData(clanID);
            await message.channel.send(getEmbed_ClanPromote(author, changeUserID, clanID, clanData.color, (handler == "promote") ? 1 : 0));
            break;
        default:
            message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nstats, info, join, invite, leave,\ncreate, delete, transfer, promote, demote,\npay, withdraw."));
            break;
    }
}

module.exports = { clanManager }
