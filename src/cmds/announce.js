import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, PermissionsBitField, MessageFlags } from "discord.js";


export const data = new SlashCommandBuilder()
    .setName('announce')
            .setDescription('make kosmolit talk on your behalf')
    .addChannelOption(o => 
        o.setName('channel')
            .setDescription('which channel to issue the announcement 2')
            .setRequired(true))
    .addBooleanOption(o =>
        o.setName('date')
            .setDescription('whether the announcement should start with a date')
            .setRequired(true))
    .addStringOption(o =>
        o.setName('message')
            .setDescription('the contents of the announcement'))
    .addAttachmentOption(o => 
        o.setName('attachment')
            .setDescription('attach something to the announcement'))
    .addStringOption(o =>
        o.setName('signature')
            .setDescription('append a string to the end of the announcement on a new line'));
    
export async function execute(intrc, client) {
    if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await intrc.reply({ content: `you do not have permission to run this command .`, flags: MessageFlags.Ephemeral});
        return;
    }

    await intrc.deferReply({ flags: MessageFlags.Ephemeral });

    const dateFormat =  `${intrc.createdAt.getDate().toString().padStart(2, '0')}`+
                        `/${(intrc.createdAt.getMonth()+1).toString().padStart(2, '0')}`+
                        `/${intrc.createdAt.getFullYear()}`;
    
    const announceTarget = intrc.options.getChannel('channel');
    const announceAttch    = intrc.options.getAttachment('attachment');

    const announceMsg    = intrc.options.getString('message') ?? "";
    const announceSig    = intrc.options.getString('signature') ?? "";
    const announceDate   = intrc.options.get('date')?.value ? `${dateFormat}${announceMsg ? ' - ' : ''}` : "";

    const msgData = { content: announceDate+announceMsg.trim()+'\n'+announceSig.trim() };

    if (announceAttch) msgData.files = [new AttachmentBuilder(announceAttch.url)];

    const sentMsg = await announceTarget.send(msgData);
    await intrc.editReply({ content: `message sent successfully . jump 2 message: ${sentMsg.url}`, flags: MessageFlags.Ephemeral});

    const embed = new EmbedBuilder()
        .setTitle('announcement issued')
        .setAuthor({ name: intrc.user.tag, iconURL: intrc.user.displayAvatarURL()})
        .setColor(0x005e13)
        .setImage(announceAttch.url)
        .addFields(
            { name: 'content', value: announceMsg.length === 0 ? 'EMPTY_STRING' : announceMsg },
            { name: 'signed', value: announceSig.length === 0 ? 'none' : announceSig },
            { name: 'date', value: (intrc.options.get('date')?.value) ? 'yes' : 'no' },
            { name: 'message link', value: `${sentMsg.url}` })
        .setFooter(
            { text: 'cmd called at: ' + intrc.createdAt.toLocaleDateString() + ' ' + intrc.createdAt.toLocaleTimeString() })

    const logChannel = client.channels.cache.get(process.env.LOG_ID);
    if (logChannel && logChannel.isTextBased()) logChannel.send({ embeds: [embed] })
        else await intrc.editReply({ content: `message sent but logging failed. check whether <#${process.env.LOG_ID}> exists`, flags: MessageFlags.Ephemeral});
    return;
}