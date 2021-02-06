//## npm install node-schedule
//## npm install discord.js
//## npm install sqlite3
//## npm install --save sequelize

const   commands = require("./commands.js");
const { chatChannelID,
        roleBannedID,
        roleMutedChatID,
        roleMutedVoiceID,
        guildID,
        token,
        prefix,
        bot,
        schedule } = require('./config.js');
const { getUserdata,
        syncDatabase,
        getAllUserdataBanned,
        getAllUserdataMuted,
        getAllUserdataNoChat } = require('./database.js');
const { getEmbed_Ready,
        getEmbed_MemberAdd,
        getEmbed_UnknownError } = require('./embedMessages.js');
const { unbanAuto,
        unmuteAuto,
        unchatAuto } = require('./administration.js');
administrationJobs = [];

bot.on("ready", async () => {
    syncDatabase();
    console.log(bot.user.username + " запустился!");
    bot.channels.cache.get(chatChannelID).send(getEmbed_Ready());

    usersBanned = await getAllUserdataBanned();
    for(userdata of usersBanned)
        administrationJobs.push(schedule.scheduleJob(userdata.banned, async function (){ await unbanAuto(bot.guilds.cache.get(guildID).members.cache.get(userdata.userid)); }));
    
    usersMuted = await getAllUserdataMuted();
    for(userdata of usersMuted)
        administrationJobs.push(schedule.scheduleJob(userdata.mutedvoice, async function (){ await unmuteAuto(bot.guilds.cache.get(guildID).members.cache.get(userdata.userid)); }));

    usersNochat = await getAllUserdataNoChat();
    for(userdata of usersNochat)
        administrationJobs.push(schedule.scheduleJob(userdata.mutedchat, async function (){ await unchatAuto(bot.guilds.cache.get(guildID).members.cache.get(userdata.userid)); }));
});

bot.on("guildMemberAdd", async (member) => {
    try{
        let isViolation = false;
        userdata = await getUserdata(member.user.id);
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
            if(isViolation)
                return;
            else
                return bot.channels.cache.get(chatChannelID).send(getEmbed_MemberAdd(member.user));
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
    args = message.content.trim().toLowerCase().split(" ");
    command = args.shift().slice(1);
    for(i in commands)
        if(commands[i].name.includes(command))
            try{
                await commands[i].out(bot, message, args);
                await message.delete();
            } catch (errorOnMessage) {
                return message.channel.send(getEmbed_UnknownError("errorOnMessage"));
            }
});

bot.login(token);
