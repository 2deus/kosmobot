import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } from 'discord.js';

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

    try {
        const fetchedmsg  = await intrc.channel.messages.fetch({ limit: amount });
        const filteredmsg = non629fm ? fetchedmsg.filter(fmsg => !allowed.includes(fmsg.cleanContent)) : fetchedmsg;
        const deletedmsg  = await intrc.channel.bulkDelete(filteredmsg, true);

        const embed = new EmbedBuilder()
            .setTitle('bulk delete command used')
            .setAuthor({ name: intrc.user.tag, iconURL: intrc.user.displayAvatarURL()})
            .setColor(0x005e13)
            .setDescription('messages:\n'+deletedmsg.map(msg => `${msg.content}`).join('\n')) // TODO: fix this
            .addFields(
                { name: 'number of messages', value: `${deletedmsg.size}` })
            .setFooter(
                { text: 'cmd called at: ' + intrc.createdAt.toLocaleDateString() + ' ' + intrc.createdAt.toLocaleTimeString() })
    
        const logChannel = client.channels.cache.get(process.env.LOG_ID);
        if (logChannel && logChannel.isTextBased()) logChannel.send({ embeds: [embed] });
            else {
                await intrc.reply({ content: `<<<<<<<<WARNING>>>>>>>> command executed but logging failed. check whether <#${process.env.LOG_ID}> exists`, flags: MessageFlags.Ephemeral});
                return;
            }
        await intrc.reply({ content: `${deletedmsg.size} messages deleted successfully`, flags: MessageFlags.Ephemeral });
    }
    catch (e) {
        console.error(e);
        await intrc.reply({ content: 'error trying 2 delete', flags: MessageFlags.Ephemeral });
        return;
    }
    return;
}