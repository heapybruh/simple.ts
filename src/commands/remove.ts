import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot, color } from "../index.js"
import { Terminal } from "../utils/terminal.js"

@Discord()
export class Remove {
  @Slash({
    description: "Removes track from queue",
    name: "remove",
  })
  async remove(
    @SlashOption({
      description: "Track's position",
      name: "position",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    position: number,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply()

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.editReply({
        content: "Not connected to a voice channel",
      })

      return
    }

    if (position < 1) {
      await interaction.editReply({
        content: "Position must be above or equal 1",
      })

      return
    }

    if (position > player.queue.size) {
      await interaction.editReply({
        content: "There is no track at this position",
      })

      return
    }

    const track = player.queue.tracks[position - 1]
    player.queue.remove(position)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Removed track",
            iconURL: process.env.QUEUE_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully removed [${track.title} by **${track.author}**](${track.url}) from queue :notes:`
          )
          .setFooter({
            text: `@${interaction.user.username} used /${interaction.command!.name}`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
