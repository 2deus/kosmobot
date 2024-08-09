require('dotenv').config();
var cron = require('node-cron');
const { Client, IntentsBitField, EmbedBuilder, ActivityType, DefaultWebSocketManagerOptions: {identifyProperties}, PermissionsBitField} = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
    ]
});
identifyProperties.browser = "Discord iOS";

const allowed = ["629", "fm", "629fm", "fm.com", ".com", "629fm.com", "@629fm", "222"];
let tick = 0;
let godMode;
const whitelist = [];

client.on('ready', (c) => {
    client.user.setPresence({
        activities: [{
            name: '629fm',
            type: ActivityType.Listening
        }],
        //status: 'idle'
    });
    setInterval(() => {
        switch (tick) {
            case 0:
                client.user.setActivity('629fm', { type: ActivityType.Listening });
                break;
            case 1:
                client.user.setActivity('629fm', { type: ActivityType.Competing });
                break;
            case 2:
                client.user.setActivity('629fm', { type: ActivityType.Playing });
                break;
            case 3:
                client.user.setActivity('you.', { type: ActivityType.Watching});
                break;
            case 4:
                client.user.setActivity('629fm', { type: ActivityType.Streaming, url: 'https://youtu.be/xpp2ZuN__CU?si=s0oPAwTNOsb85bzj'});
                tick = -1;
                break;
        }
        tick++;
    }, 10000);

    cron.schedule('22 29 6 * * *', () => {
        client.channels.cache.get(process.env.CHANNEL_ID).send('629fm');
    }, {timezone: "Europe/Vilnius"});
    console.log(`${c.user.tag} is online`);
});

client.on('guildMemberAdd', async (c) => {
    c.roles.add([process.env.ROLE_ID]);
    c.setNickname('629fm');
});

function msgCheck(msg, edited) {
    if (msg.channelId != process.env.CHANNEL_ID || msg.author.bot || allowed.includes(msg.cleanContent) || msg.system) return;
    for (usr in whitelist) if (whitelist[usr].id == msg.author.id && godMode) return;

        const image = msg.attachments.first()?.url;
        let processedText = msg.cleanContent == "" ? "EMPTY_STRING" : msg.cleanContent;

        msg.delete().then(console.log(`msg deleted: ${processedText}`));

        client.channels.cache.get(process.env.CHANNEL_ID).sendTyping();
        setTimeout(() => {
            client.channels.cache.get(process.env.CHANNEL_ID).send('629fm');
        }, 500);

        if (edited) {
            processedText = '\\*EDITED* ' + msg.cleanContent;
        }


            const embed = new EmbedBuilder()
            .setTitle('Message deleted')
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL()})
            .setColor(0x005e13)
            .setImage(image)
            .addFields(
                { name: 'jump 2 message', value: `${msg.url}`},
                { name: 'content', value: processedText, }
            )
            .setFooter({ text: 'ID: ' + msg.id + ' | ' + msg.createdAt.toLocaleDateString() + ' ' + msg.createdAt.toLocaleTimeString() })
            
            client.channels.cache.get(process.env.LOG_ID).send({ embeds: [embed] });
}

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
            for (usr in whitelist) if (whitelist[usr].id == addedUser.id) {
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
            let allIds = "whitelist:\n";
            for (let i = 0; i < whitelist.length; i++) {
                allIds = allIds.concat("- ", whitelist[i].tag, '\n');
            };
            console.log(whitelist);
            await intrc.reply({ content: allIds, ephemeral: true});
            return;
        }
        await intrc.reply({ content: `whitelist set to ${godMode}`, ephemeral: true});
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
        const announceMsg = intrc.options.get('message').value;
        let announceSig = intrc.options.get('signature') === null ? "" : intrc.options.get('signature').value;

        const sentMsg = await announceTarget.send(`${announceMsg}\n${announceSig}`);
        announceSig = intrc.options.get('signature') === null ? "none" : announceSig;

        const bembed = new EmbedBuilder()
            .setTitle('announcement issued')
            .setAuthor({ name: intrc.user.tag, iconURL: intrc.user.avatarURL()})
            .setColor(0x005e13)
            .addFields(
                { name: 'content', value: announceMsg },
                { name: 'signed', value: announceSig },
                { name: 'message link', value: `${sentMsg.url}` }
            )
            .setFooter({
                text: 'cmd called at: ' + intrc.createdAt.toLocaleDateString() + ' ' + intrc.createdAt.toLocaleTimeString()
            })
        client.channels.cache.get(process.env.LOG_ID).send({ embeds: [bembed] });

        await intrc.reply({ content: `message sent successfully . jump 2 message: ${sentMsg.url}`, ephemeral: true});
    }

});

client.login(process.env.TOKEN);