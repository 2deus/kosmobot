require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'purge',
        description: 'mass-deletes an amount of fetched messages . this will NOT delete messages OLDER THAN 2 WEEKS',
        options: [
            {
                name: 'non-629fm',
                description: 'delete non-629fm messages only?',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'fetchamount',
                description: 'amount of messages to FETCH ( max 100 )',
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: 'whitelist',
        description: 'which people are ignored by fm check . mad broken be careful',
        options: [
            {
                name: 'masterswitch',
                description: 'turn whitelist on/off',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'member',
                description: 'which member to judge // not required if printing whitelist',
                type: ApplicationCommandOptionType.User,
                required: false
            },
            {
                name: 'god',
                description: 'make member god or sever their divine link // optional',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: 'print',
                description: 'print current whitelist // optional',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    {
        name: 'blacklist',
        description: 'which people are restrained from sending messages . mad broken be careful',
        options: [
            {
                name: 'darkswitch',
                description: 'turn blacklist on/off',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'member',
                description: 'which member to judge // not required if printing blacklist',
                type: ApplicationCommandOptionType.User,
                required: false
            },
            {
                name: 'sinner',
                description: `send member to depths of gehenna or lift them from their punishment // optional`,
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: 'print',
                description: 'print current blacklist // optional',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    {
        name: 'announce',
        description: 'make kosmolit talk on your behalf',
        options: [
            {
                name: 'channel',
                description: 'which channel to announce in',
                type: ApplicationCommandOptionType.Channel,
                required: true
            },
            {
                name: 'date',
                description: `start the message with today's date?`,
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'message',
                description: 'what to say',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'image',
                description: 'add an attachment to the announcement',
                type: ApplicationCommandOptionType.Attachment,
                required: false
            },
            {
                name: 'signature',
                description: 'adds a signature at the end of the message',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'debt',
        description: `check how many 629fm msgs are missing a .com`
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('registering console cmds');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )

        console.log('cmds registered');
    } catch (err) {
      console.log(`Error: ${err}`)  
    }
})();