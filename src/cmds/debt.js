const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debt')
             .setDescription('check how many 629fm are missing a .com'),

    async execute(intrc, client) {
    if (client.data.debt > 0) await intrc.reply({ content: `at this moment consent dept is ${client.data.debt} .com entries short`, ephemeral: true });
        else if (client.data.debt < 0 ) await intrc.reply({ content: `at this moment consent dept is ${client.data.debt * -1} .com entries ahead`, ephemeral: true });
        else await intrc.reply({ content: `at this moment consent dept is not facing a .com entry shortage`, ephemeral: true });
        return;
    }
};