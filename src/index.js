require('dotenv').config();
var cron = require('node-cron');
const { Client, IntentsBitField, EmbedBuilder, ActivityType, DefaultWebSocketManagerOptions: {identifyProperties}, PermissionsBitField, AttachmentBuilder} = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
    ]
});

const allowed = ["629", "fm", "629fm", "fm.com", ".com", "629fm.com", "@629fm", "222"], whitelist = [], blacklist = [];
let debounce = 6, debt = 0, godMode, damnation;

client.on('ready', (c) => {
    client.user.setPresence({
        activities: [{
            name: 'you.',
            type: ActivityType.Watching
        }],
        status: 'dnd'
    });

    cron.schedule('22 29 6 * * *', () => {
        client.channels.cache.get(process.env.CHANNEL_ID).send('629fm');
        debt++;
    }, {timezone: "Europe/Vilnius"});
    console.log(`${c.user.tag} is online`);
});

client.on('guildMemberAdd', async (c) => {
    c.roles.add([process.env.ROLE_ID]);
    c.setNickname('629fm');
    const embed = new EmbedBuilder()
        .setTitle('New member')
        .setAuthor({ name: c.user.tag, iconURL: c.user.avatarURL()})
        .setColor(0x005e13)
        .setFooter({ text: 'user ID: ' + c.id + ' | ' + c.joinedAt.toLocaleDateString() + ' ' + c.joinedAt.toLocaleTimeString() })
        
    client.channels.cache.get(process.env.LOG_ID).send({ embeds: [embed] });
});

function msgCheck(msg, edited) {
    let blacklisted = false;
    for (usr in whitelist) if (whitelist[usr].id == msg.author.id && godMode) return;
    for (usr in blacklist) if (blacklist[usr].id == msg.author.id && damnation) blacklisted = true;
    if (msg.author.bot) return;
    if (!blacklisted) debt += msg.cleanContent == allowed[2] ? 1 : msg.cleanContent == allowed[4] ? -1 : 0;
    if (((allowed.includes(msg.cleanContent) || msg.system) && !blacklisted) || msg.channelId != process.env.CHANNEL_ID) return;
    

    if (client.presence.status == "idle")
        client.user.setPresence({
        activities: [{
            name: 'you.',
            type: ActivityType.Watching
        }],
        status: 'dnd'
    });
    debounce = 6;

    const image = msg.attachments.first()?.url;
    let processedText = msg.cleanContent == "" ? "EMPTY_STRING" : msg.cleanContent;

    msg.delete();

    if (!blacklisted) {
        client.channels.cache.get(process.env.CHANNEL_ID).sendTyping();
        setTimeout(() => {
            client.channels.cache.get(process.env.CHANNEL_ID).send('629fm');
            debt++;
        }, 500);
    }
    processedText = edited ? '\\*EDITED* ' + msg.cleanContent : processedText;

    const embed = new EmbedBuilder()
        .setTitle('Message deleted')
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL()})
        .setColor(0x005e13)
        .setImage(image)
        .addFields(
            { name: 'content', value: processedText },
            { name: 'jump 2 message', value: `${msg.url}` },
            { name: 'blacklisted?', value: `${blacklisted}` }
        )
        .setFooter({ text: 'ID: ' + msg.id + ' | ' + msg.createdAt.toLocaleDateString() + ' ' + msg.createdAt.toLocaleTimeString() })
        
    client.channels.cache.get(process.env.LOG_ID).send({ embeds: [embed] });
}

setInterval(()=> {
    if (debounce <= 0) {
        client.user.setPresence({
            activities: [{
                name: '629fm',
                type: ActivityType.Listening
            }],
            status: 'idle'
        });
        return;
    }
    debounce--;
}, 5000)

client.on('messageCreate', (msg) => {msgCheck(msg, false)});
client.on('messageUpdate', (oldMsg, msg) => {msgCheck(msg, true)});

client.on('interactionCreate', async (intrc) => {
    if (!intrc.isChatInputCommand()) return;

    if (intrc.commandName === 'whitelist') {
        if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !intrc.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await intrc.reply({ content: `you do not have permissions to run this command .`, ephemeral: true});
            return;
        }
        godMode = intrc.options.get('masterswitch').value;
        const addedUser = intrc.options.get('member')?.user;
        const isGod = intrc.options.get('god')?.value;
        const isPrint = intrc.options.get('print')?.value;
        if (isGod === true) {
            if (!addedUser) {
                await intrc.reply({ content: `try including a member first`, ephemeral: true});
                return;
            }
        for (usr in whitelist)
            if (whitelist[usr].id == addedUser.id) {
                await intrc.reply({ content: `user ${addedUser.tag} already in whitelist`, ephemeral: true});
                return;
            }
            whitelist.push(addedUser);
            await intrc.reply({ content: `added user ${addedUser.tag} to the whitelist`, ephemeral: true});
            return;
        }
        else if (isGod === false) {
            if (!addedUser) {
                await intrc.reply({ content: `try including a member first`, ephemeral: true});
                return;
            }
            const didSlice = whitelist.splice(whitelist.indexOf(addedUser), 1);
            if (didSlice.length === 0) {
                await intrc.reply({ content: `user ${addedUser.tag} is not in whitelist`, ephemeral: true});
                return;
            }
            await intrc.reply({ content: `removed user ${addedUser.tag} from the whitelist`, ephemeral: true});
            return;
        }
        if (isPrint) {
            if (whitelist.length == 0) {
                await intrc.reply({ content: `whitelist is empty`, ephemeral: true});
                return;
            }
            let allIds = "DIVINE:\n";
            for (let i = 0; i < whitelist.length; i++) {
                allIds = allIds.concat("- ", whitelist[i].tag, '\n');
            };
            await intrc.reply({ content: allIds, ephemeral: true});
            return;
        }
        await intrc.reply({ content: `whitelist set to ${godMode}`, ephemeral: true});
    }

    if (intrc.commandName === 'blacklist') {
        if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !intrc.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await intrc.reply({ content: `you do not have permissions to run this command .`, ephemeral: true});
            return;
        }
            damnation = intrc.options.get('darkswitch').value;
            const addedUser = intrc.options.get('member')?.user;
            const isSinner = intrc.options.get('sinner')?.value;
            const isPrint = intrc.options.get('print')?.value;
            if (isSinner === true) {
                if (!addedUser) {
                    await intrc.reply({ content: `try including a member first`, ephemeral: true});
                    return;
                }
            for (usr in blacklist)
                if (blacklist[usr].id == addedUser.id) {
                    await intrc.reply({ content: `user ${addedUser.tag} already in blacklist`, ephemeral: true});
                    return;
                }
                blacklist.push(addedUser);
                await intrc.reply({ content: `added user ${addedUser.tag} to the blacklist`, ephemeral: true});
                return;
            }
            else if (isSinner === false) {
                if (!addedUser) {
                    await intrc.reply({ content: `try including a member first`, ephemeral: true});
                    return;
                }
                const didSlice = blacklist.splice(blacklist.indexOf(addedUser), 1);
                if (didSlice.length === 0) {
                    await intrc.reply({ content: `user ${addedUser.tag} is not in blacklist`, ephemeral: true});
                    return;
                }
                await intrc.reply({ content: `removed user ${addedUser.tag} from the blacklist`, ephemeral: true});
                return;
            }
            if (isPrint) {
                if (blacklist.length == 0) {
                    await intrc.reply({ content: `blacklist is empty`, ephemeral: true});
                    return;
                }
                let allIds = "SINNERS:\n";
                for (let i = 0; i < blacklist.length; i++) {
                    allIds = allIds.concat("- ", blacklist[i].tag, '\n');
                };
                await intrc.reply({ content: allIds, ephemeral: true});
                return;
            }
            await intrc.reply({ content: `blacklist set to ${damnation}`, ephemeral: true});
    }

    if (intrc.commandName === 'purge') {
        if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await intrc.reply({ content: `you do not have permissions to run this command .`, ephemeral: true});
            return;
        }
            const non629fm = intrc.options.get('non-629fm').value;
            const amount = intrc.options.get('fetchamount').value;

        if (amount < 2 || amount > 100) {
            await intrc.reply({ content: 'amount must be more than 1 and less than 100', ephemeral: true });
            return;
        }
        try {
            const fetchedmsg  = await intrc.channel.messages.fetch({ limit: amount });
            const filteredmsg = non629fm ? fetchedmsg.filter(fmsg => !allowed.includes(fmsg.cleanContent)) : fetchedmsg;
            const deletedmsg  = await intrc.channel.bulkDelete(filteredmsg, true);

            const embed = new EmbedBuilder()
            .setTitle('bulk delete command used')
            .setAuthor({ name: intrc.user.tag, iconURL: intrc.user.avatarURL()})
            .setColor(0x005e13)
            .setDescription('messages:\n'+deletedmsg.map(msg => `${msg.content}`).join('\n')) // fix this
            .addFields(
                { name: 'number of messages', value: `${deletedmsg.size}` }
            )
            .setFooter({
                text: 'cmd called at: ' + intrc.createdAt.toLocaleDateString() + ' ' + intrc.createdAt.toLocaleTimeString()
            })
        client.channels.cache.get(process.env.LOG_ID).send({ embeds: [embed] });
        await intrc.reply({ content: `${deletedmsg.size} messages deleted successfully`, ephemeral: true });
        }
        catch (error) {
            console.error(error);
            await intrc.reply({ content: 'error trying to delete', ephemeral: true });
            return;
        }
    }

    if (intrc.commandName === 'announce') {
        if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await intrc.reply({ content: `you do not have permissions to run this command .`, ephemeral: true});
            return;
        }

        const announceTarget = intrc.options.getChannel('channel');
        const announceImg = intrc.options.getAttachment('image');
        const dateFormat = `${intrc.createdAt.getDate()}/${intrc.createdAt.getMonth()+1}/${intrc.createdAt.getFullYear()}`;
        const announceMsg = intrc.options.get('message')?.value ? intrc.options.get('message').value : "";
        let announceSig = intrc.options.get('signature')?.value ? intrc.options.get('signature').value : "";
        const announceDate = 
            intrc.options.get('date')?.value && announceMsg.length === 0 ? dateFormat :
            intrc.options.get('date')?.value ? dateFormat+" - " : "";

        let processedImg;
        const msgData = { content: `${announceDate} ${announceMsg}\n${announceSig}` };
        if (announceImg) {
            processedImg = new AttachmentBuilder(announceImg.url);
            msgData.files = [processedImg];
        }

        const sentMsg = await announceTarget.send(msgData);
        await intrc.reply({ content: `message sent successfully . jump 2 message: ${sentMsg.url}`, ephemeral: true});

        announceSig = announceSig.length === 0 ? 'none' : announceSig;

        const bembed = new EmbedBuilder()
            .setTitle('announcement issued')
            .setAuthor({ name: intrc.user.tag, iconURL: intrc.user.avatarURL()})
            .setColor(0x005e13)
            .setImage(processedImg?.attachment)
            .addFields(
                { name: 'content', value: announceMsg.length === 0 ? 'EMPTY_STRING' : announceMsg },
                { name: 'signed', value: announceSig.length === 0 ? 'none' : announceSig },
                { name: 'date', value: (intrc.options.get('date')?.value) ? 'yes' : 'no' },
                { name: 'message link', value: `${sentMsg.url}` }
            )
            .setFooter({
                text: 'cmd called at: ' + intrc.createdAt.toLocaleDateString() + ' ' + intrc.createdAt.toLocaleTimeString()
            })
        client.channels.cache.get(process.env.LOG_ID).send({ embeds: [bembed] });
    }

    if (intrc.commandName === 'debt') {
        if (debt > 0) await intrc.reply({ content: `currently consent dept is ${debt} .com entries short`, ephemeral: true });
        else if (debt < 0 ) await intrc.reply({ content: `currently consent dept is ${debt * -1} .com entries ahead`, ephemeral: true });
        else await intrc.reply({ content: `currently consent dept is not facing a .com entry shortage`, ephemeral: true });
    }

});

client.login(process.env.TOKEN);