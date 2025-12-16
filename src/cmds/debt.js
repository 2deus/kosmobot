import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('debt')
            .setDescription('check how many 629fm are missing a .com');

export async function execute(intrc, client) {
    if (client.data.debt > 0) await intrc.reply({ content: `at this moment consent dept is ${client.data.debt} .com entries short`, flags: MessageFlags.Ephemeral });
        else if (client.data.debt < 0 ) await intrc.reply({ content: `at this moment consent dept is ${client.data.debt * -1} .com entries ahead`, flags: MessageFlags.Ephemeral });
        else await intrc.reply({ content: `at this moment consent dept is not facing a .com entry shortage`, flags: MessageFlags.Ephemeral });
        return;
}