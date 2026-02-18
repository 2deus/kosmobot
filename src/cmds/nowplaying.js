import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { progressBar } from '../helpers.js';
import { state } from "../nowPlayingState.js";

export const data = new SlashCommandBuilder()
    .setName('nowplaying')
            .setDescription('check 629fm radio information');

export async function execute(intrc) {
    if (!state.title) return intrc.reply({ content: "nothing playing yet", flags: MessageFlags.Ephemeral });

    const elapsed   = Math.floor((Date.now() - state.startedAt)/1000);
    const remaining = Math.max(state.duration - elapsed, 0);

    await intrc.reply({
        embeds: [{
            title: "now playing on 629fm",
            description: `**${state.title}**`,
            fields: [
                {
                    name: "Progress",
                    value: `${progressBar(elapsed, state.duration)}\n` +
                            `${Math.floor(elapsed/60)}min elapsed • ${Math.floor(remaining/60)}min remaining`
                },
                {
                    name: "Listeners",
                    value: `${state.listeners}`,
                    inline: true
                }
            ],
            color: 0x4682b4,
            footer: { text: "629fm" },
            url: "https://629fm.com"
        }],
        flags: MessageFlags.Ephemeral
    });
}