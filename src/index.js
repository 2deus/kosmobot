import "dotenv/config";
import { dirname, join }                from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs                               from "node:fs";
import cron                             from "node-cron";

import { startListener, cleanup }       from "./nowPlayingListener.js";
import { log }                          from "./log.js";
import { truncate }                     from "./helpers.js";

import { Client, Collection, IntentsBitField, ActivityType, MessageFlags, time } from 'discord.js';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const cmdPath = join(__dirname, 'cmds');
const cmdFiles = fs
    .readdirSync(cmdPath)
    .filter(f => f.endsWith('.js'));

for (const f of cmdFiles) {
    const fPath = join(cmdPath, f);
    const fUrl  = pathToFileURL(fPath).href;

    const cmdModule = await import(fUrl);
    const cmd = cmdModule.default ?? cmdModule;

    if ('data' in cmd && 'execute' in cmd) {
        client.cmds.set(cmd.data.name, cmd);
        console.log('command '+cmd.data.name+' loaded !')
    } else console.warn(`<<<<<<<<WARNING>>>>>>>> command @ ${fPath} is missing "data" or "execute"`);
}

client.on('clientReady', (c) => {
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

    startListener();
    console.log(`${c.user.tag} is online`);
});

client.on('guildMemberAdd', async (m) => {
    await m.roles.add([process.env.ROLE_ID]);
    await m.setNickname('629fm');

    log({
        title: "new member",
        author: { name: m.user.tag, iconURL: m.user.displayAvatarURL() },
        fields: [
            { name: `${time(m.createdAt, 'R')}`, value:`` }
        ],
        footer: { text: `user ID: ${m.id}` },
        warning: "member joined but"
    }, client)
});

client.on('guildMemberRemove', async (m) => {
    log({
        title: "member gone",
        author: { name: m.user.tag, iconURL: m.user.displayAvatarURL() },
        fields: [
            { name: `${time(m.createdAt, 'R')}`, value:`` }
        ],
        footer: { text: `user ID: ${m.id}` },
        warning: "member left but"
    }, client)
});

function msgCheck(msg, edited) {
    let blacklisted = false;
    if (msg.author.bot) return;
    for (let usr in client.data.whitelist) if (client.data.whitelist[usr].id == msg.author.id && client.data.godMode) return;
    for (let usr in client.data.blacklist) if (client.data.blacklist[usr].id == msg.author.id && client.data.damnation) blacklisted = true;
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

    processedText = truncate(edited ? '\\*EDITED* ' + msg.cleanContent : processedText);

    log({
        title: "message deleted",
        author: { name: msg.author.tag, iconURL: msg.author.displayAvatarURL() },
        image: image,
        fields: [
            { name: 'content', value: processedText },
            { name: 'jump 2 message', value: `${msg.url}` , inline: true },
            { name: 'blacklisted?', value: `${blacklisted}` , inline: true },
            { name: `${time(msg.createdAt, 'R')}`, value:`` }
        ],
        footer: { text: `ID: ${msg.id}` }
    }, client)
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
        await intrc.reply({ content: `error executing the command`, flags: MessageFlags.Ephemeral });
    }
});

function shutdown(signal) {
    console.log(`[${signal}] cleaning up....`);
    cleanup();
    if (client) {
        client.destroy();
        console.log("client destroyed....");
    }
    console.log("exiting....");
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2")); //nodemon exit 4 debug


client.login(process.env.TOKEN);