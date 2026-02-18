import { SlashCommandBuilder, PermissionsBitField, MessageFlags, time } from 'discord.js';
import { log } from '../log.js';

export const data = new SlashCommandBuilder()
    .setName('purge')
            .setDescription('deletes fetched messages with a lifetime of <2 weeks')
    .addBooleanOption(o =>
        o.setName('non-629fm')
            .setDescription('whether 2 ignore 629fm messages')
            .setRequired(true))
    .addNumberOption(o => 
        o.setName('fetch-amount')
            .setDescription('how many messages 2 fetch (max 100)')
            .setRequired(true));

export async function execute(intrc, client) {
    if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await intrc.reply({ content: `you do not have permissions 2 run this command .`, flags: MessageFlags.Ephemeral});
        return;
    }

    const non629fm = intrc.options.get('non-629fm').value;
    const amount   = intrc.options.get('fetch-amount').value;

    if (amount < 2 || amount > 100) {
        await intrc.reply({ content: 'amount must be more than 1 and less than 100', flags: MessageFlags.Ephemeral });
        return;
    }

    let fetchedmsg;
    let filteredmsg;
    let deletedmsg;

    try {
        fetchedmsg  = await intrc.channel.messages.fetch({ limit: amount });
        filteredmsg = non629fm ? fetchedmsg.filter(fmsg => !allowed.includes(fmsg.cleanContent)) : fetchedmsg;
        deletedmsg  = await intrc.channel.bulkDelete(filteredmsg, true);
        
        await intrc.reply({ content: `${deletedmsg.size} messages deleted successfully`, flags: MessageFlags.Ephemeral });
    }
    catch (e) {
        console.error(e);
        await intrc.reply({ content: 'error trying 2 delete', flags: MessageFlags.Ephemeral });
        return;
    }

    log({
        title: 'purge command used',
        author: { name: intrc.user.tag, iconURL: intrc.user.displayAvatarURL() },
        fields: [
            { name: 'messages:', value: deletedmsg.map(msg => `${msg.content}`).join('\n') },
            { name: 'number of messages', value: `${deletedmsg.size}` },
            { name: `${time(undefined,'R')}`, value:``}
        ]
    }, client)
}