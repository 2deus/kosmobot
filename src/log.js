import "dotenv/config";
import { EmbedBuilder } from "discord.js";

export function log({
    title,
    author,
    footer = null,
    image = null,
    fields = [],
    color = 0x005e13,
    warning = ``
}, client) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setAuthor(author)
        .setColor(color)
        .setFooter(footer)

    if (image) embed.setImage(image);
    if (fields.length) embed.addFields(fields);
    if (footer) embed.setFooter(footer);


    const logChannel = client.channels.cache.get(process.env.LOG_ID);

        if (logChannel?.isTextBased()) logChannel.send({ embeds: [embed] })
            else console.warn(`<<<<<<<<WARNING>>>>>>>> ${warning} logging to channel <#${process.env.LOG_ID}> failed`);
}