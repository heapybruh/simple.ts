import { CommandInteraction } from "discord.js"
import { Discord, Slash } from "discordx"
import { bot } from "../index.ts"

@Discord()
export class Leave {
  @Slash({
    description: "Leaves voice channel",
    name: "leave",
  })
  async leave(interaction: CommandInteraction): Promise<void> {
    if (bot.moon.nodes.cache.get("socket")) {
      await interaction.reply({
        content: "Not connected to NodeLink",
        ephemeral: true,
      })

      return
    }

    await interaction.deferReply()

    const player = bot.moon.players.get(interaction.guildId!)

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
