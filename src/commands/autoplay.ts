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
    await interaction.deferReply()

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.editReply({
        content: "Not connected to a voice channel",
      })

      return
    }

    player.setAutoPlay(enabled)

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Changed autoplay mode",
            iconURL: process.env.AUTOPLAY_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully changed autoplay mode to: ${enabled ? "**Enabled** :green_circle:" : "**Disabled** :red_circle:"}`
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
