const { clanCreateCost } = require('./config.js');
const { getEmbed_Error,
        getEmbed_ClanInfo } = require('./embedMessages.js');
const { String } = require('./functions.js');
const { setUserdataMoney,
        clanCreate,
	    clanDelete,
	    clanGetData,
	    clanUpdateMoney,
	    clanUpdateAvatar,
        clanUpdateLeader,
        clanCheckClanName,
        clanUpdateName,
        updateUserdataClanID,
        updateUserdataClanStatus,
        clearAllUserdataClan,
        getUserdata,
        getAllUserdataClan,
        hasPermissionLevel } = require('./database.js');

async function clanManager(robot, message, args){
    if(!hasPermissionLevel(message.member, 5)) return;
    let clanid = "", clanRating = 0, clanModerators = [];
    handler = args.shift();
    switch(handler){
        case "stats":
        case "info":
            clanid = args.shift().slice(3, -1);
            clanData = await clanGetData(clanid);
            if(!clanData)
                return await message.channel.send(getEmbed_Error("Такого клана не существует!"));
            clanMembers = await getAllUserdataClan(clanid);
            for(member of clanMembers){
                clanRating += (member.rating - 1000);
                if(member.clanStatus == 1)
                    clanModerators.push(member.userid);
            }
            await message.channel.send(getEmbed_ClanInfo(message.author, clanData.clanid, clanRating, clanData.money, clanData.leaderid, clanModerators, clanMembers.length, clanData.avatarURL))
            break;
        case "create":
            userdata = await getUserdata(message.author.id);
            if(userdata.clanid)
                return await message.channel.send(getEmbed_Error("Нельзя создать клан, когда вы уже состоите в клане!"));
            if(userdata.money < clanCreateCost)
                return await message.channel.send(getEmbed_Error("У вас недостаточно средств!\nНеобходимо {0} 🪙 монет для создания клана.".format(clanCreateCost)));
            
            break;
        case "delete":
            break;
        case "transfer":
            break;
        case "pay":
            break;
        case "withdraw":
            break;
        case "join":
            break;
        case "invite":
            break;
        case "leave":
            break;
        case "promote":
        case "demote":
            break;
        default:
            message.channel.send(getEmbed_Error("Введите одну из следующих подкоманд:\nstats, info, join, invite, leave,\ncreate, delete, transfer, promote, demote,\npay, withdraw."));
            break;
    }
}

module.exports = { clanManager }