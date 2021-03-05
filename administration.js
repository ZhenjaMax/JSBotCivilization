const { getUserdata,
        updateUserdataBanned, 
        updateUserdataMuted,
        updateUserdataNochat} = require('./database.js');
const { roleBannedID,
        roleMutedChatID,
        roleMutedVoiceID,
        chatChannelID,
        schedule,
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
        getEmbed_Error,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { parseNumberRule,
        parseDuration,
        getTimeInSeconds } = require('./functions.js');
administrationJobs = [];

async function banAdm(robot, message, args){
    try{
        member = await message.mentions.members.first();
        if(!member)
            return message.channel.send(getEmbed_Error("Укажите пользователя для бана."));
        userdata = await getUserdata(member.id);
        if(userdata.banned)
            return message.channel.send(getEmbed_Error("Пользователь уже имеет бан! Чтобы снять, используйте !unban"));
        duration = parseDuration(args[1]);
        if(duration == undefined)
            return message.channel.send(getEmbed_Error("Укажите время бана в формате: 1s, 2m, 3h, 4d, 5y."));
        reason = parseNumberRule(args[2]);
        if(reason == undefined)
            return message.channel.send(getEmbed_Error("Укажите номер правила для причины бана."));
        dateUntil = new Date();
        dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
        roleBanned = await message.guild.roles.cache.get(roleBannedID);
        await member.roles.add(roleBanned);
        await updateUserdataBanned(member.id, dateUntil);
        administrationJobs.push(schedule.scheduleJob(dateUntil, async function (){ await unbanAuto(member); }));
        await message.channel.send(getEmbed_Ban(member, dateUntil, reason, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Ban(member, dateUntil, reason, message.author));
    } catch (errorBanAdm) {
        return message.channel.send(getEmbed_UnknownError("errorBanAdm"));
    }
}

async function unbanAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для разбана."));
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.banned)
            return message.channel.send(getEmbed_Error("Пользователь не имеет бана."));
        roleBanned = await message.guild.roles.cache.get(roleBannedID);
        await user.roles.remove(roleBanned);
        await updateUserdataBanned(user.id, null);
        await message.channel.send(getEmbed_Unban(user, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unban(user, message.author));
    } catch (errorUnban) {
        return message.channel.send(getEmbed_UnknownError("errorUnbanAdm"));
    }
}

async function unbanAuto(user){
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.banned)
            return;
        if(bot.guilds.cache.get(guildID).members.cache.get(user.id)){
            roleBanned = await bot.guilds.cache.get(guildID).roles.cache.get(roleBannedID);
            await user.roles.remove(roleBanned);
        }
        await updateUserdataBanned(user.id, null);
        await bot.channels.cache.get(chatChannelID).send(getEmbed_Unban(user));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unban(user));
    } catch (errorUnbanAuto) {
        return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUnbanAuto"));
    }
}

async function muteAdm(robot, message, args){
    try{
        member = await message.mentions.members.first();
        if(!member)
            return message.channel.send(getEmbed_Error("Укажите пользователя для бана."));
        userdata = await getUserdata(member.id);
        if(userdata.mutedvoice)
            return message.channel.send(getEmbed_Error("Пользователь уже имеет мут! Чтобы снять, используйте !unmute"));
        duration = parseDuration(args[1]);
        if(duration == undefined)
            return message.channel.send(getEmbed_Error("Укажите время мута в формате: 1s, 2m, 3h, 4d, 5y."));
        reason = parseNumberRule(args[2]);
        if(reason == undefined)
            return message.channel.send(getEmbed_Error("Укажите номер правила для причины мута."));
        dateUntil = new Date();
        dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
        roleMuted = await message.guild.roles.cache.get(roleMutedVoiceID);
        await member.roles.add(roleMuted);
        await updateUserdataMuted(member.id, dateUntil);
        administrationJobs.push(schedule.scheduleJob(dateUntil, async function (){ await unmuteAuto(member); }));
        await message.channel.send(getEmbed_Mute(member, dateUntil, reason, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Mute(member, dateUntil, reason, message.author));
    } catch (errorMuteAdm) {
        return message.channel.send(getEmbed_UnknownError("errorMuteAdm"));
    }
}

async function unmuteAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для размута."));
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.mutedvoice)
            return message.channel.send(getEmbed_Error("Пользователь не имеет мута."));
        roleMuted = await message.guild.roles.cache.get(roleMutedVoiceID);
        await user.roles.remove(roleMuted);
        await updateUserdataMuted(user.id, null);
        await message.channel.send(getEmbed_Unmute(user, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unmute(user, message.author));
    } catch (errorUnmuteAdm) {
        return message.channel.send(getEmbed_UnknownError("errorUnmuteAdm"));
    }
}

async function unmuteAuto(user){
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.mutedvoice)
            return;
        if(bot.guilds.cache.get(guildID).members.cache.get(user.id)){
            roleMuted = await bot.guilds.cache.get(guildID).roles.cache.get(roleMutedVoiceID);
            await user.roles.remove(roleMuted);
        }
        await updateUserdataMuted(user.id, null);
        await bot.channels.cache.get(chatChannelID).send(getEmbed_Unmute(user));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unmute(user));
    } catch (errorUnmuteAuto) {
        return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUnmuteAuto"));
    }
}

async function nochatAdm(robot, message, args){
    try{
        member = await message.mentions.members.first();
        if(!member)
            return message.channel.send(getEmbed_Error("Укажите пользователя для блокировки чата."));
        userdata = await getUserdata(member.id);
        if(userdata.mutedchat)
            return message.channel.send(getEmbed_Error("Пользователь уже имеет блокировку чата! Чтобы снять, используйте !unchat"));
        duration = parseDuration(args[1]);
        if(duration == undefined)
            return message.channel.send(getEmbed_Error("Укажите время бана в формате: 1s, 2m, 3h, 4d, 5y."));
        reason = parseNumberRule(args[2]);
        if(reason == undefined)
            return message.channel.send(getEmbed_Error("Укажите номер правила для причины блокировки чата."));
        dateUntil = new Date();
        dateUntil.setSeconds(dateUntil.getSeconds() + getTimeInSeconds(parseInt(duration[0]), duration[1]));
        roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
        await member.roles.add(roleMutedChat);
        await updateUserdataNochat(member.id, dateUntil);
        administrationJobs.push(schedule.scheduleJob(dateUntil, async function (){ await unchatAuto(member); }));
        await message.channel.send(getEmbed_Nochat(member, dateUntil, reason, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Nochat(member, dateUntil, reason, message.author));
    } catch (errorNochatAdm) {
        return message.channel.send(getEmbed_UnknownError("errorNochatAdm"));
    }
}

async function unchatAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для разблокировки чата."));
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.mutedchat)
            return message.channel.send(getEmbed_Error("Пользователь не имеет блокировки чата."));
        roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
        await user.roles.remove(roleMutedChat);
        await updateUserdataNochat(user.id, null);
        await message.channel.send(getEmbed_Unchat(user, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unchat(user, message.author));
    } catch (errorUnchatAdm) {
        return message.channel.send(getEmbed_UnknownError("errorUnchatAdm"));
    }
}

async function unchatAuto(user){
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.mutedchat)
            return;
        if(bot.guilds.cache.get(guildID).members.cache.get(user.id)){
            roleMutedChat = await bot.guilds.cache.get(guildID).roles.cache.get(roleMutedChatID);
            await user.roles.remove(roleMutedChat);
        }
        await updateUserdataNochat(user.id, null);
        await bot.channels.cache.get(chatChannelID).send(getEmbed_Unchat(user));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Unchat(user));
    } catch (errorUnchatAuto) {
        return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorUnchatAuto"));
    }
}

async function pardonAdm(robot, message, args){
    user = message.mentions.members.first();
    if(!user)
        return message.channel.send(getEmbed_Error("Укажите пользователя для помилования."));
    try{
        userdata = await getUserdata(user.id);
        if(!userdata.banned && !userdata.mutedvoice && !userdata.mutedchat)
            return message.channel.send(getEmbed_Error("Пользователь не имеет текущих наказаний."));
        roleBanned = await message.guild.roles.cache.get(roleBannedID);
        roleMutedVoice = await message.guild.roles.cache.get(roleMutedVoiceID);
        roleMutedChat = await message.guild.roles.cache.get(roleMutedChatID);
        await user.roles.remove(roleBanned);
        await user.roles.remove(roleMutedVoice);
        await user.roles.remove(roleMutedChat);
        await updateUserdataBanned(user.id, null);
        await updateUserdataMuted(user.id, null);
        await updateUserdataNochat(user.id, null);
        await message.channel.send(getEmbed_Pardon(user, message.author));
        await bot.channels.cache.get(bansReportsChannelID).send(getEmbed_Pardon(user, message.author));
    } catch (errorPardonAdm) {
        return message.channel.send(getEmbed_UnknownError("errorPardonAdm"));
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
    unbanAuto,
    unmuteAuto,
    unchatAuto
}
