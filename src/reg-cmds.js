import "dotenv/config";
import { REST, Routes, ApplicationCommandOptionType } from 'discord.js';

const commands = [
    {
        name: 'announce',
        description: 'make kosmolit talk on your behalf',
        options: [
            {
                name: 'channel',
                description: 'which channel to issue the announcement 2',
                type: ApplicationCommandOptionType.Channel,
                required: true
            },
            {
                name: 'date',
                description: `whether the announcement should start with a date`,
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'message',
                description: 'the contents of the announcement',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'attachment',
                description: 'attach something to the announcement',
                type: ApplicationCommandOptionType.Attachment,
                required: false
            },
            {
                name: 'signature',
                description: 'append a string to the end of the announcement on a new line',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'blacklist',
        description: 'which grifters should be targeted by kosmobot',
        options: [
            {
                name: 'darkswitch',
                description: 'toggle blacklist',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'member',
                description: 'which member 2 judge // not required if printing list',
                type: ApplicationCommandOptionType.User,
                required: false
            },
            {
                name: 'sinner',
                description: `exercise or lift the will of god`,
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: 'print',
                description: 'print list in black',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    {
        name: 'debt',
        description: `check how many 629fm msgs are missing a .com`
    },
    {
        name: 'nowplaying',
        description: `check 629fm radio information`
    },
    {
        name: 'purge',
        description: 'deletes fetched messages with a lifetime of <2 weeks',
        options: [
            {
                name: 'non-629fm',
                description: 'whether 2 ignore 629fm messages',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'fetch-amount',
                description: 'how many messages 2 fetch (max 100)',
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: 'whitelist',
        description: 'which investors should be ignored by kosmobot',
        options: [
            {
                name: 'lightswitch',
                description: 'turn whitelist on/off',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'member',
                description: 'which member 2 judge // not required if printing list',
                type: ApplicationCommandOptionType.User,
                required: false
            },
            {
                name: 'god',
                description: 'gift or sever the divine light',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            },
            {
                name: 'print',
                description: 'print list in white',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
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