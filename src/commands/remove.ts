import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { Discord, Slash, SlashOption } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Remove {
  @Slash({
    description: "Removes song from queue",
    name: "remove",
  })
  async remove(
    @SlashOption({
      description: "Song's position",
      name: "position",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    position: number,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!bot.moon) {
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

    const queue = player.queue.getQueue()
    const track = queue[position - 1]
    await player.queue.remove(position - 1)
    await interaction.reply(
      `Removed \`${track.title}\` by \`${track.author}\` from queue`
    )
  }
}
