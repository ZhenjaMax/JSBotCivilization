const Discord =   require('discord.js');
const commands =  require("./commands.js");
const config =    require('./config.json');
const { chatChannelID, roleBannedID } = require('./data.js');
const { databaseUsers } = require('./database.js');
const { getEmbed_Ready,
        getEmbed_MemberAdd,
        getEmbed_UnknownError } = require('./embedMessages.js');

const bot = new Discord.Client();
const token = config.token;
const prefix = config.prefix;

bot.on("ready", function() {
    databaseUsers.sync();
    console.log(bot.user.username + " запустился!");
    bot.channels.cache.get(chatChannelID).send(getEmbed_Ready());
});

bot.on("guildMemberAdd", async (member) => {
    userdata = await databaseUsers.findOne({ where: { userid: member.user.id } });
    if(userdata)
        if(userdata.banned)
            try{
                roleBanned = await member.guild.roles.cache.get(roleBannedID);
                return await member.roles.add(roleBanned);
            } catch (errorGuildMemberAdd) {
                return bot.channels.cache.get(chatChannelID).send(getEmbed_UnknownError("errorGuildMemberAdd"));
            }
    return bot.channels.cache.get(chatChannelID).send(getEmbed_MemberAdd(member.user));
});

bot.on('message', async (msg) => {
    if (msg.author.bot || (msg.guild == null) || !msg.content.startsWith(prefix))
        return;
    args = msg.content.trim().toLowerCase().split(" ");
    command = args.shift().slice(1);
    for(i in commands)
        if(commands[i].name.includes(command))
            try{
                await msg.delete();
                return commands[i].out(bot, msg, args);
            } catch (errorOnMessage) {
                return message.channel.send(getEmbed_UnknownError("errorOnMessage"));
            }
});

bot.login(token);
