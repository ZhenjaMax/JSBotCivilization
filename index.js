const   commands = require("./commands.js");
const { chatChannelID,
        roleBannedID,
        roleMutedChatID,
        roleMutedVoiceID,
        guildID,
        token,
        prefix,
        bot,
        schedule,
        botChannelID,
        DEBUG } = require('./config.js');
const { syncDatabase,
        checkUserSilent,
        getAllUserdataBanned,
        getAllUserdataMuted,
        getAllUserdataNoChat,
        hasPermissionLevel,
        saveDatabases } = require('./database.js');
const { getEmbed_Ready,
        getEmbed_MemberAdd,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { unbanAuto,
        unmuteAuto,
        unchatAuto } = require('./administration.js');
administrationJobs = [];
dbShedule = [];
bot.on("ready", async () => {
    syncDatabase();
    if(DEBUG){
        console.log(bot.user.username + " запустился в DEBUG MODE!");
        return;
    }
    currentDate = new Date();
    try{
        usersBanned = await getAllUserdataBanned();
        if(usersBanned.length != 0)
            for(userdata of usersBanned){
                if(currentDate - userdata.banned >= 0)
                    unbanAuto(userdata.userid);
                else
                    administrationJobs.push(schedule.scheduleJob(userdata.banned, async function (){ await unbanAuto(userdata.userid); }));
            }
        usersMuted = await getAllUserdataMuted();
        if(usersMuted.length != 0)
            for(userdata of usersMuted){
                if(currentDate - userdata.mutedvoice >= 0)
                    unmuteAuto(userdata.userid);
                else
                    administrationJobs.push(schedule.scheduleJob(userdata.mutedvoice, async function (){ await unmuteAuto(userdata.userid); }));
            }
        usersNochat = await getAllUserdataNoChat();
        if(usersNochat.length != 0)
            for(userdata of usersNochat){
                if(currentDate - userdata.mutedvoice >= 0)
                    unchatAuto(userdata.userid);
                else
                    administrationJobs.push(schedule.scheduleJob(userdata.mutedchat, async function (){ await unchatAuto(userdata.userid); }));
            }
        dbShedule.push(schedule.scheduleJob('0 0 0 * * *', function(){saveDatabases();}));
        dbShedule.push(schedule.scheduleJob('0 0 12 * * *', function(){saveDatabases();}));
        await bot.channels.cache.get(botChannelID).send(getEmbed_Ready());
    } catch (errorOnReady) {
        return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorOnReady"));
    }
    console.log(bot.user.username + " запустился!");
});

bot.on("guildMemberAdd", async (member) => {
    try{
        if(DEBUG)
            return;
        let isViolation = false;
        userdata = await checkUserSilent(member.user.id);
        if(userdata){
            if(userdata.banned){
                roleBanned = member.guild.roles.cache.get(roleBannedID);
                await member.roles.add(roleBanned);
                isViolation = true;
            }
            if(userdata.mutedvoice) {
                roleMutedVoice = member.guild.roles.cache.get(roleMutedVoiceID);
                await member.roles.add(roleMutedVoice);
                isViolation = true;
            }
            if(userdata.mutedchat) {
                roleMutedChat = member.guild.roles.cache.get(roleMutedChatID);
                await member.roles.add(roleMutedChat);
                isViolation = true;
            }
            if(!isViolation)
                bot.channels.cache.get(chatChannelID).send(getEmbed_MemberAdd(member.user));
            return;
        } else {
            return bot.channels.cache.get(chatChannelID).send(getEmbed_MemberAdd(member.user));
        }
    } catch (errorGuildMemberAdd) {
        return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGuildMemberAdd"));
    }
});

bot.on('message', async (message) => {
    if (message.author.bot || (message.guild == null) || !message.content.startsWith(prefix))
        return;
    if(DEBUG){
        if(message.channel.id != "716283743047909387")      // test-channel
            return;
    } else {
        if (message.channel.id != botChannelID)
            if(!hasPermissionLevel(message.member, 2) || (message.channel.id == "716283743047909387"))
                return;
    }
    args = message.content.trim().toLowerCase().split(" ");
    command = args.shift().slice(1);
    for(i in commands)
        if(commands[i].name.includes(command))
            try{
                await commands[i].out(bot, message, args);
                if(!(command == "clean" || command == "clear"))
                    await message.delete();
            } catch (errorOnMessage) {
                return message.channel.send(getEmbed_UnknownError("errorOnMessage"));
            }
});

bot.login(token);
