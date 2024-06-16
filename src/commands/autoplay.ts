import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { Discord, Slash, SlashChoice, SlashOption } from "discordx"
import { bot } from "../index.js"

@Discord()
export class Autoplay {
  @Slash({
    description: "Manages autoplay",
    name: "autoplay",
  })
  async autoplay(
    @SlashChoice({ name: "Enabled", value: true })
    @SlashChoice({ name: "Disabled", value: false })
    @SlashOption({
      description: "Enable or disable autoplay",
      name: "enabled",
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    enabled: boolean,
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

    player.setAutoPlay(enabled)

    await interaction.reply(
      `${enabled ? ":green_circle: Enabled" : ":red_circle: Disabled"} autoplay!`
    )
  }
}
