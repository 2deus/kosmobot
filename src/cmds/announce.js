import { SlashCommandBuilder, AttachmentBuilder, PermissionsBitField, MessageFlags, time } from "discord.js";
import { log } from "../log.js";

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
    await intrc.editReply({ content: `announcement announced announcemently . jump 2 announcement: ${sentMsg.url}`, flags: MessageFlags.Ephemeral});

    log({
        title: "announcement issued",
        author: { name: intrc.user.tag, iconURL: intrc.user.displayAvatarURL()},
        image: msgData.files,
        fields: [
            { name: 'content', value: announceMsg.length === 0 ? 'EMPTY_STRING' : announceMsg},
            { name: 'signed', value: announceSig.length === 0 ? 'none' : announceSig, inline: true },
            { name: 'date', value: (intrc.options.get('date')?.value) ? 'yes' : 'no', inline: true },
            { name: 'message link', value: `${sentMsg.url}`, inline: true},
            { name: `${time(sentMsg.createdAt, 'R')}`, value:`` }
        ],
        footer: { text: `ID: ${sentMsg.id}` },
        warning: "announcement posted but"
    }, client)
}