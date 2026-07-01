import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import { progressBar } from '../helpers.js';
import { state } from "../nowPlayingState.js";

export const data = new SlashCommandBuilder()
    .setName('nowplaying')
            .setDescription('check 629fm radio information');

const LOGO = "https://azuracast.629fm.com/static/uploads/background.1782929479.png";

export async function execute(intrc) {
    if (!state.title) return intrc.reply({ content: "nothing playing yet", flags: MessageFlags.Ephemeral });

    const elapsed   = Math.floor((Date.now() - state.startedAt)/1000);
    const remaining = Math.max(state.duration - elapsed, 0);

    const embed = new EmbedBuilder()
            .setTitle(state.title)
            .setAuthor({ name: "now playing on 629fm", iconURL: LOGO})
            .setColor(0x4682b4)
            .setFooter({ text: "your special place at the table" })
            .setImage(state.art)
        
    embed.setFields([
            {
                name: "elapsed",
                value:  `${progressBar(elapsed, state.duration)}\n` +
                        `${Math.floor(elapsed/60)}min elapsed • ${Math.floor(remaining/60)}min remaining`
            },
            {
                name: "listeners",
                value: `${state.listeners}`,
                inline: true
            }
        ])

    await intrc.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
    });
}