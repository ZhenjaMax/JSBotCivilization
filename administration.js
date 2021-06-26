const Discord = require('discord.js');
const { getUserdata,
        setUserdata,
        getAllUserdataBanned,
        getAllUserdataMuted,
        getAllUserdataNoChat } = require('./database.js');
const { schedule,
        roleBannedID,
        roleMutedChatID,
        roleMutedVoiceID,
        chatChannelID,
        bot,
        guildID,
        bansReportsChannelID } = require('./config.js');
const { getEmbed_Ban,
        getEmbed_Unban,
        getEmbed_Mute,
        getEmbed_Unmute,
        getEmbed_Nochat,
        getEmbed_Unchat,
        getEmbed_Pardon,
        getEmbed_Error } = require('./embedMessages.js');
const { parseNumberRule,
        parseDuration,
        getTimeInSeconds } = require('./functions.js');

async function banAdm(robot, message, args){
    member = await message.mentions.members.first();
    if(!member) return message.channel.send(getEmbed_Error("Укажите пользователя для бана."));
    userdata = await getUserdata(member.id);
    if(userdata.banned) return message.channel.send(getEmbed_Error("Пользователь уже имеет бан! Чтобы снять, используйте !unban"));
    duration = parseDuration(args[1]);
    if(duration == undefined) return message.channel.send(getEmbed_Error("Укажите время бана в формате: 1s, 2m, 3h, 4d, 5y."));
    reason = parseNumberRule(args[2]);
    if(reason == undefined) return message.channel.send(getEmbed_Error("Укажите номер правила для причины бана."));
    dateUntil = new Date();
    dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
    roleBanned = await message.guild.roles.cache.get(roleBannedID);
    await member.roles.add(roleBanned);
    await message.channel.send(getEmbed_Ban(member, dateUntil, reason, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Ban(member, dateUntil, reason, message.author));
    userdata.karma = Math.max(userdata.karma - Math.floor(getTimeInSeconds(parseInt(duration[0]), duration[1]) / 3600), 0);
    userdata.banned = dateUntil;
    await setUserdata(userdata);
    await punishmentRemover();
}

async function unbanAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user) return message.channel.send(getEmbed_Error("Укажите пользователя для разбана."));
    userdata = await getUserdata(user.id);
    if(!userdata.banned) return message.channel.send(getEmbed_Error("Пользователь не имеет бана."));
    roleBanned = await message.guild.roles.cache.get(roleBannedID);
    await user.roles.remove(roleBanned);
    await message.channel.send(getEmbed_Unban(user, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unban(user, message.author));
    userdata.banned = null;
    await setUserdata(userdata);
}

async function muteAdm(robot, message, args){
    member = await message.mentions.members.first();
    if(!member) return message.channel.send(getEmbed_Error("Укажите пользователя для мута."));
    userdata = await getUserdata(member.id);
    if(userdata.mutedvoice) return message.channel.send(getEmbed_Error("Пользователь уже имеет мут! Чтобы снять, используйте !unmute"));
    duration = parseDuration(args[1]);
    if(duration == undefined) return message.channel.send(getEmbed_Error("Укажите время мута в формате: 1s, 2m, 3h, 4d, 5y."));
    reason = parseNumberRule(args[2]);
    if(reason == undefined) return message.channel.send(getEmbed_Error("Укажите номер правила для причины мута."));
    dateUntil = new Date();
    dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
    roleMuted = await message.guild.roles.cache.get(roleMutedVoiceID);
    await member.roles.add(roleMuted);
    await message.channel.send(getEmbed_Mute(member, dateUntil, reason, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Mute(member, dateUntil, reason, message.author));
    userdata.karma = Math.max(userdata.karma - Math.floor(getTimeInSeconds(parseInt(duration[0]), duration[1]) / 3600), 0);
    userdata.mutedvoice = dateUntil;
    await setUserdata(userdata);
    await punishmentRemover();
}

async function unmuteAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user) return message.channel.send(getEmbed_Error("Укажите пользователя для размута."));
    userdata = await getUserdata(user.id);
    if(!userdata.mutedvoice) return message.channel.send(getEmbed_Error("Пользователь не имеет мута."));
    roleMuted = await message.guild.roles.cache.get(roleMutedVoiceID);
    await user.roles.remove(roleMuted);
    await message.channel.send(getEmbed_Unmute(user, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unmute(user, message.author));
    userdata.mutedvoice = null;
    await setUserdata(userdata);
}

async function nochatAdm(robot, message, args){
    member = await message.mentions.members.first();
    if(!member) return message.channel.send(getEmbed_Error("Укажите пользователя для блокировки чата."));
    userdata = await getUserdata(member.id);
    if(userdata.mutedchat) return message.channel.send(getEmbed_Error("Пользователь уже имеет блокировку чата! Чтобы снять, используйте !unchat"));
    duration = parseDuration(args[1]);
    if(duration == undefined) return message.channel.send(getEmbed_Error("Укажите время бана в формате: 1s, 2m, 3h, 4d, 5y."));
    reason = parseNumberRule(args[2]);
    if(reason == undefined) return message.channel.send(getEmbed_Error("Укажите номер правила для причины блокировки чата."));
    dateUntil = new Date();
    dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
    roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
    await member.roles.add(roleMutedChat);
    await message.channel.send(getEmbed_Nochat(member, dateUntil, reason, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Nochat(member, dateUntil, reason, message.author));
    userdata.karma = Math.max(userdata.karma - Math.floor(getTimeInSeconds(parseInt(duration[0]), duration[1]) / 3600), 0);
    userdata.mutedchat = dateUntil;
    await setUserdata(userdata);
    await punishmentRemover();
}

async function unchatAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user) return message.channel.send(getEmbed_Error("Укажите пользователя для разблокировки чата."));
    userdata = await getUserdata(user.id);
    if(!userdata.mutedchat) return message.channel.send(getEmbed_Error("Пользователь не имеет блокировки чата."));
    roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
    await user.roles.remove(roleMutedChat);
    await message.channel.send(getEmbed_Unchat(user, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unchat(user, message.author));
    userdata.mutedchat = null;
    await setUserdata(userdata);
}

async function pardonAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user) return message.channel.send(getEmbed_Error("Укажите пользователя для помилования."));
    userdata = await getUserdata(user.id);
    if(!userdata.banned && !userdata.mutedvoice && !userdata.mutedchat) return message.channel.send(getEmbed_Error("Пользователь не имеет текущих наказаний."));
    roleBanned = await message.guild.roles.cache.get(roleBannedID);
    roleMutedVoice = await message.guild.roles.cache.get(roleMutedVoiceID);
    roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
    await user.roles.remove(roleBanned);
    await user.roles.remove(roleMutedVoice);
    await user.roles.remove(roleMutedChat);
    userdata.banned = null;
    userdata.mutedchat = null;
    userdata.mutedvoice = null;
    await setUserdata(userdata);
    await message.channel.send(getEmbed_Pardon(user, message.author));
    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Pardon(user, message.author));
}

async function punishmentRemover(){
    const currentData = new Date();
    firstData = null;
    roleBanned = bot.guilds.cache.get(guildID).roles.cache.get(roleBannedID);
    roleMutedChat = bot.guilds.cache.get(guildID).roles.cache.get(roleMutedChatID);
    roleMutedVoice = bot.guilds.cache.get(guildID).roles.cache.get(roleMutedVoiceID);

    usersdata = await getAllUserdataBanned();
    for(i in usersdata){
        if(usersdata[i].banned != null){
            if(usersdata[i].banned <= currentData){
                usersdata[i].banned = null;
                user = bot.guilds.cache.get(guildID).members.cache.get(String(usersdata[i].userid));
                if(user){
                    await user.roles.remove(roleBanned);
                    await bot.channels.cache.get(chatChannelID).send(getEmbed_Unban(user));
                    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unban(user));
                }
                await setUserdata(usersdata[i]);
            } else {
                if(firstData == null)
                    firstData = usersdata[i].banned;
                else if (firstData > usersdata[i].banned)
                    firstData = usersdata[i].banned;
            }
        }
    }
    usersdata = await getAllUserdataMuted();
    for(i in usersdata){
        if(usersdata[i].mutedvoice != null){
            if(usersdata[i].mutedvoice <= currentData){
                usersdata[i].mutedvoice = null;
                user = bot.guilds.cache.get(guildID).members.cache.get(String(usersdata[i].userid));
                if(user){
                    await user.roles.remove(roleMutedVoice);
                    await bot.channels.cache.get(chatChannelID).send(getEmbed_Unmute(user));
                    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unmute(user));
                }
                await setUserdata(usersdata[i]);
            } else {
                if(firstData == null)
                    firstData = usersdata[i].mutedvoice;
                else if (firstData > usersdata[i].mutedvoice)
                    firstData = usersdata[i].mutedvoice;
            }
        }
    }
    usersdata = await getAllUserdataNoChat();
    for(i in usersdata){
        if(usersdata[i].mutedchat != null){
            if(usersdata[i].mutedchat <= currentData){
                usersdata[i].mutedchat = null;
                user = bot.guilds.cache.get(guildID).members.cache.get(String(usersdata[i].userid));
                if(user){
                    await user.roles.remove(roleMutedChat);
                    await bot.channels.cache.get(chatChannelID).send(getEmbed_Unchat(user));
                    await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unchat(user));
                }
                await setUserdata(usersdata[i]);
            } else {
                if(firstData == null)
                    firstData = usersdata[i].mutedchat;
                else if (firstData > usersdata[i].mutedchat)
                    firstData = usersdata[i].mutedchat;
            }
        }
    }
    if(firstData) {
        if(schedule.scheduledJobs["punishmentRemover"]) schedule.scheduledJobs["punishmentRemover"].cancel(); 
        schedule.scheduleJob("punishmentRemover", firstData, async function(){await punishmentRemover();});
    }
}

module.exports = { 
    banAdm,
    unbanAdm,
    muteAdm,
    unmuteAdm,
    nochatAdm,
    unchatAdm,
    pardonAdm,
    punishmentRemover,
}
