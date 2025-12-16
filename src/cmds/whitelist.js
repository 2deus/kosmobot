import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('whitelist')
            .setDescription('which investors should be ignored by kosmobot')
    .addBooleanOption(o =>
        o.setName('lightswitch')
            .setDescription('toggle whitelist')
            .setRequired(true))
    .addUserOption(o => 
        o.setName('member')
            .setDescription('which member 2 judge // not required if printing list'))
    .addBooleanOption(o =>
        o.setName('god')
            .setDescription('gift or sever the divine light'))
    .addBooleanOption(o =>
        o.setName('print')
            .setDescription('print list in white'));

export async function execute(intrc, client) {
    if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !intrc.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await intrc.reply({ content: `you do not have permissions to run this command .`, flags: MessageFlags.Ephemeral});
        return;
    }
    
    client.data.godMode = intrc.options.get('lightswitch').value;

    const addedUser = intrc.options.get('member')?.user;
    const isGod     = intrc.options.get('god')?.value;
    const isPrint   = intrc.options.get('print')?.value;

    if (isGod === true) {
        if (!addedUser) {
            await intrc.reply({ content: `try including a member first`, flags: MessageFlags.Ephemeral});
            return;
        }
        for (usr in client.data.whitelist)
            if (client.data.whitelist[usr].id == addedUser.id) {
                await intrc.reply({ content: `user ${addedUser.tag} already in whitelist`, flags: MessageFlags.Ephemeral});
                return;
            }
        client.data.whitelist.push(addedUser);
        await intrc.reply({ content: `added user ${addedUser.tag} to the whitelist`, flags: MessageFlags.Ephemeral});
        return;
    }
    else if (isGod === false) {
        if (!addedUser) {
            await intrc.reply({ content: `try including a member first`, flags: MessageFlags.Ephemeral});
            return;
        }
        const didSlice = client.data.whitelist.splice(client.data.whitelist.indexOf(addedUser), 1);
        if (didSlice.length === 0) {
            await intrc.reply({ content: `user ${addedUser.tag} is not in whitelist`, flags: MessageFlags.Ephemeral});
            return;
        }
        await intrc.reply({ content: `removed user ${addedUser.tag} from the whitelist`, flags: MessageFlags.Ephemeral});
        return;
    }
    if (isPrint) {
        if (client.data.whitelist.length == 0) {
            await intrc.reply({ content: `whitelist is empty`, flags: MessageFlags.Ephemeral});
            return;
        }
        let allIds = "DIVINE:\n";
        for (let i = 0; i < client.data.whitelist.length; i++) allIds = allIds.concat("- ", client.data.whitelist[i].tag, '\n');
        await intrc.reply({ content: allIds, flags: MessageFlags.Ephemeral});
        return;
    }
    await intrc.reply({ content: `whitelist set to ${client.data.godMode}`, flags: MessageFlags.Ephemeral});
    return;
}
