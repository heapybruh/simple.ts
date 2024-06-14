import { CommandInteraction } from "discord.js"
import { Discord, Slash } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Leave {
  @Slash({
    description: "Leaves voice channel",
    name: "leave",
  })
  async leave(interaction: CommandInteraction): Promise<void> {
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

    await player.destroy()
    await interaction.reply("Left voice channel")
  }
}
