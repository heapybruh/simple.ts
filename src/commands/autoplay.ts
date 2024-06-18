import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashChoice, SlashOption } from "discordx"
import { bot, color } from "../index.js"

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

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Changed autoplay mode",
            iconURL: process.env.AUTOPLAY_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully ${enabled ? "**Enabled**" : "**Disabled**"} autoplay ${enabled ? ":green_circle:" : ":red_circle:"}`
          )
          .setFooter({
            text: `@${interaction.user.username} used /autoplay`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
