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
    await interaction.deferReply()

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.editReply({
        content: "Not connected to a voice channel",
      })

      return
    }

    await player.destroy()
    await interaction.editReply("Left voice channel")
  }
}
