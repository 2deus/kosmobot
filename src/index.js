require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
var cron = require('node-cron');

const { Client, Collection, IntentsBitField, EmbedBuilder, ActivityType } = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
    ]
});

const allowed = ["629", "fm", "629fm", "fm.com", ".com", "629fm.com", "@629fm", "222", "VAYU"];
let debounce = 6;

client.data = {
    debt: 0,
    godMode: false,
    damnation: false,
    whitelist: [],
    blacklist: []
};

client.cmds = new Collection();

const cmdPath = path.join(__dirname, 'cmds');
const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));

for (const f of cmdFiles) {
    const fPath = path.join(cmdPath, f);
    const cmd = require(fPath);
    if ('data' in cmd && 'execute' in cmd) {client.cmds.set(cmd.data.name, cmd);console.log('command '+cmd.data.name+' loaded !')}
        else console.warn(`<<<<<<<<WARNING>>>>>>>> command @ ${fPath} is missing "data" or "execute"`);
}

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
        client.data.debt++;
    }, {timezone: "Europe/Vilnius"});
    console.log(`${c.user.tag} is online`);
});

client.on('guildMemberAdd', async (c) => {
    c.roles.add([process.env.ROLE_ID]);
    c.setNickname('629fm');
    const embed = new EmbedBuilder()
        .setTitle('new member')
        .setAuthor({ name: c.user.tag, iconURL: c.user.displayAvatarURL()})
        .setColor(0x005e13)
        .setFooter(
            { text: 'user ID: ' + c.id + ' | ' + c.joinedAt.toLocaleDateString() + ' ' + c.joinedAt.toLocaleTimeString() })
        
    const logChannel = client.channels.cache.get(process.env.LOG_ID);
    if (logChannel && logChannel.isTextBased()) logChannel.send({ embeds: [embed] })
        else warn(`<<<<<<<<WARNING>>>>>>>> member joined but logging failed. check whether <#${process.env.LOG_ID}> exists`);
    return;
});

client.on('guildMemberRemove', async (c) => {
    const embed = new EmbedBuilder()
        .setTitle('member gone')
        .setAuthor({ name: c.user.tag, iconURL: c.user.displayAvatarURL()})
        .setColor(0x005e13)
        .setFooter(
            { text: 'user ID: ' + c.id + ' | ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() })

    const logChannel = client.channels.cache.get(process.env.LOG_ID);
    if (logChannel && logChannel.isTextBased()) logChannel.send({ embeds: [embed] })
        else warn(`<<<<<<<<WARNING>>>>>>>> member left but logging failed. check whether <#${process.env.LOG_ID}> exists`);
    return;
});

function msgCheck(msg, edited) {
    let blacklisted = false;
    for (usr in client.data.whitelist) if (client.data.whitelist[usr].id == msg.author.id && client.data.godMode) return;
    for (usr in client.data.blacklist) if (client.data.blacklist[usr].id == msg.author.id && client.data.damnation) blacklisted = true;
    if (msg.author.bot) return;
    if (!blacklisted) client.data.debt += msg.cleanContent == allowed[2] ? 1 : msg.cleanContent == allowed[4] ? -1 : 0;
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
            client.data.debt++;
        }, 500);
    }
    processedText = edited ? '\\*EDITED* ' + msg.cleanContent : processedText;

    const embed = new EmbedBuilder()
        .setTitle('Message deleted')
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
        .setColor(0x005e13)
        .setImage(image)
        .addFields(
            { name: 'content', value: processedText },
            { name: 'jump 2 message', value: `${msg.url}` },
            { name: 'blacklisted?', value: `${blacklisted}` })
        .setFooter(
            { text: 'ID: ' + msg.id + ' | ' + msg.createdAt.toLocaleDateString() + ' ' + msg.createdAt.toLocaleTimeString() })
        
    const logChannel = client.channels.cache.get(process.env.LOG_ID);
    if (logChannel && logChannel.isTextBased()) logChannel.send({ embeds: [embed] })
        else warn(`<<<<<<<<WARNING>>>>>>>> logging failed. check whether <#${process.env.LOG_ID}> exists`);
    return;
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
client.on('messageUpdate', (_, msg) => {msgCheck(msg, true)});

client.on('interactionCreate', async (intrc) => {
    if (!intrc.isChatInputCommand()) return;

    const command = client.cmds.get(intrc.commandName);
    if (!command) return;

    try {await command.execute(intrc, client)}
    catch (e) {
        console.error(e);
        await intrc.reply({ content: `error executing the command`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);