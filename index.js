const   commands = require("./commands.js");
const { chatChannelID,
        roleBannedID,
        roleMutedChatID,
        roleMutedVoiceID,
        token,
        prefix,
        bot,
        schedule,
        botChannelID,
        DEBUG,
        testChannelID } = require('./config.js');
const { syncDatabase,
        checkUserData,
        saveDatabases } = require('./database.js');
const { getEmbed_Ready,
        getEmbed_MemberAdd } = require('./embedMessages.js');
const { punishmentRemover } = require('./administration.js');
const { hasPermissionLevel,
        updateUsersRatingRole,
        updateUsersWeakRole } = require('./roleManager.js');

dbShedule = [];
lastMessageContent = "";
lastMessageAuthorID = "";
lastMessageChannelID = "";

bot.on("ready", async () => {
    await syncDatabase();
    if(DEBUG){
        console.log(bot.user.username + " запустился в DEBUG MODE!");
        return;
    }
    await punishmentRemover();
    dbShedule.push(schedule.scheduleJob("dbSaveMidnight", '0 0 0 * * *', function(){saveDatabases();}));
    dbShedule.push(schedule.scheduleJob("dbSaveNoon", '0 0 12 * * *', function(){saveDatabases();}));
    await bot.channels.cache.get(botChannelID).send(getEmbed_Ready());
    console.log(bot.user.username + " запустился!");
});

bot.on("guildMemberAdd", async (member) => {
    if(DEBUG) return;
    let isViolation = false;
    userdata = await checkUserData(member.user.id);
    if(userdata){
        if(userdata.banned){
            roleBanned = member.guild.roles.cache.get(roleBannedID);
            await member.roles.add(roleBanned);
            isViolation = true;
        }
        if(userdata.mutedvoice){
            roleMutedVoice = member.guild.roles.cache.get(roleMutedVoiceID);
            await member.roles.add(roleMutedVoice);
            isViolation = true;
        }
        if(userdata.mutedchat){
            roleMutedChat = member.guild.roles.cache.get(roleMutedChatID);
            await member.roles.add(roleMutedChat);
            isViolation = true;
        }
        if(userdata.winsFFA + userdata.defeatsFFA + userdata.winsTeamers + userdata.defeatsTeamers > 0)
            await updateUsersRatingRole([userdata.userid]);
        if(userdata.clanid){
            clanRole = member.guild.roles.cache.get(userdata.clanid);
            await member.roles.add(clanRole);
        }
        await updateUsersWeakRole(userdata.userid);
        if(isViolation) return;
    }
    await bot.channels.cache.get(chatChannelID).send(getEmbed_MemberAdd(member.user));
});

bot.on('message', async (message) => {
    if(message.author.bot || (message.guild == null)) return;
    if(!message.content.startsWith(prefix)){
        if((message.content == lastMessageContent)&&(lastMessageContent != "")&&(message.author.id == lastMessageAuthorID)&&(message.channel.id == lastMessageChannelID)){
            await message.delete();
        } else {
            lastMessageContent = message.content;
            lastMessageChannelID = message.channel.id;
            lastMessageAuthorID = message.author.id;
        }
        return;
    }

    if(DEBUG){
        if(message.channel.id != testChannelID) return;     // test-channel
    } else if ((message.channel.id != botChannelID) && (!hasPermissionLevel(message.member, 2) || (message.channel.id == testChannelID))) return;

    args = message.content.replace(/\n/g, " ").trim().toLowerCase().split(" ").filter(x => x);
    command = args.shift().slice(1);
    for(i in commands)
        if(commands[i].name.includes(command))
            return await commands[i].out(bot, message, args);
});

bot.login(token);
