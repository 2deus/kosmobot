const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
             .setDescription('which grifters should be targeted by kosmobot')
        .addBooleanOption(o =>
            o.setName('darkswitch')
             .setDescription('toggle blacklist')
                .setRequired(true))
        .addUserOption(o => 
            o.setName('member')
             .setDescription('which member 2 judge // not required if printing list'))
        .addBooleanOption(o =>
            o.setName('sinner')
             .setDescription('exercise or lift the will of god'))
        .addBooleanOption(o =>
            o.setName('print')
             .setDescription('print list in black')),

    async execute(intrc, client) {
        if (!intrc.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !intrc.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await intrc.reply({ content: `you do not have permissions to run this command .`, ephemeral: true});
            return;
        }

        client.data.damnation = intrc.options.get('darkswitch').value;

        const addedUser = intrc.options.get('member')?.user;
        const isSinner  = intrc.options.get('sinner')?.value;
        const isPrint   = intrc.options.get('print')?.value;

        if (isSinner === true) {
            if (!addedUser) {
                await intrc.reply({ content: `try including a member first`, ephemeral: true});
                return;
            }
            for (usr in client.data.blacklist)
                if (client.data.blacklist[usr].id == addedUser.id) {
                    await intrc.reply({ content: `user ${addedUser.tag} already in blacklist`, ephemeral: true});
                    return;
                }
            client.data.blacklist.push(addedUser);
            await intrc.reply({ content: `added user ${addedUser.tag} to the blacklist`, ephemeral: true});
            return;
        }
        else if (isSinner === false) {
            if (!addedUser) {
                await intrc.reply({ content: `try including a member first`, ephemeral: true});
                return;
            }
            const didSlice = client.data.blacklist.splice(client.data.blacklist.indexOf(addedUser), 1);
            if (didSlice.length === 0) {
                await intrc.reply({ content: `user ${addedUser.tag} is not in blacklist`, ephemeral: true});
                return;
            }
            await intrc.reply({ content: `removed user ${addedUser.tag} from the blacklist`, ephemeral: true});
            return;
        }
        if (isPrint) {
            if (client.data.blacklist.length == 0) {
                await intrc.reply({ content: `blacklist is empty`, ephemeral: true});
                return;
            }
            let allIds = "SINNERS:\n";
            for (let i = 0; i < client.data.blacklist.length; i++) {
                allIds = allIds.concat("- ", client.data.blacklist[i].tag, '\n');
            };
            await intrc.reply({ content: allIds, ephemeral: true});
            return;
        }
        await intrc.reply({ content: `blacklist set to ${client.data.damnation}`, ephemeral: true});
        return;
    }
};