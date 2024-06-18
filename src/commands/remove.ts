import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot, color } from "../index.js"

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
    if (!bot.moon.isConnected) {
      await interaction.reply({
        content: "Not connected to Lavalink server",
        ephemeral: true,
      })

      return
    }

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.reply({
        content: "Not connected to a voice channel",
        ephemeral: true,
      })

      return
    }

    if (position < 1) {
      await interaction.reply({
        content: "Position must be above or equal 1",
        ephemeral: true,
      })

      return
    }

    const queue = player.queue.getQueue()

    if (position > queue.length) {
      await interaction.reply({
        content: "There is no track at this position",
        ephemeral: true,
      })

      return
    }

    const track = queue[position - 1]
    player.queue.remove(position)
    await interaction.reply({
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
            text: `@${interaction.user.username} used /remove`,
            iconURL: process.env.LOGO_PATH,
          }),
      ],
    })
  }
}
